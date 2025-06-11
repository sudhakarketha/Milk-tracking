import axios from 'axios';
import { LoginRequest, SignupRequest, Milk, User, PasswordChangeRequest } from '../types';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Check if the error is due to an expired or invalid token (401 Unauthorized or 403 Forbidden)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn('Authentication error (401/403). Logging out...');
            // Programmatically call the logout function from authService
            // We need to import authService here, but since it's already in the same file,
            // we can directly call it. However, to avoid circular dependencies with `useAuth`
            // where `authService.logout` might depend on `useAuth`, we should make sure
            // the logout logic is robust.
            // For now, let's assume authService.logout() will handle the necessary cleanup.
            authService.logout();
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (data: LoginRequest) => {
        const response = await api.post('/auth/signin', data);
        return response.data;
    },
    signup: async (data: SignupRequest) => {
        const response = await api.post('/auth/signup', data);
        return response.data;
    },
    changePassword: async (data: PasswordChangeRequest) => {
        const response = await api.post('/users/change-password', data);
        return response.data;
    },
    logout: async () => {
        try {
            // Call backend logout endpoint if available
            await api.post('/auth/signout');
        } catch (error) {
            console.warn('Backend logout failed:', error);
        } finally {
            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Clear Authorization header
            delete api.defaults.headers.common['Authorization'];
        }
    },
};

export const userService = {
    getAllUsers: async (): Promise<User[]> => {
        const response = await axios.get(`${API_URL}/users/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    getTotalUsers: async (token: string): Promise<number> => {
        const response = await axios.get(`${API_URL}/users/count`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.count;
    },

    updateUser: async (id: number, data: Partial<User>): Promise<User> => {
        const response = await axios.put(`${API_URL}/users/${id}`, data, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    deleteUser: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/users/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
    },
};

export const milkService = {
    getAllMilk: async () => {
        const response = await api.get('/milk');
        return response.data;
    },
    getMilkById: async (id: number) => {
        const response = await api.get(`/milk/${id}`);
        return response.data;
    },
    createMilk: async (data: Omit<Milk, 'id' | 'createdAt' | 'updatedAt'>) => {
        const response = await api.post('/milk/', data);
        return response.data;
    },
    updateMilk: async (id: number, data: Partial<Milk>) => {
        const response = await api.put(`/milk/${id}`, data);
        return response.data;
    },
    deleteMilk: async (id: number) => {
        await api.delete(`/milk/${id}`);
    },
    updateStock: async (id: number, quantity: number) => {
        const response = await api.patch(`/milk/${id}/stock?quantity=${quantity}`);
        return response.data;
    },
}; 