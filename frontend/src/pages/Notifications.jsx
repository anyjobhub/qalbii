import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { formatDistanceToNow } from 'date-fns';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notification');
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notification/${id}/read`);
            setNotifications((prev) =>
                prev.map((notif) => (notif._id === id ? { ...notif, read: true } : notif))
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleClearAll = async () => {
        const confirmClear = window.confirm('Are you sure you want to clear all notifications?');
        if (!confirmClear) return;

        try {
            await api.delete('/notification/clear');
            setNotifications([]);
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'message':
                return '💬';
            case 'security':
                return '🔒';
            case 'system':
                return '⚙️';
            default:
                return '🔔';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8 fade-in">
                    <div>
                        <h1 className="text-4xl font-bold gradient-text mb-2">Notifications</h1>
                        <p className="text-gray-600">Stay updated with your activity</p>
                    </div>

                    {notifications.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-2"
                        >
                            <FiTrash2 />
                            Clear All
                        </button>
                    )}
                </div>

                <div className="space-y-4 fade-in">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="card text-center py-12">
                            <FiBell className="text-6xl text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-gray-400 mb-2">No notifications</h2>
                            <p className="text-gray-400">You're all caught up!</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`card hover:shadow-xl transition-shadow ${!notification.read ? 'border-l-4 border-l-primary-600 bg-primary-50/30' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="text-4xl">{getNotificationIcon(notification.type)}</div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-gray-900">{notification.title}</h3>
                                            {!notification.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                    className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center gap-1"
                                                    title="Mark as read"
                                                >
                                                    <FiCheck />
                                                    Mark Read
                                                </button>
                                            )}
                                        </div>

                                        <p className="text-gray-700 mb-2">{notification.message}</p>

                                        {notification.relatedUser && (
                                            <p className="text-sm text-gray-500">
                                                From: {notification.relatedUser.fullName}
                                            </p>
                                        )}

                                        <p className="text-xs text-gray-400 mt-2">
                                            {formatDistanceToNow(new Date(notification.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
