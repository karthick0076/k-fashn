import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const data = await apiFetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            if (data.success) {
                login({ email: data.email, role: data.role });
                if (data.role === 'admin') navigate('/admin');
                else navigate('/home');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Server error. Ensure backend is running.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--primary-color)", fontSize: "2.5rem", marginBottom: "0.5rem" }}>K-Fashn</h1>
                <p style={{ marginBottom: "2rem", color: "#666" }}>Elegance tailored for you.</p>
                <h2>Sign In</h2>
                {error && <p className="error-text">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" required className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" required className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Enter</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
