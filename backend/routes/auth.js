import express from 'express';
import bcrypt from 'bcryptjs';
import * as OTPAuth from 'otplib';
import QRCode from 'qrcode';
import { generateToken, getUser, updateUser2FA } from '../middleware/auth.js';

const router = express.Router();
const { authenticator } = OTPAuth;

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password, totpToken } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const user = getUser(username);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check 2FA if enabled
        if (user.twoFactorEnabled) {
            if (!totpToken) {
                return res.status(200).json({
                    requiresTwoFactor: true,
                    message: 'Please provide 2FA code'
                });
            }

            const isValid = authenticator.verify({
                token: totpToken,
                secret: user.totpSecret
            });

            if (!isValid) {
                return res.status(401).json({ error: 'Invalid 2FA code' });
            }
        }

        // Generate JWT token
        const token = generateToken(user.username, user.role);

        res.json({
            success: true,
            token,
            user: {
                username: user.username,
                role: user.role,
                twoFactorEnabled: user.twoFactorEnabled
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Setup 2FA endpoint
router.post('/setup-2fa', async (req, res) => {
    try {
        const { username } = req.body;

        const user = getUser(username);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate secret
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(username, 'AI Sherly Lab', secret);

        // Generate QR code
        const qrCode = await QRCode.toDataURL(otpauthUrl);

        // Store secret (temporarily until user confirms)
        updateUser2FA(username, secret, false);

        res.json({
            success: true,
            secret,
            qrCode
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enable 2FA endpoint (verify and activate)
router.post('/enable-2fa', async (req, res) => {
    try {
        const { username, totpToken } = req.body;

        const user = getUser(username);
        if (!user || !user.totpSecret) {
            return res.status(400).json({ error: 'Setup 2FA first' });
        }

        const isValid = authenticator.verify({
            token: totpToken,
            secret: user.totpSecret
        });

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid 2FA code' });
        }

        updateUser2FA(username, user.totpSecret, true);

        res.json({
            success: true,
            message: '2FA enabled successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Disable 2FA endpoint
router.post('/disable-2fa', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = getUser(username);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        updateUser2FA(username, null, false);

        res.json({
            success: true,
            message: '2FA disabled successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
