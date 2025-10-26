// app.js
import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import swaggerDocument from '../openapi.json' with { type: 'json' };
import showsRouter from './routes/shows.js';
import { checkApiKey } from './middleware/authMiddleware.js';

dotenv.config();
const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Protect all API routes with API key
app.use('/api', checkApiKey);

app.get('/', (req, res) => res.json({ message: 'Welcome to Group 5 TV API!' }));
app.use('/api/v1/shows', showsRouter);

app.listen(process.env.PORT || 3000);
