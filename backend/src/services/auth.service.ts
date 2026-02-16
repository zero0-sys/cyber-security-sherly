import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../config/database';
import { jwtConfig } from '../config/jwt';
import { RegisterData, LoginData, JWTPayload } from '../types';

export class AuthService {
    // Hash password
    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    // Compare password
    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    // Generate JWT token
    generateToken(userId: string, email: string, role: Role): string {
        const payload: JWTPayload = {
            userId,
            email,
            role,
        };

        return jwt.sign(payload, jwtConfig.secret, {
            expiresIn: jwtConfig.expiresIn,
        });
    }

    // Verify JWT token
    verifyToken(token: string): JWTPayload {
        return jwt.verify(token, jwtConfig.secret) as JWTPayload;
    }

    // Register new user
    async register(data: RegisterData) {
        const { email, username, password, role = Role.USER } = data;

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            if (existingUser.email === email) {
                throw new Error('Email already exists');
            }
            if (existingUser.username === username) {
                throw new Error('Username already exists');
            }
        }

        // Hash password
        const hashedPassword = await this.hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                role,
            },
        });

        // Generate token
        const token = this.generateToken(user.id, user.email, user.role);

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
            token,
        };
    }

    // Login user
    async login(data: LoginData) {
        const { email, password } = data;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await this.comparePassword(password, user.password);

        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate token
        const token = this.generateToken(user.id, user.email, user.role);

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
            token,
        };
    }

    // Get user by ID
    async getUserById(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return user;
    }
}

export default new AuthService();
