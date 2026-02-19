import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'student-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    },
});

// Get all students
router.get('/', authenticateToken, async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(students);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single student
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const student = await prisma.student.findUnique({
            where: { id: req.params.id },
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create student
router.post('/', authenticateToken, upload.single('photo'), async (req, res) => {
    try {
        const { name, address, parentPhone } = req.body;

        if (!name || !address || !parentPhone) {
            return res.status(400).json({ error: 'Name, address, and parent phone are required' });
        }

        const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const student = await prisma.student.create({
            data: {
                name,
                address,
                parentPhone,
                photoUrl,
            },
        });

        res.status(201).json(student);
    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update student
router.put('/:id', authenticateToken, upload.single('photo'), async (req, res) => {
    try {
        const { name, address, parentPhone } = req.body;
        const studentId = req.params.id;

        const existingStudent = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!existingStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (address) updateData.address = address;
        if (parentPhone) updateData.parentPhone = parentPhone;
        if (req.file) {
            updateData.photoUrl = `/uploads/${req.file.filename}`;
            // Delete old photo if exists
            if (existingStudent.photoUrl) {
                const oldPhotoPath = path.join(__dirname, '../..', existingStudent.photoUrl);
                if (fs.existsSync(oldPhotoPath)) {
                    fs.unlinkSync(oldPhotoPath);
                }
            }
        }

        const student = await prisma.student.update({
            where: { id: studentId },
            data: updateData,
        });

        res.json(student);
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete student
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const studentId = req.params.id;

        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Delete photo if exists
        if (student.photoUrl) {
            const photoPath = path.join(__dirname, '../..', student.photoUrl);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        await prisma.student.delete({
            where: { id: studentId },
        });

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
