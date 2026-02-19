import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';

function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="navbar-brand">
                    <div className="navbar-brand-icon">📋</div>
                    <span>AttendanceApp</span>
                </Link>

                <div className="navbar-links">
                    <Link
                        to="/"
                        className={`navbar-link ${isActive('/') ? 'active' : ''}`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/students"
                        className={`navbar-link ${isActive('/students') ? 'active' : ''}`}
                    >
                        Students
                    </Link>
                    <Link
                        to="/history"
                        className={`navbar-link ${isActive('/history') ? 'active' : ''}`}
                    >
                        History
                    </Link>

                    <div style={{
                        marginLeft: '1rem',
                        paddingLeft: '1rem',
                        borderLeft: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <span className="text-secondary text-sm">{user?.name}</span>
                        <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem' }}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
