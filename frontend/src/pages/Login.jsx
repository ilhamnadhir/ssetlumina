import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FiMail, FiLock, FiBook, FiUser, FiBriefcase, FiHash, FiEye, FiEyeOff } from 'react-icons/fi';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [facultyId, setFacultyId] = useState('');
    const [department, setDepartment] = useState('');
    const [role, setRole] = useState('');
    const [phone, setPhone] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate email contains 'scmsgroup' (except for admin email)
        const isAdminEmail = email.toLowerCase() === 'admin@college.edu';
        if (!isAdminEmail && !email.toLowerCase().includes('scmsgroup')) {
            setError('Email must contain "scmsgroup"');
            setLoading(false);
            return;
        }

        if (isRegister) {
            // Validate registration fields
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }

            if (password.length < 6) {
                setError('Password must be at least 6 characters');
                setLoading(false);
                return;
            }

            if (!name || !facultyId || !department) {
                setError('Please fill in all required fields');
                setLoading(false);
                return;
            }

            // Register new user and create faculty profile
            try {
                // First, register the user
                let userData;
                try {
                    const userResponse = await api.post('/auth/register', { email, password, role: 'faculty' });
                    userData = userResponse.data;
                } catch (regErr) {
                    setError(regErr.response?.data?.message || 'Registration failed');
                    setLoading(false);
                    return;
                }

                // Then, login to get the token
                const loginResult = await login({ email, password });

                if (!loginResult.success) {
                    setError('Registration successful but login failed. Please try logging in.');
                    setLoading(false);
                    return;
                }

                // Wait a moment for token to be set
                await new Promise(resolve => setTimeout(resolve, 100));

                // Create faculty profile using API service
                try {
                    await api.post('/faculty', {
                        name,
                        facultyId,
                        department,
                        role,
                        email,
                        phone,
                        specialization,
                        qualifications: specialization ? [specialization] : []
                    });

                    // Successfully created profile, navigate to home
                    navigate('/');
                } catch (facultyError) {
                    console.error('Faculty creation error:', facultyError);
                    setError(facultyError.response?.data?.message || 'Profile creation failed. Please contact admin.');
                }
            } catch (err) {
                console.error('Registration error:', err);
                setError('Registration failed. Please try again.');
            }
        } else {
            // Login existing user
            const result = await login({ email, password });

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error);
            }
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-background"></div>

            <div className="login-card" style={isRegister ? { maxWidth: '600px' } : {}}>
                <div className="login-header">
                    <div className="login-icon">
                        <FiBook />
                    </div>
                    <h1>Faculty Portal</h1>
                    <p>{isRegister ? 'Create New Account' : 'Publication Management System'}</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {isRegister && (
                        <>
                            <div className="form-group">
                                <label className="form-label">
                                    <FiUser />
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <FiHash />
                                    Faculty ID *
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={facultyId}
                                    onChange={(e) => setFacultyId(e.target.value)}
                                    placeholder="e.g., FAC001"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <FiBook />
                                    Department *
                                </label>
                                <select
                                    className="form-select"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Choose department</option>
                                    <option value="M.Tech-EE">M.Tech - EE</option>
                                    <option value="M.Tech-CSE">M.Tech - CSE</option>
                                    <option value="MCA">MCA</option>
                                    <option value="B.Tech-CSE">B.Tech - CSE</option>
                                    <option value="B.Tech-AI&DS">B.Tech - AI&DS</option>
                                    <option value="B.Tech-ECE">B.Tech - ECE</option>
                                    <option value="B.Tech-ECE(VLSI)">B.Tech - ECE (VLSI)</option>
                                    <option value="B.Tech-EEE">B.Tech - EEE</option>
                                    <option value="B.Tech-ME">B.Tech - ME</option>
                                    <option value="B.Tech-AU">B.Tech - AU</option>
                                    <option value="B.Tech-CE">B.Tech - CE</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <FiBriefcase />
                                    Role *
                                </label>
                                <select
                                    className="form-select"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Choose role</option>
                                    <option value="Professor">Professor</option>
                                    <option value="Associate Professor">Associate Professor</option>
                                    <option value="Assistant Professor">Assistant Professor</option>
                                    <option value="Lecturer">Lecturer</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Phone (Optional)
                                </label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+91-9876543210"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Specialization (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                    placeholder="e.g., Machine Learning, Data Science"
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label className="form-label">
                            <FiMail />
                            Email Address *
                        </label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@scmsgroup.com"
                            autoComplete="off"
                            required
                        />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {isRegister ? 'Must contain "scmsgroup"' : 'Admin email or scmsgroup email'}
                        </small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FiLock />
                            Password *
                        </label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete="new-password"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="eye-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            Minimum 6 characters
                        </small>
                    </div>

                    {isRegister && (
                        <div className="form-group">
                            <label className="form-label">
                                <FiLock />
                                Confirm Password *
                            </label>
                            <div className="password-wrapper">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="form-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password"
                                    autoComplete="new-password"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    className="eye-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? (isRegister ? 'Creating Account...' : 'Signing in...') : (isRegister ? 'Create Account' : 'Sign In')}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)' }}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                                // Reset form fields
                                setName('');
                                setFacultyId('');
                                setPhone('');
                                setSpecialization('');
                                setConfirmPassword('');
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary-light)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                textDecoration: 'underline'
                            }}
                        >
                            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
