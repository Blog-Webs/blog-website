// Tracks currently connected sockets and broadcasts the live count
// to every client whenever someone connects or disconnects.

let io;
const connectedSockets = new Set();

const initSocket = (server, corsOrigins) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: corsOrigins,
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
