import express from 'express';
import cors from 'cors';
import { getDbConnection } from './utils/connection';
import routes from './routes/index.js';
import dotenv from 'dotenv';
dotenv.config(); // Load .env variables

// dotenv.config({ path: '../.env.local' });
// console.log('Loaded TOKEN_SECRET:', process.env.TOKEN_SECRET);

const result = dotenv.config({ path: '../.env.local' });

if (result.error) {
  console.error('Failed to load .envfile:', result.error);
} else {
  console.log('Environment variables loaded:', result.parsed);
}

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize DB and start server
const startServer = async () => {
  await getDbConnection();

  // Routes
  app.use('/api', routes);

  app.listen(PORT, () => {
    console.log(
      `Example app listening at ${process.env.REACT_APP_API_BASE_URL}:${PORT}`
    );
  });
};

startServer();
