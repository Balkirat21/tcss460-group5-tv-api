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

// GET all networks (with pagination and optional search)
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

        let query = 'SELECT * FROM networks';
        let countQuery = 'SELECT COUNT(*) FROM networks';
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
        console.error('Error fetching networks:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// GET one network by ID
router.get('/:id', async (req, res) => {
    try {
        const networkId = req.params.id;

        const networkQuery = 'SELECT * FROM networks WHERE id = $1';
        const networkResult = await pool.query(networkQuery, [parseInt(networkId)]);

        if (networkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Network not found' });
        }

        res.json(networkResult.rows[0]);
    } catch (error) {
        console.error('Error fetching network by ID:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// GET all shows for a specific network (with filtering and sorting)
router.get('/:id/shows', async (req, res) => {
    try {
        const networkId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 25;
        const sortBy = req.query.sortBy || 'first_air_date';
        const order = req.query.order || 'desc';

        // Filters
        const genreFilter = req.query.genre;
        const actorFilter = req.query.actor;
        const yearFilter = req.query.year;
        const minRating = req.query.minRating;

        // Whitelist of allowed sort fields
        const allowedSortFields = ['id', 'name', 'first_air_date', 'tmdb_rating', 'popularity', 'vote_count'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'first_air_date';
        const sortOrder = (order.toLowerCase() === 'desc') ? 'DESC' : 'ASC';

        // Verify network exists
        const networkCheck = await pool.query('SELECT * FROM networks WHERE id = $1', [parseInt(networkId)]);
        if (networkCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Network not found' });
        }

        // Build WHERE clause for filters
        const whereClauses = ['sn.network_id = $1'];
        const params = [parseInt(networkId)];
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
            JOIN show_networks sn ON s.id = sn.show_id
            WHERE ${whereClause}
        `;
        const countResult = await pool.query(countQuery, params);
        const totalRecords = parseInt(countResult.rows[0].count);

        // Get paginated shows
        const offset = (page - 1) * pageSize;
        const query = `
            SELECT s.*
            FROM tv_shows s
            JOIN show_networks sn ON s.id = sn.show_id
            WHERE ${whereClause}
            ORDER BY s.${sortField} ${sortOrder}
            LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;
        params.push(pageSize, offset);
        const result = await pool.query(query, params);

        res.json({
            network: networkCheck.rows[0],
            totalRecords,
            currentPage: page,
            totalPages: Math.ceil(totalRecords / pageSize),
            pageSize,
            shows: result.rows.map(show => formatShowDates(show))
        });
    } catch (error) {
        console.error('Error fetching shows for network:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// POST - Create a new network
router.post('/', async (req, res) => {
    try {
        const { name, logo_url, country } = req.body;

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Network name is required'
            });
        }

        // Insert new network
        const query = 'INSERT INTO networks (name, logo_url, country) VALUES ($1, $2, $3) RETURNING *';
        const result = await pool.query(query, [name.trim(), logo_url || null, country || null]);

        res.status(201).json({
            message: 'Network created successfully',
            network: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating network:', error);

        // Handle unique constraint violation (duplicate name)
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Conflict',
                message: 'A network with this name already exists'
            });
        }

        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// PATCH - Update an existing network
router.patch('/:id', async (req, res) => {
    try {
        const networkId = parseInt(req.params.id);
        const { name, logo_url, country } = req.body;

        // Check if network exists
        const checkQuery = 'SELECT * FROM networks WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [networkId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Network not found' });
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

        if (logo_url !== undefined) {
            updates.push(`logo_url = $${paramCount}`);
            values.push(logo_url);
            paramCount++;
        }

        if (country !== undefined) {
            updates.push(`country = $${paramCount}`);
            values.push(country);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'At least one field (name, logo_url, or country) must be provided'
            });
        }

        // Add network ID to values
        values.push(networkId);

        const updateQuery = `UPDATE networks SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        const result = await pool.query(updateQuery, values);

        res.json({
            message: 'Network updated successfully',
            network: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating network:', error);

        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Conflict',
                message: 'A network with this name already exists'
            });
        }

        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

export default router;
