import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage browser push notifications
 * Handles permission requests and showing system notifications
 */
export default function useWebNotification() {
    const [permission, setPermission] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
    );
    const [isSupported, setIsSupported] = useState(false);

    // Check if browser supports notifications
    useEffect(() => {
        const supported = 'Notification' in window;
        setIsSupported(supported);

        if (supported) {
            setPermission(Notification.permission);
        }
    }, []);

    /**
     * Request notification permission from user
     * @returns {Promise<string>} - Permission state: 'granted', 'denied', or 'default'
     */
    const requestPermission = useCallback(async () => {
        if (!isSupported) {
            console.warn('Browser notifications are not supported');
            return 'unsupported';
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            console.log('📬 Notification permission:', result);
            return result;
        } catch (error) {
            console.error('Failed to request notification permission:', error);
            return 'denied';
        }
    }, [isSupported]);

    /**
     * Show a browser notification
     * @param {string} title - Notification title
     * @param {Object} options - Notification options
     * @returns {Notification|null} - Notification instance or null if failed
     */
    const showNotification = useCallback(
        (title, options = {}) => {
            if (!isSupported) {
                console.warn('Browser notifications are not supported');
                return null;
            }

            if (permission !== 'granted') {
                console.warn('Notification permission not granted:', permission);
                return null;
            }

            try {
                const notification = new Notification(title, {
                    icon: '/vite.svg', // App icon
                    badge: '/vite.svg',
                    vibrate: [200, 100, 200],
                    requireInteraction: false,
                    silent: false,
                    ...options,
                });

                console.log('📬 Browser notification shown:', title);
                return notification;
            } catch (error) {
                console.error('Failed to show notification:', error);
                return null;
            }
        },
        [isSupported, permission]
    );

    return {
        isSupported,
        permission,
        requestPermission,
        showNotification,
    };
}
