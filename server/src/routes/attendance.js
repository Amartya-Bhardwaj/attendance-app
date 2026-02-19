import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { sendAbsenceNotification } from '../services/smsService.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get attendance for a specific date
router.get('/date/:date', authenticateToken, async (req, res) => {
    try {
        const { date } = req.params;

        // Get all students with their attendance for the date
        const students = await prisma.student.findMany({
            include: {
                attendance: {
                    where: { date },
                },
            },
            orderBy: { name: 'asc' },
        });

        // Transform data to include attendance status
        const result = students.map((student) => ({
            id: student.id,
            name: student.name,
            address: student.address,
            parentPhone: student.parentPhone,
            photoUrl: student.photoUrl,
            attendance: student.attendance[0] || null,
        }));

        res.json(result);
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get attendance history for a student
router.get('/student/:id', authenticateToken, async (req, res) => {
    try {
        const studentId = req.params.id;

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                attendance: {
                    orderBy: { date: 'desc' },
                    take: 30, // Last 30 records
                },
            },
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        console.error('Get student attendance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Mark attendance (single student)
router.post('/mark', authenticateToken, async (req, res) => {
    try {
        const { studentId, date, present } = req.body;

        if (!studentId || !date || present === undefined) {
            return res.status(400).json({ error: 'Student ID, date, and present status are required' });
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Upsert attendance record
        const attendance = await prisma.attendance.upsert({
            where: {
                date_studentId: {
                    date,
                    studentId,
                },
            },
            update: { present },
            create: {
                date,
                studentId,
                present,
            },
        });

        // Send SMS notification if student is marked absent
        if (!present) {
            const smsResult = await sendAbsenceNotification(student.name, student.parentPhone);
            return res.json({ attendance, smsNotification: smsResult });
        }

        res.json({ attendance });
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Bulk mark attendance
router.post('/bulk', authenticateToken, async (req, res) => {
    try {
        const { date, records } = req.body;

        if (!date || !records || !Array.isArray(records)) {
            return res.status(400).json({ error: 'Date and records array are required' });
        }

        const results = [];
        const absentStudents = [];

        for (const record of records) {
            const { studentId, present } = record;

            const attendance = await prisma.attendance.upsert({
                where: {
                    date_studentId: {
                        date,
                        studentId,
                    },
                },
                update: { present },
                create: {
                    date,
                    studentId,
                    present,
                },
            });

            results.push(attendance);

            // Collect absent students for notifications
            if (!present) {
                const student = await prisma.student.findUnique({
                    where: { id: studentId },
                });
                if (student) {
                    absentStudents.push(student);
                }
            }
        }

        // Send SMS notifications for absent students
        const smsResults = [];
        for (const student of absentStudents) {
            const smsResult = await sendAbsenceNotification(student.name, student.parentPhone);
            smsResults.push({ studentId: student.id, studentName: student.name, ...smsResult });
        }

        res.json({
            attendance: results,
            smsNotifications: smsResults,
        });
    } catch (error) {
        console.error('Bulk mark attendance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get attendance summary for a date range
router.get('/summary', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        const attendance = await prisma.attendance.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                student: true,
            },
            orderBy: { date: 'desc' },
        });

        res.json(attendance);
    } catch (error) {
        console.error('Get attendance summary error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
