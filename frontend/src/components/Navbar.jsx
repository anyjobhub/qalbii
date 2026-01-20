import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMessageCircle, FiSearch, FiUser, FiBell, FiRefreshCw, FiLogOut } from 'react-icons/fi';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/chat" className="text-2xl font-bold hover:opacity-80 transition">
                        Qalbi
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-2">
                        <Link
                            to="/chat"
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${isActive('/chat')
                                    ? 'bg-white/20 font-semibold'
                                    : 'hover:bg-white/10'
                                }`}
                        >
                            <FiMessageCircle />
                            <span className="hidden sm:inline">Chat</span>
                        </Link>

                        <Link
                            to="/profile"
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${isActive('/profile')
                                    ? 'bg-white/20 font-semibold'
                                    : 'hover:bg-white/10'
                                }`}
                        >
                            <FiUser />
                            <span className="hidden sm:inline">Profile</span>
                        </Link>

                        <Link
                            to="/notifications"
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${isActive('/notifications')
                                    ? 'bg-white/20 font-semibold'
                                    : 'hover:bg-white/10'
                                }`}
                        >
                            <FiBell />
                            <span className="hidden sm:inline">Notifications</span>
                        </Link>

                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/10 transition"
                            title="Refresh"
                        >
                            <FiRefreshCw />
                        </button>

                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/10 transition"
                            title="Logout"
                        >
                            <FiLogOut />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
