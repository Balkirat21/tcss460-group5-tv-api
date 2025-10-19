// app.js
import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../openapi.json' with { type: 'json' };
import showsRouter from './routes/shows.js';
// import { checkApiKey } from './middleware/authMiddleware.js'; // ← comment out

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// app.use(checkApiKey); // ← comment out

app.get('/', (req, res) => res.json({ message: 'Welcome to Group 5 TV API!' }));
app.use('/api/v1/shows', showsRouter);

app.listen(process.env.PORT || 3000);
