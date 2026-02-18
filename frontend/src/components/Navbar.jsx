import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiBook, FiUsers, FiFileText, FiLogOut, FiSettings, FiSun, FiMoon, FiUser } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    // Helper function to check if a link is active
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <FiBook className="brand-icon" />
                    <span>Faculty Portal</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                        <FiHome />
                        <span>Home</span>
                    </Link>
                    <Link to="/departments" className={`nav-link ${isActive('/departments') ? 'active' : ''}`}>
                        <FiBook />
                        <span>Departments</span>
                    </Link>
                    <Link to="/publications" className={`nav-link ${isActive('/publications') ? 'active' : ''}`}>
                        <FiFileText />
                        <span>Publications</span>
                    </Link>
                    <Link to="/faculty" className={`nav-link ${isActive('/faculty') ? 'active' : ''}`}>
                        <FiUsers />
                        <span>Faculty</span>
                    </Link>
                    {isAdmin() && (
                        <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                            <FiSettings />
                            <span>Admin</span>
                        </Link>
                    )}
                    {!isAdmin() && user && (
                        <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                            <FiUser />
                            <span>My Profile</span>
                        </Link>
                    )}
                </div>

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
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
