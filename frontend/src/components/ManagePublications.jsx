import { useState, useEffect } from 'react';
import { publicationsAPI, facultyAPI, departmentsAPI } from '../services/api';
import { FiX, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

const emptyForm = {
    title: '',
    type: 'journal',
    authors: [],
    coAuthors: '',
    department: '',
    doi: '',
    publishedDate: '',
    indexing: '',
    abstract: '',
    keywords: '',
    // Journal fields
    journalName: '',
    paymentType: '',
    paperLink: '',
    journalWebsiteLink: '',
    journalType: '',
    printJournalContentLink: '',
    issn: '',
    impactFactor: '',
    affiliation: '',
    volume: '',
    issue: '',
    pages: '',
    // Conference/Book fields
    conferenceSubtype: '',
    conferenceType: '',
    conferenceName: '',
    proceedingsTitle: '',
    isbn: '',
    nameOfPublisher: '',
    firstPageLink: '',
};

const ManagePublications = ({ onUpdate }) => {
    const [publications, setPublications] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingPub, setEditingPub] = useState(null);
    const [formData, setFormData] = useState({ ...emptyForm });

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
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

    const handleAdd = () => {
        setEditingPub(null);
        setFormData({ ...emptyForm, department: departments[0]?._id || '' });
        setShowModal(true);
    };

    const handleEdit = (pub) => {
        setEditingPub(pub);
        setFormData({
            title: pub.title || '',
            type: pub.type || 'journal',
            authors: pub.authors?.map(a => a._id) || [],
            coAuthors: pub.coAuthors || '',
            department: pub.department?._id || departments[0]?._id || '',
            doi: pub.doi || '',
            publishedDate: pub.publishedDate || '',
            indexing: pub.indexing?.join(', ') || '',
            abstract: pub.abstract || '',
            keywords: pub.keywords?.join(', ') || '',
            // Journal
            journalName: pub.journalName || '',
            paymentType: pub.paymentType || '',
            paperLink: pub.paperLink || '',
            journalWebsiteLink: pub.journalWebsiteLink || '',
            journalType: pub.journalType || '',
            issn: pub.issn || '',
            impactFactor: pub.impactFactor ?? '',
            affiliation: pub.affiliation || '',
            volume: pub.volume || '',
            issue: pub.issue || '',
            pages: pub.pages || '',
            // Conference/Book
            conferenceSubtype: pub.conferenceSubtype || '',
            conferenceType: pub.conferenceType || '',
            conferenceName: pub.conferenceName || '',
            isbn: pub.isbn || '',
            nameOfPublisher: pub.nameOfPublisher || '',
            firstPageLink: pub.firstPageLink || '',
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
                keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
                indexing: formData.indexing ? formData.indexing.split(',').map(i => i.trim()).filter(Boolean) : [],
                impactFactor: formData.impactFactor !== '' ? parseFloat(formData.impactFactor) : undefined,
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

    const isJournal = formData.type === 'journal';

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
                                    {pub.authors?.map(a => a.name).join(', ')}
                                    {pub.coAuthors ? (pub.authors?.length ? `, ${pub.coAuthors}` : pub.coAuthors) : ''}
                                </p>
                                <p className="text-secondary" style={{ margin: 0 }}>
                                    {pub.type === 'journal'
                                        ? pub.journalName || pub.venue || '—'
                                        : pub.conferenceName || pub.venue || '—'}
                                    {pub.publishedDate ? ` • ${pub.publishedDate}` : ''}
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
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
                        <div className="flex justify-between items-center mb-lg">
                            <h3>{editingPub ? 'Edit Publication' : 'Add Publication'}</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.5rem' }}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>

                            {/* ── Step 1: Type ── */}
                            <div className="form-group">
                                <label className="form-label">Publication Category *</label>
                                <div className="flex gap-md" style={{ marginTop: '0.5rem' }}>
                                    {[
                                        { value: 'journal', label: '📰 Journal' },
                                        { value: 'conference', label: '📚 Conference / Book / Book Paper' },
                                    ].map(opt => (
                                        <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.6rem 1rem', border: `2px solid ${formData.type === opt.value ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', flex: 1, fontWeight: formData.type === opt.value ? 600 : 400 }}>
                                            <input
                                                type="radio"
                                                name="pubType"
                                                value={opt.value}
                                                checked={formData.type === opt.value}
                                                onChange={set('type')}
                                                style={{ accentColor: 'var(--primary)' }}
                                            />
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />

                            {/* ── Conference sub-type (only for conference category) ── */}
                            {!isJournal && (
                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select className="form-select" value={formData.conferenceSubtype} onChange={set('conferenceSubtype')}>
                                        <option value="">Select type</option>
                                        <option value="conference">Conference Paper</option>
                                        <option value="book">Book</option>
                                        <option value="book-paper">Book Paper / Book Chapter</option>
                                    </select>
                                </div>
                            )}

                            {/* ── Title (always required) ── */}
                            <div className="form-group">
                                <label className="form-label">
                                    {isJournal ? 'Title of Paper *' : 'Title of Conference / Book / Book Paper *'}
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={set('title')}
                                    required
                                />
                            </div>

                            {/* ── Journal-specific fields ── */}
                            {isJournal && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Journal Name</label>
                                        <input type="text" className="form-input" value={formData.journalName} onChange={set('journalName')} placeholder="e.g. Nature, IEEE Transactions..." />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Co-Authors</label>
                                        <input type="text" className="form-input" value={formData.coAuthors} onChange={set('coAuthors')} placeholder="Names of co-authors not in the system" />
                                    </div>

                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Payment Type</label>
                                            <select className="form-select" value={formData.paymentType} onChange={set('paymentType')}>
                                                <option value="">Select</option>
                                                <option value="unpaid">Unpaid (Open Access)</option>
                                                <option value="paid">Paid</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Date of Publication (dd/mm/yyyy)</label>
                                            <input type="text" className="form-input" value={formData.publishedDate} onChange={set('publishedDate')} placeholder="01/01/2024" maxLength={10} />
                                        </div>
                                    </div>

                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Paper Link</label>
                                            <input type="url" className="form-input" value={formData.paperLink} onChange={set('paperLink')} placeholder="https://..." />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Link to Journal Website</label>
                                            <input type="url" className="form-input" value={formData.journalWebsiteLink} onChange={set('journalWebsiteLink')} placeholder="https://..." />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">URL to content page in print journal</label>
                                        <input type="url" className="form-input" value={formData.printJournalContentLink} onChange={set('printJournalContentLink')} placeholder="https://..." />
                                    </div>

                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Journal Type</label>
                                            <select className="form-select" value={formData.journalType} onChange={set('journalType')}>
                                                <option value="">Select</option>
                                                <option value="international">International</option>
                                                <option value="national">National</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Indexing (comma-separated)</label>
                                            <input type="text" className="form-input" value={formData.indexing} onChange={set('indexing')} placeholder="Scopus, Web of Science..." />
                                        </div>
                                    </div>

                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">ISSN</label>
                                            <input type="text" className="form-input" value={formData.issn} onChange={set('issn')} placeholder="1234-5678" />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">DOI</label>
                                            <input type="text" className="form-input" value={formData.doi} onChange={set('doi')} placeholder="10.1234/example" />
                                        </div>
                                    </div>

                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Impact Factor</label>
                                            <input type="number" step="0.001" min="0" className="form-input" value={formData.impactFactor} onChange={set('impactFactor')} placeholder="e.g. 3.456" />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Affiliation</label>
                                            <input type="text" className="form-input" value={formData.affiliation} onChange={set('affiliation')} placeholder="Institution name" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ── Conference/Book-specific fields ── */}
                            {!isJournal && (
                                <>
                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Conference Type</label>
                                            <select className="form-select" value={formData.conferenceType} onChange={set('conferenceType')}>
                                                <option value="">Select</option>
                                                <option value="international">International</option>
                                                <option value="national">National</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Name of Conference / Book</label>
                                            <input type="text" className="form-input" value={formData.conferenceName} onChange={set('conferenceName')} placeholder="e.g. ICML 2024" />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Title of the proceedings of conference</label>
                                        <input type="text" className="form-input" value={formData.proceedingsTitle} onChange={set('proceedingsTitle')} placeholder="Proceedings of..." />
                                    </div>

                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Date of Publishing (dd/mm/yyyy)</label>
                                            <input type="text" className="form-input" value={formData.publishedDate} onChange={set('publishedDate')} placeholder="01/01/2024" maxLength={10} />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">ISBN</label>
                                            <input type="text" className="form-input" value={formData.isbn} onChange={set('isbn')} placeholder="978-3-16-148410-0" />
                                        </div>
                                    </div>

                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">DOI</label>
                                            <input type="text" className="form-input" value={formData.doi} onChange={set('doi')} placeholder="10.1234/example" />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Name of Publisher</label>
                                            <input type="text" className="form-input" value={formData.nameOfPublisher} onChange={set('nameOfPublisher')} placeholder="Springer, IEEE, etc." />
                                        </div>
                                    </div>

                                    <div className="grid grid-2 gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Link to First Page</label>
                                            <input type="url" className="form-input" value={formData.firstPageLink} onChange={set('firstPageLink')} placeholder="https://..." />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Indexing (comma-separated)</label>
                                            <input type="text" className="form-input" value={formData.indexing} onChange={set('indexing')} placeholder="Scopus, DBLP..." />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ── Shared optional: Authors from faculty list ── */}
                            <details style={{ marginBottom: '1rem' }}>
                                <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    + Select Faculty Authors (optional)
                                </summary>
                                <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-sm)', marginTop: '0.5rem' }}>
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
                            </details>

                            {/* ── Department ── */}
                            {departments.length > 0 && (
                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <select className="form-select" value={formData.department} onChange={set('department')}>
                                        <option value="">Select department</option>
                                        {departments.map(dept => (
                                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-md" style={{ marginTop: '1.5rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {editingPub ? 'Update Publication' : 'Add Publication'}
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
