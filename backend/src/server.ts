import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3001', 10);

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
