require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets/liveUsers');

// Initialize background workers
require('./modules/studentos/services/RagWorker');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

initSocket(server, allowedOrigins);

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`[Server] HttpTechNex API running on http://localhost:${PORT}`);
  });
};

start();

process.on('unhandledRejection', (err) => {
  console.error('[UnhandledRejection]', err);
});
