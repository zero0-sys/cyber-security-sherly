import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sherly-secret-key-change-in-production';
const JWT_EXPIRY = '24h';

// In-memory user store (replace with database in production)
const users = new Map([
    ['zero kyber', {
        username: 'zero kyber',
        passwordHash: '$2a$10$rZtxWz7j0wXXQzh3YN.Hn.WkGXuL/5qH5Z8aJX/LKz3mR5p0jx7ue', // 153762
        role: 'admin',
        totpSecret: null,
        twoFactorEnabled: false
    }]
]);

// Generate JWT token
export const generateToken = (username, role) => {
    return jwt.sign({ username, role }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

// Verify JWT token middleware
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Admin role check middleware
export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Get user from store
export const getUser = (username) => {
    return users.get(username);
};

// Add user to store
export const addUser = (username, passwordHash, role = 'user') => {
    users.set(username, {
        username,
        passwordHash,
        role,
        totpSecret: null,
        twoFactorEnabled: false
    });
};

// Update user 2FA settings
export const updateUser2FA = (username, totpSecret, enabled) => {
    const user = users.get(username);
    if (user) {
        user.totpSecret = totpSecret;
        user.twoFactorEnabled = enabled;
    }
};

export { users };
