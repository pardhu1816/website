import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Mail, Lock, User, Phone, BadgeCheck, ChevronDown, CheckCircle2, ArrowRight } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

const SignupPage = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://14.139.187.229:8081/jan2026/spic741/visualmotortrainer/api';
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        reason: 'General Training',
        role: 'patient'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleSignup = async (e) => {
        e.preventDefault();

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        // Phone Validation (Indian Format: 10 digits, starts with 6-9)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(formData.phone)) {
            setError('Phone number must be 10 digits and start with 6, 7, 8, or 9.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    full_name: formData.username.trim(),
                    phone_number: formData.phone,
                    role: formData.role
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Direct login logic
                const userData = result.data || {
                    id: formData.email.trim(),
                    username: formData.username.trim(),
                    email: formData.email.trim(),
                    full_name: formData.username.trim(),
                    role: formData.role,
                    api_token: 'demo-token-' + Date.now()
                };
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', userData.api_token || 'demo-token');

                navigate('/home');
            } else {
                setError(result.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('Cannot connect to server. Please ensure the backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px' }}>
            <div className="card animate-fade-in glow" style={{ maxWidth: '480px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(255, 138, 0, 0.1)',
                        borderRadius: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px'
                    }}>
                        <BrainCircuit size={48} color="var(--accent-orange)" />
                    </div>
                    <h1 style={{ fontSize: '32px', color: 'var(--text-primary)', marginBottom: '8px' }}>Create Account</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Start your rehabilitation journey</p>
                </div>

                <form onSubmit={handleSignup}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                        <Input
                            label="Username"
                            icon={User}
                            placeholder="Full Name"
                            name="name"
                            autoComplete="name"
                            value={formData.username}
                            onChange={(val) => setFormData({ ...formData, username: val })}
                        />
                        <Input
                            label="Email Address"
                            icon={Mail}
                            placeholder="name@example.com"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={(val) => setFormData({ ...formData, email: val })}
                        />
                        <Input
                            label="Phone Number"
                            icon={Phone}
                            placeholder="+91 0000000000"
                            type="tel"
                            name="phone"
                            autoComplete="tel"
                            value={formData.phone}
                            onChange={(val) => setFormData({ ...formData, phone: val })}
                        />

                        <div className="form-group">
                            <label style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px' }}>Primary Reason for Training</label>
                            <div className="input-container" style={{ position: 'relative' }}>
                                <BadgeCheck className="input-icon" />
                                <select
                                    style={{ border: 'none', background: 'none', width: '100%', height: '100%', paddingLeft: '12px', fontSize: '16px', appearance: 'none', outline: 'none' }}
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                >
                                    <option>General Training</option>
                                    <option>ADHD</option>
                                    <option>Stroke Recovery</option>
                                    <option>Traumatic Brain Injury</option>
                                    <option>Parkinson's</option>
                                    <option>Multiple Sclerosis</option>
                                    <option>Cerebral Palsy</option>
                                </select>
                                <ChevronDown size={20} style={{ position: 'absolute', right: '16px', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <Input
                                label="Password"
                                icon={Lock}
                                placeholder="••••••••"
                                type="password"
                                name="new-password"
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={(val) => setFormData({ ...formData, password: val })}
                            />
                            <Input
                                label="Confirm"
                                icon={Lock}
                                placeholder="••••••••"
                                type="password"
                                name="confirm-password"
                                autoComplete="new-password"
                                value={formData.confirmPassword}
                                onChange={(val) => setFormData({ ...formData, confirmPassword: val })}
                            />
                        </div>
                    </div>

                    {error && <div style={{ color: 'var(--error-red)', background: '#FEF2F2', padding: '12px', borderRadius: '8px', margin: '20px 0', fontSize: '14px', border: '1px solid #FEE2E2' }}>{error}</div>}

                    <div style={{ margin: '24px 0', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <input type="checkbox" id="terms" style={{ marginTop: '4px' }} required />
                        <label htmlFor="terms" style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                            I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                        </label>
                    </div>

                    <Button type="submit" isLoading={isLoading} style={{ background: 'var(--accent-orange)' }}>
                        Create Account <ArrowRight size={20} />
                    </Button>
                </form>

                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '16px', marginTop: '32px' }}>
                    Already have an account? <Link to="/login" style={{ fontWeight: 700 }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
