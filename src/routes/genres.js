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

// GET all genres
router.get('/', async (req, res) => {
    try {
        const sortBy = req.query.sortBy || 'name';
        const order = req.query.order || 'asc';

        // Whitelist of allowed sort fields
        const allowedSortFields = ['id', 'name'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
        const sortOrder = (order.toLowerCase() === 'desc') ? 'DESC' : 'ASC';

        const query = `SELECT * FROM genres ORDER BY ${sortField} ${sortOrder}`;
        const result = await pool.query(query);

        res.json({
            totalRecords: result.rows.length,
            results: result.rows
        });
    } catch (error) {
        console.error('Error fetching genres:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// GET one genre by ID
router.get('/:id', async (req, res) => {
    try {
        const genreId = req.params.id;

        const genreQuery = 'SELECT * FROM genres WHERE id = $1';
        const genreResult = await pool.query(genreQuery, [parseInt(genreId)]);

        if (genreResult.rows.length === 0) {
            return res.status(404).json({ error: 'Genre not found' });
        }

        res.json(genreResult.rows[0]);
    } catch (error) {
        console.error('Error fetching genre by ID:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// GET all shows for a specific genre
router.get('/:id/shows', async (req, res) => {
    try {
        const genreId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 25;

        // Verify genre exists
        const genreCheck = await pool.query('SELECT * FROM genres WHERE id = $1', [parseInt(genreId)]);
        if (genreCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Genre not found' });
        }

        // Count total shows for this genre
        const countQuery = `
            SELECT COUNT(*) FROM show_genres
            WHERE genre_id = $1
        `;
        const countResult = await pool.query(countQuery, [parseInt(genreId)]);
        const totalRecords = parseInt(countResult.rows[0].count);

        // Get paginated shows
        const offset = (page - 1) * pageSize;
        const query = `
            SELECT s.*
            FROM tv_shows s
            JOIN show_genres sg ON s.id = sg.show_id
            WHERE sg.genre_id = $1
            ORDER BY s.tmdb_rating DESC, s.popularity DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await pool.query(query, [parseInt(genreId), pageSize, offset]);

        res.json({
            genre: genreCheck.rows[0],
            totalRecords,
            currentPage: page,
            totalPages: Math.ceil(totalRecords / pageSize),
            pageSize,
            shows: result.rows.map(show => formatShowDates(show))
        });
    } catch (error) {
        console.error('Error fetching shows for genre:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// POST - Create a new genre
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Genre name is required'
            });
        }

        // Insert new genre
        const query = 'INSERT INTO genres (name) VALUES ($1) RETURNING *';
        const result = await pool.query(query, [name.trim()]);

        res.status(201).json({
            message: 'Genre created successfully',
            genre: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating genre:', error);

        // Handle unique constraint violation (duplicate name)
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Conflict',
                message: 'A genre with this name already exists'
            });
        }

        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// PATCH - Update an existing genre
router.patch('/:id', async (req, res) => {
    try {
        const genreId = parseInt(req.params.id);
        const { name } = req.body;

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Genre name is required'
            });
        }

        // Check if genre exists
        const checkQuery = 'SELECT * FROM genres WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [genreId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Genre not found' });
        }

        // Update genre
        const updateQuery = 'UPDATE genres SET name = $1 WHERE id = $2 RETURNING *';
        const result = await pool.query(updateQuery, [name.trim(), genreId]);

        res.json({
            message: 'Genre updated successfully',
            genre: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating genre:', error);

        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Conflict',
                message: 'A genre with this name already exists'
            });
        }

        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

export default router;
