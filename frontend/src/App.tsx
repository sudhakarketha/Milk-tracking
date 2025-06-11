import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Sidebar from './components/Sidebar';
import MilkTable from './components/MilkTable';
import UsersTable from './components/UsersTable';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent: React.FC = () => {
    const { token, roles, logout } = useAuth();
    const isAuthenticated = !!token;

    // Protected Route component
    const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
        return isAuthenticated ? element : <Navigate to="/login" />;
    };

    return (
        <Routes>
            <Route path="/login" element={
                isAuthenticated ?
                    <Navigate to="/dashboard" /> :
                    <Login />
            } />
            <Route path="/signup" element={
                isAuthenticated ?
                    <Navigate to="/dashboard" /> :
                    <Signup />
            } />
            <Route path="/*" element={
                <ProtectedRoute element={
                    <div className="flex min-h-screen bg-blue-100">
                        <Sidebar />
                        <div className="flex-1">
                            <Routes>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/milk" element={<MilkTable />} />
                                {roles?.some(role => role.name === 'ROLE_ADMIN') ? (
                                    <Route path="/users" element={<UsersTable />} />
                                ) : (
                                    <Route path="/users" element={<Navigate to="/dashboard" />} />
                                )}
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/" element={<Navigate to="/dashboard" />} />
                            </Routes>
                        </div>
                    </div>
                } />
            } />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
};

export default App; 