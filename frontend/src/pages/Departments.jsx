import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { departmentsAPI, publicationsAPI } from '../services/api';
import { FiSearch } from 'react-icons/fi';

const Departments = () => {
    const [searchParams] = useSearchParams();
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);
    const [deptDetails, setDeptDetails] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (selectedDept) {
            fetchDepartmentDetails(selectedDept);
        }
    }, [selectedDept]);

    const fetchDepartments = async () => {
        try {
            const res = await departmentsAPI.getAll();
            setDepartments(res.data.departments);

            // Check if there's a dept parameter in the URL
            const deptParam = searchParams.get('dept');

            if (deptParam) {
                // If dept parameter exists, use it
                setSelectedDept(deptParam);
            } else if (res.data.departments.length > 0) {
                // Otherwise, default to the first department
                setSelectedDept(res.data.departments[0]._id);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartmentDetails = async (id) => {
        try {
            const res = await departmentsAPI.getById(id);
            setDeptDetails(res.data);
        } catch (error) {
            console.error('Error fetching department details:', error);
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="loader"></div></div>;
    }

    return (
        <div className="home-page">
            <div className="container">
                <div className="page-header">
                    <h1>Departments</h1>
                </div>

                <div className="content-grid">
                    <div className="section-card">
                        <h2>All Departments</h2>
                        <div className="departments-list">
                            {departments.map((dept) => (
                                <div
                                    key={dept._id}
                                    className={`department-item ${selectedDept === dept._id ? 'active' : ''}`}
                                    onClick={() => setSelectedDept(dept._id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="department-info">
                                        <h3>{dept.name}</h3>
                                        <p className="department-code">{dept.code}</p>
                                    </div>
                                    <div className="department-badge">
                                        {dept.facultyCount || 0} Faculty
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="section-card">
                        {deptDetails && (
                            <>
                                <h2>{deptDetails.department.name}</h2>
                                <p className="text-muted mb-lg">{deptDetails.department.description}</p>

                                <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                                    <div className="card">
                                        <h4>Faculty Members</h4>
                                        <div className="stat-value" style={{ fontSize: '2rem' }}>
                                            {deptDetails.faculty.length}
                                        </div>
                                    </div>
                                    <div className="card">
                                        <h4>Publications</h4>
                                        <div className="stat-value" style={{ fontSize: '2rem' }}>
                                            {deptDetails.publicationCount}
                                        </div>
                                    </div>
                                </div>

                                <h3>Faculty Members</h3>
                                <div className="faculty-grid">
                                    {deptDetails.faculty.map((faculty) => (
                                        <div key={faculty._id} className="faculty-card-mini">
                                            <img
                                                src={faculty.profilePhoto || 'https://via.placeholder.com/100'}
                                                alt={faculty.name}
                                                className="faculty-avatar"
                                            />
                                            <div className="faculty-info">
                                                <h4>{faculty.name}</h4>
                                                <p className="faculty-role">{faculty.role}</p>
                                                <p className="faculty-dept">{faculty.publicationCount || 0} Publications</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Departments;
