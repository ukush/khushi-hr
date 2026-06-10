/**
 * Simple Express server demonstrating TypeScript + Prisma client usage.
 * Keep this minimal: a health endpoint and a placeholder user route.
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // Log startup so developer knows server is running.
  console.log(`Backend listening on http://localhost:${PORT}`);
});
