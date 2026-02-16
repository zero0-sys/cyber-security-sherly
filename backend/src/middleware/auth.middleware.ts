import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../types';
import authService from '../services/auth.service';

// Authenticate middleware - verify JWT token
export async function authenticate(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.substring(7);

        // Verify token
        const decoded = authService.verifyToken(token);

        // Get user from database
        const user = await authService.getUserById(decoded.userId);

        if (!user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }

        // Attach user to request
        req.user = user;

        next();
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'JsonWebTokenError') {
                res.status(401).json({ error: 'Invalid token' });
                return;
            }
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({ error: 'Token expired' });
                return;
            }
        }
        res.status(401).json({ error: 'Authentication failed' });
    }
}

// Role-based access control middleware
export function requireRole(...allowedRoles: Role[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Access denied. Insufficient permissions' });
            return;
        }

        next();
    };
}
