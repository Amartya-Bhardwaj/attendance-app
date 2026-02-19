import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { attendanceAPI } from '../api';
import StudentCard from '../components/StudentCard';

function Dashboard() {
    const [date, setDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchAttendance();
    }, [date]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await attendanceAPI.getByDate(date);
            setStudents(res.data);
        } catch (err) {
            showToast('Failed to load attendance', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleToggleAttendance = async (studentId, present) => {
        setSaving(true);
        try {
            const res = await attendanceAPI.mark(studentId, date, present);

            // Update local state
            setStudents(prev => prev.map(s =>
                s.id === studentId
                    ? { ...s, attendance: res.data.attendance }
                    : s
            ));

            if (!present && res.data.smsNotification) {
                if (res.data.smsNotification.mock) {
                    showToast('Student marked absent (SMS mock mode)', 'success');
                } else {
                    showToast('Student marked absent - SMS sent to parent', 'success');
                }
            } else {
                showToast(present ? 'Marked present' : 'Marked absent', 'success');
            }
        } catch (err) {
            showToast('Failed to update attendance', 'error');
        } finally {
            setSaving(false);
        }
    };

    const stats = {
        total: students.length,
        present: students.filter(s => s.attendance?.present === true).length,
        absent: students.filter(s => s.attendance?.present === false).length,
        unmarked: students.filter(s => !s.attendance).length,
    };

    const changeDate = (days) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        setDate(newDate.toISOString().split('T')[0]);
    };

    return (
        <div>
            <div className="dashboard-header">
                <div>
                    <h1 style={{ marginBottom: '0.25rem' }}>Daily Attendance</h1>
                    <p className="text-secondary">Mark attendance for your class</p>
                </div>

                <div className="date-picker">
                    <button className="btn-icon" onClick={() => changeDate(-1)}>←</button>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="date-input"
                    />
                    <button className="btn-icon" onClick={() => changeDate(1)}>→</button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="card stat-card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Students</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>{stats.present}</div>
                    <div className="stat-label">Present</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{stats.absent}</div>
                    <div className="stat-label">Absent</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{stats.unmarked}</div>
                    <div className="stat-label">Unmarked</div>
                </div>
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            ) : students.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">👨‍🎓</div>
                    <h3>No students yet</h3>
                    <p className="text-secondary mb-lg">Add students to start tracking attendance</p>
                    <Link to="/students/new" className="btn btn-primary">Add Student</Link>
                </div>
            ) : (
                <div className="grid" style={{ gap: 'var(--spacing-md)' }}>
                    {students.map(student => (
                        <StudentCard
                            key={student.id}
                            student={student}
                            attendance={student.attendance}
                            onToggleAttendance={handleToggleAttendance}
                        />
                    ))}
                </div>
            )}

            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}

export default Dashboard;
