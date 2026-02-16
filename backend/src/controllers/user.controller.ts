import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

export class UserController {
    // Get current user profile
    async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }

            res.status(200).json({
                user: req.user,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get all users (admin only)
    async getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    username: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            res.status(200).json({
                count: users.length,
                users,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
