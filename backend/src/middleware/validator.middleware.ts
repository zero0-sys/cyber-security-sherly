import { body, ValidationChain } from 'express-validator';

export const registerValidator: ValidationChain[] = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('username')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters')
        .trim(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(['ADMIN', 'USER'])
        .withMessage('Role must be either ADMIN or USER'),
];

export const loginValidator: ValidationChain[] = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];
