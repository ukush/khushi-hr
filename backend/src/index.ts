/**
 * Simple Express server demonstrating TypeScript + Prisma client usage.
 * Keep this minimal: a health endpoint and a placeholder user route.
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
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

// Serve the built frontend (if present) so the API and UI can run as a single
// deployed service. In local dev, frontend/dist doesn't exist and the
// frontend is served separately by the Vite dev server.
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // Log startup so developer knows server is running.
  console.log(`Backend listening on http://localhost:${PORT}`);
});
