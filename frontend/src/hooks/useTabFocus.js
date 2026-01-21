import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the current browser tab is focused
 * Uses the Page Visibility API
 */
export default function useTabFocus() {
    const [isTabFocused, setIsTabFocused] = useState(!document.hidden);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsTabFocused(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Also listen to window focus events for better accuracy
        const handleFocus = () => setIsTabFocused(true);
        const handleBlur = () => setIsTabFocused(false);

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    return isTabFocused;
}
