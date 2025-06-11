import axios from 'axios';
import { LoginRequest, SignupRequest, ApiResponse, User } from '../types';

const API_URL = 'http://localhost:8080/api/auth';

export const login = async (loginRequest: LoginRequest): Promise<{ token: string; user: User }> => {
    try {
        console.log('Attempting login with:', { username: loginRequest.username });
        const response = await axios.post(`${API_URL}/signin`, loginRequest);
        console.log('Login response:', response.data);

        // Extract token and user info from the response
        const token = response.data.token;
        const user: User = {
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            roles: Array.isArray(response.data.roles) ? response.data.roles : []
        };

        if (!token) {
            throw new Error('No token received from server');
        }

        // Store token and user in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return { token, user };
    } catch (error: any) {
        console.error('Login error details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        // Throw a more informative error
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.response?.status === 401) {
            throw new Error('Invalid username or password');
        } else if (error.response?.status === 404) {
            throw new Error('Login service not found. Please check the server URL');
        } else if (!error.response) {
            throw new Error('Network error. Please check your connection');
        }
        throw error;
    }
};

export const signup = async (signupRequest: SignupRequest): Promise<void> => {
    try {
        await axios.post<ApiResponse<void>>(`${API_URL}/signup`, signupRequest);
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
};

export const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}; 