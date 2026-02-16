export const logger = {
    info: (...args: any[]) => {
        console.log('ℹ️ [INFO]', ...args);
    },
    error: (...args: any[]) => {
        console.error('❌ [ERROR]', ...args);
    },
    warn: (...args: any[]) => {
        console.warn('⚠️ [WARN]', ...args);
    },
    success: (...args: any[]) => {
        console.log('✅ [SUCCESS]', ...args);
    },
};
