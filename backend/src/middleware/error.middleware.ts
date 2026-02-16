import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    logger.error('Error:', err);

    // Default error
    let statusCode = 500;
    let message = 'Internal server error';

    // Handle specific error types
    if (err.statusCode) {
        statusCode = err.statusCode;
    }

    if (err.message) {
        message = err.message;
    }

    // Prisma errors
    if (err.code) {
        if (err.code === 'P2002') {
            statusCode = 400;
            message = 'Duplicate entry';
        } else if (err.code === 'P2025') {
            statusCode = 404;
            message = 'Record not found';
        }
    }

    // Send error response
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}
