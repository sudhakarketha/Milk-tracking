export interface User {
    id: number;
    username: string;
    email: string;
    phoneNumber?: string;
    roles: { id: number; name: string }[];
}

export interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    username: string | null;
    email: string | null;
    roles: string[];
    userId: number | null;
}

export interface Milk {
    id: number;
    milkType: string;
    quantity: number;
    rate: number;
    amount: number;
    entryDate: string;
    createdAt: string;
    updatedAt: string;
    userId?: number;
    username?: string;
    user?: {
        id: number;
        username: string;
        email: string;
    };
}

export interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
    role: string[];
}

export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}