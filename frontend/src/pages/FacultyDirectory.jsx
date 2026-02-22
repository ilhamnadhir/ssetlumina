import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { facultyAPI } from '../services/api';
import { FiSearch } from 'react-icons/fi';
import { useData } from '../context/DataContext';

const FacultyDirectory = () => {
    const [faculty, setFaculty] = useState([]);
    const { departments } = useData();
    const [filters, setFilters] = useState({ department: '', role: '', search: '', sortBy: 'name' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        try {
            const facultyRes = await facultyAPI.getAll(filters);
            setFaculty(facultyRes.data.faculty);
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
                    <h1>Faculty Directory</h1>
                </div>

                <div className="section-card mb-lg">
                    <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                        <div className="search-bar" style={{ flex: '1', minWidth: '250px' }}>
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search faculty..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>

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

                        <select
                            className="form-select"
                            value={filters.sortBy}
                            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                            style={{ width: '150px' }}
                        >
                            <option value="name">Name</option>
                            <option value="publicationCount">Publications</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-3">
                    {faculty.map((fac) => (
                        <Link to={`/faculty/${fac._id}`} key={fac._id} className="card" style={{ textDecoration: 'none' }}>
                            <div className="flex flex-col items-center text-center">
                                <img
                                    src={fac.profilePhoto || 'https://via.placeholder.com/150'}
                                    alt={fac.name}
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        marginBottom: 'var(--spacing-md)',
                                        border: '3px solid var(--primary)'
                                    }}
                                />
                                <h3 style={{ margin: '0 0 var(--spacing-xs) 0' }}>{fac.name}</h3>
                                <p className="text-muted mb-sm">{fac.role}</p>
                                <p className="text-secondary mb-md">{fac.department?.name}</p>
                                <div className="badge badge-primary">
                                    {fac.publicationCount || 0} Publications
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {faculty.length === 0 && (
                    <div className="text-center p-xl">
                        <p className="text-muted">No faculty members found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultyDirectory;
