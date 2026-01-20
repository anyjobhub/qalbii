import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { FiCamera, FiSave } from 'react-icons/fi';

export default function Profile() {
    const { user, updateUser } = useAuth();

    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        mobile: user?.mobile || '',
        password: '',
    });

    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setMessage({ type: '', text: '' });
    };

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage({ type: '', text: '' });

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('profilePicture', file);

            const response = await api.post('/user/profile-picture', formDataUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setProfilePicture(response.data.profilePicture);
            updateUser({ profilePicture: response.data.profilePicture });
            setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to upload profile picture',
            });
        }

        setUploading(false);
        e.target.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const updateData = {};
            if (formData.fullName && formData.fullName !== user.fullName) {
                updateData.fullName = formData.fullName;
            }
            if (formData.mobile && formData.mobile !== user.mobile) {
                updateData.mobile = formData.mobile;
            }
            if (formData.password) {
                updateData.password = formData.password;
            }

            if (Object.keys(updateData).length === 0) {
                setMessage({ type: 'error', text: 'No changes to save' });
                setLoading(false);
                return;
            }

            const response = await api.put('/user/profile', updateData);
            updateUser(response.data.user);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setFormData((prev) => ({ ...prev, password: '' }));
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile',
            });
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="text-center mb-8 fade-in">
                    <h1 className="text-4xl font-bold gradient-text mb-2">My Profile</h1>
                    <p className="text-gray-600">Manage your account settings</p>
                </div>

                <div className="card fade-in">
                    {/* Profile Picture */}
                    <div className="text-center mb-8">
                        <div className="relative inline-block">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-5xl font-bold mx-auto mb-4 overflow-hidden">
                                {profilePicture ? (
                                    <img
                                        src={profilePicture}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    user?.fullName?.charAt(0).toUpperCase()
                                )}
                            </div>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute bottom-4 right-0 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition disabled:opacity-50"
                                title="Change Profile Picture"
                            >
                                <FiCamera size={20} />
                            </button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleProfilePictureUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
                    </div>

                    {/* Message */}
                    {message.text && (
                        <div
                            className={`px-4 py-3 rounded-lg mb-6 ${message.type === 'success'
                                    ? 'bg-green-50 border-2 border-green-200 text-green-700'
                                    : 'bg-red-50 border-2 border-red-200 text-red-700'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username (non-editable) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={user?.username || ''}
                                disabled
                                className="input-field bg-gray-100 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                        </div>

                        {/* Email (non-editable) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="input-field bg-gray-100 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

                        {/* Mobile */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mobile Number
                            </label>
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                New Password (leave blank to keep current)
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Submit Button */}
                        <button type="submit" disabled={loading} className="btn-primary w-full">
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
                                    Saving...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <FiSave />
                                    Save Changes
                                </span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
