import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, authService } from '../services/api';

const Profile: React.FC = () => {
    const { user, setUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [error, setError] = useState<string | null>(null);
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    if (!user) return null;

    const handleSave = async () => {
        try {
            const updatedUser = await userService.updateUser(user.id, {
                username: user.username,
                email: user.email,
                phoneNumber: phoneNumber
            });
            setUser(updatedUser);
            setIsEditing(false);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleChangePassword = async () => {
        setError(null);
        setPasswordChangeSuccess(null);

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match.');
            return;
        }

        try {
            const response = await authService.changePassword({
                currentPassword,
                newPassword,
                confirmPassword
            });
            setPasswordChangeSuccess(response.message || 'Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to change password.');
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md">
                <div className="p-6">
                    <div className="flex items-center justify-center mb-6">
                        <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-3xl font-bold text-blue-600">
                                {user.username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
                        My Profile
                    </h1>

                    {error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {passwordChangeSuccess && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            <span className="block sm:inline">{passwordChangeSuccess}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="border-b pb-4">
                            <h2 className="text-sm font-medium text-gray-500">Username</h2>
                            <p className="mt-1 text-lg text-gray-800">{user.username}</p>
                        </div>

                        <div className="border-b pb-4">
                            <h2 className="text-sm font-medium text-gray-500">Email</h2>
                            <p className="mt-1 text-lg text-gray-800">{user.email}</p>
                        </div>

                        <div className="border-b pb-4">
                            <h2 className="text-sm font-medium text-gray-500">Phone Number</h2>
                            {isEditing ? (
                                <div className="mt-1">
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter phone number"
                                    />
                                    <div className="mt-2 flex space-x-2">
                                        <button
                                            onClick={handleSave}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setPhoneNumber(user.phoneNumber || '');
                                            }}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-1 flex items-center justify-between">
                                    <p className="text-lg text-gray-800">{user.phoneNumber || 'Not set'}</p>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Password Change Section */}
                        <div>
                            <h2 className="text-sm font-medium text-blue-700 mb-2">Change Password</h2>
                            {isChangingPassword ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="mt-2 flex space-x-2">
                                        <button
                                            onClick={handleChangePassword}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            Change Password
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsChangingPassword(false);
                                                setCurrentPassword('');
                                                setNewPassword('');
                                                setConfirmPassword('');
                                            }}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-1 flex items-center justify-between">
                                    <p className="text-lg text-gray-800">***********</p>
                                    <button
                                        onClick={() => {
                                            setIsChangingPassword(true);
                                            setError(null);
                                            setPasswordChangeSuccess(null);
                                        }}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        Change Password
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-sm font-medium text-blue-700">Roles</h2>
                            <div className="mt-1">
                                {user.roles && user.roles.length > 0 ? (
                                    user.roles.map((role) => (
                                        <span
                                            key={role.id || role.name || String(role)}
                                            className="inline-block bg-blue-200 text-blue-800 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded-full"
                                        >
                                            {role.name ? role.name.replace('ROLE_', '') : String(role)}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-500">No roles assigned</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;