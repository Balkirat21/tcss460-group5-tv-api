import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET all shows (with optional pagination)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 25;
        const nameFilter = req.query.name || null;
        const genreFilter = req.query.genre || null;

        // Build the query dynamically based on filters
        let query = 'SELECT * FROM tv_shows';
        let countQuery = 'SELECT COUNT(*) FROM tv_shows';
        const params = [];
        const conditions = [];

        if (nameFilter) {
            conditions.push(`name ILIKE $${params.length + 1}`);
            params.push(`%${nameFilter}%`);
        }

        if (genreFilter) {
            // genres is stored as a semicolon-separated string
            conditions.push(`genres ILIKE $${params.length + 1}`);
            params.push(`%${genreFilter}%`);
        }

        if (conditions.length > 0) {
            const whereClause = ' WHERE ' + conditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        // Get total count
        const countResult = await pool.query(countQuery, params);
        const totalRecords = parseInt(countResult.rows[0].count);

        // Add pagination
        const offset = (page - 1) * pageSize;
        query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(pageSize, offset);

        const result = await pool.query(query, params);

        res.json({
            totalRecords,
            currentPage: page,
            totalPages: Math.ceil(totalRecords / pageSize),
            pageSize,
            results: result.rows
        });
    } catch (error) {
        console.error('Error fetching shows:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// GET shows by year (with pagination)
router.get('/showbyyear/:year', async (req, res) => {
    try {
        const year = req.params.year;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 25;

        // Count total shows in that year
        const countQuery = `
            SELECT COUNT(*) FROM tv_shows
            WHERE EXTRACT(YEAR FROM first_air_date) = $1
        `;
        const countResult = await pool.query(countQuery, [parseInt(year)]);
        const totalRecords = parseInt(countResult.rows[0].count);

        if (totalRecords === 0) {
            return res.status(404).json({
                error: 'No shows found for this year',
                year: year
            });
        }

        // Fetch paginated results
        const offset = (page - 1) * pageSize;
        const query = `
            SELECT * FROM tv_shows
            WHERE EXTRACT(YEAR FROM first_air_date) = $1
            ORDER BY first_air_date
            LIMIT $2 OFFSET $3
        `;
        const result = await pool.query(query, [parseInt(year), pageSize, offset]);

        res.json({
            year: year,
            totalRecords,
            currentPage: page,
            totalPages: Math.ceil(totalRecords / pageSize),
            pageSize,
            shows: result.rows
        });
    } catch (error) {
        console.error('Error fetching shows by year:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// GET one show by ID
router.get('/:id', async (req, res) => {
    try {
        const showId = req.params.id;

        const query = 'SELECT * FROM tv_shows WHERE id = $1';
        const result = await pool.query(query, [parseInt(showId)]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Show not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching show by ID:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// PUT - Update an existing TV show by ID
router.put('/:id', async (req, res) => {
    try {
        const showId = req.params.id;
        const updates = req.body;

        // Check if show exists
        const checkQuery = 'SELECT * FROM tv_shows WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [parseInt(showId)]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Show not found',
                message: `No show exists with ID ${showId}`
            });
        }

        // Whitelist of allowed fields to prevent SQL injection
        const allowedFields = [
            'name', 'original_name', 'first_air_date', 'last_air_date',
            'seasons', 'episodes', 'status', 'overview', 'popularity',
            'tmdb_rating', 'vote_count', 'poster_url', 'backdrop_url', 'genres'
        ];

        // Filter out non-allowed fields
        const updateFields = Object.keys(updates).filter(field => allowedFields.includes(field));

        if (updateFields.length === 0) {
            return res.status(400).json({
                error: 'No valid fields to update',
                message: `Allowed fields: ${allowedFields.join(', ')}`
            });
        }

        // Validate data types for numeric fields
        if (updates.seasons && isNaN(parseInt(updates.seasons))) {
            return res.status(400).json({ error: 'Seasons must be a number' });
        }
        if (updates.episodes && isNaN(parseInt(updates.episodes))) {
            return res.status(400).json({ error: 'Episodes must be a number' });
        }
        if (updates.popularity && isNaN(parseFloat(updates.popularity))) {
            return res.status(400).json({ error: 'Popularity must be a number' });
        }
        if (updates.tmdb_rating && (isNaN(parseFloat(updates.tmdb_rating)) || parseFloat(updates.tmdb_rating) < 0 || parseFloat(updates.tmdb_rating) > 10)) {
            return res.status(400).json({ error: 'TMDb rating must be a number between 0 and 10' });
        }
        if (updates.vote_count && isNaN(parseInt(updates.vote_count))) {
            return res.status(400).json({ error: 'Vote count must be a number' });
        }

        // Build the SET clause dynamically with validated fields
        const setClause = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        const values = [parseInt(showId), ...updateFields.map(field => updates[field])];

        const updateQuery = `UPDATE tv_shows SET ${setClause} WHERE id = $1 RETURNING *`;
        const result = await pool.query(updateQuery, values);

        res.json({
            message: 'TV show updated successfully',
            show: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating show:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

// DELETE a TV show by ID
router.delete('/:id', async (req, res) => {
    try {
        const showId = req.params.id;

        // Check if the show exists first
        const checkQuery = 'SELECT * FROM tv_shows WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [parseInt(showId)]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Show not found',
                message: `No show exists with ID ${showId}`
            });
        }

        // Delete the show
        const deleteQuery = 'DELETE FROM tv_shows WHERE id = $1 RETURNING *';
        const result = await pool.query(deleteQuery, [parseInt(showId)]);

        res.json({
            message: 'TV show deleted successfully',
            deletedShow: result.rows[0]
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
            genres
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

        // Get the next available ID
        const maxIdResult = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM tv_shows');
        const nextId = maxIdResult.rows[0].next_id;

        // Insert the new show
        const query = `
            INSERT INTO tv_shows (
                id,
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
                genres
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        `;

        const values = [
            nextId,
            name,
            original_name || name, // Default to name if original_name not provided
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
            backdrop_url || '',
            genres || ''
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: 'TV show added successfully',
            show: result.rows[0]
        });
    } catch (error) {
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
    }
});

// PUT (update) a TV show by ID
router.put('/:id', async (req, res) => {
    try {
        const showId = req.params.id;

        // Check if the show exists first
        const checkQuery = 'SELECT * FROM tv_shows WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [parseInt(showId)]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Show not found',
                message: `No show exists with ID ${showId}`
            });
        }

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
            genres
        } = req.body;

        // Validate data types for numeric fields if they are provided
        if (seasons !== undefined && seasons !== null && isNaN(parseInt(seasons))) {
            return res.status(400).json({ error: 'Seasons must be a number' });
        }
        if (episodes !== undefined && episodes !== null && isNaN(parseInt(episodes))) {
            return res.status(400).json({ error: 'Episodes must be a number' });
        }
        if (popularity !== undefined && popularity !== null && isNaN(parseFloat(popularity))) {
            return res.status(400).json({ error: 'Popularity must be a number' });
        }
        if (tmdb_rating !== undefined && tmdb_rating !== null) {
            const rating = parseFloat(tmdb_rating);
            if (isNaN(rating) || rating < 0 || rating > 10) {
                return res.status(400).json({ error: 'TMDb rating must be a number between 0 and 10' });
            }
        }
        if (vote_count !== undefined && vote_count !== null && isNaN(parseInt(vote_count))) {
            return res.status(400).json({ error: 'Vote count must be a number' });
        }

        // Build dynamic update query with only provided fields
        const updates = [];
        const values = [];
        let paramCounter = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramCounter++}`);
            values.push(name);
        }
        if (original_name !== undefined) {
            updates.push(`original_name = $${paramCounter++}`);
            values.push(original_name);
        }
        if (first_air_date !== undefined) {
            updates.push(`first_air_date = $${paramCounter++}`);
            values.push(first_air_date);
        }
        if (last_air_date !== undefined) {
            updates.push(`last_air_date = $${paramCounter++}`);
            values.push(last_air_date);
        }
        if (seasons !== undefined) {
            updates.push(`seasons = $${paramCounter++}`);
            values.push(parseInt(seasons));
        }
        if (episodes !== undefined) {
            updates.push(`episodes = $${paramCounter++}`);
            values.push(parseInt(episodes));
        }
        if (status !== undefined) {
            updates.push(`status = $${paramCounter++}`);
            values.push(status);
        }
        if (overview !== undefined) {
            updates.push(`overview = $${paramCounter++}`);
            values.push(overview);
        }
        if (popularity !== undefined) {
            updates.push(`popularity = $${paramCounter++}`);
            values.push(parseFloat(popularity));
        }
        if (tmdb_rating !== undefined) {
            updates.push(`tmdb_rating = $${paramCounter++}`);
            values.push(parseFloat(tmdb_rating));
        }
        if (vote_count !== undefined) {
            updates.push(`vote_count = $${paramCounter++}`);
            values.push(parseInt(vote_count));
        }
        if (poster_url !== undefined) {
            updates.push(`poster_url = $${paramCounter++}`);
            values.push(poster_url);
        }
        if (backdrop_url !== undefined) {
            updates.push(`backdrop_url = $${paramCounter++}`);
            values.push(backdrop_url);
        }
        if (genres !== undefined) {
            updates.push(`genres = $${paramCounter++}`);
            values.push(genres);
        }

        // If no fields to update, return error
        if (updates.length === 0) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'No valid fields provided for update'
            });
        }

        // Add the ID as the last parameter
        values.push(parseInt(showId));

        // Build and execute update query
        const updateQuery = `
            UPDATE tv_shows
            SET ${updates.join(', ')}
            WHERE id = $${paramCounter}
            RETURNING *
        `;

        const result = await pool.query(updateQuery, values);

        res.json({
            message: 'TV show updated successfully',
            show: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating show:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

export default router;
