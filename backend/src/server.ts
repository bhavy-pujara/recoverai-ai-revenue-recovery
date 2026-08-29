import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  ======================================================
  🚀 RecoverAI API Engine is Running!
  ------------------------------------------------------
  📡 URL:         http://localhost:${PORT}
  🏥 Health Check: http://localhost:${PORT}/api/health
  🤖 AI Engine:   Deterministic Local AI Scoring Active
  🛡️  Environment: ${process.env.NODE_ENV || 'development'}
  💡 Disclaimer:  Simulated payment data (Portfolio Demo)
  ======================================================
  `);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
