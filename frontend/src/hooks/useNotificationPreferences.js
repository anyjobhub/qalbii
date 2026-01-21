import { useState, useEffect } from 'react';
import { DEFAULT_NOTIFICATION_SETTINGS } from '../constants/notificationSounds';

const STORAGE_KEY = 'qalbi_notification_prefs';

/**
 * Custom hook to manage notification preferences
 * Preferences are persisted in localStorage
 */
export default function useNotificationPreferences() {
    const [preferences, setPreferences] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load notification preferences:', error);
        }
        return DEFAULT_NOTIFICATION_SETTINGS;
    });

    // Persist preferences to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        } catch (error) {
            console.error('Failed to save notification preferences:', error);
        }
    }, [preferences]);

    const setSoundEnabled = (enabled) => {
        setPreferences((prev) => ({ ...prev, soundEnabled: enabled }));
    };

    const setVolume = (volume) => {
        // Clamp volume between 0 and 1
        const clampedVolume = Math.max(0, Math.min(1, volume));
        setPreferences((prev) => ({ ...prev, volume: clampedVolume }));
    };

    const toggleSound = () => {
        setSoundEnabled(!preferences.soundEnabled);
    };

    return {
        soundEnabled: preferences.soundEnabled,
        volume: preferences.volume,
        setSoundEnabled,
        setVolume,
        toggleSound,
    };
}
