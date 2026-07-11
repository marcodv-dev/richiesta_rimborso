import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import rimborsiRoutes from './routes/rimborsi';
import categorieRoutes from './routes/categorie';
import statisticheRoutes from './routes/statistiche';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/utenti', authRoutes);
app.use('/api/rimborsi', rimborsiRoutes);
app.use('/api/categorie-spesa', categorieRoutes);
app.use('/api/statistiche', statisticheRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const frontendDist = path.join(__dirname, '../../dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist, {
    maxAge: '7d',
    etag: true,
    setHeaders(res, filePath) {
      if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
      if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.gif') || filePath.endsWith('.webp')) {
        res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
      }
    },
  }));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

export default app;
