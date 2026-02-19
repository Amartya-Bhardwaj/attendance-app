import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const admin = await prisma.admin.findUnique({
            where: { email },
        });

        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify token / Get current admin
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const admin = await prisma.admin.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, name: true },
        });

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        res.json(admin);
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
