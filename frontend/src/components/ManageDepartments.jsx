import { useState } from 'react';
import { departmentsAPI } from '../services/api';
import { FiX, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const ManageDepartments = ({ departments, onUpdate }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        established: new Date().getFullYear()
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDept) {
                await departmentsAPI.update(editingDept._id, formData);
            } else {
                await departmentsAPI.create(formData);
            }
            setShowModal(false);
            setEditingDept(null);
            setFormData({ name: '', code: '', description: '', established: new Date().getFullYear() });
            onUpdate();
        } catch (error) {
            alert(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (dept) => {
        setEditingDept(dept);
        setFormData({
            name: dept.name,
            code: dept.code,
            description: dept.description || '',
            established: dept.established || new Date().getFullYear()
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this department?')) return;
        try {
            await departmentsAPI.delete(id);
            onUpdate();
        } catch (error) {
            alert(error.response?.data?.message || 'Delete failed');
        }
    };

    return (
        <div className="section-card">
            <div className="flex justify-between items-center mb-lg">
                <h2>Manage Departments</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <FiPlus /> Add Department
                </button>
            </div>

            <div className="grid gap-md">
                {departments.map((dept) => (
                    <div key={dept._id} className="card flex justify-between items-center">
                        <div>
                            <h4 style={{ margin: 0 }}>{dept.name}</h4>
                            <p className="text-muted" style={{ margin: '0.25rem 0 0 0' }}>{dept.code}</p>
                        </div>
                        <div className="flex gap-sm">
                            <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(dept)}>
                                <FiEdit2 />
                            </button>
                            <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(dept._id)}>
                                <FiTrash2 />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-lg">
                            <h3>{editingDept ? 'Edit Department' : 'Add Department'}</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Department Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Department Code *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Established Year</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.established}
                                    onChange={(e) => setFormData({ ...formData, established: parseInt(e.target.value) })}
                                    min="1900"
                                    max={new Date().getFullYear()}
                                />
                            </div>

                            <div className="flex gap-md">
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {editingDept ? 'Update' : 'Create'}
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

export default ManageDepartments;
