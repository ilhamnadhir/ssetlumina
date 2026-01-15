import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicationsAPI, departmentsAPI } from '../services/api';
import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Publications = () => {
    const navigate = useNavigate();
    const [publications, setPublications] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filters, setFilters] = useState({ department: '', type: '', year: '', search: '' });
    const [loading, setLoading] = useState(true);
    const { isFaculty } = useAuth();

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        try {
            const [pubsRes, deptsRes] = await Promise.all([
                publicationsAPI.getAll(filters),
                departmentsAPI.getAll()
            ]);
            setPublications(pubsRes.data.publications);
            setDepartments(deptsRes.data.departments);
        } catch (error) {
            console.error('Error fetching data:', error);
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
                    <h1>Publications</h1>
                </div>

                <div className="section-card mb-lg">
                    <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                        <div className="search-bar" style={{ flex: '1', minWidth: '250px' }}>
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search publications..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>

                        <select
                            className="form-select"
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            style={{ width: '150px' }}
                        >
                            <option value="">All Types</option>
                            <option value="journal">Journal</option>
                            <option value="conference">Conference</option>
                        </select>

                        <select
                            className="form-select"
                            value={filters.department}
                            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                            style={{ width: '200px' }}
                        >
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept._id} value={dept._id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid gap-lg">
                    {publications.map((pub) => (
                        <div
                            key={pub._id}
                            className="card"
                            onClick={() => navigate(`/publications/${pub._id}`)}
                            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '';
                            }}
                        >
                            <div className="flex justify-between items-center mb-md">
                                <h3 style={{ margin: 0 }}>{pub.title}</h3>
                                <span className={`badge ${pub.type === 'journal' ? 'badge-primary' : 'badge-success'}`}>
                                    {pub.type}
                                </span>
                            </div>

                            <p className="text-muted mb-sm">
                                {pub.authors.map(a => a.name).join(', ')}
                            </p>

                            <p className="text-secondary mb-md">
                                {pub.venue} • {pub.year}
                            </p>

                            {pub.abstract && (
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                    {pub.abstract.substring(0, 200)}...
                                </p>
                            )}

                            <div className="flex gap-sm mt-md">
                                <span className="badge badge-primary">{pub.department?.name}</span>
                                {pub.doi && <span className="text-muted" style={{ fontSize: '0.75rem' }}>DOI: {pub.doi}</span>}
                            </div>
                        </div>
                    ))}
                </div>

                {publications.length === 0 && (
                    <div className="text-center p-xl">
                        <p className="text-muted">No publications found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Publications;
