import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import authService from '../services/auth.service';
import { RegisterData, LoginData } from '../types';

export class AuthController {
    // Register new user
    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }

            const data: RegisterData = req.body;
            const result = await authService.register(data);

            res.status(201).json({
                message: 'User registered successfully',
                ...result,
            });
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
                return;
            }
            next(error);
        }
    }

    // Login user
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }

            const data: LoginData = req.body;
            const result = await authService.login(data);

            res.status(200).json({
                message: 'Login successful',
                ...result,
            });
        } catch (error) {
            if (error instanceof Error) {
                res.status(401).json({ error: error.message });
                return;
            }
            next(error);
        }
    }
}

export default new AuthController();
