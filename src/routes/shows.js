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

// GET shows by year
router.get('/showbyyear/:year', async (req, res) => {
    try {
        const year = req.params.year;

        // Query shows where first_air_date year matches
        const query = `
            SELECT * FROM tv_shows
            WHERE EXTRACT(YEAR FROM first_air_date) = $1
        `;

        const result = await pool.query(query, [parseInt(year)]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'No shows found for this year',
                year: year
            });
        }

        res.json({
            year: year,
            count: result.rows.length,
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

export default router;
