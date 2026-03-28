import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Mail, Lock, ArrowRight, X } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

const LoginPage = () => {
    const API_BASE_URL = 'http://14.139.187.229:8081/jan2026/spic741/visualmotortrainer/auth';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmNewPass, setConfirmNewPass] = useState('');
    const [resetMsg, setResetMsg] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!email || !password) {
            setError('Invalid email or password');
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Ensure the user object has a unique identifier and an email field
                const userData = {
                    ...result.data,
                    email: result.data.email || email.trim(), // Ensure email field is present
                    id: result.data.id || result.data.email || email.trim() // Robust userId
                };
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', userData.api_token || result.data.api_token);
                navigate('/home');
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Cannot connect to server. Please ensure the backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(forgotEmail)) {
            setResetMsg('Please enter a valid email address.');
            return;
        }

        if (!forgotEmail || !newPass || !confirmNewPass) {
            setResetMsg('Please fill all fields');
            return;
        }
        if (newPass !== confirmNewPass) {
            setResetMsg('Passwords do not match');
            return;
        }
        setIsLoading(true);
        setResetMsg('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset_password.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: forgotEmail.trim(),
                    new_password: newPass
                }),
            });

            const result = await response.json();
            if (result.success) {
                setResetMsg('Password reset successful! You can now log in.');
                setTimeout(() => {
                    setShowForgotModal(false);
                    setResetMsg('');
                    setConfirmNewPass('');
                    setNewPass('');
                }, 3000);
            } else {
                setResetMsg(result.message || 'Reset failed');
            }
        } catch (err) {
            setResetMsg('Error connecting to server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div className="card animate-fade-in glow" style={{ maxWidth: '440px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'var(--secondary-blue)',
                        borderRadius: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px'
                    }}>
                        <BrainCircuit size={48} color="var(--primary-blue)" />
                    </div>
                    <h1 style={{ fontSize: '32px', color: 'var(--text-primary)', marginBottom: '8px' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Sign in to continue your training</p>
                </div>

                <form onSubmit={handleLogin}>
                    <Input
                        label="Email"
                        icon={Mail}
                        placeholder="Enter your email"
                        type="email"
                        value={email}
                        onChange={setEmail}
                    />
                    <Input
                        label="Password"
                        icon={Lock}
                        placeholder="••••••••"
                        type="password"
                        value={password}
                        onChange={setPassword}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                        <button
                            type="button"
                            onClick={() => setShowForgotModal(true)}
                            style={{ fontSize: '14px', background: 'none', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer', fontWeight: 600 }}
                        >
                            Forgot Password?
                        </button>
                    </div>

                    {error && <div style={{ color: 'var(--error-red)', background: '#FEF2F2', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #FEE2E2' }}>{error}</div>}

                    <Button type="submit" isLoading={isLoading}>
                        Sign In <ArrowRight size={20} />
                    </Button>
                </form>

                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '16px', marginTop: '32px' }}>
                    Don't have an account? <Link to="/signup" style={{ fontWeight: 700 }}>Sign Up</Link>
                </p>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    padding: '24px'
                }}>
                    <div className="card" style={{ maxWidth: '400px', width: '100%', position: 'relative' }}>
                        <button
                            onClick={() => setShowForgotModal(false)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={20} color="var(--text-secondary)" />
                        </button>
                        <h2 style={{ marginBottom: '16px' }}>Reset Password</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Enter your email and confirm your new password.</p>

                        <form onSubmit={handleResetPassword}>
                            <Input
                                label="Email"
                                icon={Mail}
                                placeholder="example@email.com"
                                type="email"
                                value={forgotEmail}
                                onChange={setForgotEmail}
                            />
                            <Input
                                label="New Password"
                                icon={Lock}
                                placeholder="••••••••"
                                type="password"
                                value={newPass}
                                onChange={setNewPass}
                            />
                            <Input
                                label="Re-enter Password"
                                icon={Lock}
                                placeholder="••••••••"
                                type="password"
                                value={confirmNewPass}
                                onChange={setConfirmNewPass}
                            />
                            {resetMsg && <div style={{
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                fontSize: '14px',
                                background: resetMsg.includes('successful') ? '#F0FDF4' : '#FEF2F2',
                                color: resetMsg.includes('successful') ? '#16A34A' : 'var(--error-red)',
                                border: `1px solid ${resetMsg.includes('successful') ? '#DCFCE7' : '#FEE2E2'}`
                            }}>{resetMsg}</div>}
                            <Button type="submit" isLoading={isLoading}>Reset Password</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
