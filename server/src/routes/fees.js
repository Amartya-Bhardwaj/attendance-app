import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all students with their fee record for a given month
router.get('/:month', authenticateToken, async (req, res) => {
    try {
        const { month } = req.params; // YYYY-MM

        const students = await prisma.student.findMany({
            include: {
                feeRecords: {
                    where: { month },
                },
            },
            orderBy: { name: 'asc' },
        });

        const result = students.map((student) => ({
            id: student.id,
            name: student.name,
            address: student.address,
            parentPhone: student.parentPhone,
            parentEmail: student.parentEmail,
            photoUrl: student.photoUrl,
            feeRecord: student.feeRecords[0] || null,
        }));

        res.json(result);
    } catch (error) {
        console.error('Get fees error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Mark fee for a single student
router.post('/mark', authenticateToken, async (req, res) => {
    try {
        const { studentId, month, amount, paid } = req.body;

        if (!studentId || !month || paid === undefined) {
            return res.status(400).json({ error: 'Student ID, month, and paid status are required' });
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const feeRecord = await prisma.feeRecord.upsert({
            where: {
                month_studentId: {
                    month,
                    studentId,
                },
            },
            update: {
                paid,
                amount: amount ?? 0,
                paidAt: paid ? new Date() : null,
            },
            create: {
                month,
                studentId,
                paid,
                amount: amount ?? 0,
                paidAt: paid ? new Date() : null,
            },
        });

        res.json({ feeRecord });
    } catch (error) {
        console.error('Mark fee error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Bulk mark fees
router.post('/bulk', authenticateToken, async (req, res) => {
    try {
        const { month, records } = req.body;

        if (!month || !records || !Array.isArray(records)) {
            return res.status(400).json({ error: 'Month and records array are required' });
        }

        const results = [];

        for (const record of records) {
            const { studentId, amount, paid } = record;

            const feeRecord = await prisma.feeRecord.upsert({
                where: {
                    month_studentId: {
                        month,
                        studentId,
                    },
                },
                update: {
                    paid,
                    amount: amount ?? 0,
                    paidAt: paid ? new Date() : null,
                },
                create: {
                    month,
                    studentId,
                    paid,
                    amount: amount ?? 0,
                    paidAt: paid ? new Date() : null,
                },
            });

            results.push(feeRecord);
        }

        res.json({ feeRecords: results });
    } catch (error) {
        console.error('Bulk mark fee error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
