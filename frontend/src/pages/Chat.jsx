import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import api from '../utils/api';
import { FiMessageCircle } from 'react-icons/fi';
import useNotificationPreferences from '../hooks/useNotificationPreferences';
import useNotificationSound from '../hooks/useNotificationSound';
import useTabFocus from '../hooks/useTabFocus';

export default function Chat() {
    const { user } = useAuth();
    const { socket, connected } = useSocket();

    // Notification sound hooks
    const notificationPreferences = useNotificationPreferences();
    const { playNotificationSound } = useNotificationSound(notificationPreferences);
    const isTabFocused = useTabFocus();

    const [chats, setChats] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch chats and all users
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch chats
                const chatsResponse = await api.get('/chat');
                setChats(chatsResponse.data.chats);

                // Fetch all users for discovery
                const usersResponse = await api.get('/user/all');
                setAllUsers(usersResponse.data.users);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fetch messages when chat is selected
    useEffect(() => {
        if (!selectedChat) return;

        const fetchMessages = async () => {
            try {
                const response = await api.get(`/message/${selectedChat._id}`);
                setMessages(response.data.messages);

                // Mark messages as read
                if (socket) {
                    socket.emit('chat:read', { chatId: selectedChat._id });
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        };

        fetchMessages();

        // Join chat room
        if (socket) {
            socket.emit('chat:join', selectedChat._id);
        }

        return () => {
            if (socket) {
                socket.emit('chat:leave', selectedChat._id);
            }
        };
    }, [selectedChat, socket]);

    // Socket listeners
    useEffect(() => {
        if (!socket || !selectedChat) return;

        const handleMessageReceive = (message) => {
            if (message.chat === selectedChat._id) {
                setMessages((prev) => [...prev, message]);

                // Play notification sound for messages from other users
                if (message.sender._id !== user.id) {
                    playNotificationSound(message.sender._id, user.id);
                }

                // Mark as delivered
                socket.emit('message:delivered', {
                    messageId: message._id,
                    chatId: selectedChat._id,
                });

                // Mark as read
                socket.emit('message:read', {
                    messageId: message._id,
                    chatId: selectedChat._id,
                });

                // Update chat's lastMessage
                setChats((prev) =>
                    prev.map((chat) =>
                        chat._id === selectedChat._id ? { ...chat, lastMessage: message } : chat
                    )
                );
            }
        };

        const handleMessageStatus = ({ messageId, status }) => {
            setMessages((prev) =>
                prev.map((msg) => (msg._id === messageId ? { ...msg, status } : msg))
            );
        };

        const handleMessageDeleted = ({ messageId, deleteFor }) => {
            if (deleteFor === 'both') {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === messageId ? { ...msg, deletedForEveryone: true } : msg
                    )
                );
            } else {
                setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
            }
        };

        socket.on('message:receive', handleMessageReceive);
        socket.on('message:status', handleMessageStatus);
        socket.on('message:deleted', handleMessageDeleted);

        return () => {
            socket.off('message:receive', handleMessageReceive);
            socket.off('message:status', handleMessageStatus);
            socket.off('message:deleted', handleMessageDeleted);
        };
    }, [socket, selectedChat]);

    // Socket listeners for online/offline status
    useEffect(() => {
        if (!socket) return;

        const handleUserStatus = ({ userId, isOnline, lastSeen }) => {
            console.log('👤 User status update:', userId, { isOnline, lastSeen });

            // Update in allUsers
            setAllUsers((prev) =>
                prev.map((user) =>
                    user._id === userId ? { ...user, isOnline, lastSeen } : user
                )
            );

            // Update in chats
            setChats((prev) =>
                prev.map((chat) => ({
                    ...chat,
                    participants: chat.participants.map((p) =>
                        p._id === userId ? { ...p, isOnline, lastSeen } : p
                    ),
                }))
            );
        };

        socket.on('user:status', handleUserStatus);

        return () => {
            socket.off('user:status', handleUserStatus);
        };
    }, [socket]);

    const handleSendMessage = ({ content, media, replyToId }) => {
        if (!socket || !selectedChat) return;

        socket.emit('message:send', {
            chatId: selectedChat._id,
            content: content || '',
            media: media || { type: '', url: '' },
            replyToId: replyToId || null,
        });
    };

    const handleDeleteMessage = async (messageId, deleteFor) => {
        try {
            await api.delete(`/message/${messageId}`, {
                data: { deleteFor },
            });

            if (deleteFor === 'both' && socket) {
                socket.emit('message:delete', {
                    messageId,
                    chatId: selectedChat._id,
                    deleteFor: 'both',
                });
            } else {
                setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    const handleDeleteChat = async () => {
        if (!selectedChat) return;

        const confirmDelete = window.confirm('Are you sure you want to delete this chat?');
        if (!confirmDelete) return;

        try {
            await api.delete(`/chat/${selectedChat._id}`);

            // Clear messages first
            setMessages([]);

            // Remove chat from list
            setChats((prev) => prev.filter((chat) => chat._id !== selectedChat._id));

            // Deselect chat
            setSelectedChat(null);
        } catch (error) {
            console.error('Failed to delete chat:', error);
        }
    };

    // Handle creating new chat with user
    const handleStartNewChat = async (userId) => {
        try {
            const response = await api.post('/chat', { participantId: userId });
            const newChat = response.data.chat;

            // Check if chat already exists in list
            const existingChat = chats.find(c => c._id === newChat._id);
            if (!existingChat) {
                setChats((prev) => [newChat, ...prev]);
            }

            setSelectedChat(newChat);
        } catch (error) {
            console.error('Failed to create chat:', error);
        }
    };

    return (
        <div className="h-screen flex flex-col">
            <Navbar />

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Chat List */}
                <div className={`w-full md:w-96 flex-shrink-0 ${selectedChat ? 'hidden md:block' : 'block'}`}>
                    <ChatList
                        chats={chats}
                        allUsers={allUsers}
                        selectedChat={selectedChat}
                        onSelectChat={setSelectedChat}
                        onStartNewChat={handleStartNewChat}
                        currentUser={user}
                    />
                </div>

                {/* Right Panel - Chat Window */}
                <div className={`flex-1 ${selectedChat ? 'block' : 'hidden md:block'}`}>
                    {selectedChat ? (
                        <ChatWindow
                            chat={selectedChat}
                            messages={messages}
                            currentUser={user}
                            socket={socket}
                            onSendMessage={handleSendMessage}
                            onDeleteMessage={handleDeleteMessage}
                            onDeleteChat={handleDeleteChat}
                            onBack={() => setSelectedChat(null)}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                            <div className="text-center px-4">
                                <FiMessageCircle className="text-6xl sm:text-8xl text-gray-300 mx-auto mb-4" />
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-400 mb-2">
                                    Select a chat to start messaging
                                </h2>
                                <p className="text-sm sm:text-base text-gray-400">
                                    Choose a conversation from the left to begin
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Connection Status */}
            {!connected && (
                <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-3 py-2 sm:px-4 rounded-lg shadow-lg text-sm sm:text-base z-50">
                    Reconnecting...
                </div>
            )}
        </div>
    );
}
