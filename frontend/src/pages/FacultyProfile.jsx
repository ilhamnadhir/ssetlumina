import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { facultyAPI, publicationsAPI, departmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiPhone, FiBook, FiAward, FiPlus, FiX, FiEdit } from 'react-icons/fi';

// Helper function to convert Google Drive links to direct image URLs
const convertDriveUrl = (url) => {
    if (!url) return url;

    // Remove query parameters like ?usp=sharing
    const cleanUrl = url.split('?')[0];

    // Check if it's a Google Drive link
    const driveMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
        const fileId = driveMatch[1];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    // Check if it's already a direct Drive link
    if (url.includes('drive.google.com/uc?')) {
        return url;
    }

    // Return original URL if not a Drive link
    return url;
};

const FacultyProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [faculty, setFaculty] = useState(null);
    const [publications, setPublications] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [allFaculty, setAllFaculty] = useState([]);
    const [filters, setFilters] = useState({ type: '', year: '' });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        facultyId: '',
        department: '',
        role: '',
        email: '',
        phone: '',
        specialization: '',
        qualifications: [],
        profilePhoto: ''
    });
    const [formData, setFormData] = useState({
        title: '',
        authors: [],
        type: 'journal',
        year: new Date().getFullYear(),
        department: '',
        venue: '',
        abstract: '',
        doi: '',
        volume: '',
        issue: '',
        pages: ''
    });

    // Check if this is the logged-in user's own profile
    const isOwnProfile = user && faculty && (
        user.facultyId === faculty._id ||
        user.facultyId?._id === faculty._id ||
        user._id === faculty.userId
    );

    // Debug logging
    useEffect(() => {
        if (user && faculty) {
            console.log('User:', user);
            console.log('Faculty:', faculty);
            console.log('isOwnProfile:', isOwnProfile);
        }
    }, [user, faculty]);

    useEffect(() => {
        fetchData();
    }, [id, filters]);

    const fetchData = async () => {
        try {
            const [facultyRes, pubsRes, deptsRes, allFacRes] = await Promise.all([
                facultyAPI.getById(id),
                publicationsAPI.getByFaculty(id, filters),
                departmentsAPI.getAll(),
                facultyAPI.getAll()
            ]);
            setFaculty(facultyRes.data.faculty);
            setPublications(pubsRes.data.publications);
            setDepartments(deptsRes.data.departments);
            setAllFaculty(allFacRes.data.faculty);

            if (deptsRes.data.departments.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    department: facultyRes.data.faculty.department._id,
                    authors: [facultyRes.data.faculty._id]
                }));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPublication = () => {
        setFormData({
            title: '',
            authors: [faculty._id],
            type: 'journal',
            year: new Date().getFullYear(),
            department: faculty.department._id,
            venue: '',
            abstract: '',
            doi: '',
            volume: '',
            issue: '',
            pages: ''
        });
        setShowModal(true);
    };

    const toggleAuthor = (authorId) => {
        setFormData(prev => ({
            ...prev,
            authors: prev.authors.includes(authorId)
                ? prev.authors.filter(id => id !== authorId)
                : [...prev.authors, authorId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await publicationsAPI.create(formData);
            setShowModal(false);
            fetchData(); // Refresh publications list
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add publication');
        }
    };

    const handleEditProfile = () => {
        setEditFormData({
            name: faculty.name,
            facultyId: faculty.facultyId,
            department: faculty.department?._id || '',
            role: faculty.role,
            email: faculty.email,
            phone: faculty.phone || '',
            specialization: faculty.specialization || '',
            qualifications: faculty.qualifications || [],
            profilePhoto: faculty.profilePhoto || ''
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await facultyAPI.update(faculty._id, editFormData);
            setShowEditModal(false);
            fetchData(); // Refresh faculty data
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update profile');
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="loader"></div></div>;
    }

    if (!faculty) {
        return <div className="container"><p>Faculty not found</p></div>;
    }

    return (
        <div className="home-page">
            <div className="container">
                <div className="section-card mb-lg">
                    <div className="flex gap-xl" style={{ alignItems: 'flex-start' }}>
                        <img
                            src={convertDriveUrl(faculty.profilePhoto) || 'https://via.placeholder.com/200'}
                            alt={faculty.name}
                            style={{
                                width: '200px',
                                height: '200px',
                                borderRadius: 'var(--radius-xl)',
                                border: '4px solid var(--primary)',
                                objectFit: 'cover'
                            }}
                        />

                        <div style={{ flex: 1 }}>
                            <div className="flex justify-between items-start mb-sm">
                                <h1 style={{ marginBottom: 'var(--spacing-sm)' }}>{faculty.name}</h1>
                                {isOwnProfile && (
                                    <button className="btn btn-secondary" onClick={handleEditProfile}>
                                        <FiEdit /> Edit Profile
                                    </button>
                                )}
                            </div>
                            <p className="text-primary mb-md" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                                {faculty.role}
                            </p>

                            <div className="flex gap-md mb-lg" style={{ flexWrap: 'wrap' }}>
                                <div className="badge badge-primary">
                                    {faculty.department?.name}
                                </div>
                                <div className="badge badge-success">
                                    ID: {faculty.facultyId}
                                </div>
                            </div>

                            <div className="flex flex-col gap-sm mb-lg">
                                {faculty.email && (
                                    <div className="flex items-center gap-sm text-secondary">
                                        <FiMail /> {faculty.email}
                                    </div>
                                )}
                                {faculty.phone && (
                                    <div className="flex items-center gap-sm text-secondary">
                                        <FiPhone /> {faculty.phone}
                                    </div>
                                )}
                                {faculty.specialization && (
                                    <div className="flex items-center gap-sm text-secondary">
                                        <FiAward /> {faculty.specialization}
                                    </div>
                                )}
                            </div>

                            {faculty.qualifications && faculty.qualifications.length > 0 && (
                                <div>
                                    <h4>Qualifications</h4>
                                    <ul style={{ paddingLeft: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                                        {faculty.qualifications.map((qual, idx) => (
                                            <li key={idx}>{qual}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="section-card">
                    <div className="flex justify-between items-center mb-lg">
                        <h2>Publications ({publications.length})</h2>
                        <div className="flex gap-sm">
                            {isOwnProfile && (
                                <button className="btn btn-primary" onClick={handleAddPublication}>
                                    <FiPlus /> Add Publication
                                </button>
                            )}
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
                        </div>
                    </div>

                    <div className="grid gap-md">
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
                                <div className="flex justify-between items-center mb-sm">
                                    <h4 style={{ margin: 0 }}>{pub.title}</h4>
                                    <span className={`badge ${pub.type === 'journal' ? 'badge-primary' : 'badge-success'}`}>
                                        {pub.type}
                                    </span>
                                </div>
                                <p className="text-secondary mb-sm">{pub.venue} • {pub.year}</p>
                                {pub.abstract && (
                                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                        {pub.abstract.substring(0, 150)}...
                                    </p>
                                )}
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

            {/* Add Publication Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="flex justify-between items-center mb-lg">
                            <h3>Add Publication</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.5rem' }}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Co-Authors (Select additional authors)</label>
                                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-sm)' }}>
                                    {allFaculty.map(fac => (
                                        <label key={fac._id} style={{ display: 'block', padding: 'var(--spacing-xs)', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.authors.includes(fac._id)}
                                                onChange={() => toggleAuthor(fac._id)}
                                                style={{ marginRight: 'var(--spacing-sm)' }}
                                            />
                                            {fac.name} ({fac.department?.name})
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-2 gap-md">
                                <div className="form-group">
                                    <label className="form-label">Type *</label>
                                    <select
                                        className="form-select"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        required
                                    >
                                        <option value="journal">Journal</option>
                                        <option value="conference">Conference</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Year *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                        min="1900"
                                        max={new Date().getFullYear() + 1}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Venue *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.venue}
                                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                    placeholder="Journal/Conference name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Abstract</label>
                                <textarea
                                    className="form-textarea"
                                    value={formData.abstract}
                                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                                    placeholder="Publication abstract..."
                                />
                            </div>

                            <div className="grid grid-2 gap-md">
                                <div className="form-group">
                                    <label className="form-label">DOI</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.doi}
                                        onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                                        placeholder="10.1234/example"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Pages</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.pages}
                                        onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                                        placeholder="123-145"
                                    />
                                </div>
                            </div>

                            {formData.type === 'journal' && (
                                <div className="grid grid-2 gap-md">
                                    <div className="form-group">
                                        <label className="form-label">Volume</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.volume}
                                            onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Issue</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.issue}
                                            onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-md">
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Add Publication
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="flex justify-between items-center mb-lg">
                            <h3>Edit Profile</h3>
                            <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.5rem' }}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label className="form-label">Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-2 gap-md">
                                <div className="form-group">
                                    <label className="form-label">Faculty ID *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editFormData.facultyId}
                                        onChange={(e) => setEditFormData({ ...editFormData, facultyId: e.target.value })}
                                        required
                                        disabled
                                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={editFormData.email}
                                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                        required
                                        disabled
                                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-2 gap-md">
                                <div className="form-group">
                                    <label className="form-label">Department *</label>
                                    <select
                                        className="form-select"
                                        value={editFormData.department}
                                        onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Role *</label>
                                    <select
                                        className="form-select"
                                        value={editFormData.role}
                                        onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        <option value="HOD">HOD</option>
                                        <option value="Professor">Professor</option>
                                        <option value="Associate Professor">Associate Professor</option>
                                        <option value="Assistant Professor">Assistant Professor</option>
                                        <option value="Lecturer">Lecturer</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={editFormData.phone}
                                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    placeholder="+1234567890"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Specialization</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editFormData.specialization}
                                    onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                                    placeholder="e.g., Machine Learning, Data Science"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Profile Photo URL</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    value={editFormData.profilePhoto}
                                    onChange={(e) => setEditFormData({ ...editFormData, profilePhoto: e.target.value })}
                                    placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view or any image URL"
                                />
                                {editFormData.profilePhoto && (
                                    <div style={{ marginTop: 'var(--spacing-sm)' }}>
                                        <img
                                            src={convertDriveUrl(editFormData.profilePhoto)}
                                            alt="Preview"
                                            style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/100'}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Qualifications (one per line)</label>
                                <textarea
                                    className="form-textarea"
                                    value={editFormData.qualifications.join('\n')}
                                    onChange={(e) => setEditFormData({ ...editFormData, qualifications: e.target.value.split('\n').filter(q => q.trim()) })}
                                    placeholder="Ph.D. in Computer Science&#10;M.Tech in AI&#10;B.Tech in CSE"
                                    rows="4"
                                />
                            </div>

                            <div className="flex gap-md">
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Save Changes
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyProfile;
