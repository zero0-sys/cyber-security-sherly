import { Router } from 'express';
import { Role } from '@prisma/client';
import userController from '../controllers/user.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/users/profile - Get current user profile
router.get('/profile', userController.getProfile.bind(userController));

// GET /api/users - Get all users (admin only)
router.get('/', requireRole(Role.ADMIN), userController.getAllUsers.bind(userController));

export default router;
