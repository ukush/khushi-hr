/**
 * Simple Express server demonstrating TypeScript + Prisma client usage.
 * Keep this minimal: a health endpoint and a placeholder user route.
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { usersRouter } from './routes/users';
import { shiftsRouter } from './routes/shifts';
import { adminRouter } from './routes/admin';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/users', usersRouter);
app.use('/api/shifts', shiftsRouter);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // Log startup so developer knows server is running.
  console.log(`Backend listening on http://localhost:${PORT}`);
});
