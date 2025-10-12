import express from 'express';
import dotenv from 'dotenv';
import { checkApiKey } from './middleware/authMiddleware.js';
import showsRouter from './routes/shows.js';

// Load environment variables from .env file
dotenv.config();

console.log('Loaded API key:', process.env.API_KEY);

// Create the Express application
const app = express();

// Parse JSON bodies
app.use(express.json());

// Protect all routes with API key
app.use(checkApiKey);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Group 5 TV API!' });
});

// Mount the shows routes
app.use('/api/v1/shows', showsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
