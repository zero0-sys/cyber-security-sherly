import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Create a singleton Prisma client instance
const prisma = new PrismaClient({
    log: ['error', 'warn'],
});

// Test database connection
export async function connectDatabase() {
    try {
        await prisma.$connect();
        logger.success('Database connected successfully');
    } catch (error) {
        logger.error('Failed to connect to database:', error);
        throw error;
    }
}

// Disconnect database
export async function disconnectDatabase() {
    await prisma.$disconnect();
    logger.info('Database disconnected');
}

export default prisma;
