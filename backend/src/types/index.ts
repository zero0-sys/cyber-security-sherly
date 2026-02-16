import { Request } from 'express';
import { Role } from '@prisma/client';

// Extend Express Request type to include user
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string;
        role: Role;
    };
}

// JWT Payload
export interface JWTPayload {
    userId: string;
    email: string;
    role: Role;
}

// Auth response
export interface AuthResponse {
    user: {
        id: string;
        email: string;
        username: string;
        role: Role;
    };
    token: string;
}

// User registration data
export interface RegisterData {
    email: string;
    username: string;
    password: string;
    role?: Role;
}

// User login data
export interface LoginData {
    email: string;
    password: string;
}
