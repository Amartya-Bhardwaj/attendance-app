function StudentCard({ student, attendance, onToggleAttendance, showActions = false, onEdit, onDelete }) {
    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const photoUrl = student.photoUrl
        ? `https://attendance-app-xr9r.onrender.com${student.photoUrl}`
        : null;

    return (
        <div className="student-card">
            {photoUrl ? (
                <img src={photoUrl} alt={student.name} className="student-avatar" />
            ) : (
                <div className="student-avatar">{getInitials(student.name)}</div>
            )}

            <div className="student-info">
                <div className="student-name">{student.name}</div>
                <div className="student-details">📞 {student.parentPhone}</div>
            </div>

            {onToggleAttendance && (
                <div className="attendance-toggle">
                    <button
                        className={attendance?.present === true ? 'present' : ''}
                        onClick={() => onToggleAttendance(student.id, true)}
                    >
                        Present
                    </button>
                    <button
                        className={attendance?.present === false ? 'absent' : ''}
                        onClick={() => onToggleAttendance(student.id, false)}
                    >
                        Absent
                    </button>
                </div>
            )}

            {showActions && (
                <div className="student-actions">
                    <button className="btn-icon" onClick={() => onEdit(student)} title="Edit">
                        ✏️
                    </button>
                    <button className="btn-icon" onClick={() => onDelete(student)} title="Delete">
                        🗑️
                    </button>
                </div>
            )}
        </div>
    );
}

export default StudentCard;
