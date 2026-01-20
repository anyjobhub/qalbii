import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// Store online users
const onlineUsers = new Map(); // userId -> socketId

export default function (io) {
    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.id}`);

        // Join user to their personal room
        socket.on('user:online', async (userId) => {
            try {
                onlineUsers.set(userId, socket.id);
                socket.userId = userId;

                // Update user status
                await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });

                // Notify user's contacts that they're online
                socket.broadcast.emit('user:status', { userId, isOnline: true });
            } catch (error) {
                console.error('user:online error:', error);
            }
        });

        // Join a chat room
        socket.on('chat:join', (chatId) => {
            socket.join(chatId);
            console.log(`User ${socket.userId} joined chat ${chatId}`);
        });

        // Leave a chat room
        socket.on('chat:leave', (chatId) => {
            socket.leave(chatId);
            console.log(`User ${socket.userId} left chat ${chatId}`);
        });

        // Send message
        socket.on('message:send', async (data) => {
            try {
                const { chatId, content, media } = data;

                // Create message
                const message = await Message.create({
                    chat: chatId,
                    sender: socket.userId,
                    content: content || '',
                    media: media || { type: '', url: '' },
                    status: 'sent',
                });

                // Populate sender info
                await message.populate('sender', 'username fullName profilePicture');

                // Update chat's lastMessage
                await Chat.findByIdAndUpdate(chatId, {
                    lastMessage: message._id,
                    updatedAt: new Date(),
                });

                // Get chat to find recipient
                const chat = await Chat.findById(chatId).populate('participants', '_id username fullName');

                // Emit message to the chat room
                io.to(chatId).emit('message:receive', message);

                // Create notification for recipient if they're offline
                const recipient = chat.participants.find((p) => p._id.toString() !== socket.userId);
                if (recipient && !onlineUsers.has(recipient._id.toString())) {
                    await Notification.create({
                        user: recipient._id,
                        type: 'message',
                        title: 'New Message',
                        message: `${message.sender.fullName} sent you a message`,
                        relatedUser: socket.userId,
                        relatedChat: chatId,
                    });
                }

                console.log(`Message sent in chat ${chatId}`);
            } catch (error) {
                console.error('message:send error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Typing indicator
        socket.on('typing:start', (data) => {
            const { chatId, userId, username } = data;
            socket.to(chatId).emit('typing:start', { userId, username });
        });

        socket.on('typing:stop', (data) => {
            const { chatId, userId } = data;
            socket.to(chatId).emit('typing:stop', { userId });
        });

        // Message status updates
        socket.on('message:delivered', async (data) => {
            try {
                const { messageId, chatId } = data;

                await Message.findByIdAndUpdate(messageId, { status: 'delivered' });

                io.to(chatId).emit('message:status', {
                    messageId,
                    status: 'delivered',
                });
            } catch (error) {
                console.error('message:delivered error:', error);
            }
        });

        socket.on('message:read', async (data) => {
            try {
                const { messageId, chatId } = data;

                await Message.findByIdAndUpdate(messageId, { status: 'read' });

                io.to(chatId).emit('message:status', {
                    messageId,
                    status: 'read',
                });
            } catch (error) {
                console.error('message:read error:', error);
            }
        });

        // Mark all messages in chat as read
        socket.on('chat:read', async (data) => {
            try {
                const { chatId } = data;

                await Message.updateMany(
                    { chat: chatId, sender: { $ne: socket.userId } },
                    { status: 'read' }
                );

                socket.to(chatId).emit('chat:read', { chatId, userId: socket.userId });
            } catch (error) {
                console.error('chat:read error:', error);
            }
        });

        // Delete message
        socket.on('message:delete', async (data) => {
            try {
                const { messageId, chatId, deleteFor } = data;

                const message = await Message.findById(messageId);

                if (!message) {
                    return socket.emit('error', { message: 'Message not found' });
                }

                if (deleteFor === 'both') {
                    message.deletedForEveryone = true;
                    await message.save();

                    // Notify everyone in the chat
                    io.to(chatId).emit('message:deleted', { messageId, deleteFor: 'both' });
                } else {
                    // This is handled via API, but we can emit an event for UI update
                    socket.emit('message:deleted', { messageId, deleteFor: 'self' });
                }
            } catch (error) {
                console.error('message:delete error:', error);
            }
        });

        // Disconnect
        socket.on('disconnect', async () => {
            try {
                if (socket.userId) {
                    onlineUsers.delete(socket.userId);

                    // Update user status
                    await User.findByIdAndUpdate(socket.userId, {
                        isOnline: false,
                        lastSeen: new Date(),
                    });

                    // Notify user's contacts that they're offline
                    socket.broadcast.emit('user:status', {
                        userId: socket.userId,
                        isOnline: false,
                    });
                }

                console.log(`❌ User disconnected: ${socket.id}`);
            } catch (error) {
                console.error('disconnect error:', error);
            }
        });
    });
}
