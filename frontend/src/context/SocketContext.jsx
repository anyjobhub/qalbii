import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Singleton socket instance
let socketInstance = null;

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // If no user, disconnect and clean up
        if (!user) {
            if (socketInstance) {
                console.log('🔌 Disconnecting socket (user logged out)');
                socketInstance.disconnect();
                socketInstance = null;
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        // Reuse existing socket if connected
        if (socketInstance && socketInstance.connected) {
            console.log('♻️ Reusing existing socket connection');
            setSocket(socketInstance);
            setConnected(true);
            return;
        }

        // Create new socket only if needed
        console.log('🔗 Creating new socket connection...');
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            withCredentials: true,
        });

        newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id);
            setConnected(true);

            // Emit user online status
            if (user) {
                newSocket.emit('user:online', user.id);
            }
        });

        newSocket.on('disconnect', (reason) => {
            console.log('⚠️ Socket disconnected. Reason:', reason);
            setConnected(false);

            // Auto-reconnect unless manually disconnected
            if (reason === 'io server disconnect') {
                console.log('🔄 Attempting to reconnect...');
                newSocket.connect();
            }
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error.message);
            setConnected(false);
        });

        newSocket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
            if (user) {
                newSocket.emit('user:online', user.id);
            }
        });

        newSocket.on('reconnect_attempt', () => {
            console.log('🔄 Attempting to reconnect...');
        });

        newSocket.on('reconnect_failed', () => {
            console.error('❌ Reconnection failed');
        });

        // Set socket instance
        socketInstance = newSocket;
        setSocket(newSocket);

        // Cleanup: Do NOT disconnect on component unmount
        // Keep socket alive across route changes
        return () => {
            console.log('🔹 Component unmounted, keeping socket connected');
        };
    }, [user]); // Only re-run if user changes

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export default SocketContext;
