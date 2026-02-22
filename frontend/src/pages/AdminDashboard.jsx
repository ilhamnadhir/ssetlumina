import { useState, useEffect } from 'react';
import { adminAPI, departmentsAPI } from '../services/api';
import { FiUsers, FiFileText, FiBook, FiTrendingUp } from 'react-icons/fi';
import ManageDepartments from '../components/ManageDepartments';
import ManagePublications from '../components/ManagePublications';
import ManageFaculty from '../components/ManageFaculty';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, deptsRes] = await Promise.all([
                adminAPI.getStats(),
                departmentsAPI.getAll()
            ]);
            setStats(statsRes.data);
            setDepartments(deptsRes.data.departments);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="loader"></div></div>;
    }

    return (
        <div className="home-page">
            <div className="container">
                <div className="page-header">
                    <h1>Admin Dashboard</h1>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-md mb-xl" style={{ borderBottom: '2px solid var(--border)' }}>
                    <button
                        onClick={() => setActiveTab('overview')}
                        style={{
                            padding: 'var(--spacing-md)',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === 'overview' ? 'var(--primary-light)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            marginBottom: '-2px'
                        }}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('departments')}
                        style={{
                            padding: 'var(--spacing-md)',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'departments' ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === 'departments' ? 'var(--primary-light)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            marginBottom: '-2px'
                        }}
                    >
                        Manage Departments
                    </button>
                    <button
                        onClick={() => setActiveTab('publications')}
                        style={{
                            padding: 'var(--spacing-md)',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'publications' ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === 'publications' ? 'var(--primary-light)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            marginBottom: '-2px'
                        }}
                    >
                        Manage Publications
                    </button>
                    <button
                        onClick={() => setActiveTab('faculty')}
                        style={{
                            padding: 'var(--spacing-md)',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'faculty' ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === 'faculty' ? 'var(--primary-light)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            marginBottom: '-2px'
                        }}
                    >
                        Manage Faculty
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card" style={{ background: 'var(--gradient-primary)' }}>
                                <FiUsers className="stat-icon" />
                                <div className="stat-value">{stats?.overview.totalFaculty || 0}</div>
                                <div className="stat-label">Total Faculty</div>
                            </div>

                            <div className="stat-card" style={{ background: 'var(--gradient-secondary)' }}>
                                <FiFileText className="stat-icon" />
                                <div className="stat-value">{stats?.overview.totalPublications || 0}</div>
                                <div className="stat-label">Publications</div>
                            </div>

                            <div className="stat-card" style={{ background: 'var(--gradient-accent)' }}>
                                <FiBook className="stat-icon" />
                                <div className="stat-value">{stats?.overview.totalDepartments || 0}</div>
                                <div className="stat-label">Departments</div>
                            </div>

                            <div className="stat-card" style={{ background: 'var(--gradient-success)' }}>
                                <FiTrendingUp className="stat-icon" />
                                <div className="stat-value">{stats?.overview.totalUsers || 0}</div>
                                <div className="stat-label">Total Users</div>
                            </div>
                        </div>

                        <div className="content-grid">
                            <div className="section-card">
                                <h2>Publication Breakdown</h2>
                                <div className="grid grid-2 gap-md mt-lg">
                                    <div className="card text-center">
                                        <h3 style={{ color: 'var(--primary-light)' }}>
                                            {stats?.publicationBreakdown.journal || 0}
                                        </h3>
                                        <p className="text-muted">Journal Articles</p>
                                    </div>
                                    <div className="card text-center">
                                        <h3 style={{ color: 'var(--accent)' }}>
                                            {stats?.publicationBreakdown.conference || 0}
                                        </h3>
                                        <p className="text-muted">Conference Papers</p>
                                    </div>
                                </div>
                            </div>

                            <div className="section-card">
                                <h2>Top Publishers</h2>
                                <div className="grid gap-sm mt-lg">
                                    {stats?.topPublishers.slice(0, 5).map((publisher, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-md" style={{
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: 'var(--radius-md)'
                                        }}>
                                            <span className="text-primary">{publisher.name}</span>
                                            <span className="badge badge-primary">{publisher.count} publications</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="section-card mt-lg">
                            <h2>Publications by Department</h2>
                            <div className="grid grid-2 gap-md mt-lg">
                                {stats?.departmentStats.slice(0, 4).map((dept) => (
                                    <div key={dept._id} className="card">
                                        <h4>{dept.departmentName}</h4>
                                        <p className="text-muted mb-sm">{dept.departmentCode}</p>
                                        <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--primary-light)' }}>
                                            {dept.count}
                                        </div>
                                        <p className="text-muted">Publications</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'departments' && (
                    <ManageDepartments departments={departments} onUpdate={fetchData} />
                )}

                {activeTab === 'publications' && (
                    <ManagePublications onUpdate={fetchData} />
                )}

                {activeTab === 'faculty' && (
                    <ManageFaculty onUpdate={fetchData} />
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
