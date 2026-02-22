import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, facultyAPI } from '../services/api';
import { FiUsers, FiFileText, FiBook, FiTrendingUp } from 'react-icons/fi';
import { useData } from '../context/DataContext';
import useCountUp from '../hooks/useCountUp';
import './Home.css';

const Home = () => {
    const [stats, setStats] = useState(null);
    const { departments } = useData();
    const [recentFaculty, setRecentFaculty] = useState([]);
    const [loading, setLoading] = useState(true);

    // Animated counters
    const facultyCount = useCountUp(stats?.totalFaculty || 0, 2000);
    const publicationsCount = useCountUp(stats?.totalPublications || 0, 2000);
    const departmentsCount = useCountUp(stats?.totalDepartments || 0, 2000);
    const avgCount = useCountUp(parseFloat(((stats?.totalPublications || 0) / (stats?.totalFaculty || 1)).toFixed(1)), 2000);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, facultyRes] = await Promise.all([
                adminAPI.getStats(),
                facultyAPI.getAll({ sortBy: 'createdAt', order: 'desc', limit: 6, minimal: true })
            ]);

            setStats(statsRes.data.overview);
            setRecentFaculty(facultyRes.data.faculty);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <div className="container">
                <div className="page-header">
                    <h1>Faculty Publication Portal</h1>
                </div>

                <div className="stats-grid">
                    <div className="stat-card" style={{ background: 'var(--gradient-primary)' }}>
                        <FiUsers className="stat-icon" />
                        <div className="stat-value">{facultyCount}</div>
                        <div className="stat-label">Total Faculty</div>
                    </div>

                    <div className="stat-card" style={{ background: 'var(--gradient-secondary)' }}>
                        <FiFileText className="stat-icon" />
                        <div className="stat-value">{publicationsCount}</div>
                        <div className="stat-label">Publications</div>
                    </div>

                    <div className="stat-card" style={{ background: 'var(--gradient-accent)' }}>
                        <FiBook className="stat-icon" />
                        <div className="stat-value">{departmentsCount}</div>
                        <div className="stat-label">Departments</div>
                    </div>

                    <div className="stat-card" style={{ background: 'var(--gradient-success)' }}>
                        <FiTrendingUp className="stat-icon" />
                        <div className="stat-value">{avgCount.toFixed(1)}</div>
                        <div className="stat-label">Avg per Faculty</div>
                    </div>
                </div>

                <div className="content-grid">
                    <div className="section-card">
                        <div className="section-header">
                            <h2>Departments</h2>
                            <Link to="/departments" className="btn btn-sm btn-outline">View All</Link>
                        </div>
                        <div className="departments-list">
                            {departments.slice(0, 4).map((dept) => (
                                <Link to={`/departments?dept=${dept._id}`} key={dept._id} className="department-item">
                                    <div className="department-info">
                                        <h3>{dept.name}</h3>
                                        <p className="department-code">{dept.code}</p>
                                    </div>
                                    <div className="department-badge">
                                        {dept.facultyCount || 0} Faculty
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <h2>Faculty Members</h2>
                            <Link to="/faculty" className="btn btn-sm btn-outline">View All</Link>
                        </div>
                        <div className="faculty-grid">
                            {recentFaculty.map((faculty) => (
                                <Link to={`/faculty/${faculty._id}`} key={faculty._id} className="faculty-card-mini">
                                    <img
                                        src={faculty.profilePhoto || 'https://via.placeholder.com/100'}
                                        alt={faculty.name}
                                        className="faculty-avatar"
                                    />
                                    <div className="faculty-info">
                                        <h4>{faculty.name}</h4>
                                        <p className="faculty-role">{faculty.role}</p>
                                        <p className="faculty-dept">{faculty.department?.name}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
