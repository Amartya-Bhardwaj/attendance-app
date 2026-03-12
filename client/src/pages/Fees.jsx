import { useState, useEffect } from 'react';
import { feesAPI } from '../api';

function Fees() {
    const [month, setMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchFees();
    }, [month]);

    const fetchFees = async () => {
        setLoading(true);
        try {
            const res = await feesAPI.getByMonth(month);
            setStudents(res.data);
        } catch (err) {
            showToast('Failed to load fee records', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleToggleFee = async (studentId, paid) => {
        setSaving(true);
        try {
            const res = await feesAPI.mark(studentId, month, 0, paid);

            setStudents(prev => prev.map(s =>
                s.id === studentId
                    ? { ...s, feeRecord: res.data.feeRecord }
                    : s
            ));

            showToast(paid ? 'Marked as Paid' : 'Marked as Unpaid', 'success');
        } catch (err) {
            showToast('Failed to update fee status', 'error');
        } finally {
            setSaving(false);
        }
    };

    const stats = {
        total: students.length,
        paid: students.filter(s => s.feeRecord?.paid === true).length,
        unpaid: students.filter(s => !s.feeRecord || s.feeRecord.paid === false).length,
    };

    const changeMonth = (offset) => {
        const [y, m] = month.split('-').map(Number);
        const d = new Date(y, m - 1 + offset, 1);
        setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    };

    const formatMonth = (m) => {
        const [y, mo] = m.split('-');
        const date = new Date(Number(y), Number(mo) - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    return (
        <div>
            <div className="dashboard-header">
                <div>
                    <h1 style={{ marginBottom: '0.25rem' }}>Monthly Fees</h1>
                    <p className="text-secondary">Track fee payments for your class</p>
                </div>

                <div className="date-picker">
                    <button className="btn-icon" onClick={() => changeMonth(-1)}>←</button>
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="date-input"
                    />
                    <button className="btn-icon" onClick={() => changeMonth(1)}>→</button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="card stat-card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Students</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>{stats.paid}</div>
                    <div className="stat-label">Paid</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{stats.unpaid}</div>
                    <div className="stat-label">Unpaid</div>
                </div>
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            ) : students.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">💰</div>
                    <h3>No students yet</h3>
                    <p className="text-secondary mb-lg">Add students to start tracking fees</p>
                </div>
            ) : (
                <div className="grid" style={{ gap: 'var(--spacing-md)' }}>
                    {students.map(student => {
                        const isPaid = student.feeRecord?.paid === true;
                        const paidAt = student.feeRecord?.paidAt;

                        return (
                            <div key={student.id} className="student-card">
                                {student.photoUrl ? (
                                    <img
                                        src={student.photoUrl}
                                        alt={student.name}
                                        className="student-avatar"
                                    />
                                ) : (
                                    <div className="student-avatar">
                                        {student.name.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                <div className="student-info">
                                    <div className="student-name">{student.name}</div>
                                    <div className="student-details">
                                        {isPaid && paidAt
                                            ? `Paid on ${new Date(paidAt).toLocaleDateString()}`
                                            : `Fees for ${formatMonth(month)}`
                                        }
                                    </div>
                                </div>

                                <div className="student-actions">
                                    <span className={`badge ${isPaid ? 'badge-success' : 'badge-danger'}`}>
                                        {isPaid ? '✓ Paid' : '✗ Unpaid'}
                                    </span>
                                    <div className="fee-toggle">
                                        <button
                                            className={isPaid ? 'paid' : ''}
                                            onClick={() => handleToggleFee(student.id, true)}
                                            disabled={saving}
                                        >
                                            Paid
                                        </button>
                                        <button
                                            className={!isPaid ? 'unpaid' : ''}
                                            onClick={() => handleToggleFee(student.id, false)}
                                            disabled={saving}
                                        >
                                            Unpaid
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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

export default Fees;
