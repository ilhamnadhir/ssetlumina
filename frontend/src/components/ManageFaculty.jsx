import { useState, useEffect } from 'react';
import { facultyAPI, departmentsAPI } from '../services/api';
import { FiX, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

const ManageFaculty = ({ onUpdate }) => {
    const [faculty, setFaculty] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        facultyId: '',
        department: '',
        role: 'Assistant Professor',
        email: '',
        phone: '',
        specialization: '',
        qualifications: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [facRes, deptsRes] = await Promise.all([
                facultyAPI.getAll(),
                departmentsAPI.getAll()
            ]);
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
        setEditingFaculty(null);
        setFormData({
            name: '',
            facultyId: '',
            department: departments.length > 0 ? departments[0]._id : '',
            role: 'Assistant Professor',
            email: '',
            phone: '',
            specialization: '',
            qualifications: ''
        });
        setShowModal(true);
    };

    const handleEdit = (fac) => {
        setEditingFaculty(fac);
        setFormData({
            name: fac.name,
            facultyId: fac.facultyId,
            department: fac.department?._id || departments[0]?._id || '',
            role: fac.role,
            email: fac.email,
            phone: fac.phone || '',
            specialization: fac.specialization || '',
            qualifications: fac.qualifications?.join('\n') || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this faculty member? This will also delete their user account.')) return;
        try {
            await facultyAPI.delete(id);
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
                qualifications: formData.qualifications
                    ? formData.qualifications.split('\n').filter(q => q.trim())
                    : []
            };

            if (editingFaculty) {
                await facultyAPI.update(editingFaculty._id, submitData);
            } else {
                await facultyAPI.create(submitData);
            }
            setShowModal(false);
            setEditingFaculty(null);
            fetchData();
            if (onUpdate) onUpdate();
        } catch (error) {
            alert(error.response?.data?.message || 'Operation failed');
        }
    };

    return (
        <div className="section-card">
            <div className="flex justify-between items-center mb-lg">
                <h2>Manage Faculty</h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <FiPlus /> Add Faculty
                </button>
            </div>

            <div className="grid gap-md">
                {faculty.map((fac) => (
                    <div key={fac._id} className="card">
                        <div className="flex justify-between items-start">
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: 0 }}>{fac.name}</h4>
                                <p className="text-muted" style={{ margin: '0.25rem 0' }}>
                                    {fac.facultyId} • {fac.role}
                                </p>
                                <p className="text-secondary" style={{ margin: '0.25rem 0' }}>
                                    {fac.department?.name}
                                </p>
                                <p className="text-muted" style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                                    {fac.email}
                                </p>
                                <div className="mt-sm">
                                    <span className="badge badge-primary">
                                        {fac.publicationCount || 0} Publications
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-sm">
                                <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(fac)}>
                                    <FiEdit2 />
                                </button>
                                <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(fac._id)} style={{ color: '#f87171' }}>
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {faculty.length === 0 && (
                <div className="text-center p-xl">
                    <p className="text-muted">No faculty members found. Click "Add Faculty" to create one.</p>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="flex justify-between items-center mb-lg">
                            <h3>{editingFaculty ? 'Edit Faculty' : 'Add Faculty'}</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.5rem' }}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-2 gap-md">
                                <div className="form-group">
                                    <label className="form-label">Faculty ID *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.facultyId}
                                        onChange={(e) => setFormData({ ...formData, facultyId: e.target.value.toUpperCase() })}
                                        placeholder="FAC001"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-2 gap-md">
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
                                    <label className="form-label">Role *</label>
                                    <select
                                        className="form-select"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        required
                                    >
                                        <option value="Professor">Professor</option>
                                        <option value="Associate Professor">Associate Professor</option>
                                        <option value="Assistant Professor">Assistant Professor</option>
                                        <option value="Lecturer">Lecturer</option>
                                        <option value="HOD">HOD</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-2 gap-md">
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91-9876543210"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Specialization</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.specialization}
                                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                        placeholder="e.g., Machine Learning"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Qualifications (one per line)</label>
                                <textarea
                                    className="form-textarea"
                                    value={formData.qualifications}
                                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                                    placeholder="Ph.D. in Computer Science&#10;M.Tech in AI"
                                    rows="3"
                                />
                            </div>

                            <div className="flex gap-md">
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {editingFaculty ? 'Update' : 'Create'}
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

export default ManageFaculty;
