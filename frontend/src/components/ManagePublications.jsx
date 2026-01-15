import { useState, useEffect } from 'react';
import { publicationsAPI, facultyAPI, departmentsAPI } from '../services/api';
import { FiX, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

const ManagePublications = ({ onUpdate }) => {
    const [publications, setPublications] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingPub, setEditingPub] = useState(null);
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
        pages: '',
        publisher: '',
        url: '',
        keywords: '',
        publishedDate: '',
        venueUrl: '',
        affiliation: '',
        indexing: '',
        journalType: '',
        issn: '',
        impactFactor: '',
        conferenceType: '',
        isbn: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pubsRes, facRes, deptsRes] = await Promise.all([
                publicationsAPI.getAll({ limit: 100 }),
                facultyAPI.getAll(),
                departmentsAPI.getAll()
            ]);
            setPublications(pubsRes.data.publications);
            setFaculty(facRes.data.faculty);
            setDepartments(deptsRes.data.departments);
            if (deptsRes.data.departments.length > 0 && !formData.department) {
                setFormData(prev => ({ ...prev, department: deptsRes.data.departments[0]._id }));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleAdd = () => {
        setEditingPub(null);
        setFormData({
            title: '',
            authors: [],
            type: 'journal',
            year: new Date().getFullYear(),
            department: departments.length > 0 ? departments[0]._id : '',
            venue: '',
            abstract: '',
            doi: '',
            volume: '',
            issue: '',
            pages: '',
            publisher: '',
            url: '',
            keywords: '',
            publishedDate: '',
            venueUrl: '',
            affiliation: '',
            indexing: '',
            journalType: '',
            issn: '',
            impactFactor: '',
            conferenceType: '',
            isbn: ''
        });
        setShowModal(true);
    };

    const handleEdit = (pub) => {
        setEditingPub(pub);
        setFormData({
            title: pub.title,
            authors: pub.authors.map(a => a._id),
            type: pub.type,
            year: pub.year,
            department: pub.department?._id || departments[0]?._id || '',
            venue: pub.venue,
            abstract: pub.abstract || '',
            doi: pub.doi || '',
            volume: pub.volume || '',
            issue: pub.issue || '',
            pages: pub.pages || '',
            publisher: pub.publisher || '',
            url: pub.url || '',
            keywords: pub.keywords?.join(', ') || '',
            publishedDate: pub.publishedDate ? new Date(pub.publishedDate).toISOString().split('T')[0] : '',
            venueUrl: pub.venueUrl || '',
            affiliation: pub.affiliation || '',
            indexing: pub.indexing?.join(', ') || '',
            journalType: pub.journalType || '',
            issn: pub.issn || '',
            impactFactor: pub.impactFactor || '',
            conferenceType: pub.conferenceType || '',
            isbn: pub.isbn || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this publication?')) return;
        try {
            await publicationsAPI.delete(id);
            fetchData();
            if (onUpdate) onUpdate();
        } catch (error) {
            alert(error.response?.data?.message || 'Delete failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()).filter(k => k) : [],
                indexing: formData.indexing ? formData.indexing.split(',').map(i => i.trim()).filter(i => i) : [],
                impactFactor: formData.impactFactor ? parseFloat(formData.impactFactor) : undefined,
                publishedDate: formData.publishedDate || undefined
            };

            if (editingPub) {
                await publicationsAPI.update(editingPub._id, submitData);
            } else {
                await publicationsAPI.create(submitData);
            }
            setShowModal(false);
            setEditingPub(null);
            fetchData();
            if (onUpdate) onUpdate();
        } catch (error) {
            alert(error.response?.data?.message || 'Operation failed');
        }
    };

    const toggleAuthor = (authorId) => {
        setFormData(prev => ({
            ...prev,
            authors: prev.authors.includes(authorId)
                ? prev.authors.filter(id => id !== authorId)
                : [...prev.authors, authorId]
        }));
    };

    return (
        <div className="section-card">
            <div className="flex justify-between items-center mb-lg">
                <h2>Manage Publications</h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <FiPlus /> Add Publication
                </button>
            </div>

            <div className="grid gap-md">
                {publications.map((pub) => (
                    <div key={pub._id} className="card">
                        <div className="flex justify-between items-start mb-sm">
                            <div style={{ flex: 1 }}>
                                <div className="flex items-center gap-sm mb-sm">
                                    <h4 style={{ margin: 0 }}>{pub.title}</h4>
                                    <span className={`badge ${pub.type === 'journal' ? 'badge-primary' : 'badge-success'}`}>
                                        {pub.type}
                                    </span>
                                </div>
                                <p className="text-muted" style={{ margin: '0.25rem 0' }}>
                                    {pub.authors.map(a => a.name).join(', ')}
                                </p>
                                <p className="text-secondary" style={{ margin: 0 }}>
                                    {pub.venue} • {pub.year}
                                </p>
                            </div>
                            <div className="flex gap-sm">
                                <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(pub)}>
                                    <FiEdit2 />
                                </button>
                                <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(pub._id)} style={{ color: '#f87171' }}>
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {publications.length === 0 && (
                <div className="text-center p-xl">
                    <p className="text-muted">No publications found. Click "Add Publication" to create one.</p>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="flex justify-between items-center mb-lg">
                            <h3>{editingPub ? 'Edit Publication' : 'Add Publication'}</h3>
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
                                <label className="form-label">Authors * (Select at least one)</label>
                                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-sm)' }}>
                                    {faculty.map(fac => (
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
                                <label className="form-label">Department *</label>
                                <select
                                    className="form-select"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    required
                                >
                                    {departments.map(dept => (
                                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                                    ))}
                                </select>
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

                            {/* Common Fields */}
                            <div className="grid grid-2 gap-md">
                                <div className="form-group">
                                    <label className="form-label">Publisher</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.publisher}
                                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                                        placeholder="IEEE, Springer, etc."
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Published Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.publishedDate}
                                        onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-2 gap-md">
                                <div className="form-group">
                                    <label className="form-label">Paper URL</label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Venue URL</label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        value={formData.venueUrl}
                                        onChange={(e) => setFormData({ ...formData, venueUrl: e.target.value })}
                                        placeholder="Journal/Conference website"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Affiliation</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.affiliation}
                                    onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                                    placeholder="Institution affiliation"
                                />
                            </div>

                            <div className="grid grid-2 gap-md">
                                <div className="form-group">
                                    <label className="form-label">Keywords (comma-separated)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.keywords}
                                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                        placeholder="AI, Machine Learning, etc."
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Indexing (comma-separated)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.indexing}
                                        onChange={(e) => setFormData({ ...formData, indexing: e.target.value })}
                                        placeholder="Scopus, Web of Science, etc."
                                    />
                                </div>
                            </div>

                            {/* Journal-Specific Fields */}
                            {formData.type === 'journal' && (
                                <>
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

                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Journal Type</label>
                                            <select
                                                className="form-select"
                                                value={formData.journalType}
                                                onChange={(e) => setFormData({ ...formData, journalType: e.target.value })}
                                            >
                                                <option value="">Select Type</option>
                                                <option value="international">International</option>
                                                <option value="national">National</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">ISSN</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={formData.issn}
                                                onChange={(e) => setFormData({ ...formData, issn: e.target.value })}
                                                placeholder="1234-5678"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Impact Factor</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            className="form-input"
                                            value={formData.impactFactor}
                                            onChange={(e) => setFormData({ ...formData, impactFactor: e.target.value })}
                                            placeholder="e.g., 3.456"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Conference-Specific Fields */}
                            {formData.type === 'conference' && (
                                <div className="grid grid-2 gap-md">
                                    <div className="form-group">
                                        <label className="form-label">Conference Type</label>
                                        <select
                                            className="form-select"
                                            value={formData.conferenceType}
                                            onChange={(e) => setFormData({ ...formData, conferenceType: e.target.value })}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="conference">Conference</option>
                                            <option value="book">Book</option>
                                            <option value="book-chapter">Book Chapter</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">ISBN</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.isbn}
                                            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                            placeholder="978-3-16-148410-0"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-md">
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {editingPub ? 'Update' : 'Create'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
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

export default ManagePublications;
