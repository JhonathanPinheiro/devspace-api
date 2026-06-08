import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'

import { errorMiddleware } from './middlewares/error.middleware';
import { authRoutes } from './routes/auth.routes';

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    credentials: true,
  })
)
app.use(express.json());

app.use(cookieParser())

app.use('/auth', authRoutes);

app.use(errorMiddleware);

export default app;