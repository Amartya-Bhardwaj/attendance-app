import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    if (isAuthenticated) {
        navigate('/', { replace: true });
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="card login-card">
                <div className="login-header">
                    <div className="login-logo">📋</div>
                    <h1>Welcome Back</h1>
                    <p className="text-secondary">Sign in to manage attendance</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
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

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@school.com"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-muted" style={{ marginTop: 'var(--spacing-lg)', fontSize: '0.8125rem' }}>
                    Default: admin@school.com / admin123
                </p>
            </div>
        </div>
    );
}

export default Login;
