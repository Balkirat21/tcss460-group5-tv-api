import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

// GET all shows (with optional pagination)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 25;
        const offset = (page - 1) * pageSize;
        const nameFilter = req.query.name ? req.query.name.toLowerCase() : null;
        const genreFilter = req.query.genre ? req.query.genre.toLowerCase() : null;

        // Build the query dynamically based on filters
        let query = 'SELECT * FROM tvshows WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (nameFilter) {
            query += ` AND LOWER(name) LIKE $${paramCount}`;
            params.push(`%${nameFilter}%`);
            paramCount++;
        }

        if (genreFilter) {
            query += ` AND LOWER(genres) LIKE $${paramCount}`;
            params.push(`%${genreFilter}%`);
            paramCount++;
        }

        // Count total records
        const countResult = await pool.query(query.replace('SELECT *', 'SELECT COUNT(*) as total'));
        const totalRecords = parseInt(countResult.rows[0].total);

        // Add pagination
        query += ` ORDER BY showid LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
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
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET one show by ID
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tvshows WHERE showid = $1', [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Show not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching show:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST - Create a new show
router.post('/', async (req, res) => {
    try {
        const { showid, name, originalname, firstairdate, lastairdate, seasons, episodes, status, overview, popularity, tmdb_rating, vote_count, poster_url, backdrop_url, genres } = req.body;

        // Validate required fields
        if (!showid || !name) {
            return res.status(400).json({ error: 'ShowID and Name are required fields' });
        }

        // Check if show already exists
        const existingShow = await pool.query('SELECT * FROM tvshows WHERE showid = $1', [showid]);
        if (existingShow.rows.length > 0) {
            return res.status(409).json({ error: 'Show with this ID already exists' });
        }

        const result = await pool.query(
            `INSERT INTO tvshows (showid, name, originalname, firstairdate, lastairdate, seasons, episodes, status, overview, popularity, tmdb_rating, vote_count, poster_url, backdrop_url, genres)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
             RETURNING *`,
            [showid, name, originalname, firstairdate, lastairdate, seasons, episodes, status, overview, popularity, tmdb_rating, vote_count, poster_url, backdrop_url, genres]
        );

        res.status(201).json({
            message: 'Show created successfully',
            show: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating show:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT - Update an existing show
router.put('/:id', async (req, res) => {
    try {
        const showId = req.params.id;
        const updates = req.body;

        // Check if show exists
        const existingShow = await pool.query('SELECT * FROM tvshows WHERE showid = $1', [showId]);
        if (existingShow.rows.length === 0) {
            return res.status(404).json({ error: 'Show not found' });
        }

        // Build dynamic update query
        const fields = Object.keys(updates);
        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        const values = [showId, ...fields.map(field => updates[field])];
        const query = `UPDATE tvshows SET ${setClause} WHERE showid = $1 RETURNING *`;

        const result = await pool.query(query, values);

        res.json({
            message: 'Show updated successfully',
            show: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating show:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE - Delete a show
router.delete('/:id', async (req, res) => {
    try {
        const showId = req.params.id;

        // Check if show exists
        const existingShow = await pool.query('SELECT * FROM tvshows WHERE showid = $1', [showId]);
        if (existingShow.rows.length === 0) {
            return res.status(404).json({ error: 'Show not found' });
        }

        const result = await pool.query('DELETE FROM tvshows WHERE showid = $1 RETURNING *', [showId]);

        res.json({
            message: 'Show deleted successfully',
            deleted: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting show:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;