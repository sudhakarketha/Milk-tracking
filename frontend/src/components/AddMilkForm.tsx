import React, { useState, useEffect } from 'react';
import { User, Milk } from '../types';
import { milkService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

interface AddMilkFormProps {
    onMilkAdded: (milk: Milk) => void;
    onCancel: () => void;
}

// Define a new interface for the form data to explicitly control the userId type
interface AddMilkFormState extends Omit<Milk, 'id' | 'createdAt' | 'updatedAt' | 'user' | 'username' | 'userId'> {
    username?: string;
    userId?: number | null; // userId can be a number, null, or undefined in state
}

const AddMilkForm: React.FC<AddMilkFormProps> = ({ onMilkAdded, onCancel }) => {
    const { token, user: currentUser, roles } = useAuth();
    const isAdmin = roles?.some(role => role.name === 'ROLE_ADMIN');

    const [formData, setFormData] = useState<AddMilkFormState>(
        {
            milkType: '',
            quantity: 0,
            rate: 0,
            amount: 0,
            entryDate: format(new Date(), 'yyyy-MM-dd') + 'T00:00:00',
            userId: isAdmin ? null : currentUser?.id, // Initialize userId to null for admins, or current user's ID for non-admins
            username: isAdmin ? '' : currentUser?.username,
        }
    );
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userLoading, setUserLoading] = useState(isAdmin);

    useEffect(() => {
        if (isAdmin && token) {
            const fetchUsers = async () => {
                try {
                    const allUsers = await userService.getAllUsers();
                    setUsers(allUsers);
                } catch (err: any) {
                    console.error('Error fetching users:', err);
                    setError('Failed to load users for assignment.');
                } finally {
                    setUserLoading(false);
                }
            };
            fetchUsers();
        } else {
            setUserLoading(false);
        }
    }, [isAdmin, token]);

    // This useEffect is crucial for non-admin users to set userId once currentUser is available
    useEffect(() => {
        if (!isAdmin && currentUser && currentUser.id !== undefined && formData.userId === undefined) {
            setFormData(prev => ({
                ...prev,
                userId: currentUser.id,
                username: currentUser.username
            }));
        }
    }, [isAdmin, currentUser, formData.userId]); // Added formData.userId to dependency array to avoid unnecessary re-runs

    useEffect(() => {
        const newAmount = formData.quantity * formData.rate;
        setFormData((prev) => ({ ...prev, amount: newAmount }));
    }, [formData.quantity, formData.rate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name === 'entryDate') {
            setFormData({ ...formData, [name]: `${value}T00:00:00` });
        } else if (type === 'number') {
            setFormData({ ...formData, [name]: Number(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleUserSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedUserId = Number(e.target.value);
        const selectedUser = users.find(user => user.id === selectedUserId);
        setFormData(prev => ({
            ...prev,
            userId: selectedUserId,
            username: selectedUser?.username
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Create a mutable copy of formData to ensure userId is correctly assigned as a number
            const finalMilkEntry: Omit<Milk, 'id' | 'createdAt' | 'updatedAt'> = {
                ...formData,
                userId: undefined // Temporarily set to undefined to ensure it's re-assigned correctly or caught by validation
            };

            if (isAdmin) {
                if (formData.userId === undefined || formData.userId === null) {
                    setError('Please assign a user for this milk entry.');
                    setLoading(false);
                    return;
                }
                finalMilkEntry.userId = formData.userId;
            } else {
                if (currentUser && currentUser.id !== undefined) {
                    finalMilkEntry.userId = currentUser.id; // Assign current user's ID for non-admins
                } else {
                    setError('Authentication error: User ID is missing. Please log in again.');
                    setLoading(false);
                    return;
                }
            }

            console.log('Sending milk entry (final payload check):', finalMilkEntry);
            const createdMilk = await milkService.createMilk(finalMilkEntry);
            onMilkAdded(createdMilk);
        } catch (err: any) {
            console.error('Error adding milk:', err);
            setError(err.response?.data?.message || 'Failed to add milk entry.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-blue-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg relative">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-blue-500 hover:text-blue-700 focus:outline-none"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                <h2 className="text-2xl font-bold mb-6 text-blue-800">Add New Milk Entry</h2>

                {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isAdmin && (
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Assign to User</label>
                            {userLoading ? (
                                <p className="text-blue-600">Loading users...</p>
                            ) : (
                                <select
                                    name="userId"
                                    value={formData.userId || ''}
                                    onChange={handleUserSelectChange}
                                    className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select a user</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.username}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Milk Type</label>
                        <input
                            type="text"
                            name="milkType"
                            value={formData.milkType}
                            onChange={handleChange}
                            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Quantity (liters)</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            step="0.01"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Rate (₹/liter)</label>
                        <input
                            type="number"
                            name="rate"
                            value={formData.rate}
                            onChange={handleChange}
                            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            step="0.01"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Amount (₹)</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount.toFixed(2)}
                            readOnly
                            className="w-full p-2 border border-blue-300 rounded bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Entry Date</label>
                        <input
                            type="date"
                            name="entryDate"
                            value={format(new Date(formData.entryDate), 'yyyy-MM-dd')}
                            onChange={handleChange}
                            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? 'Adding...' : 'Add Milk'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMilkForm; 