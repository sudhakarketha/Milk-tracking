import axios from 'axios';
import { User } from '../types';

const API_URL = 'http://localhost:8080/api';

export const getAllUsers = async (token: string): Promise<User[]> => {
    try {
        const response = await axios.get(`${API_URL}/users/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data || [];
    } catch (error: any) {
        console.error('Error fetching users:', error);
        throw error;
    }
}; 