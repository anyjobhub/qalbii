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
            <div className="max-w-7xl mx-auto px-2 sm:px-4">
                <div className="flex items-center justify-between h-14 sm:h-16">
                    {/* Logo */}
                    <Link to="/chat" className="text-lg sm:text-2xl font-bold hover:opacity-80 transition">
                        Qalbi
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Link
                            to="/chat"
                            className={`px-2 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition touch-manipulation ${isActive('/chat') ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
                                }`}
                        >
                            <FiMessageCircle size={18} className="sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline text-sm sm:text-base">Chat</span>
                        </Link>

                        <Link
                            to="/profile"
                            className={`px-2 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition touch-manipulation ${isActive('/profile') ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
                                }`}
                        >
                            <FiUser size={18} className="sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline text-sm sm:text-base">Profile</span>
                        </Link>

                        <Link
                            to="/notifications"
                            className={`px-2 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition touch-manipulation ${isActive('/notifications') ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
                                }`}
                        >
                            <FiBell size={18} className="sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline text-sm sm:text-base">Notifications</span>
                        </Link>

                        <button
                            onClick={() => window.location.reload()}
                            className="px-2 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-white/10 transition touch-manipulation"
                            title="Refresh"
                        >
                            <FiRefreshCw size={18} className="sm:w-5 sm:h-5" />
                        </button>

                        <button
                            onClick={handleLogout}
                            className="px-2 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-white/10 transition touch-manipulation"
                            title="Logout"
                        >
                            <FiLogOut size={18} className="sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline text-sm sm:text-base">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
