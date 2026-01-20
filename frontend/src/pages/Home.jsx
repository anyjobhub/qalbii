import { Link } from 'react-router-dom';
import { FiHeart, FiLock, FiMessageCircle } from 'react-icons/fi';

export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-4xl w-full text-center fade-in">
                {/* Logo/Brand */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 mb-6 shadow-2xl transform hover:scale-110 transition-transform">
                        <FiHeart className="text-white text-5xl" />
                    </div>
                    <h1 className="text-6xl font-bold gradient-text mb-4">Qalbi</h1>
                    <p className="text-2xl text-gray-600 font-medium">
                        Private Family Chat
                    </p>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="card hover:shadow-2xl transition-shadow">
                        <FiLock className="text-4xl text-primary-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
                        <p className="text-gray-600">
                            Your conversations stay between you and your loved ones
                        </p>
                    </div>
                    <div className="card hover:shadow-2xl transition-shadow">
                        <FiMessageCircle className="text-4xl text-primary-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Realtime Messaging</h3>
                        <p className="text-gray-600">
                            Instant delivery with read receipts and typing indicators
                        </p>
                    </div>
                    <div className="card hover:shadow-2xl transition-shadow">
                        <FiHeart className="text-4xl text-primary-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Family Focused</h3>
                        <p className="text-gray-600">
                            Built for meaningful connections with those who matter most
                        </p>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/signup" className="btn-primary text-lg px-12 py-4">
                        Get Started
                    </Link>
                    <Link to="/login" className="btn-secondary text-lg px-12 py-4">
                        Sign In
                    </Link>
                </div>

                {/* Footer */}
                <p className="mt-12 text-gray-500">
                    Built with ❤️ for families who care about privacy
                </p>
            </div>
        </div>
    );
}
