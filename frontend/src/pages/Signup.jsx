import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateSignupForm, getPasswordStrength } from '../utils/validation';
import { FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';

export default function Signup() {
    const navigate = useNavigate();
    const { signup } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        mobile: '',
        dateOfBirth: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        setApiError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const validationErrors = validateSignupForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setApiError('');

        const result = await signup(formData);

        if (result.success) {
            navigate('/chat');
        } else {
            setApiError(result.message);
            if (result.errors && result.errors.length > 0) {
                const newErrors = {};
                result.errors.forEach((err) => {
                    if (err.param) {
                        newErrors[err.param] = err.msg;
                    }
                });
                setErrors(newErrors);
            }
        }

        setLoading(false);
    };

    const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

    const isFormValid = () => {
        return (
            formData.username &&
            formData.fullName &&
            formData.email &&
            formData.mobile &&
            formData.dateOfBirth &&
            formData.password &&
            Object.keys(errors).length === 0
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-8 fade-in">
                    <h1 className="text-4xl font-bold gradient-text mb-2">Create Account</h1>
                    <p className="text-gray-600">Join Qalbi and connect with your family</p>
                </div>

                <div className="card fade-in">
                    {apiError && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Username *
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`input-field ${errors.username ? 'border-red-500' : ''}`}
                                placeholder="johndoe"
                                autoComplete="username"
                            />
                            {errors.username && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <FiX /> {errors.username}
                                </p>
                            )}
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`input-field ${errors.fullName ? 'border-red-500' : ''}`}
                                placeholder="John Doe"
                                autoComplete="name"
                            />
                            {errors.fullName && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <FiX /> {errors.fullName}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                                placeholder="john@example.com"
                                autoComplete="email"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <FiX /> {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Mobile */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mobile Number *
                            </label>
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className={`input-field ${errors.mobile ? 'border-red-500' : ''}`}
                                placeholder="1234567890"
                                autoComplete="tel"
                            />
                            {errors.mobile && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <FiX /> {errors.mobile}
                                </p>
                            )}
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Date of Birth *
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className={`input-field ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                            />
                            {errors.dateOfBirth && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <FiX /> {errors.dateOfBirth}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`input-field pr-12 ${errors.password ? 'border-red-500' : ''}`}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <FiX /> {errors.password}
                                </p>
                            )}

                            {/* Password Strength Indicator */}
                            {formData.password && passwordStrength && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${passwordStrength.color === 'green'
                                                        ? 'bg-green-500 w-full'
                                                        : passwordStrength.color === 'yellow'
                                                            ? 'bg-yellow-500 w-2/3'
                                                            : 'bg-red-500 w-1/3'
                                                    }`}
                                            />
                                        </div>
                                        <span
                                            className={`text-xs font-semibold ${passwordStrength.color === 'green'
                                                    ? 'text-green-600'
                                                    : passwordStrength.color === 'yellow'
                                                        ? 'text-yellow-600'
                                                        : 'text-red-600'
                                                }`}
                                        >
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!isFormValid() || loading}
                            className="btn-primary w-full"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
