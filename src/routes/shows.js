import express from 'express';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const router = express.Router();

let tvShows = [];

// Load CSV file into memory when the server starts
const loadCSVData = () => {
    const filePath = path.join(process.cwd(), 'data', 'tv_last1years.csv');
    const results = [];

    fs.createReadStream(filePath)
        .pipe(csv({ separator: '\t' })) // your data is tab-separated
        .on('data', (data) => results.push(data))
        .on('end', () => {
            tvShows = results;
            console.log(`Loaded ${tvShows.length} TV shows from CSV.`);
        });
};

loadCSVData();

// GET all shows (with optional pagination)
router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = tvShows.slice(start, end);

    res.json({
        page,
        pageSize,
        total: tvShows.length,
        shows: paginated
    });
});

// GET one show by ID
router.get('/:id', (req, res) => {
    const show = tvShows.find(s => s.ID === req.params.id);
    if (!show) {
        return res.status(404).json({ error: 'Show not found' });
    }
    res.json(show);
});

export default router;
