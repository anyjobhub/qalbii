import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FiMail, FiLock, FiCheck } from 'react-icons/fi';

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Enter identifier, 2: Verify OTP, 3: Reset password
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Step 1: Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/forgot-password', { identifier });
            setSuccess(response.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        }

        setLoading(false);
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/verify-otp', { identifier, otp });
            setSuccess(response.data.message);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        }

        setLoading(false);
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/reset-password', {
                identifier,
                otp,
                newPassword,
            });
            setSuccess(response.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8 fade-in">
                    <h1 className="text-4xl font-bold gradient-text mb-2">Reset Password</h1>
                    <p className="text-gray-600">
                        {step === 1 && 'Enter your username, email, or mobile'}
                        {step === 2 && 'Enter the OTP sent to your email'}
                        {step === 3 && 'Set your new password'}
                    </p>
                </div>

                <div className="card fade-in">
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {step > 1 ? <FiCheck /> : '1'}
                            </div>
                            <div
                                className={`w-16 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}
                            />
                        </div>
                        <div className="flex items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {step > 2 ? <FiCheck /> : '2'}
                            </div>
                            <div
                                className={`w-16 h-1 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}
                            />
                        </div>
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            3
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                            {success}
                        </div>
                    )}

                    {/* Step 1: Enter Identifier */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Username, Email, or Mobile *
                                </label>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="input-field"
                                    placeholder="Enter your username, email, or mobile"
                                    required
                                />
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full">
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verify OTP */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Enter OTP *
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="input-field text-center text-2xl tracking-widest"
                                    placeholder="000000"
                                    maxLength="6"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    Check your email for the 6-digit OTP
                                </p>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full">
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="btn-secondary w-full"
                            >
                                Go Back
                            </button>
                        </form>
                    )}

                    {/* Step 3: Reset Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    New Password *
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="Enter new password"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    Password must be at least 8 characters
                                </p>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full">
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-primary-600 font-semibold hover:text-primary-700"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
