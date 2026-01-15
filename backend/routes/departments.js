import express from 'express';
import Department from '../models/Department.js';
import Faculty from '../models/Faculty.js';
import Publication from '../models/Publication.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all departments
router.get('/', async (req, res) => {
    try {
        const departments = await Department.find()
            .populate('head', 'name facultyId')
            .populate('facultyCount')
            .sort({ name: 1 });

        res.json({ departments, count: departments.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get department by ID with faculty list
router.get('/:id', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate('head', 'name facultyId email')
            .populate('facultyCount');

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Get faculty in this department
        const faculty = await Faculty.find({ department: req.params.id })
            .populate('publicationCount')
            .sort({ name: 1 });

        // Get publication count for this department
        const publicationCount = await Publication.countDocuments({ department: req.params.id });

        res.json({
            department,
            faculty,
            publicationCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create department (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const { name, code, description, established, head } = req.body;

        // Check if department code already exists
        const existingDept = await Department.findOne({ code });
        if (existingDept) {
            return res.status(400).json({ message: 'Department code already exists' });
        }

        const department = new Department({
            name,
            code,
            description,
            established,
            head
        });

        await department.save();

        const populatedDept = await Department.findById(department._id).populate('head', 'name facultyId');

        res.status(201).json({
            message: 'Department created successfully',
            department: populatedDept
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update department (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        const { name, code, description, established, head } = req.body;

        if (name) department.name = name;
        if (code) department.code = code;
        if (description) department.description = description;
        if (established) department.established = established;
        if (head !== undefined) department.head = head;

        await department.save();

        const updatedDept = await Department.findById(department._id).populate('head', 'name facultyId');

        res.json({
            message: 'Department updated successfully',
            department: updatedDept
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete department (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Check if department has faculty
        const facultyCount = await Faculty.countDocuments({ department: req.params.id });
        if (facultyCount > 0) {
            return res.status(400).json({ message: 'Cannot delete department with existing faculty members' });
        }

        await Department.findByIdAndDelete(req.params.id);

        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
