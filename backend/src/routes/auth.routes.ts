import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { registerValidator, loginValidator } from '../middleware/validator.middleware';

const router = Router();

// POST /api/auth/register - Register new user
router.post('/register', registerValidator, authController.register.bind(authController));

// POST /api/auth/login - Login user
router.post('/login', loginValidator, authController.login.bind(authController));

export default router;
