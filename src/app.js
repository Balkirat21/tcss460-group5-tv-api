import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../openapi.json' with { type: 'json' };
import showsRouter from './routes/shows.js';
import authRouter from './routes/auth.js';
import { checkApiKey } from './middleware/authMiddleware.js'; 

dotenv.config();

console.log('Loaded API key:', process.env.API_KEY);

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => res.json({ message: 'Welcome to Group 5 TV API!' }));

// Auth routes (NO API key required - these create the tokens!)
app.use('/auth', authRouter);

// Apply API key check to all routes below this line
app.use(checkApiKey);

app.use('/api/v1/shows', showsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
