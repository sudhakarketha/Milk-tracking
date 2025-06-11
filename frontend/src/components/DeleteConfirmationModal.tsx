import React from 'react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    loading: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    loading,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-blue-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-auto">
                <h3 className="text-lg font-medium text-blue-900 text-center">
                    Confirm Deletion
                </h3>
                <div className="mt-2 mb-4 text-center">
                    <p className="text-sm text-blue-700">
                        Are you sure you want to delete this {itemName}? This action cannot be undone.
                    </p>
                </div>
                <div className="flex justify-center space-x-4">
                    <button
                        type="button"
                        className="px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal; 