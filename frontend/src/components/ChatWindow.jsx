import { useState, useEffect, useRef } from 'react';
import { FiSend, FiImage, FiTrash2 } from 'react-icons/fi';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import api from '../utils/api';

export default function ChatWindow({
    chat,
    messages,
    currentUser,
    socket,
    onSendMessage,
    onDeleteMessage,
    onDeleteChat,
}) {
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const otherUser = chat.participants.find((p) => p._id !== currentUser.id);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Socket listeners for typing
    useEffect(() => {
        if (!socket) return;

        const handleTypingStart = ({ userId, username }) => {
            if (userId !== currentUser.id) {
                setTypingUsers((prev) => new Set(prev).add(username));
            }
        };

        const handleTypingStop = ({ userId }) => {
            if (userId !== currentUser.id) {
                setTypingUsers((prev) => {
                    const newSet = new Set(prev);
                    // Remove by matching any username from this user
                    return newSet;
                });
                setTypingUsers(new Set());
            }
        };

        socket.on('typing:start', handleTypingStart);
        socket.on('typing:stop', handleTypingStop);

        return () => {
            socket.off('typing:start', handleTypingStart);
            socket.off('typing:stop', handleTypingStop);
        };
    }, [socket, currentUser.id]);

    const handleTyping = () => {
        if (!isTyping && socket) {
            setIsTyping(true);
            socket.emit('typing:start', {
                chatId: chat._id,
                userId: currentUser.id,
                username: currentUser.username,
            });
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            if (socket) {
                socket.emit('typing:stop', {
                    chatId: chat._id,
                    userId: currentUser.id,
                });
            }
        }, 1000);
    };

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        onSendMessage({ content: newMessage });
        setNewMessage('');

        // Stop typing indicator
        if (socket) {
            socket.emit('typing:stop', {
                chatId: chat._id,
                userId: currentUser.id,
            });
        }
        setIsTyping(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingMedia(true);

        try {
            const formData = new FormData();
            formData.append('media', file);

            // Determine media type
            let mediaType = 'image';
            if (file.type.startsWith('video/')) mediaType = 'video';
            else if (file.type.startsWith('audio/')) mediaType = 'audio';

            formData.append('mediaType', mediaType);

            const response = await api.post('/message/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            onSendMessage({ media: response.data });
        } catch (error) {
            console.error('File upload error:', error);
            alert('Failed to upload file');
        }

        setUploadingMedia(false);
        e.target.value = '';
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary-50 to-secondary-50">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                            {otherUser.profilePicture ? (
                                <img
                                    src={otherUser.profilePicture}
                                    alt={otherUser.fullName}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                otherUser.fullName?.charAt(0).toUpperCase()
                            )}
                        </div>
                        {otherUser.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">{otherUser.fullName}</h2>
                        <p className="text-sm text-gray-500">
                            {otherUser.isOnline ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={onDeleteChat}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                    title="Delete Chat"
                >
                    <FiTrash2 size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-purple-50/20">
                {messages.map((message) => (
                    <Message
                        key={message._id}
                        message={message}
                        currentUserId={currentUser.id}
                        onDelete={onDeleteMessage}
                    />
                ))}

                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                    <div className="flex justify-start mb-4">
                        <TypingIndicator />
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
                <div className="flex items-end gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*,video/*,audio/*"
                        className="hidden"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingMedia}
                        className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
                        title="Attach Media"
                    >
                        <FiImage size={20} />
                    </button>

                    <textarea
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        onKeyPress={handleKeyPress}
                        className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 outline-none resize-none"
                        placeholder="Type a message..."
                        rows="1"
                        style={{ maxHeight: '120px' }}
                    />

                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || uploadingMedia}
                        className="p-3 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Send Message"
                    >
                        <FiSend size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
