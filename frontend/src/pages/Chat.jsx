import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import api from '../utils/api';
import { FiMessageCircle } from 'react-icons/fi';

export default function Chat() {
    const { user } = useAuth();
    const { socket, connected } = useSocket();

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

    const handleSendMessage = ({ content, media }) => {
        if (!socket || !selectedChat) return;

        socket.emit('message:send', {
            chatId: selectedChat._id,
            content: content || '',
            media: media || { type: '', url: '' },
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
            setChats((prev) => prev.filter((chat) => chat._id !== selectedChat._id));
            setSelectedChat(null);
            setMessages([]);
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
                <div className="w-full md:w-96 flex-shrink-0">
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
                <div className="flex-1 hidden md:block">
                    {selectedChat ? (
                        <ChatWindow
                            chat={selectedChat}
                            messages={messages}
                            currentUser={user}
                            socket={socket}
                            onSendMessage={handleSendMessage}
                            onDeleteMessage={handleDeleteMessage}
                            onDeleteChat={handleDeleteChat}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                            <div className="text-center">
                                <FiMessageCircle className="text-8xl text-gray-300 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-400 mb-2">
                                    Select a chat to start messaging
                                </h2>
                                <p className="text-gray-400">
                                    Choose a conversation from the left to begin
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Connection Status */}
            {!connected && (
                <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
                    Reconnecting...
                </div>
            )}
        </div>
    );
}
