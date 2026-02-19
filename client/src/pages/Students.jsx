import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentsAPI } from '../api';
import StudentCard from '../components/StudentCard';

function Students() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState(null);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await studentsAPI.getAll();
            setStudents(res.data);
        } catch (err) {
            showToast('Failed to load students', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleEdit = (student) => {
        navigate(`/students/${student.id}/edit`);
    };

    const handleDeleteClick = (student) => {
        setDeleteModal(student);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal) return;

        try {
            await studentsAPI.delete(deleteModal.id);
            setStudents(prev => prev.filter(s => s.id !== deleteModal.id));
            showToast('Student deleted successfully');
        } catch (err) {
            showToast('Failed to delete student', 'error');
        } finally {
            setDeleteModal(null);
        }
    };

    return (
        <div>
            <div className="dashboard-header">
                <div>
                    <h1 style={{ marginBottom: '0.25rem' }}>Student Management</h1>
                    <p className="text-secondary">Manage your class roster</p>
                </div>

                <Link to="/students/new" className="btn btn-primary">
                    + Add Student
                </Link>
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            ) : students.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">👨‍🎓</div>
                    <h3>No students yet</h3>
                    <p className="text-secondary mb-lg">Start by adding your first student</p>
                    <Link to="/students/new" className="btn btn-primary">Add Student</Link>
                </div>
            ) : (
                <div className="grid" style={{ gap: 'var(--spacing-md)' }}>
                    {students.map(student => (
                        <StudentCard
                            key={student.id}
                            student={student}
                            showActions
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Delete Student</h2>
                            <button className="modal-close" onClick={() => setDeleteModal(null)}>×</button>
                        </div>
                        <p className="text-secondary" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            Are you sure you want to delete <strong>{deleteModal.name}</strong>?
                            This action cannot be undone and will remove all their attendance records.
                        </p>
                        <div className="flex gap-md" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                                Delete
                            </button>
                        </div>
                    </div>
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

export default Students;
