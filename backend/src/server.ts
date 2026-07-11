import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import rimborsiRoutes from './routes/rimborsi';
import categorieRoutes from './routes/categorie';
import statisticheRoutes from './routes/statistiche';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

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

const tryListen = (port: number) => {
  const server = app.listen(port, () => {
    console.log(`Backend server in ascolto sulla porta ${port}`);
  });
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Porta ${port} occupata, provo ${port + 1}...`);
      tryListen(port + 1);
    } else {
      console.error('Errore del server:', err);
    }
  });
};

tryListen(PORT);
