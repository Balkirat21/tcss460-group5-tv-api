import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Helper function to format dates as YYYY-MM-DD (removes time/timezone)
const formatShowDates = (show) => {
    if (!show) return show;
    if (show.first_air_date) {
        show.first_air_date = show.first_air_date.toISOString().split('T')[0];
    }
    if (show.last_air_date) {
        show.last_air_date = show.last_air_date.toISOString().split('T')[0];
    }
    return show;
};

// GET all shows (with optional pagination and filtering)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 25;
        const nameFilter = req.query.name || null;
        const genreFilter = req.query.genre || null;
        const actorFilter = req.query.actor || null;
        const networkFilter = req.query.network || null;
        const yearFilter = req.query.year || null;
        const sortBy = req.query.sortBy || 'id';
        const order = req.query.order || 'asc';

        // Whitelist of allowed sort fields
        const allowedSortFields = ['id', 'name', 'first_air_date', 'tmdb_rating', 'popularity', 'vote_count'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
        const sortOrder = (order.toLowerCase() === 'desc') ? 'DESC' : 'ASC';

        // Use the shows_complete view for simpler queries
        let query = 'SELECT * FROM shows_complete';
        let countQuery = 'SELECT COUNT(DISTINCT id) FROM shows_complete';
        const params = [];
        const conditions = [];

        if (nameFilter) {
            conditions.push(`name ILIKE $${params.length + 1}`);
            params.push(`%${nameFilter}%`);
        }

        if (genreFilter) {
            conditions.push(`genres ILIKE $${params.length + 1}`);
            params.push(`%${genreFilter}%`);
        }

        if (actorFilter) {
            conditions.push(`top_actors ILIKE $${params.length + 1}`);
            params.push(`%${actorFilter}%`);
        }

        if (networkFilter) {
            conditions.push(`networks ILIKE $${params.length + 1}`);
            params.push(`%${networkFilter}%`);
        }

        if (yearFilter) {
            conditions.push(`EXTRACT(YEAR FROM first_air_date) = $${params.length + 1}`);
            params.push(parseInt(yearFilter));
        }

        if (conditions.length > 0) {
            const whereClause = ' WHERE ' + conditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        // Get total count
        const countResult = await pool.query(countQuery, params);
        const totalRecords = parseInt(countResult.rows[0].count);

        // Add sorting and pagination
        const offset = (page - 1) * pageSize;
        query += ` ORDER BY ${sortField} ${sortOrder} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(pageSize, offset);

        const result = await pool.query(query, params);

        // Transform top_actors to actors and format dates
        const transformedResults = result.rows.map(show => formatShowDates({
            ...show,
            actors: show.top_actors,
            top_actors: undefined
        }));

        res.json({
            totalRecords,
            currentPage: page,
            totalPages: Math.ceil(totalRecords / pageSize),
            pageSize,
            results: transformedResults
        });
    } catch (error) {
        console.error('Error fetching shows:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// GET one show by ID with all related data
router.get('/:id', async (req, res) => {
    try {
        const showId = req.params.id;

        // Get show with all aggregated data from view
        const showQuery = 'SELECT * FROM shows_complete WHERE id = $1';
        const showResult = await pool.query(showQuery, [parseInt(showId)]);

        if (showResult.rows.length === 0) {
            return res.status(404).json({ error: 'Show not found' });
        }

        const show = showResult.rows[0];

        // Get detailed actor information with characters
        const actorsQuery = `
            SELECT a.id, a.name, a.profile_url, sa.character_name, sa.display_order
            FROM actors a
            JOIN show_actors sa ON a.id = sa.actor_id
            WHERE sa.show_id = $1
            ORDER BY sa.display_order
        `;
        const actorsResult = await pool.query(actorsQuery, [parseInt(showId)]);

        // Get detailed network information
        const networksQuery = `
            SELECT n.id, n.name, n.logo_url, n.country
            FROM networks n
            JOIN show_networks sn ON n.id = sn.network_id
            WHERE sn.show_id = $1
        `;
        const networksResult = await pool.query(networksQuery, [parseInt(showId)]);

        // Get detailed genre information
        const genresQuery = `
            SELECT g.id, g.name
            FROM genres g
            JOIN show_genres sg ON g.id = sg.genre_id
            WHERE sg.show_id = $1
        `;
        const genresResult = await pool.query(genresQuery, [parseInt(showId)]);

        // Combine all data, transform top_actors to actors, and format dates
        const response = formatShowDates({
            ...show,
            actors: show.top_actors,
            top_actors: undefined,
            actors_detailed: actorsResult.rows,
            networks_detailed: networksResult.rows,
            genres_detailed: genresResult.rows
        });

        res.json(response);
    } catch (error) {
        console.error('Error fetching show by ID:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// PATCH - Update an existing TV show by ID
router.patch('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const showId = parseInt(req.params.id);
        const updates = req.body;

        await client.query('BEGIN');

        // Check if show exists
        const checkQuery = 'SELECT * FROM tv_shows WHERE id = $1';
        const checkResult = await client.query(checkQuery, [showId]);

        if (checkResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                error: 'Show not found',
                message: `No show exists with ID ${showId}`
            });
        }

        // Whitelist of allowed fields for tv_shows table
        const allowedFields = [
            'name', 'original_name', 'first_air_date', 'last_air_date',
            'seasons', 'episodes', 'status', 'overview', 'popularity',
            'tmdb_rating', 'vote_count', 'poster_url', 'backdrop_url'
        ];

        // Filter out non-allowed fields and separate relationship updates
        const showFields = Object.keys(updates).filter(field => allowedFields.includes(field));

        // Validate data types for numeric fields
        if (updates.seasons && isNaN(parseInt(updates.seasons))) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Seasons must be a number' });
        }
        if (updates.episodes && isNaN(parseInt(updates.episodes))) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Episodes must be a number' });
        }
        if (updates.popularity && isNaN(parseFloat(updates.popularity))) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Popularity must be a number' });
        }
        if (updates.tmdb_rating && (isNaN(parseFloat(updates.tmdb_rating)) || parseFloat(updates.tmdb_rating) < 0 || parseFloat(updates.tmdb_rating) > 10)) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'TMDb rating must be a number between 0 and 10' });
        }
        if (updates.vote_count && isNaN(parseInt(updates.vote_count))) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Vote count must be a number' });
        }

        // Update tv_shows table if there are valid fields
        if (showFields.length > 0) {
            const setClause = showFields.map((field, index) => `${field} = $${index + 2}`).join(', ');
            const values = [showId, ...showFields.map(field => updates[field])];
            const updateQuery = `UPDATE tv_shows SET ${setClause} WHERE id = $1`;
            await client.query(updateQuery, values);
        }

        // Handle genres update if provided
        if (updates.genres && Array.isArray(updates.genres)) {
            // Delete existing genres
            await client.query('DELETE FROM show_genres WHERE show_id = $1', [showId]);

            // Insert new genres
            for (const genreName of updates.genres) {
                // Get or create genre
                const genreResult = await client.query(
                    'INSERT INTO genres (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
                    [genreName]
                );
                const genreId = genreResult.rows[0].id;

                // Link to show
                await client.query(
                    'INSERT INTO show_genres (show_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [showId, genreId]
                );
            }
        }

        // Handle networks update if provided
        if (updates.networks && Array.isArray(updates.networks)) {
            await client.query('DELETE FROM show_networks WHERE show_id = $1', [showId]);

            for (const networkName of updates.networks) {
                const networkResult = await client.query(
                    'INSERT INTO networks (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
                    [networkName]
                );
                const networkId = networkResult.rows[0].id;

                await client.query(
                    'INSERT INTO show_networks (show_id, network_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [showId, networkId]
                );
            }
        }

        // Handle actors update if provided
        if (updates.actors && Array.isArray(updates.actors)) {
            await client.query('DELETE FROM show_actors WHERE show_id = $1', [showId]);

            for (let i = 0; i < updates.actors.length; i++) {
                const actor = updates.actors[i];
                const actorResult = await client.query(
                    'INSERT INTO actors (name, profile_url) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
                    [actor.name, actor.profile_url || null]
                );
                const actorId = actorResult.rows[0].id;
                await client.query(
                    'INSERT INTO show_actors (show_id, actor_id, character_name, display_order) VALUES ($1, $2, $3, $4)',
                    [showId, actorId, actor.character_name || '', i + 1]
                );
            }
        }

        // Handle creators update if provided
        if (updates.creators && Array.isArray(updates.creators)) {
            await client.query('DELETE FROM show_creators WHERE show_id = $1', [showId]);

            for (const creatorName of updates.creators) {
                const creatorResult = await client.query(
                    'INSERT INTO creators (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
                    [creatorName]
                );
                const creatorId = creatorResult.rows[0].id;
                await client.query(
                    'INSERT INTO show_creators (show_id, creator_id) VALUES ($1, $2)',
                    [showId, creatorId]
                );
            }
        }

        // Handle studios update if provided
        if (updates.studios && Array.isArray(updates.studios)) {
            await client.query('DELETE FROM show_studios WHERE show_id = $1', [showId]);

            for (const studioName of updates.studios) {
                const studioResult = await client.query(
                    'INSERT INTO studios (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
                    [studioName]
                );
                const studioId = studioResult.rows[0].id;
                await client.query(
                    'INSERT INTO show_studios (show_id, studio_id) VALUES ($1, $2)',
                    [showId, studioId]
                );
            }
        }

        await client.query('COMMIT');

        // Fetch and return updated show
        const updatedShow = await pool.query('SELECT * FROM shows_complete WHERE id = $1', [showId]);

        // Transform top_actors to actors and format dates
        const transformedShow = formatShowDates({
            ...updatedShow.rows[0],
            actors: updatedShow.rows[0].top_actors,
            top_actors: undefined
        });

        res.json({
            message: 'TV show updated successfully',
            show: transformedShow
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating show:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    } finally {
        client.release();
    }
});

// DELETE a TV show by ID
router.delete('/:id', async (req, res) => {
    try {
        const showId = req.params.id;

        // Check if the show exists first
        const checkQuery = 'SELECT * FROM shows_complete WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [parseInt(showId)]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Show not found',
                message: `No show exists with ID ${showId}`
            });
        }

        // Delete the show (CASCADE will handle relationships)
        const deleteQuery = 'DELETE FROM tv_shows WHERE id = $1 RETURNING *';
        const result = await pool.query(deleteQuery, [parseInt(showId)]);

        // Transform top_actors to actors and format dates
        const transformedShow = formatShowDates({
            ...checkResult.rows[0],
            actors: checkResult.rows[0].top_actors,
            top_actors: undefined
        });

        res.json({
            message: 'TV show deleted successfully',
            deletedShow: transformedShow
        });
    } catch (error) {
        console.error('Error deleting show:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

// POST a new TV show
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            name,
            original_name,
            first_air_date,
            last_air_date,
            seasons,
            episodes,
            status,
            overview,
            popularity,
            tmdb_rating,
            vote_count,
            poster_url,
            backdrop_url,
            genres,
            networks,
            actors,
            creators,
            studios
        } = req.body;

        // Validate required fields
        if (!name || !first_air_date || !overview) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Required fields: name, first_air_date, and overview'
            });
        }

        // Validate data types for numeric fields
        if (seasons && isNaN(parseInt(seasons))) {
            return res.status(400).json({ error: 'Seasons must be a number' });
        }
        if (episodes && isNaN(parseInt(episodes))) {
            return res.status(400).json({ error: 'Episodes must be a number' });
        }
        if (popularity && isNaN(parseFloat(popularity))) {
            return res.status(400).json({ error: 'Popularity must be a number' });
        }
        if (tmdb_rating && (isNaN(parseFloat(tmdb_rating)) || parseFloat(tmdb_rating) < 0 || parseFloat(tmdb_rating) > 10)) {
            return res.status(400).json({ error: 'TMDb rating must be a number between 0 and 10' });
        }
        if (vote_count && isNaN(parseInt(vote_count))) {
            return res.status(400).json({ error: 'Vote count must be a number' });
        }

        await client.query('BEGIN');

        // Insert the new show
        const showQuery = `
            INSERT INTO tv_shows (
                name,
                original_name,
                first_air_date,
                last_air_date,
                seasons,
                episodes,
                status,
                overview,
                popularity,
                tmdb_rating,
                vote_count,
                poster_url,
                backdrop_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id
        `;

        const showValues = [
            name,
            original_name || name,
            first_air_date,
            last_air_date || null,
            seasons || 1,
            episodes || 1,
            status || 'Unknown',
            overview,
            popularity || 0,
            tmdb_rating || 0,
            vote_count || 0,
            poster_url || '',
            backdrop_url || ''
        ];

        const showResult = await client.query(showQuery, showValues);
        const newShowId = showResult.rows[0].id;

        // Handle genres
        if (genres && Array.isArray(genres)) {
            for (const genreName of genres) {
                const genreResult = await client.query(
                    'INSERT INTO genres (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
                    [genreName]
                );
                const genreId = genreResult.rows[0].id;
                await client.query(
                    'INSERT INTO show_genres (show_id, genre_id) VALUES ($1, $2)',
                    [newShowId, genreId]
                );
            }
        }

        // Handle networks
        if (networks && Array.isArray(networks)) {
            for (const networkName of networks) {
                const networkResult = await client.query(
                    'INSERT INTO networks (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
                    [networkName]
                );
                const networkId = networkResult.rows[0].id;
                await client.query(
                    'INSERT INTO show_networks (show_id, network_id) VALUES ($1, $2)',
                    [newShowId, networkId]
                );
            }
        }

        // Handle actors
        if (actors && Array.isArray(actors)) {
            for (let i = 0; i < actors.length; i++) {
                const actor = actors[i];
                const actorResult = await client.query(
                    'INSERT INTO actors (name, profile_url) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
                    [actor.name, actor.profile_url || '']
                );
                const actorId = actorResult.rows[0].id;
                await client.query(
                    'INSERT INTO show_actors (show_id, actor_id, character_name, display_order) VALUES ($1, $2, $3, $4)',
                    [newShowId, actorId, actor.character_name || '', i + 1]
                );
            }
        }

        // Handle creators
        if (creators && Array.isArray(creators)) {
            for (const creatorName of creators) {
                const creatorResult = await client.query(
                    'INSERT INTO creators (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
                    [creatorName]
                );
                const creatorId = creatorResult.rows[0].id;
                await client.query(
                    'INSERT INTO show_creators (show_id, creator_id) VALUES ($1, $2)',
                    [newShowId, creatorId]
                );
            }
        }

        // Handle studios
        if (studios && Array.isArray(studios)) {
            for (const studioName of studios) {
                const studioResult = await client.query(
                    'INSERT INTO studios (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
                    [studioName]
                );
                const studioId = studioResult.rows[0].id;
                await client.query(
                    'INSERT INTO show_studios (show_id, studio_id) VALUES ($1, $2)',
                    [newShowId, studioId]
                );
            }
        }

        await client.query('COMMIT');

        // Fetch the complete show data
        const completeShow = await pool.query('SELECT * FROM shows_complete WHERE id = $1', [newShowId]);

        // Transform top_actors to actors and format dates
        const transformedShow = formatShowDates({
            ...completeShow.rows[0],
            actors: completeShow.rows[0].top_actors,
            top_actors: undefined
        });

        res.status(201).json({
            message: 'TV show added successfully',
            show: transformedShow
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error adding show:', error);

        // Handle unique constraint violations
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Conflict',
                message: 'A show with this information already exists'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    } finally {
        client.release();
    }
});

// ==================== RELATIONSHIP MANAGEMENT ENDPOINTS ====================

// POST - Add an actor to a show
router.post('/:id/actors', async (req, res) => {
    try {
        const showId = parseInt(req.params.id);
        const { name, character_name, profile_url, display_order } = req.body;

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Actor name is required'
            });
        }

        // Check if show exists
        const showCheck = await pool.query('SELECT * FROM tv_shows WHERE id = $1', [showId]);
        if (showCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Show not found' });
        }

        // Get or create actor
        const actorResult = await pool.query(
            'INSERT INTO actors (name, profile_url) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
            [name.trim(), profile_url || null]
        );
        const actorId = actorResult.rows[0].id;

        // Check if actor is already in show
        const existingCheck = await pool.query(
            'SELECT * FROM show_actors WHERE show_id = $1 AND actor_id = $2',
            [showId, actorId]
        );
        if (existingCheck.rows.length > 0) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'This actor is already in the show'
            });
        }

        // Get next display order if not provided
        let finalDisplayOrder = display_order;
        if (!finalDisplayOrder) {
            const maxOrderResult = await pool.query(
                'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM show_actors WHERE show_id = $1',
                [showId]
            );
            finalDisplayOrder = maxOrderResult.rows[0].next_order;
        }

        // Add actor to show
        await pool.query(
            'INSERT INTO show_actors (show_id, actor_id, character_name, display_order) VALUES ($1, $2, $3, $4)',
            [showId, actorId, character_name || '', finalDisplayOrder]
        );

        res.status(201).json({
            message: 'Actor added to show successfully',
            actor: {
                id: actorId,
                name: name.trim(),
                character_name: character_name || '',
                display_order: finalDisplayOrder
            }
        });
    } catch (error) {
        console.error('Error adding actor to show:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// DELETE - Remove an actor from a show
router.delete('/:id/actors/:actorId', async (req, res) => {
    try {
        const showId = parseInt(req.params.id);
        const actorId = parseInt(req.params.actorId);

        // Check if relationship exists
        const checkResult = await pool.query(
            'SELECT * FROM show_actors WHERE show_id = $1 AND actor_id = $2',
            [showId, actorId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'This actor is not in the show'
            });
        }

        // Remove actor from show
        await pool.query(
            'DELETE FROM show_actors WHERE show_id = $1 AND actor_id = $2',
            [showId, actorId]
        );

        res.json({
            message: 'Actor removed from show successfully'
        });
    } catch (error) {
        console.error('Error removing actor from show:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// PATCH - Update actor relationship (character name, display order)
router.patch('/:id/actors/:actorId', async (req, res) => {
    try {
        const showId = parseInt(req.params.id);
        const actorId = parseInt(req.params.actorId);
        const { character_name, display_order } = req.body;

        // Check if relationship exists
        const checkResult = await pool.query(
            'SELECT * FROM show_actors WHERE show_id = $1 AND actor_id = $2',
            [showId, actorId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'This actor is not in the show'
            });
        }

        // Build update query dynamically
        const updates = [];
        const values = [showId, actorId];
        let paramCount = 3;

        if (character_name !== undefined) {
            updates.push(`character_name = $${paramCount}`);
            values.push(character_name);
            paramCount++;
        }

        if (display_order !== undefined) {
            updates.push(`display_order = $${paramCount}`);
            values.push(display_order);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'At least one field (character_name or display_order) must be provided'
            });
        }

        // Update relationship
        const updateQuery = `
            UPDATE show_actors
            SET ${updates.join(', ')}
            WHERE show_id = $1 AND actor_id = $2
            RETURNING *
        `;
        const result = await pool.query(updateQuery, values);

        res.json({
            message: 'Actor relationship updated successfully',
            relationship: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating actor relationship:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// POST - Add a network to a show
router.post('/:id/networks', async (req, res) => {
    try {
        const showId = parseInt(req.params.id);
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Network name is required'
            });
        }

        // Check if show exists
        const showCheck = await pool.query('SELECT * FROM tv_shows WHERE id = $1', [showId]);
        if (showCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Show not found' });
        }

        // Get or create network
        const networkResult = await pool.query(
            'INSERT INTO networks (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
            [name.trim()]
        );
        const networkId = networkResult.rows[0].id;

        // Check if already linked
        const existingCheck = await pool.query(
            'SELECT * FROM show_networks WHERE show_id = $1 AND network_id = $2',
            [showId, networkId]
        );
        if (existingCheck.rows.length > 0) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'This network is already linked to the show'
            });
        }

        // Add network to show
        await pool.query(
            'INSERT INTO show_networks (show_id, network_id) VALUES ($1, $2)',
            [showId, networkId]
        );

        res.status(201).json({
            message: 'Network added to show successfully',
            network: { id: networkId, name: name.trim() }
        });
    } catch (error) {
        console.error('Error adding network to show:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// DELETE - Remove a network from a show
router.delete('/:id/networks/:networkId', async (req, res) => {
    try {
        const showId = parseInt(req.params.id);
        const networkId = parseInt(req.params.networkId);

        const checkResult = await pool.query(
            'SELECT * FROM show_networks WHERE show_id = $1 AND network_id = $2',
            [showId, networkId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'This network is not linked to the show'
            });
        }

        await pool.query(
            'DELETE FROM show_networks WHERE show_id = $1 AND network_id = $2',
            [showId, networkId]
        );

        res.json({ message: 'Network removed from show successfully' });
    } catch (error) {
        console.error('Error removing network from show:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// POST - Add a genre to a show
router.post('/:id/genres', async (req, res) => {
    try {
        const showId = parseInt(req.params.id);
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Genre name is required'
            });
        }

        const showCheck = await pool.query('SELECT * FROM tv_shows WHERE id = $1', [showId]);
        if (showCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Show not found' });
        }

        const genreResult = await pool.query(
            'INSERT INTO genres (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
            [name.trim()]
        );
        const genreId = genreResult.rows[0].id;

        const existingCheck = await pool.query(
            'SELECT * FROM show_genres WHERE show_id = $1 AND genre_id = $2',
            [showId, genreId]
        );
        if (existingCheck.rows.length > 0) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'This genre is already linked to the show'
            });
        }

        await pool.query(
            'INSERT INTO show_genres (show_id, genre_id) VALUES ($1, $2)',
            [showId, genreId]
        );

        res.status(201).json({
            message: 'Genre added to show successfully',
            genre: { id: genreId, name: name.trim() }
        });
    } catch (error) {
        console.error('Error adding genre to show:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// DELETE - Remove a genre from a show
router.delete('/:id/genres/:genreId', async (req, res) => {
    try {
        const showId = parseInt(req.params.id);
        const genreId = parseInt(req.params.genreId);

        const checkResult = await pool.query(
            'SELECT * FROM show_genres WHERE show_id = $1 AND genre_id = $2',
            [showId, genreId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'This genre is not linked to the show'
            });
        }

        await pool.query(
            'DELETE FROM show_genres WHERE show_id = $1 AND genre_id = $2',
            [showId, genreId]
        );

        res.json({ message: 'Genre removed from show successfully' });
    } catch (error) {
        console.error('Error removing genre from show:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// POST - Add a creator to a show
router.post('/:id/creators', async (req, res) => {
    try {
        const showId = parseInt(req.params.id);
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Creator name is required'
            });
        }

        const showCheck = await pool.query('SELECT * FROM tv_shows WHERE id = $1', [showId]);
        if (showCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Show not found' });
        }

        const creatorResult = await pool.query(
            'INSERT INTO creators (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
            [name.trim()]
        );
        const creatorId = creatorResult.rows[0].id;

        const existingCheck = await pool.query(
            'SELECT * FROM show_creators WHERE show_id = $1 AND creator_id = $2',
            [showId, creatorId]
        );
        if (existingCheck.rows.length > 0) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'This creator is already linked to the show'
            });
        }

        await pool.query(
            'INSERT INTO show_creators (show_id, creator_id) VALUES ($1, $2)',
            [showId, creatorId]
        );

        res.status(201).json({
            message: 'Creator added to show successfully',
            creator: { id: creatorId, name: name.trim() }
        });
    } catch (error) {
        console.error('Error adding creator to show:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// DELETE - Remove a creator from a show
router.delete('/:id/creators/:creatorId', async (req, res) => {
    try {
        const showId = parseInt(req.params.id);
        const creatorId = parseInt(req.params.creatorId);

        const checkResult = await pool.query(
            'SELECT * FROM show_creators WHERE show_id = $1 AND creator_id = $2',
            [showId, creatorId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'This creator is not linked to the show'
            });
        }

        await pool.query(
            'DELETE FROM show_creators WHERE show_id = $1 AND creator_id = $2',
            [showId, creatorId]
        );

        res.json({ message: 'Creator removed from show successfully' });
    } catch (error) {
        console.error('Error removing creator from show:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// POST - Add a studio to a show
router.post('/:id/studios', async (req, res) => {
    try {
        const showId = parseInt(req.params.id);
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Studio name is required'
            });
        }

        const showCheck = await pool.query('SELECT * FROM tv_shows WHERE id = $1', [showId]);
        if (showCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Show not found' });
        }

        const studioResult = await pool.query(
            'INSERT INTO studios (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
            [name.trim()]
        );
        const studioId = studioResult.rows[0].id;

        const existingCheck = await pool.query(
            'SELECT * FROM show_studios WHERE show_id = $1 AND studio_id = $2',
            [showId, studioId]
        );
        if (existingCheck.rows.length > 0) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'This studio is already linked to the show'
            });
        }

        await pool.query(
            'INSERT INTO show_studios (show_id, studio_id) VALUES ($1, $2)',
            [showId, studioId]
        );

        res.status(201).json({
            message: 'Studio added to show successfully',
            studio: { id: studioId, name: name.trim() }
        });
    } catch (error) {
        console.error('Error adding studio to show:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// DELETE - Remove a studio from a show
router.delete('/:id/studios/:studioId', async (req, res) => {
    try {
        const showId = parseInt(req.params.id);
        const studioId = parseInt(req.params.studioId);

        const checkResult = await pool.query(
            'SELECT * FROM show_studios WHERE show_id = $1 AND studio_id = $2',
            [showId, studioId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'This studio is not linked to the show'
            });
        }

        await pool.query(
            'DELETE FROM show_studios WHERE show_id = $1 AND studio_id = $2',
            [showId, studioId]
        );

        res.json({ message: 'Studio removed from show successfully' });
    } catch (error) {
        console.error('Error removing studio from show:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

export default router;
