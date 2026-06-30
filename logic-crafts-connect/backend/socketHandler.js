import jwt from 'jsonwebtoken';
import User from './models/User.js';

const socketHandler = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select('-password');
      
      if (!socket.user) {
        return next(new Error('Authentication error: User not found'));
      }

      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);
    
    // Join a room based on the user's ID
    socket.join(socket.user._id.toString());

    // Join a role-based room (useful for broadcasting to all artisans or all buyers)
    if (socket.user.role) {
      socket.join(socket.user.role);
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.user._id})`);
    });
  });
};

export default socketHandler;
