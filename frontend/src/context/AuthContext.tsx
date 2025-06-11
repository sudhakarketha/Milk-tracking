import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    roles: { id: number; name: string }[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    roles: { id: number; name: string }[];
    login: (token: string, user: User) => void;
    logout: () => void;
    setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        token: null,
        roles: []
    });
    const navigate = useNavigate();

    useEffect(() => {
        // Check localStorage for existing auth data
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                setAuthState({
                    user,
                    token,
                    roles: (user.roles as { id: number; name: string }[]) || []
                });
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
    }, []);

    const login = (token: string, user: User) => {
        setAuthState({
            user,
            token,
            roles: (user.roles as { id: number; name: string }[]) || []
        });
    };

    const logout = () => {
        setAuthState({
            user: null,
            token: null,
            roles: []
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login'); // Redirect to login page
    };

    const setUser = (user: User) => {
        setAuthState(prev => ({
            ...prev,
            user
        }));
        localStorage.setItem('user', JSON.stringify(user));
    };

    return (
        <AuthContext.Provider value={{
            user: authState.user,
            token: authState.token,
            roles: authState.roles,
            login,
            logout,
            setUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 