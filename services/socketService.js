const jwt = require('jsonwebtoken');
const { Message } = require('../models');

const initializeSocketService = (io, jwtSecret) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token'));
      }

      socket.userId = decoded.id;
      next();
    });
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    console.log(`✅ User ${userId} connected via Socket.io, Socket ID: ${socket.id}`);
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined room: user_${userId}`);

    socket.on('send_message', async (data) => {
      try {
        console.log('📨 Received send_message event:', { data, socketUserId: socket.userId });
        const { receiverId, content } = data;

        // Buscar o username do remetente pelo ID (ou já é username)
        const { User } = require('../models');
        const sender = await User.findOne({ where: { username: socket.userId } });

        if (!sender) {
          console.log('❌ Sender not found:', socket.userId);
          socket.emit('error', { message: 'User not found' });
          return;
        }

        const senderId = sender.id;

        if (!receiverId || !content) {
          console.log('❌ Missing required fields:', { receiverId, content });
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        // Buscar o username do destinatário pelo ID
        const receiver = await User.findOne({ where: { id: receiverId }, attributes: ['username'] });

        if (!receiver) {
          console.log('❌ Receiver not found:', receiverId);
          socket.emit('error', { message: 'Receiver not found' });
          return;
        }

        console.log('💾 Saving message to database...', { senderId, receiverId });
        const message = await Message.create({
          senderId,
          receiverId,
          content,
          seen: false
        });
        console.log('✅ Message saved:', message.id);

        const messageData = {
          id: message.id,
          senderId,
          receiverId,
          content,
          seen: false,
          createdAt: message.createdAt
        };

        const receiverRoom = `user_${receiver.username}`;
        console.log('📤 Emitting to receiver room:', receiverRoom);

        // Verificar quantos sockets estão no room do destinatário
        const socketsInRoom = await io.in(receiverRoom).fetchSockets();
        console.log(`👥 Sockets in ${receiverRoom}:`, socketsInRoom.length, 'IDs:', socketsInRoom.map(s => s.id));

        io.to(receiverRoom).emit('receive_message', messageData);
        console.log('📤 Emitting to sender');
        socket.emit('receive_message', messageData);
      } catch (error) {
        console.error('❌ Error in send_message:', error);
        socket.emit('error', { message: 'Error sending message', details: error.message });
      }
    });

    socket.on('mark_seen', async (data) => {
      try {
        const { messageId } = data;
        if (!messageId) return;

        await Message.update({ seen: true }, { where: { id: messageId } });
      } catch (error) {
        console.error('Error marking message as seen:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`âŒ User ${socket.userId} disconnected`);
    });
  });
};

module.exports = { initializeSocketService };
