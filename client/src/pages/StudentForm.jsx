import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { studentsAPI } from '../api';

function StudentForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        parentPhone: '',
    });
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEdit) {
            fetchStudent();
        }
    }, [id]);

    const fetchStudent = async () => {
        try {
            const res = await studentsAPI.getOne(id);
            setFormData({
                name: res.data.name,
                address: res.data.address,
                parentPhone: res.data.parentPhone,
            });
            if (res.data.photoUrl) {
                setPhotoPreview(`https://attendance-app-xr9r.onrender.com${res.data.photoUrl}`);
            }
        } catch (err) {
            setError('Failed to load student');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('address', formData.address);
            data.append('parentPhone', formData.parentPhone);
            if (photo) {
                data.append('photo', photo);
            }

            if (isEdit) {
                await studentsAPI.update(id, data);
            } else {
                await studentsAPI.create(data);
            }

            navigate('/students');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save student');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="form-container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <Link to="/students" className="text-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-md)' }}>
                    ← Back to Students
                </Link>
                <h1>{isEdit ? 'Edit Student' : 'Add New Student'}</h1>
                <p className="text-secondary">
                    {isEdit ? 'Update student information' : 'Enter student details to add them to your class'}
                </p>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid var(--color-danger)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--spacing-md)',
                            marginBottom: 'var(--spacing-lg)',
                            color: 'var(--color-danger)',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <div className="photo-upload" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="photo-preview" />
                        ) : (
                            <div className="photo-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                📷
                            </div>
                        )}
                        <label className="btn btn-secondary photo-upload-btn">
                            {photoPreview ? 'Change Photo' : 'Upload Photo'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                        </label>
                        <span className="text-muted text-sm">Optional - Max 5MB</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter student's full name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address *</label>
                        <textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter student's address"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="parentPhone">Parent's Phone Number *</label>
                        <input
                            type="tel"
                            id="parentPhone"
                            name="parentPhone"
                            value={formData.parentPhone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            required
                        />
                        <span className="text-muted text-sm" style={{ marginTop: '0.25rem', display: 'block' }}>
                            SMS notifications will be sent to this number for absences
                        </span>
                    </div>

                    <div className="flex gap-md" style={{ marginTop: 'var(--spacing-xl)' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (isEdit ? 'Update Student' : 'Add Student')}
                        </button>
                        <Link to="/students" className="btn btn-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StudentForm;
