import axios from 'axios';
import { Milk, ApiResponse, AuthState } from '../types';

const API_URL = 'http://localhost:8080/api';

export const getMilkList = async (token: string, isAdmin: boolean): Promise<Milk[]> => {
    try {
        console.log('Fetching milk list with token:', token);
        const endpoint = isAdmin ? `${API_URL}/milk` : `${API_URL}/milk/my-milk`;
        const response = await axios.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('API Response:', response.data);

        // Handle both possible response formats (data or milk property)
        const milkData = response.data.data || response.data.milk;
        if (!milkData || !Array.isArray(milkData)) {
            console.error('Invalid API response structure:', response.data);
            return []; // Return empty array instead of undefined
        }

        // Validate that each item in the array matches our Milk interface
        const milkList = milkData
            .filter(milk => milk !== null && milk !== undefined) // Filter out null/undefined entries
            .map(milk => ({
                id: milk.id,
                milkType: milk.milkType || '',
                quantity: Number(milk.quantity) || 0,
                rate: Number(milk.rate) || 0,
                amount: Number(milk.amount) || 0,
                entryDate: milk.entryDate || new Date().toISOString(),
                createdAt: milk.createdAt || new Date().toISOString(),
                updatedAt: milk.updatedAt || new Date().toISOString(),
                userId: milk.userId || null,
                username: milk.user?.username || ''
            }));

        return milkList;
    } catch (error: any) {
        console.error('Error fetching milk list:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return []; // Return empty array on error instead of throwing
    }
};

export const createMilk = async (milk: Omit<Milk, 'id' | 'createdAt' | 'updatedAt'>, token: string): Promise<Milk> => {
    try {
        console.log('Creating milk with data:', milk);
        const response = await axios.post(`${API_URL}/milk/`, {
            ...milk,
            userId: milk.userId
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Create milk API response:', response.data);

        // Handle both possible response formats (data property or direct object)
        const createdMilk = response.data.data;

        if (!createdMilk || typeof createdMilk !== 'object') {
            console.error('Invalid API response structure:', response.data);
            throw new Error('Invalid API response structure');
        }

        // Validate and transform the response data
        return {
            id: createdMilk.id,
            milkType: createdMilk.milkType || '',
            quantity: Number(createdMilk.quantity) || 0,
            rate: Number(createdMilk.rate) || 0,
            amount: Number(createdMilk.amount) || 0,
            entryDate: createdMilk.entryDate || new Date().toISOString(),
            createdAt: createdMilk.createdAt || new Date().toISOString(),
            updatedAt: createdMilk.updatedAt || new Date().toISOString(),
            userId: createdMilk.userId || null
        };
    } catch (error: any) {
        console.error('Error creating milk:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            fullError: error
        });
        throw error;
    }
};

export const updateMilk = async (id: number, milk: Partial<Milk>, token: string): Promise<Milk> => {
    try {
        // Format the request according to MilkRequest structure
        const milkRequest = {
            milkType: milk.milkType,
            quantity: milk.quantity,
            rate: milk.rate,
            amount: milk.amount,
            entryDate: milk.entryDate,
            userId: milk.userId || milk.user?.id // Include the userId from either source
        };

        const response = await axios.put<ApiResponse<Milk>>(`${API_URL}/milk/${id}`, milkRequest, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Handle both possible response formats (data property or direct object)
        const updatedMilk = response.data.data || response.data;

        if (!updatedMilk || typeof updatedMilk !== 'object') {
            console.error('Invalid API response structure:', response.data);
            throw new Error('Invalid API response structure');
        }

        // Validate and transform the response data
        return {
            id: updatedMilk.id,
            milkType: updatedMilk.milkType || '',
            quantity: Number(updatedMilk.quantity) || 0,
            rate: Number(updatedMilk.rate) || 0,
            amount: Number(updatedMilk.amount) || 0,
            entryDate: updatedMilk.entryDate || new Date().toISOString(),
            createdAt: updatedMilk.createdAt || new Date().toISOString(),
            updatedAt: updatedMilk.updatedAt || new Date().toISOString(),
            userId: updatedMilk.userId || updatedMilk.user?.id,
            username: updatedMilk.user?.username || ''
        };
    } catch (error) {
        console.error('Error updating milk:', error);
        throw error;
    }
};

export const deleteMilk = async (id: number, token: string): Promise<void> => {
    try {
        await axios.delete(`${API_URL}/milk/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error deleting milk:', error);
        throw error;
    }
}; 