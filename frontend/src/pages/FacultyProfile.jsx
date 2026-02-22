import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { facultyAPI, publicationsAPI, departmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiPhone, FiBook, FiAward, FiPlus, FiX, FiEdit, FiTrash2, FiCamera } from 'react-icons/fi';

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
    const [filters, setFilters] = useState({ type: '', year: '', academicYear: '' });
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
    const [showEditPubModal, setShowEditPubModal] = useState(false);
    const [editingPub, setEditingPub] = useState(null);

    const emptyPubForm = {
        title: '',
        authors: [],
        type: 'journal',
        department: '',
        abstract: '',
        doi: '',
        // Journal fields
        journalName: '',
        coAuthors: '',
        paymentType: '',
        publishedDate: '',
        paperLink: '',
        journalWebsiteLink: '',
        journalType: '',
        printJournalContentLink: '',
        indexing: '',
        issn: '',
        impactFactor: '',
        affiliation: '',
        volume: '',
        issue: '',
        pages: '',
        // Conference / Book fields
        conferenceSubtype: 'conference',
        conferenceType: '',
        conferenceName: '',
        proceedingsTitle: '',
        isbn: '',
        nameOfPublisher: '',
        firstPageLink: '',
    };

    const [formData, setFormData] = useState({ ...emptyPubForm });
    const [editPubData, setEditPubData] = useState({ ...emptyPubForm });

    // Check if this is the logged-in user's own profile
    // Note: login response uses 'id' not '_id', so check both
    const userId = user?.id || user?._id;
    const userFacultyId = user?.facultyId;
    const isOwnProfile = user && faculty && (
        (userFacultyId && (
            userFacultyId.toString() === faculty._id?.toString() ||
            userFacultyId?._id?.toString() === faculty._id?.toString()
        )) ||
        (userId && userId.toString() === faculty.userId?.toString())
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
            ...emptyPubForm,
            authors: [faculty._id],
            department: faculty.department._id,
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
            const dataToSubmit = {
                ...formData,
                indexing: typeof formData.indexing === 'string'
                    ? formData.indexing.split(',').map(i => i.trim()).filter(Boolean)
                    : formData.indexing
            };
            await publicationsAPI.create(dataToSubmit);
            setShowModal(false);
            fetchData(); // Refresh publications list
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add publication');
        }
    };

    const handleEditPublication = (pub, e) => {
        e.stopPropagation();
        setEditingPub(pub);
        setEditPubData({
            ...emptyPubForm,
            title: pub.title || '',
            type: pub.type || 'journal',
            department: pub.department?._id || pub.department || '',
            abstract: pub.abstract || '',
            doi: pub.doi || '',
            // Journal
            journalName: pub.journalName || '',
            coAuthors: pub.coAuthors || '',
            paymentType: pub.paymentType || '',
            publishedDate: pub.publishedDate || '',
            paperLink: pub.paperLink || '',
            journalWebsiteLink: pub.journalWebsiteLink || '',
            journalType: pub.journalType || '',
            printJournalContentLink: pub.printJournalContentLink || '',
            indexing: Array.isArray(pub.indexing) ? pub.indexing.join(', ') : (pub.indexing || ''),
            issn: pub.issn || '',
            impactFactor: pub.impactFactor || '',
            affiliation: pub.affiliation || '',
            volume: pub.volume || '',
            issue: pub.issue || '',
            pages: pub.pages || '',
            // Conference
            conferenceSubtype: pub.conferenceSubtype || 'conference',
            conferenceType: pub.conferenceType || '',
            conferenceName: pub.conferenceName || '',
            proceedingsTitle: pub.proceedingsTitle || '',
            isbn: pub.isbn || '',
            nameOfPublisher: pub.nameOfPublisher || '',
            firstPageLink: pub.firstPageLink || '',
        });
        setShowEditPubModal(true);
    };

    const handleEditPubSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...editPubData,
                indexing: typeof editPubData.indexing === 'string'
                    ? editPubData.indexing.split(',').map(i => i.trim()).filter(Boolean)
                    : editPubData.indexing
            };
            await publicationsAPI.update(editingPub._id, dataToSubmit);
            setShowEditPubModal(false);
            setEditingPub(null);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update publication');
        }
    };

    const handleDeletePublication = async (pubId, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this publication?')) return;
        try {
            await publicationsAPI.delete(pubId);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete publication');
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

    // Compress image using canvas before uploading (keeps payload small for mobile)
    const compressImage = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const MAX = 800;
                let { width, height } = img;
                if (width > MAX || height > MAX) {
                    if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
                    else { width = Math.round(width * MAX / height); height = MAX; }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.75));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const compressed = await compressImage(file);
            setEditFormData(prev => ({ ...prev, profilePhoto: compressed }));
        } catch {
            alert('Failed to process image');
        }
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
                    <div className="profile-header">
                        {/* Profile photo with camera overlay for own profile */}
                        <div className="profile-photo-wrap" style={{ position: 'relative', width: '200px', flexShrink: 0 }}>
                            <img
                                src={convertDriveUrl(faculty.profilePhoto) || 'https://via.placeholder.com/200'}
                                alt={faculty.name}
                                style={{
                                    width: '200px',
                                    height: '200px',
                                    borderRadius: 'var(--radius-xl)',
                                    border: '4px solid var(--primary)',
                                    objectFit: 'cover',
                                    display: 'block'
                                }}
                            />
                            {isOwnProfile && (
                                <label
                                    htmlFor="profile-photo-upload"
                                    title="Change photo"
                                    style={{
                                        position: 'absolute',
                                        bottom: '8px',
                                        right: '8px',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: 'var(--primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#fff',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                                    }}
                                >
                                    <FiCamera size={16} />
                                    <input
                                        id="profile-photo-upload"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            try {
                                                const compressed = await compressImage(file);
                                                await facultyAPI.update(faculty._id, { profilePhoto: compressed });
                                                fetchData();
                                            } catch {
                                                alert('Failed to update photo');
                                            }
                                        }}
                                    />
                                </label>
                            )}
                        </div>

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
                                value={filters.academicYear}
                                onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
                                style={{ width: '180px' }}
                            >
                                <option value="">Academic Year</option>
                                {Array.from({ length: 10 }, (_, i) => {
                                    const startYear = new Date().getFullYear() - 5 + i;
                                    const endYear = (startYear + 1).toString().slice(-2);
                                    return <option key={startYear} value={`${startYear}-${endYear}`}>{`${startYear}-${endYear}`}</option>;
                                })}
                            </select>
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
                            <div key={pub._id}
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
                                    <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                                        <span className={`badge ${pub.type === 'journal' ? 'badge-primary' : 'badge-success'}`}>
                                            {pub.type}
                                        </span>
                                        {isOwnProfile && (
                                            <>
                                                <button
                                                    onClick={(e) => handleEditPublication(pub, e)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '4px' }}
                                                    title="Edit publication"
                                                >
                                                    <FiEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeletePublication(pub._id, e)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger, #ef4444)', padding: '4px' }}
                                                    title="Delete publication"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <p className="text-secondary mb-sm">
                                    {pub.type === 'journal' ? (pub.journalName || pub.venue || '') : (pub.conferenceName || pub.venue || '')}
                                    {pub.publishedDate && ` • ${pub.publishedDate}`}
                                </p>
                                {pub.conferenceSubtype && pub.type === 'conference' && (
                                    <span className="badge badge-success" style={{ fontSize: '0.7rem', textTransform: 'capitalize', marginBottom: '0.5rem', display: 'inline-block' }}>
                                        {pub.conferenceSubtype === 'book-paper' ? 'Book Paper' : pub.conferenceSubtype}
                                    </span>
                                )}
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

            {/* Edit Publication Modal */}
            {showEditPubModal && editingPub && (
                <div className="modal-overlay" onClick={() => setShowEditPubModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '740px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="flex justify-between items-center mb-lg">
                            <h3>Edit Publication</h3>
                            <button onClick={() => setShowEditPubModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.5rem' }}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleEditPubSubmit}>
                            {/* Type selector */}
                            <div className="form-group">
                                <label className="form-label">Category *</label>
                                <div className="flex gap-md mb-md">
                                    {[{ val: 'journal', label: '📰 Journal' }, { val: 'conference', label: '📚 Conference / Book / Book Paper' }].map(opt => (
                                        <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem 1rem', border: `2px solid ${editPubData.type === opt.val ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', flex: 1, background: editPubData.type === opt.val ? 'var(--primary-light, color-mix(in srgb, var(--primary) 12%, transparent))' : 'transparent', fontWeight: editPubData.type === opt.val ? 600 : 400 }}>
                                            <input type="radio" name="editType" value={opt.val} checked={editPubData.type === opt.val} onChange={() => setEditPubData({ ...editPubData, type: opt.val })} style={{ display: 'none' }} />
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input type="text" className="form-input" value={editPubData.title}
                                    onChange={(e) => setEditPubData({ ...editPubData, title: e.target.value })} required />
                            </div>

                            {editPubData.type === 'journal' ? (
                                <>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Journal Name</label>
                                            <input type="text" className="form-input" value={editPubData.journalName}
                                                onChange={(e) => setEditPubData({ ...editPubData, journalName: e.target.value })} placeholder="e.g. Nature, IEEE Access" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Co-Authors</label>
                                            <input type="text" className="form-input" value={editPubData.coAuthors}
                                                onChange={(e) => setEditPubData({ ...editPubData, coAuthors: e.target.value })} placeholder="External co-author names" />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Payment Type</label>
                                            <select className="form-select" value={editPubData.paymentType}
                                                onChange={(e) => setEditPubData({ ...editPubData, paymentType: e.target.value })}>
                                                <option value="">Select</option>
                                                <option value="unpaid">Unpaid / Open Access</option>
                                                <option value="paid">Paid</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Date of Publication</label>
                                            <input type="text" className="form-input" value={editPubData.publishedDate}
                                                onChange={(e) => setEditPubData({ ...editPubData, publishedDate: e.target.value })} placeholder="dd/mm/yyyy" />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Paper Link</label>
                                            <input type="url" className="form-input" value={editPubData.paperLink}
                                                onChange={(e) => setEditPubData({ ...editPubData, paperLink: e.target.value })} placeholder="https://..." />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Journal Website Link</label>
                                            <input type="url" className="form-input" value={editPubData.journalWebsiteLink}
                                                onChange={(e) => setEditPubData({ ...editPubData, journalWebsiteLink: e.target.value })} placeholder="https://..." />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Journal Type</label>
                                            <select className="form-select" value={editPubData.journalType}
                                                onChange={(e) => setEditPubData({ ...editPubData, journalType: e.target.value })}>
                                                <option value="">Select</option>
                                                <option value="international">International</option>
                                                <option value="national">National</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">ISSN</label>
                                            <input type="text" className="form-input" value={editPubData.issn}
                                                onChange={(e) => setEditPubData({ ...editPubData, issn: e.target.value })} placeholder="XXXX-XXXX" />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">DOI</label>
                                            <input type="text" className="form-input" value={editPubData.doi}
                                                onChange={(e) => setEditPubData({ ...editPubData, doi: e.target.value })} placeholder="10.xxxx/xxxx" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Impact Factor</label>
                                            <input type="number" step="0.001" className="form-input" value={editPubData.impactFactor}
                                                onChange={(e) => setEditPubData({ ...editPubData, impactFactor: e.target.value })} placeholder="e.g. 4.21" />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Print Journal Content Page Link</label>
                                            <input type="url" className="form-input" value={editPubData.printJournalContentLink}
                                                onChange={(e) => setEditPubData({ ...editPubData, printJournalContentLink: e.target.value })} placeholder="https://..." />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Indexing (comma-separated)</label>
                                            <input type="text" className="form-input" value={editPubData.indexing}
                                                onChange={(e) => setEditPubData({ ...editPubData, indexing: e.target.value })} placeholder="Scopus, Web of Science..." />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Affiliation</label>
                                        <input type="text" className="form-input" value={editPubData.affiliation}
                                            onChange={(e) => setEditPubData({ ...editPubData, affiliation: e.target.value })} placeholder="Institution name as published" />
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Volume</label>
                                            <input type="text" className="form-input" value={editPubData.volume}
                                                onChange={(e) => setEditPubData({ ...editPubData, volume: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Issue</label>
                                            <input type="text" className="form-input" value={editPubData.issue}
                                                onChange={(e) => setEditPubData({ ...editPubData, issue: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Pages</label>
                                        <input type="text" className="form-input" value={editPubData.pages}
                                            onChange={(e) => setEditPubData({ ...editPubData, pages: e.target.value })} placeholder="e.g. 123-145" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Sub-type *</label>
                                            <select className="form-select" value={editPubData.conferenceSubtype}
                                                onChange={(e) => setEditPubData({ ...editPubData, conferenceSubtype: e.target.value })} required>
                                                <option value="conference">Conference</option>
                                                <option value="book">Book</option>
                                                <option value="book-paper">Book Paper</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Conference Type</label>
                                            <select className="form-select" value={editPubData.conferenceType}
                                                onChange={(e) => setEditPubData({ ...editPubData, conferenceType: e.target.value })}>
                                                <option value="">Select</option>
                                                <option value="international">International</option>
                                                <option value="national">National</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Name of Conference / Book</label>
                                            <input type="text" className="form-input" value={editPubData.conferenceName}
                                                onChange={(e) => setEditPubData({ ...editPubData, conferenceName: e.target.value })} placeholder="Full conference/book name" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Proceedings Title</label>
                                            <input type="text" className="form-input" value={editPubData.proceedingsTitle}
                                                onChange={(e) => setEditPubData({ ...editPubData, proceedingsTitle: e.target.value })} placeholder="Proceedings of..." />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Co-Authors</label>
                                            <input type="text" className="form-input" value={editPubData.coAuthors}
                                                onChange={(e) => setEditPubData({ ...editPubData, coAuthors: e.target.value })} placeholder="External co-author names" />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Date of Publishing</label>
                                            <input type="text" className="form-input" value={editPubData.publishedDate}
                                                onChange={(e) => setEditPubData({ ...editPubData, publishedDate: e.target.value })} placeholder="dd/mm/yyyy" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">ISBN</label>
                                            <input type="text" className="form-input" value={editPubData.isbn}
                                                onChange={(e) => setEditPubData({ ...editPubData, isbn: e.target.value })} placeholder="978-X-XXXX-XXXX-X" />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">DOI</label>
                                            <input type="text" className="form-input" value={editPubData.doi}
                                                onChange={(e) => setEditPubData({ ...editPubData, doi: e.target.value })} placeholder="10.xxxx/xxxx" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Name of Publisher</label>
                                            <input type="text" className="form-input" value={editPubData.nameOfPublisher}
                                                onChange={(e) => setEditPubData({ ...editPubData, nameOfPublisher: e.target.value })} placeholder="e.g. Springer, Elsevier" />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Link to First Page</label>
                                            <input type="url" className="form-input" value={editPubData.firstPageLink}
                                                onChange={(e) => setEditPubData({ ...editPubData, firstPageLink: e.target.value })} placeholder="https://..." />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Indexing (comma-separated)</label>
                                            <input type="text" className="form-input" value={editPubData.indexing}
                                                onChange={(e) => setEditPubData({ ...editPubData, indexing: e.target.value })} placeholder="Scopus, DBLP..." />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label className="form-label">Abstract</label>
                                <textarea className="form-textarea" value={editPubData.abstract}
                                    onChange={(e) => setEditPubData({ ...editPubData, abstract: e.target.value })}
                                    placeholder="Publication abstract..." />
                            </div>

                            <div className="flex gap-md">
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditPubModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Publication Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '740px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="flex justify-between items-center mb-lg">
                            <h3>Add Publication</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.5rem' }}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Category selector */}
                            <div className="form-group">
                                <label className="form-label">Category *</label>
                                <div className="flex gap-md mb-md">
                                    {[{ val: 'journal', label: '📰 Journal' }, { val: 'conference', label: '📚 Conference / Book / Book Paper' }].map(opt => (
                                        <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem 1rem', border: `2px solid ${formData.type === opt.val ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', flex: 1, background: formData.type === opt.val ? 'var(--primary-light, color-mix(in srgb, var(--primary) 12%, transparent))' : 'transparent', fontWeight: formData.type === opt.val ? 600 : 400 }}>
                                            <input type="radio" name="addType" value={opt.val} checked={formData.type === opt.val} onChange={() => setFormData({ ...formData, type: opt.val })} style={{ display: 'none' }} />
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input type="text" className="form-input" value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                            </div>

                            {formData.type === 'journal' ? (
                                <>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Journal Name</label>
                                            <input type="text" className="form-input" value={formData.journalName}
                                                onChange={(e) => setFormData({ ...formData, journalName: e.target.value })} placeholder="e.g. Nature, IEEE Access" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Co-Authors</label>
                                            <input type="text" className="form-input" value={formData.coAuthors}
                                                onChange={(e) => setFormData({ ...formData, coAuthors: e.target.value })} placeholder="External co-author names" />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Payment Type</label>
                                            <select className="form-select" value={formData.paymentType}
                                                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}>
                                                <option value="">Select</option>
                                                <option value="unpaid">Unpaid / Open Access</option>
                                                <option value="paid">Paid</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Date of Publication</label>
                                            <input type="text" className="form-input" value={formData.publishedDate}
                                                onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })} placeholder="dd/mm/yyyy" />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Paper Link</label>
                                            <input type="url" className="form-input" value={formData.paperLink}
                                                onChange={(e) => setFormData({ ...formData, paperLink: e.target.value })} placeholder="https://..." />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Journal Website Link</label>
                                            <input type="url" className="form-input" value={formData.journalWebsiteLink}
                                                onChange={(e) => setFormData({ ...formData, journalWebsiteLink: e.target.value })} placeholder="https://..." />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Journal Type</label>
                                            <select className="form-select" value={formData.journalType}
                                                onChange={(e) => setFormData({ ...formData, journalType: e.target.value })}>
                                                <option value="">Select</option>
                                                <option value="international">International</option>
                                                <option value="national">National</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">ISSN</label>
                                            <input type="text" className="form-input" value={formData.issn}
                                                onChange={(e) => setFormData({ ...formData, issn: e.target.value })} placeholder="XXXX-XXXX" />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">DOI</label>
                                            <input type="text" className="form-input" value={formData.doi}
                                                onChange={(e) => setFormData({ ...formData, doi: e.target.value })} placeholder="10.xxxx/xxxx" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Impact Factor</label>
                                            <input type="number" step="0.001" className="form-input" value={formData.impactFactor}
                                                onChange={(e) => setFormData({ ...formData, impactFactor: e.target.value })} placeholder="e.g. 4.21" />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Print Journal Content Page Link</label>
                                            <input type="url" className="form-input" value={formData.printJournalContentLink}
                                                onChange={(e) => setFormData({ ...formData, printJournalContentLink: e.target.value })} placeholder="https://..." />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Indexing (comma-separated)</label>
                                            <input type="text" className="form-input" value={formData.indexing}
                                                onChange={(e) => setFormData({ ...formData, indexing: e.target.value })} placeholder="Scopus, Web of Science..." />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Affiliation</label>
                                        <input type="text" className="form-input" value={formData.affiliation}
                                            onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })} placeholder="Institution name as published" />
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Volume</label>
                                            <input type="text" className="form-input" value={formData.volume}
                                                onChange={(e) => setFormData({ ...formData, volume: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Issue</label>
                                            <input type="text" className="form-input" value={formData.issue}
                                                onChange={(e) => setFormData({ ...formData, issue: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Pages</label>
                                        <input type="text" className="form-input" value={formData.pages}
                                            onChange={(e) => setFormData({ ...formData, pages: e.target.value })} placeholder="e.g. 123-145" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Sub-type *</label>
                                            <select className="form-select" value={formData.conferenceSubtype}
                                                onChange={(e) => setFormData({ ...formData, conferenceSubtype: e.target.value })} required>
                                                <option value="conference">Conference</option>
                                                <option value="book">Book</option>
                                                <option value="book-paper">Book Paper</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Conference Type</label>
                                            <select className="form-select" value={formData.conferenceType}
                                                onChange={(e) => setFormData({ ...formData, conferenceType: e.target.value })}>
                                                <option value="">Select</option>
                                                <option value="international">International</option>
                                                <option value="national">National</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Name of Conference / Book</label>
                                            <input type="text" className="form-input" value={formData.conferenceName}
                                                onChange={(e) => setFormData({ ...formData, conferenceName: e.target.value })} placeholder="Full conference/book name" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Proceedings Title</label>
                                            <input type="text" className="form-input" value={formData.proceedingsTitle}
                                                onChange={(e) => setFormData({ ...formData, proceedingsTitle: e.target.value })} placeholder="Proceedings of..." />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Co-Authors</label>
                                            <input type="text" className="form-input" value={formData.coAuthors}
                                                onChange={(e) => setFormData({ ...formData, coAuthors: e.target.value })} placeholder="External co-author names" />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Date of Publishing</label>
                                            <input type="text" className="form-input" value={formData.publishedDate}
                                                onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })} placeholder="dd/mm/yyyy" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">ISBN</label>
                                            <input type="text" className="form-input" value={formData.isbn}
                                                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })} placeholder="978-X-XXXX-XXXX-X" />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">DOI</label>
                                            <input type="text" className="form-input" value={formData.doi}
                                                onChange={(e) => setFormData({ ...formData, doi: e.target.value })} placeholder="10.xxxx/xxxx" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Name of Publisher</label>
                                            <input type="text" className="form-input" value={formData.nameOfPublisher}
                                                onChange={(e) => setFormData({ ...formData, nameOfPublisher: e.target.value })} placeholder="e.g. Springer, Elsevier" />
                                        </div>
                                    </div>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Link to First Page</label>
                                            <input type="url" className="form-input" value={formData.firstPageLink}
                                                onChange={(e) => setFormData({ ...formData, firstPageLink: e.target.value })} placeholder="https://..." />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Indexing (comma-separated)</label>
                                            <input type="text" className="form-input" value={formData.indexing}
                                                onChange={(e) => setFormData({ ...formData, indexing: e.target.value })} placeholder="Scopus, DBLP..." />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label className="form-label">Abstract</label>
                                <textarea className="form-textarea" value={formData.abstract}
                                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                                    placeholder="Publication abstract..." />
                            </div>

                            {/* Optional: additional faculty authors */}
                            <details style={{ marginBottom: 'var(--spacing-md)' }}>
                                <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    + Add Faculty Co-Authors (optional)
                                </summary>
                                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-sm)', marginTop: '0.5rem' }}>
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
                            </details>

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
                                <label className="form-label">Profile Photo</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                    <img
                                        src={editFormData.profilePhoto || 'https://via.placeholder.com/80'}
                                        alt="Preview"
                                        style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }}
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/80'}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <label
                                            htmlFor="edit-photo-upload"
                                            className="btn btn-secondary"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '6px' }}
                                        >
                                            <FiCamera size={14} /> Choose Photo
                                            <input
                                                id="edit-photo-upload"
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={handlePhotoUpload}
                                            />
                                        </label>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Max 2MB · JPG, PNG, WEBP</p>
                                    </div>
                                </div>
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
