import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiCheck, FiUser, FiLock, FiRefreshCw } from 'react-icons/fi';
import api from '../utils/api';
import { validatePassword } from '../utils/validation';

const SignupMultiStep = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1-4
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Step 1: Email
    const [email, setEmail] = useState('');

    // Step 2: OTP
    const [otp, setOtp] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    // Step 3 & 4: User details
    const [verificationToken, setVerificationToken] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        mobile: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: '',
    });

    const [passwordStrength, setPasswordStrength] = useState({
        strength: '',
        score: 0,
    });

    // Step 1: Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/send-signup-otp', { email });
            setSuccess(response.data.message);
            setStep(2);
            startResendCooldown();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/verify-signup-otp', { email, otp });
            setSuccess(response.data.message);
            setVerificationToken(response.data.verificationToken);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        if (resendCooldown > 0) return;

        setError('');
        try {
            await api.post('/auth/send-signup-otp', { email });
            setSuccess('New OTP sent to your email');
            setOtp('');
            startResendCooldown();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        }
    };

    const startResendCooldown = () => {
        setResendCooldown(60);
        const interval = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Step 3: User Details (Next button)
    const handleUserDetailsNext = (e) => {
        e.preventDefault();
        setError('');

        // Validate fields
        if (!formData.username || !formData.fullName || !formData.mobile || !formData.dateOfBirth) {
            setError('All fields are required');
            return;
        }

        if (!/^[a-z0-9_]{3,20}$/.test(formData.username)) {
            setError('Username must be 3-20 characters, lowercase letters, numbers, and underscores only');
            return;
        }

        if (!/^[0-9]{10,15}$/.test(formData.mobile)) {
            setError('Mobile number must be 10-15 digits');
            return;
        }

        setStep(4);
    };

    // Step 4: Complete signup
    const handleCompleteSignup = async (e) => {
        e.preventDefault();
        setError('');

        // Validate passwords
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/complete-signup', {
                email,
                verificationToken,
                ...formData,
            });

            setSuccess(response.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Signup failed';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setFormData({ ...formData, password: newPassword });
        const validation = validatePassword(newPassword);
        setPasswordStrength(validation);
    };

    const handleChangeEmail = () => {
        setStep(1);
        setEmail('');
        setOtp('');
        setVerificationToken('');
        setError('');
        setSuccess('');
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength.score === 0) return 'bg-gray-300';
        if (passwordStrength.score <= 2) return 'bg-red-500';
        if (passwordStrength.score === 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Progress Indicator */}
                <div className="bg-primary-600 p-6">
                    <div className="flex justify-between items-center mb-4">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex flex-col items-center flex-1">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step >= s
                                            ? 'bg-white text-primary-600'
                                            : 'bg-primary-400 text-white'
                                        }`}
                                >
                                    {step > s ? <FiCheck size={20} /> : s}
                                </div>
                                <p className="text-xs text-white mt-2 hidden sm:block">
                                    {s === 1 && 'Email'}
                                    {s === 2 && 'Verify'}
                                    {s === 3 && 'Details'}
                                    {s === 4 && 'Password'}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="w-full bg-primary-400 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-white h-full transition-all duration-500"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {step === 1 && 'Create Account'}
                        {step === 2 && 'Verify Email'}
                        {step === 3 && 'Your Details'}
                        {step === 4 && 'Set Password'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {step === 1 && 'Enter your email to get started'}
                        {step === 2 && 'Enter the 6-digit OTP sent to your email'}
                        {step === 3 && 'Tell us about yourself'}
                        {step === 4 && 'Create a strong password'}
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                            {success}
                        </div>
                    )}

                    {/* Step 1: Email */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>

                            <p className="text-center text-sm text-gray-600">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="text-primary-600 font-semibold hover:underline"
                                >
                                    Login
                                </button>
                            </p>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter 6-Digit OTP
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={resendCooldown > 0}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiRefreshCw size={18} />
                                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend OTP'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleChangeEmail}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Change Email
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </form>
                    )}

                    {/* Step 3: User Details */}
                    {step === 3 && (
                        <form onSubmit={handleUserDetailsNext} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) =>
                                            setFormData({ ...formData, username: e.target.value.toLowerCase() })
                                        }
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="username123"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Lowercase letters, numbers, and underscores only</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mobile Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.mobile}
                                    onChange={(e) =>
                                        setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="1234567890"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">10-15 digits</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                            >
                                Continue
                            </button>
                        </form>
                    )}

                    {/* Step 4: Password */}
                    {step === 4 && (
                        <form onSubmit={handleCompleteSignup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={handlePasswordChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-gray-600">Password Strength:</span>
                                            <span className={`font-semibold ${passwordStrength.score <= 2 ? 'text-red-500' :
                                                    passwordStrength.score === 3 ? 'text-yellow-500' : 'text-green-500'
                                                }`}>
                                                {passwordStrength.strength}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${getPasswordStrengthColor()}`}
                                                style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Back
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignupMultiStep;
