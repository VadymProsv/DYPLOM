const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

module.exports = (io) => {
  // Middleware для аутентифікації через WebSocket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user.name);

    // Приєднання до кімнати події
    socket.on('join_event', (eventId) => {
      socket.join(eventId);
      console.log(`${socket.user.name} joined event: ${eventId}`);
    });

    // Від'єднання від кімнати події
    socket.on('leave_event', (eventId) => {
      socket.leave(eventId);
      console.log(`${socket.user.name} left event: ${eventId}`);
    });

    // Обробка друку повідомлення
    socket.on('typing', (eventId) => {
      socket.to(eventId).emit('user_typing', {
        userId: socket.user._id,
        name: socket.user.name
      });
    });

    // Обробка припинення друку
    socket.on('stop_typing', (eventId) => {
      socket.to(eventId).emit('user_stop_typing', {
        userId: socket.user._id
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user.name);
    });
  });
}; 