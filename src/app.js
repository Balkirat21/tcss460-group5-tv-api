import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../openapi.json' with { type: 'json' };
import showsRouter from './routes/shows.js';
import actorsRouter from './routes/actors.js';
import networksRouter from './routes/networks.js';
import genresRouter from './routes/genres.js';
import creatorsRouter from './routes/creators.js';
import studiosRouter from './routes/studios.js';
import { checkApiKey } from './middleware/authMiddleware.js'; 

dotenv.config();

console.log('Loaded API key:', process.env.API_KEY);

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => res.json({ message: 'Welcome to Group 5 TV API!' }));

app.use(checkApiKey);

app.use('/api/shows', showsRouter);
app.use('/api/actors', actorsRouter);
app.use('/api/networks', networksRouter);
app.use('/api/genres', genresRouter);
app.use('/api/creators', creatorsRouter);
app.use('/api/studios', studiosRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
