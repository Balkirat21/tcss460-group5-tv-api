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

// GET all studios (with pagination and optional search)
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

        let query = 'SELECT * FROM studios';
        let countQuery = 'SELECT COUNT(*) FROM studios';
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
        console.error('Error fetching studios:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// GET one studio by ID
router.get('/:id', async (req, res) => {
    try {
        const studioId = req.params.id;

        const studioQuery = 'SELECT * FROM studios WHERE id = $1';
        const studioResult = await pool.query(studioQuery, [parseInt(studioId)]);

        if (studioResult.rows.length === 0) {
            return res.status(404).json({ error: 'Studio not found' });
        }

        res.json(studioResult.rows[0]);
    } catch (error) {
        console.error('Error fetching studio by ID:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// GET all shows for a specific studio (with filtering and sorting)
router.get('/:id/shows', async (req, res) => {
    try {
        const studioId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 25;
        const sortBy = req.query.sortBy || 'first_air_date';
        const order = req.query.order || 'desc';

        // Filters
        const genreFilter = req.query.genre;
        const networkFilter = req.query.network;
        const actorFilter = req.query.actor;
        const yearFilter = req.query.year;
        const minRating = req.query.minRating;

        // Whitelist of allowed sort fields
        const allowedSortFields = ['id', 'name', 'first_air_date', 'tmdb_rating', 'popularity', 'vote_count'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'first_air_date';
        const sortOrder = (order.toLowerCase() === 'desc') ? 'DESC' : 'ASC';

        // Verify studio exists
        const studioCheck = await pool.query('SELECT * FROM studios WHERE id = $1', [parseInt(studioId)]);
        if (studioCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Studio not found' });
        }

        // Build WHERE clause for filters
        const whereClauses = ['ss.studio_id = $1'];
        const params = [parseInt(studioId)];
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

        if (actorFilter) {
            whereClauses.push(`EXISTS (
                SELECT 1 FROM show_actors sa
                JOIN actors a ON sa.actor_id = a.id
                WHERE sa.show_id = s.id AND a.name ILIKE $${paramCount}
            )`);
            params.push(`%${actorFilter}%`);
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
            JOIN show_studios ss ON s.id = ss.show_id
            WHERE ${whereClause}
        `;
        const countResult = await pool.query(countQuery, params);
        const totalRecords = parseInt(countResult.rows[0].count);

        // Get paginated shows
        const offset = (page - 1) * pageSize;
        const query = `
            SELECT s.*
            FROM tv_shows s
            JOIN show_studios ss ON s.id = ss.show_id
            WHERE ${whereClause}
            ORDER BY s.${sortField} ${sortOrder}
            LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;
        params.push(pageSize, offset);
        const result = await pool.query(query, params);

        res.json({
            studio: studioCheck.rows[0],
            totalRecords,
            currentPage: page,
            totalPages: Math.ceil(totalRecords / pageSize),
            pageSize,
            shows: result.rows.map(show => formatShowDates(show))
        });
    } catch (error) {
        console.error('Error fetching shows for studio:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// POST - Create a new studio
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Studio name is required'
            });
        }

        // Insert new studio
        const query = 'INSERT INTO studios (name) VALUES ($1) RETURNING *';
        const result = await pool.query(query, [name.trim()]);

        res.status(201).json({
            message: 'Studio created successfully',
            studio: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating studio:', error);

        // Handle unique constraint violation (duplicate name)
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Conflict',
                message: 'A studio with this name already exists'
            });
        }

        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// PATCH - Update an existing studio
router.patch('/:id', async (req, res) => {
    try {
        const studioId = parseInt(req.params.id);
        const { name } = req.body;

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Studio name is required'
            });
        }

        // Check if studio exists
        const checkQuery = 'SELECT * FROM studios WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [studioId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Studio not found' });
        }

        // Update studio
        const updateQuery = 'UPDATE studios SET name = $1 WHERE id = $2 RETURNING *';
        const result = await pool.query(updateQuery, [name.trim(), studioId]);

        res.json({
            message: 'Studio updated successfully',
            studio: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating studio:', error);

        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Conflict',
                message: 'A studio with this name already exists'
            });
        }

        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

export default router;
