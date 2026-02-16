import express from 'express';
import bcrypt from 'bcryptjs';
import argon2 from 'argon2';
import crypto from 'crypto';

const router = express.Router();

// ==================== Argon2 Hashing ====================

// Hash with Argon2
router.post('/argon2/hash', async (req, res) => {
    try {
        const { password, type = 'argon2id', timeCost = 3, memoryCost = 65536 } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password required' });
        }

        const hash = await argon2.hash(password, {
            type: argon2[type] || argon2.argon2id,
            timeCost,
            memoryCost,
            parallelism: 4
        });

        res.json({
            success: true,
            hash,
            algorithm: 'Argon2',
            type,
            timeCost,
            memoryCost
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify Argon2 hash
router.post('/argon2/verify', async (req, res) => {
    try {
        const { password, hash } = req.body;

        if (!password || !hash) {
            return res.status(400).json({ error: 'Password and hash required' });
        }

        const isMatch = await argon2.verify(hash, password);

        res.json({
            success: true,
            match: isMatch
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== Bcrypt Hashing ====================

// Hash with bcrypt
router.post('/bcrypt/hash', async (req, res) => {
    try {
        const { password, saltRounds = 10 } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password required' });
        }

        const salt = await bcrypt.genSalt(parseInt(saltRounds));
        const hash = await bcrypt.hash(password, salt);

        res.json({
            success: true,
            hash,
            algorithm: 'bcrypt',
            saltRounds
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify bcrypt hash
router.post('/bcrypt/verify', async (req, res) => {
    try {
        const { password, hash } = req.body;

        if (!password || !hash) {
            return res.status(400).json({ error: 'Password and hash required' });
        }

        const isMatch = await bcrypt.compare(password, hash);

        res.json({
            success: true,
            match: isMatch
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== PBKDF2 Key Derivation ====================

router.post('/pbkdf2', (req, res) => {
    try {
        const { password, salt, iterations = 100000, keylen = 64, digest = 'sha512' } = req.body;

        if (!password || !salt) {
            return res.status(400).json({ error: 'Password and salt required' });
        }

        crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                success: true,
                derivedKey: derivedKey.toString('hex'),
                algorithm: 'PBKDF2',
                iterations,
                keyLength: keylen,
                digest
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== scrypt Key Derivation ====================

router.post('/scrypt', (req, res) => {
    try {
        const { password, salt, N = 16384, r = 8, p = 1, keylen = 64 } = req.body;

        if (!password || !salt) {
            return res.status(400).json({ error: 'Password and salt required' });
        }

        crypto.scrypt(password, salt, keylen, { N, r, p }, (err, derivedKey) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                success: true,
                derivedKey: derivedKey.toString('hex'),
                algorithm: 'scrypt',
                cost: N,
                blockSize: r,
                parallelization: p,
                keyLength: keylen
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
