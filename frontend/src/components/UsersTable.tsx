import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/api';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const UsersTable: React.FC = () => {
    const { token, user: loggedInUser, roles } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; userId: number | null; loading: boolean }>({
        show: false,
        userId: null,
        loading: false
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setError(null);
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            setError('Failed to fetch users. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (id: number) => {
        setEditingUserId(id);
        // TODO: Implement edit functionality
        console.log('Edit user:', id);
    };

    const handleDeleteClick = (id: number) => {
        setDeleteConfirmation({
            show: true,
            userId: id,
            loading: false
        });
    };

    const handleDeleteConfirm = async () => {
        if (!token || !deleteConfirmation.userId) return;

        setDeleteConfirmation(prev => ({ ...prev, loading: true }));
        try {
            await userService.deleteUser(deleteConfirmation.userId);
            setUsers(users.filter(user => user.id !== deleteConfirmation.userId));
            setError(null);
            setDeleteConfirmation({ show: false, userId: null, loading: false });
        } catch (err: any) {
            console.error('Error deleting user:', err);
            if (err.response?.status === 403) {
                setError('You do not have permission to delete users. Please check your authorization.');
            } else {
                setError('Failed to delete user. ' + (err.response?.data?.message || ''));
            }
            setDeleteConfirmation(prev => ({ ...prev, loading: false }));
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmation({ show: false, userId: null, loading: false });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
                <p className="ml-2">Loading users...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Users Management</h1>

            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={deleteConfirmation.show}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                itemName="user"
                loading={deleteConfirmation.loading}
            />

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-blue-300 rounded-lg shadow">
                    <thead>
                        <tr className="bg-blue-600">
                            <th className="px-6 py-3 border-b text-left text-white">ID</th>
                            <th className="px-6 py-3 border-b text-left text-white">Username</th>
                            <th className="px-6 py-3 border-b text-left text-white">Email</th>
                            {/* <th className="px-6 py-3 border-b text-left text-white">Phone Number</th> */}
                            {/* <th className="px-6 py-3 border-b text-left text-white">Roles</th> */}
                            {roles?.some(role => role.name === 'ROLE_ADMIN') && (
                                <th className="px-6 py-3 border-b text-left text-white">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-blue-50">
                                <td className="px-6 py-4 border-b">{user.id}</td>
                                <td className="px-6 py-4 border-b">{user.username}</td>
                                <td className="px-6 py-4 border-b">{user.email}</td>
                                {/* <td className="px-6 py-4 border-b">{user.phoneNumber || '-'}</td> */}
                                {/* <td className="px-6 py-4 border-b">
                                    {user.roles.map(role => (
                                        <span
                                            key={String(role)}
                                            className="inline-block bg-blue-200 rounded-full px-3 py-1 text-sm font-semibold text-blue-800 mr-2"
                                        >
                                            {String(role).replace('ROLE_', '')}
                                        </span>
                                    ))}
                                </td> */}
                                {roles?.some(role => role.name === 'ROLE_ADMIN') && (
                                    <td className="px-6 py-4 border-b">
                                        <div className="flex items-center space-x-2">
                                            {/* <Tooltip title="Edit User">
                                                <IconButton
                                                    size="small"
                                                    className="text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors duration-200"
                                                    onClick={() => handleEditClick(user.id)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip> */}
                                            <Tooltip title="Delete User">
                                                <IconButton
                                                    size="small"
                                                    className={`text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors duration-200 ${user.id === loggedInUser?.id ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                    onClick={() => handleDeleteClick(user.id)}
                                                    disabled={user.id === loggedInUser?.id}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersTable; 