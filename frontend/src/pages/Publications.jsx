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
                            {/* Header */}
                            <div className="flex justify-between items-start mb-md" style={{ gap: '1rem' }}>
                                <h3 style={{ margin: 0, flex: 1 }}>{pub.title}</h3>
                                <div className="flex gap-xs" style={{ flexWrap: 'wrap', flexShrink: 0 }}>
                                    <span className={`badge ${pub.type === 'journal' ? 'badge-primary' : 'badge-success'}`}>
                                        {pub.type}
                                    </span>
                                    {pub.journalType && (
                                        <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>
                                            {pub.journalType}
                                        </span>
                                    )}
                                    {pub.conferenceType && (
                                        <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>
                                            {pub.conferenceType.replace('-', ' ')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Authors */}
                            <p className="text-muted mb-sm" style={{ fontSize: '0.9rem' }}>
                                <strong>Authors:</strong> {pub.authors.map(a => a.name).join(', ')}
                            </p>

                            {/* Venue & Year */}
                            <p className="text-secondary mb-md" style={{ fontSize: '1rem', fontWeight: 500 }}>
                                {pub.venue} • {pub.year}
                                {pub.publishedDate && ` • ${new Date(pub.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`}
                            </p>

                            {/* Metadata Grid */}
                            <div className="grid gap-sm mb-md" style={{
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                padding: '0.75rem',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)'
                            }}>
                                {/* Journal-specific metadata */}
                                {pub.type === 'journal' && (
                                    <>
                                        {pub.impactFactor && (
                                            <div>
                                                <div className="text-muted" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Impact Factor</div>
                                                <div className="text-primary" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{pub.impactFactor}</div>
                                            </div>
                                        )}
                                        {pub.issn && (
                                            <div>
                                                <div className="text-muted" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>ISSN</div>
                                                <div className="text-secondary" style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{pub.issn}</div>
                                            </div>
                                        )}
                                        {pub.volume && (
                                            <div>
                                                <div className="text-muted" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Volume</div>
                                                <div className="text-secondary" style={{ fontSize: '0.9rem' }}>{pub.volume}</div>
                                            </div>
                                        )}
                                        {pub.issue && (
                                            <div>
                                                <div className="text-muted" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Issue</div>
                                                <div className="text-secondary" style={{ fontSize: '0.9rem' }}>{pub.issue}</div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Conference-specific metadata */}
                                {pub.type === 'conference' && pub.isbn && (
                                    <div>
                                        <div className="text-muted" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>ISBN</div>
                                        <div className="text-secondary" style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{pub.isbn}</div>
                                    </div>
                                )}

                                {/* Common metadata */}
                                {pub.pages && (
                                    <div>
                                        <div className="text-muted" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Pages</div>
                                        <div className="text-secondary" style={{ fontSize: '0.9rem' }}>{pub.pages}</div>
                                    </div>
                                )}
                                {pub.publisher && (
                                    <div>
                                        <div className="text-muted" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Publisher</div>
                                        <div className="text-secondary" style={{ fontSize: '0.9rem' }}>{pub.publisher}</div>
                                    </div>
                                )}
                                {pub.doi && (
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <div className="text-muted" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>DOI</div>
                                        <div className="text-secondary" style={{ fontSize: '0.85rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>{pub.doi}</div>
                                    </div>
                                )}
                            </div>

                            {/* Indexing */}
                            {pub.indexing && pub.indexing.length > 0 && (
                                <div className="mb-sm">
                                    <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, marginRight: '0.5rem' }}>
                                        Indexed in:
                                    </span>
                                    <div style={{ display: 'inline-flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                        {pub.indexing.map((index, idx) => (
                                            <span key={idx} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                                                {index}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Abstract */}
                            {pub.abstract && (
                                <p className="text-muted mb-md" style={{
                                    fontSize: '0.875rem',
                                    lineHeight: '1.5',
                                    borderLeft: '3px solid var(--primary)',
                                    paddingLeft: '0.75rem',
                                    marginTop: '0.75rem'
                                }}>
                                    {pub.abstract.substring(0, 200)}...
                                </p>
                            )}

                            {/* Footer */}
                            <div className="flex gap-sm" style={{ flexWrap: 'wrap', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                                <span className="badge badge-primary">{pub.department?.name}</span>
                                {pub.affiliation && (
                                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        {pub.affiliation}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {publications.length === 0 && (
                <div className="text-center p-xl">
                    <p className="text-muted">No publications found</p>
                </div>
            )}
        </div>
    );
};

export default Publications;
