import React, { useState, useEffect } from 'react';
import { Milk } from '../types';
import { getMilkList, updateMilk, deleteMilk } from '../services/milkService';
import AddMilkForm from './AddMilkForm';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';

const MilkTable: React.FC = () => {
    const { user, token, roles } = useAuth();
    const [milkList, setMilkList] = useState<Milk[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingMilk, setEditingMilk] = useState<Milk | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; milkId: number | null; loading: boolean }>({
        show: false,
        milkId: null,
        loading: false
    });

    const fetchMilkList = async () => {
        if (!token) {
            setError('Authentication token is missing. Please log in again.');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching milk list...');

            // Use different endpoint for admin
            const isAdmin = roles?.some(role => role.name === 'ROLE_ADMIN');
            const data = await getMilkList(token, isAdmin);

            console.log('Received milk list:', data);
            setMilkList(data || []); // Ensure we always set an array
            setError(null);
        } catch (err: any) {
            console.error('Error in fetchMilkList:', err);
            setMilkList([]); // Reset to empty array on error
            if (err.response?.status === 403) {
                setError('You do not have permission to view milk entries. Please check your authorization.');
            } else {
                setError('Failed to fetch milk list. ' + (err.response?.data?.message || err.message || 'Unknown error'));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('MilkTable mounted or token changed:', { token });
        fetchMilkList();
    }, [token]);

    const handleMilkAdded = (newMilk: Milk) => {
        fetchMilkList();
        setShowAddForm(false);
        setEditingMilk(null);
    };

    const handleUpdateMilk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !editingMilk) return;
        try {
            const updated = await updateMilk(editingMilk.id, editingMilk, token);
            setMilkList(milkList.map(milk => milk.id === updated.id ? updated : milk));
            setEditingMilk(null);
            setError(null);
        } catch (err: any) {
            console.error('Error updating milk:', err);
            if (err.response?.status === 403) {
                setError('You do not have permission to update milk entries. Please check your authorization.');
            } else {
                setError('Failed to update milk entry. ' + (err.response?.data?.message || ''));
            }
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeleteConfirmation({
            show: true,
            milkId: id,
            loading: false
        });
    };

    const handleDeleteConfirm = async () => {
        if (!token || !deleteConfirmation.milkId) return;

        setDeleteConfirmation(prev => ({ ...prev, loading: true }));
        try {
            await deleteMilk(deleteConfirmation.milkId, token);
            setMilkList(milkList.filter(milk => milk.id !== deleteConfirmation.milkId));
            setError(null);
            setDeleteConfirmation({ show: false, milkId: null, loading: false });
        } catch (err: any) {
            console.error('Error deleting milk:', err);
            if (err.response?.status === 403) {
                setError('You do not have permission to delete milk entries. Please check your authorization.');
            } else {
                setError('Failed to delete milk entry. ' + (err.response?.data?.message || ''));
            }
            setDeleteConfirmation(prev => ({ ...prev, loading: false }));
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmation({ show: false, milkId: null, loading: false });
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Milk Inventory</h2>
                {roles?.some(role => role.name === 'ROLE_ADMIN') && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Add Milk
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {showAddForm && (
                <AddMilkForm
                    onMilkAdded={handleMilkAdded}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            <DeleteConfirmationModal
                isOpen={deleteConfirmation.show}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                itemName="milk entry"
                loading={deleteConfirmation.loading}
            />

            {loading ? (
                <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
                    <p className="mt-2">Loading milk inventory...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded shadow">
                        <thead className="bg-gray-50">
                            <tr>
                                {roles?.some(role => role.name === 'ROLE_ADMIN') && (
                                    <th className="p-4 text-left">Username</th>
                                )}
                                <th className="p-4 text-left">Milk Type</th>
                                <th className="p-4 text-left">Quantity</th>
                                <th className="p-4 text-left">Rate</th>
                                <th className="p-4 text-left">Amount</th>
                                <th className="p-4 text-left">Entry Date</th>
                                {roles?.some(role => role.name === 'ROLE_ADMIN') && (
                                    <th className="p-4 text-left">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(milkList) && milkList.length > 0 ? (
                                milkList
                                    .filter(milk => milk) // Ensure only truthy milk objects are processed
                                    .map(milk => {
                                        return (
                                            <tr key={milk.id} className="border-t">
                                                {editingMilk?.id === milk.id ? (
                                                    <>
                                                        {roles?.some(role => role.name === 'ROLE_ADMIN') && (
                                                            <td className="p-4">{editingMilk?.username || ''}</td>
                                                        )}
                                                        <td className="p-4">
                                                            <input
                                                                type="text"
                                                                value={editingMilk?.milkType || ''}
                                                                onChange={e => setEditingMilk({ ...editingMilk, milkType: e.target.value })}
                                                                className="p-1 border rounded w-full"
                                                            />
                                                        </td>
                                                        <td className="p-4">
                                                            <input
                                                                type="number"
                                                                value={editingMilk?.quantity || 0}
                                                                onChange={e => {
                                                                    const quantity = Number(e.target.value);
                                                                    setEditingMilk({
                                                                        ...editingMilk,
                                                                        quantity,
                                                                        amount: quantity * (editingMilk?.rate || 0)
                                                                    });
                                                                }}
                                                                className="p-1 border rounded w-full"
                                                            />
                                                        </td>
                                                        <td className="p-4">
                                                            <input
                                                                type="number"
                                                                value={editingMilk?.rate || 0}
                                                                onChange={e => {
                                                                    const rate = Number(e.target.value);
                                                                    setEditingMilk({
                                                                        ...editingMilk,
                                                                        rate,
                                                                        amount: (editingMilk?.quantity || 0) * rate
                                                                    });
                                                                }}
                                                                className="p-1 border rounded w-full"
                                                            />
                                                        </td>
                                                        <td className="p-4">₹{(editingMilk?.amount || 0).toFixed(2)}</td>
                                                        <td className="p-4">
                                                            <input
                                                                type="date"
                                                                name="entryDate"
                                                                value={editingMilk?.entryDate ? format(parseISO(editingMilk.entryDate), 'yyyy-MM-dd') : ''}
                                                                onChange={e => {
                                                                    const date = e.target.value;
                                                                    // Ensure the date is sent with a time component for LocalDateTime compatibility
                                                                    const formattedDate = date ? `${date}T00:00:00` : '';
                                                                    setEditingMilk({ ...editingMilk, entryDate: formattedDate });
                                                                }}
                                                                className="p-1 border rounded w-full"
                                                            />
                                                        </td>
                                                        {roles?.some(role => role.name === 'ROLE_ADMIN') && (
                                                            <td className="p-4">
                                                                <div className="flex items-center space-x-2">
                                                                    <Tooltip title="Save Changes">
                                                                        <IconButton
                                                                            size="small"
                                                                            className="text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors duration-200"
                                                                            onClick={handleUpdateMilk}
                                                                        >
                                                                            <CheckIcon fontSize="inherit" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Cancel Edit">
                                                                        <IconButton
                                                                            size="small"
                                                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors duration-200"
                                                                            onClick={() => setEditingMilk(null)}
                                                                        >
                                                                            <CancelIcon fontSize="inherit" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </div>
                                                            </td>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        {roles?.some(role => role.name === 'ROLE_ADMIN') && (
                                                            <td className="p-4">{milk?.username || ''}</td>
                                                        )}
                                                        <td className="p-4">{milk?.milkType || ''}</td>
                                                        <td className="p-4">{milk?.quantity || 0}</td>
                                                        <td className="p-4">₹{(milk?.rate || 0).toFixed(2)}</td>
                                                        <td className="p-4">₹{(milk?.amount || 0).toFixed(2)}</td>
                                                        <td className="p-4">{milk?.entryDate ? format(parseISO(milk.entryDate), 'dd-MM-yyyy') : ''}</td>
                                                        {roles?.some(role => role.name === 'ROLE_ADMIN') && (
                                                            <td className="p-4">
                                                                <div className="flex items-center space-x-2">
                                                                    <Tooltip title="Edit">
                                                                        <IconButton
                                                                            size="small"
                                                                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors duration-200"
                                                                            onClick={() => setEditingMilk(milk)}
                                                                        >
                                                                            <EditIcon fontSize="inherit" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Delete">
                                                                        <IconButton
                                                                            size="small"
                                                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors duration-200"
                                                                            onClick={() => handleDeleteClick(milk?.id || 0)}
                                                                        >
                                                                            <DeleteIcon fontSize="inherit" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </div>
                                                            </td>
                                                        )}
                                                    </>
                                                )}
                                            </tr>
                                        );
                                    })
                            ) : (
                                <tr>
                                    <td colSpan={roles?.some(role => role.name === 'ROLE_ADMIN') ? 7 : 5} className="p-4 text-center text-gray-500">
                                        No milk entries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MilkTable; 