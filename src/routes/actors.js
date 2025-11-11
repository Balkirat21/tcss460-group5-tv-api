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

// GET all actors (with pagination and optional search)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 25;
        const searchFilter = req.query.search || null;
        const sortBy = req.query.sortBy || 'name';
        const order = req.query.order || 'asc';

        // Whitelist of allowed sort fields
        const allowedSortFields = ['id', 'name'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
        const sortOrder = (order.toLowerCase() === 'desc') ? 'DESC' : 'ASC';

        let query = 'SELECT * FROM actors';
        let countQuery = 'SELECT COUNT(*) FROM actors';
        const params = [];

        if (searchFilter) {
            query += ' WHERE name ILIKE $1';
            countQuery += ' WHERE name ILIKE $1';
            params.push(`%${searchFilter}%`);
        }

        // Get total count
        const countResult = await pool.query(countQuery, params);
        const totalRecords = parseInt(countResult.rows[0].count);

        // Add pagination
        const offset = (page - 1) * pageSize;
        query += ` ORDER BY ${sortField} ${sortOrder} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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
        console.error('Error fetching actors:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// GET one actor by ID
router.get('/:id', async (req, res) => {
    try {
        const actorId = req.params.id;

        const actorQuery = 'SELECT * FROM actors WHERE id = $1';
        const actorResult = await pool.query(actorQuery, [parseInt(actorId)]);

        if (actorResult.rows.length === 0) {
            return res.status(404).json({ error: 'Actor not found' });
        }

        res.json(actorResult.rows[0]);
    } catch (error) {
        console.error('Error fetching actor by ID:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// GET all shows for a specific actor (with filtering and sorting)
router.get('/:id/shows', async (req, res) => {
    try {
        const actorId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 25;
        const sortBy = req.query.sortBy || 'first_air_date';
        const order = req.query.order || 'desc';

        // Filters
        const genreFilter = req.query.genre;
        const networkFilter = req.query.network;
        const yearFilter = req.query.year;
        const minRating = req.query.minRating;

        // Whitelist of allowed sort fields
        const allowedSortFields = ['id', 'name', 'first_air_date', 'tmdb_rating', 'popularity', 'vote_count'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'first_air_date';
        const sortOrder = (order.toLowerCase() === 'desc') ? 'DESC' : 'ASC';

        // Verify actor exists
        const actorCheck = await pool.query('SELECT * FROM actors WHERE id = $1', [parseInt(actorId)]);
        if (actorCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Actor not found' });
        }

        // Build WHERE clause for filters
        const whereClauses = ['sa.actor_id = $1'];
        const params = [parseInt(actorId)];
        let paramCount = 2;

        if (genreFilter) {
            whereClauses.push(`EXISTS (
                SELECT 1 FROM show_genres sg
                JOIN genres g ON sg.genre_id = g.id
                WHERE sg.show_id = s.id AND g.name ILIKE $${paramCount}
            )`);
            params.push(`%${genreFilter}%`);
            paramCount++;
        }

        if (networkFilter) {
            whereClauses.push(`EXISTS (
                SELECT 1 FROM show_networks sn
                JOIN networks n ON sn.network_id = n.id
                WHERE sn.show_id = s.id AND n.name ILIKE $${paramCount}
            )`);
            params.push(`%${networkFilter}%`);
            paramCount++;
        }

        if (yearFilter) {
            whereClauses.push(`EXTRACT(YEAR FROM s.first_air_date) = $${paramCount}`);
            params.push(parseInt(yearFilter));
            paramCount++;
        }

        if (minRating) {
            whereClauses.push(`s.tmdb_rating >= $${paramCount}`);
            params.push(parseFloat(minRating));
            paramCount++;
        }

        const whereClause = whereClauses.join(' AND ');

        // Count total shows with filters
        const countQuery = `
            SELECT COUNT(*) FROM tv_shows s
            JOIN show_actors sa ON s.id = sa.show_id
            WHERE ${whereClause}
        `;
        const countResult = await pool.query(countQuery, params);
        const totalRecords = parseInt(countResult.rows[0].count);

        // Get paginated shows with character information
        const offset = (page - 1) * pageSize;
        const query = `
            SELECT
                s.*,
                sa.character_name,
                sa.display_order
            FROM tv_shows s
            JOIN show_actors sa ON s.id = sa.show_id
            WHERE ${whereClause}
            ORDER BY s.${sortField} ${sortOrder}
            LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;
        params.push(pageSize, offset);
        const result = await pool.query(query, params);

        res.json({
            actor: actorCheck.rows[0],
            totalRecords,
            currentPage: page,
            totalPages: Math.ceil(totalRecords / pageSize),
            pageSize,
            shows: result.rows.map(show => formatShowDates(show))
        });
    } catch (error) {
        console.error('Error fetching shows for actor:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// POST - Create a new actor
router.post('/', async (req, res) => {
    try {
        const { name, profile_url } = req.body;

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Actor name is required'
            });
        }

        // Insert new actor
        const query = 'INSERT INTO actors (name, profile_url) VALUES ($1, $2) RETURNING *';
        const result = await pool.query(query, [name.trim(), profile_url || null]);

        res.status(201).json({
            message: 'Actor created successfully',
            actor: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating actor:', error);

        // Handle unique constraint violation (duplicate name)
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Conflict',
                message: 'An actor with this name already exists'
            });
        }

        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// PATCH - Update an existing actor
router.patch('/:id', async (req, res) => {
    try {
        const actorId = parseInt(req.params.id);
        const { name, profile_url } = req.body;

        // Check if actor exists
        const checkQuery = 'SELECT * FROM actors WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [actorId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Actor not found' });
        }

        // Build update query dynamically based on provided fields
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (name !== undefined && name.trim() !== '') {
            updates.push(`name = $${paramCount}`);
            values.push(name.trim());
            paramCount++;
        }

        if (profile_url !== undefined) {
            updates.push(`profile_url = $${paramCount}`);
            values.push(profile_url);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'At least one field (name or profile_url) must be provided'
            });
        }

        // Add actor ID to values
        values.push(actorId);

        const updateQuery = `UPDATE actors SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        const result = await pool.query(updateQuery, values);

        res.json({
            message: 'Actor updated successfully',
            actor: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating actor:', error);

        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Conflict',
                message: 'An actor with this name already exists'
            });
        }

        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

export default router;
