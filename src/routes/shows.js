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

// POST - Create a new show
router.post('/', async (req, res) => {
    try {
        const { name, original_name, genres, first_air_date, overview, vote_average, vote_count, popularity, status } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        // Insert new show into database
        const query = `
            INSERT INTO tv_shows (name, original_name, genres, first_air_date, overview, vote_average, vote_count, popularity, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;

        const values = [
            name,
            original_name || name,
            genres || '',
            first_air_date || null,
            overview || '',
            vote_average || 0,
            vote_count || 0,
            popularity || 0,
            status || 'Unknown'
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: 'Show created successfully',
            show: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating show:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// PUT - Update an existing show
router.put('/:id', async (req, res) => {
    try {
        const showId = req.params.id;
        const { name, original_name, genres, first_air_date, overview, vote_average, vote_count, popularity, status } = req.body;

        // Check if show exists
        const checkQuery = 'SELECT * FROM tv_shows WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [parseInt(showId)]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Show not found' });
        }

        // Build dynamic update query
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(name);
        }
        if (original_name !== undefined) {
            updates.push(`original_name = $${paramCount++}`);
            values.push(original_name);
        }
        if (genres !== undefined) {
            updates.push(`genres = $${paramCount++}`);
            values.push(genres);
        }
        if (first_air_date !== undefined) {
            updates.push(`first_air_date = $${paramCount++}`);
            values.push(first_air_date);
        }
        if (overview !== undefined) {
            updates.push(`overview = $${paramCount++}`);
            values.push(overview);
        }
        if (vote_average !== undefined) {
            updates.push(`vote_average = $${paramCount++}`);
            values.push(vote_average);
        }
        if (vote_count !== undefined) {
            updates.push(`vote_count = $${paramCount++}`);
            values.push(vote_count);
        }
        if (popularity !== undefined) {
            updates.push(`popularity = $${paramCount++}`);
            values.push(popularity);
        }
        if (status !== undefined) {
            updates.push(`status = $${paramCount++}`);
            values.push(status);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(parseInt(showId));
        const query = `
            UPDATE tv_shows
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        res.json({
            message: 'Show updated successfully',
            show: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating show:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// DELETE - Remove a show
router.delete('/:id', async (req, res) => {
    try {
        const showId = req.params.id;

        // Check if show exists and get it before deleting
        const checkQuery = 'SELECT * FROM tv_shows WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [parseInt(showId)]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Show not found' });
        }

        const deletedShow = checkResult.rows[0];

        // Delete the show
        const deleteQuery = 'DELETE FROM tv_shows WHERE id = $1';
        await pool.query(deleteQuery, [parseInt(showId)]);

        res.json({
            message: 'Show deleted successfully',
            deleted: {
                id: deletedShow.id,
                name: deletedShow.name
            }
        });
    } catch (error) {
        console.error('Error deleting show:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

export default router;
