import { useRef, useCallback } from 'react';
import { NOTIFICATION_SOUND } from '../constants/notificationSounds';

/**
 * Custom hook to play notification sounds
 * Includes cooldown mechanism to prevent sound spam
 */
export default function useNotificationSound(preferences) {
    const lastPlayTimeRef = useRef(0);
    const audioRef = useRef(null);
    const cooldownMs = 2500; // 2.5 seconds cooldown

    /**
     * Play notification sound
     * @param {string} senderId - ID of the message sender
     * @param {string} currentUserId - ID of the current user
     * @returns {boolean} - true if sound was played, false if skipped
     */
    const playNotificationSound = useCallback(
        (senderId, currentUserId) => {
            // Don't play sound for own messages
            if (senderId === currentUserId) {
                return false;
            }

            // Check if sound is enabled
            if (!preferences?.soundEnabled) {
                return false;
            }

            // Check cooldown
            const now = Date.now();
            if (now - lastPlayTimeRef.current < cooldownMs) {
                console.log('🔇 Notification sound skipped (cooldown)');
                return false;
            }

            try {
                // Clean up previous audio instance
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                }

                // Create new audio instance
                const audio = new Audio(NOTIFICATION_SOUND);
                audio.volume = preferences?.volume ?? 0.5;

                // Play the sound
                const playPromise = audio.play();

                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            console.log('🔔 Notification sound played');
                            lastPlayTimeRef.current = now;
                        })
                        .catch((error) => {
                            // Handle autoplay restrictions gracefully
                            if (error.name === 'NotAllowedError') {
                                console.warn('🔇 Notification sound blocked by browser (autoplay policy)');
                            } else {
                                console.error('🔇 Failed to play notification sound:', error);
                            }
                        });
                }

                audioRef.current = audio;

                // Clean up after playback
                audio.onended = () => {
                    audioRef.current = null;
                };

                return true;
            } catch (error) {
                console.error('🔇 Error creating notification sound:', error);
                return false;
            }
        },
        [preferences]
    );

    /**
     * Test the notification sound (for settings preview)
     */
    const testNotificationSound = useCallback(() => {
        try {
            // Clean up previous audio instance
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            const audio = new Audio(NOTIFICATION_SOUND);
            audio.volume = preferences?.volume ?? 0.5;

            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.error('Failed to play test sound:', error);
                    alert('Unable to play sound. Please interact with the page first.');
                });
            }

            audioRef.current = audio;

            audio.onended = () => {
                audioRef.current = null;
            };
        } catch (error) {
            console.error('Error playing test sound:', error);
        }
    }, [preferences]);

    return {
        playNotificationSound,
        testNotificationSound,
    };
}
