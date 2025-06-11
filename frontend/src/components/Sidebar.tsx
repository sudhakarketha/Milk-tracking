import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { roles } = useAuth();

    const isActive = (path: string) => {
        return location.pathname === path ? 'bg-blue-700 text-white' : 'text-blue-300 hover:bg-blue-700';
    };

    return (
        <div className="w-64 bg-blue-900 text-white min-h-screen p-4">
            <div className="text-2xl font-bold mb-8">Milk Inventory</div>
            <nav>
                <ul>
                    <li className="mb-2">
                        <Link to="/dashboard" className={`block px-4 py-2 rounded-md ${isActive('/dashboard')}`}>
                            Dashboard
                        </Link>
                    </li>
                    <li className="mb-2">
                        <Link to="/milk" className={`block px-4 py-2 rounded-md ${isActive('/milk')}`}>
                            Milk Management
                        </Link>
                    </li>
                    {roles?.some(role => role.name === 'ROLE_ADMIN') && (
                        <li className="mb-2">
                            <Link to="/users" className={`block px-4 py-2 rounded-md ${isActive('/users')}`}>
                                Users Management
                            </Link>
                        </li>
                    )}
                    <li className="mb-2">
                        <Link to="/profile" className={`block px-4 py-2 rounded-md ${isActive('/profile')}`}>
                            My Profile
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar; 