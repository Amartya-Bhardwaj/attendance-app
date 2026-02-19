import { useState, useEffect } from 'react';
import { studentsAPI, attendanceAPI } from '../api';

function AttendanceHistory() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await studentsAPI.getAll();
            setStudents(res.data);
            if (res.data.length > 0) {
                handleStudentSelect(res.data[0]);
            }
        } catch (err) {
            console.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentSelect = async (student) => {
        setSelectedStudent(student);
        setHistoryLoading(true);
        try {
            const res = await attendanceAPI.getByStudent(student.id);
            setHistory(res.data.attendance || []);
        } catch (err) {
            console.error('Failed to load history');
        } finally {
            setHistoryLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const stats = {
        totalDays: history.length,
        presentDays: history.filter(h => h.present).length,
        absentDays: history.filter(h => !h.present).length,
        percentage: history.length > 0
            ? Math.round((history.filter(h => h.present).length / history.length) * 100)
            : 0
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ marginBottom: '0.25rem' }}>Attendance History</h1>
                <p className="text-secondary">View attendance records by student</p>
            </div>

            {students.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">📊</div>
                    <h3>No students yet</h3>
                    <p className="text-secondary">Add students to view their attendance history</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--spacing-lg)' }}>
                    {/* Student List */}
                    <div className="card" style={{ height: 'fit-content' }}>
                        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Students</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                            {students.map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => handleStudentSelect(student)}
                                    style={{
                                        padding: 'var(--spacing-md)',
                                        background: selectedStudent?.id === student.id ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--color-text-primary)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all var(--transition-fast)',
                                    }}
                                >
                                    {student.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* History View */}
                    <div>
                        {selectedStudent && (
                            <>
                                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                    <div className="card stat-card">
                                        <div className="stat-value">{stats.totalDays}</div>
                                        <div className="stat-label">Total Days</div>
                                    </div>
                                    <div className="card stat-card">
                                        <div className="stat-value" style={{ color: 'var(--color-success)' }}>{stats.presentDays}</div>
                                        <div className="stat-label">Present</div>
                                    </div>
                                    <div className="card stat-card">
                                        <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{stats.absentDays}</div>
                                        <div className="stat-label">Absent</div>
                                    </div>
                                    <div className="card stat-card">
                                        <div className="stat-value">{stats.percentage}%</div>
                                        <div className="stat-label">Attendance Rate</div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>
                                        {selectedStudent.name}'s Attendance
                                    </h3>

                                    {historyLoading ? (
                                        <div className="loading">
                                            <div className="spinner"></div>
                                        </div>
                                    ) : history.length === 0 ? (
                                        <div className="empty-state">
                                            <p className="text-muted">No attendance records yet</p>
                                        </div>
                                    ) : (
                                        <div className="table-container">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {history.map(record => (
                                                        <tr key={record.id}>
                                                            <td>{formatDate(record.date)}</td>
                                                            <td>
                                                                <span className={`badge ${record.present ? 'badge-success' : 'badge-danger'}`}>
                                                                    {record.present ? 'Present' : 'Absent'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AttendanceHistory;
