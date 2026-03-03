import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiBook, FiUsers, FiFileText, FiLogOut, FiSettings, FiSun, FiMoon, FiUser, FiMenu, FiX } from 'react-icons/fi';
import ssetLogo from '/sset logo.mp4';
import { useState, useEffect } from 'react';
import { facultyAPI } from '../services/api';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [menuOpen, setMenuOpen] = useState(false);
    const [myFacultyId, setMyFacultyId] = useState(null);

    // Fetch own faculty ID once so we can highlight "My Profile" correctly
    useEffect(() => {
        if (user && !isAdmin()) {
            facultyAPI.getMe()
                .then(res => setMyFacultyId(res.data.faculty?._id))
                .catch(() => { });
        }
    }, [user]);

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        // "My Profile" should be active when on /profile OR on own /faculty/:id page
        if (path === '/profile') {
            if (location.pathname === '/profile') return true;
            if (myFacultyId && location.pathname === `/faculty/${myFacultyId}`) return true;
            return false;
        }
        // "Faculty" should NOT be active when on own profile page
        if (path === '/faculty') {
            if (myFacultyId && location.pathname === `/faculty/${myFacultyId}`) return false;
            return location.pathname.startsWith('/faculty');
        }
        return location.pathname.startsWith(path);
    };

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/', icon: <FiHome />, label: 'Home' },
        { to: '/departments', icon: <FiBook />, label: 'Departments' },
        { to: '/publications', icon: <FiFileText />, label: 'Publications' },
        { to: '/faculty', icon: <FiUsers />, label: 'Faculty' },
        ...(isAdmin() ? [{ to: '/admin', icon: <FiSettings />, label: 'Admin' }] : []),
        ...(!isAdmin() && user ? [{ to: '/profile', icon: <FiUser />, label: 'My Profile' }] : []),
    ];

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <Link to="/" className="navbar-brand">
                        <video src={ssetLogo} autoPlay loop muted playsInline className="brand-logo-video" />
                        <span>SSET Lumina</span>
                    </Link>

                    {/* Desktop links */}
                    <div className="navbar-links">
                        {navLinks.map(({ to, icon, label }) => (
                            <Link key={to} to={to} className={`nav-link ${isActive(to) ? 'active' : ''}`}>
                                {icon}
                                <span>{label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Desktop user controls */}
                    <div className="navbar-user">
                        <div className="user-info">
                            <span className="user-email">{user?.email}</span>
                            <span className="user-role badge badge-primary">{user?.role}</span>
                        </div>
                        <button onClick={toggleTheme} className="btn-theme" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                            {theme === 'dark' ? <FiSun /> : <FiMoon />}
                        </button>
                        <button onClick={handleLogout} className="btn-logout">
                            <FiLogOut />
                        </button>
                        {/* Hamburger — mobile only */}
                        <button className="btn-hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
                            <FiMenu size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile overlay */}
            <div className={`mobile-menu-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

            {/* Mobile drawer */}
            <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-header">
                    <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
                        <video src={ssetLogo} autoPlay loop muted playsInline className="brand-logo-video" />
                        <span>SSET Lumina</span>
                    </Link>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setMenuOpen(false)}>
                        <FiX size={22} />
                    </button>
                </div>

                {navLinks.map(({ to, icon, label }) => (
                    <Link key={to} to={to} className={`nav-link ${isActive(to) ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                        {icon}
                        <span>{label}</span>
                    </Link>
                ))}

                <div className="mobile-menu-footer">
                    <div className="mobile-user-info">
                        <span className="mobile-user-email">{user?.email}</span>
                        <span className="mobile-user-role">{user?.role}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={toggleTheme} className="btn-theme" title="Toggle theme">
                            {theme === 'dark' ? <FiSun /> : <FiMoon />}
                        </button>
                        <button onClick={handleLogout} className="btn-logout">
                            <FiLogOut />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
