import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export default function ChatList({ chats, allUsers = [], selectedChat, onSelectChat, onStartNewChat, currentUser }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Helper to check if date is valid
    const isValidDate = (date) => {
        if (!date) return false;
        const d = new Date(date);
        return d instanceof Date && !isNaN(d.getTime());
    };

    // Filter existing chats
    const filteredChats = chats.filter((chat) => {
        const otherUser = chat.participants.find((p) => p._id !== currentUser.id);
        return (
            otherUser.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            otherUser.fullName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    // Filter all users (exclude current user  and users already in chats)
    const chatUserIds = chats.flatMap(chat =>
        chat.participants.map(p => p._id)
    );

    const filteredUsers = searchQuery.trim()
        ? allUsers.filter((user) => {
            const isInChats = chatUserIds.includes(user._id);
            const matchesSearch =
                user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.fullName.toLowerCase().includes(searchQuery.toLowerCase());

            return !isInChats && matchesSearch;
        })
        : [];

    return (
        <div className="h-full flex flex-col bg-white border-r">
            {/* Search Bar */}
            <div className="p-4 border-b">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 rounded-lg border-2 border-gray-200 focus:border-primary-500 outline-none"
                        placeholder="Search chats..."
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <FiX />
                        </button>
                    )}
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {/* Show discovered users if searching */}
                {searchQuery.trim() && filteredUsers.length > 0 && (
                    <div className="border-b-2 border-primary-200">
                        <div className="px-4 py-2 bg-primary-50 text-primary-800 text-sm font-semibold">
                            Discover Users
                        </div>
                        {filteredUsers.map((user) => (
                            <div
                                key={user._id}
                                onClick={() => {
                                    onStartNewChat(user._id);
                                    setSearchQuery('');
                                }}
                                className="p-4 border-b cursor-pointer hover:bg-blue-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                            {user.profilePicture ? (
                                                <img
                                                    src={user.profilePicture}
                                                    alt={user.fullName}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                user.fullName?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        {user.isOnline && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                                        <p className="text-sm text-gray-500">@{user.username}</p>
                                    </div>
                                    <span className="text-xs text-blue-600 font-semibold">+ New Chat</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Existing Chats */}
                {filteredChats.length === 0 && filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>{searchQuery ? 'No users or chats found' : 'No chats yet'}</p>
                        {!searchQuery && (
                            <p className="text-sm mt-2">Search for users to start chatting</p>
                        )}
                    </div>
                ) : (
                    filteredChats.map((chat) => {
                        const otherUser = chat.participants.find((p) => p._id !== currentUser.id);
                        const isSelected = selectedChat?._id === chat._id;

                        // Count unread messages (you'd implement this with actual unread logic)
                        const unreadCount = 0; // Placeholder

                        return (
                            <div
                                key={chat._id}
                                onClick={() => onSelectChat(chat)}
                                className={`p-4 border-b cursor-pointer transition-colors ${isSelected ? 'bg-primary-50 border-l-4 border-l-primary-600' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
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
                                        {/* Online Indicator */}
                                        {otherUser.isOnline && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                        )}
                                    </div>

                                    {/* Chat Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {otherUser.fullName}
                                            </h3>
                                            <div className="flex flex-col items-end">
                                                {chat.lastMessage && isValidDate(chat.lastMessage.createdAt) && (
                                                    <span className="text-xs text-gray-500">
                                                        {formatDistanceToNow(new Date(chat.lastMessage.createdAt), {
                                                            addSuffix: false,
                                                        })}
                                                    </span>
                                                )}
                                                {!otherUser.isOnline && isValidDate(otherUser.lastSeen) && (
                                                    <span className="text-xs text-gray-400">
                                                        {formatDistanceToNow(new Date(otherUser.lastSeen), {
                                                            addSuffix: true,
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-600 truncate">
                                                {chat.lastMessage?.content || 'No messages yet'}
                                            </p>
                                            {unreadCount > 0 && (
                                                <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
