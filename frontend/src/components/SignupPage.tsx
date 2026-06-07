import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css'; 

export default function SignupPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/users/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                
                alert('Account created successfully! Welcome to BeliBeli.');
                navigate('/login');
                window.location.reload();
            } else {
                setError(data.error || 'Registration failed. Please check your inputs.');
            }
        } catch {
            setError('Unable to connect to the authentication server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page-container">
            <div className="signup-card">
                <h2>Create Account</h2>
                <p className="signup-subtitle">Join BeliBeli marketplace today</p>
                
                {error && <div className="signup-error-alert">{error}</div>}
                
                <form onSubmit={handleSignupSubmit} className="signup-form">
                    <div className="form-group">
                        <label htmlFor="reg-username">Username</label>
                        <input 
                            id="reg-username"
                            type="text" 
                            placeholder="Choose a username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-email">Email Address</label>
                        <input 
                            id="reg-email"
                            type="email" 
                            placeholder="Enter your email address" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="reg-password">Password</label>
                        <input 
                            id="reg-password"
                            type="password" 
                            placeholder="Create a strong password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="signup-submit-btn" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>
                
                <p className="signup-footer">
                    Already have an account? <Link to="/login">Log In</Link>
                </p>
            </div>
        </div>
    );
}