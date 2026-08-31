// Tracks currently connected sockets and broadcasts the live count
// to every client whenever someone connects or disconnects.

let io;
const connectedSockets = new Set();

const { isAllowedOrigin } = require('../config/cors');

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    connectedSockets.add(socket.id);
    broadcastCount();

    socket.on('disconnect', () => {
      connectedSockets.delete(socket.id);
      broadcastCount();
    });
  });

  return io;
};

const broadcastCount = () => {
  if (io) {
    io.emit('liveUserCount', connectedSockets.size);
  }
};

const getLiveCount = () => connectedSockets.size;

module.exports = { initSocket, getLiveCount };
