import express from 'express';
import Faculty from '../models/Faculty.js';
import User from '../models/User.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all faculty with filters and sorting
router.get('/', async (req, res) => {
    try {
        const { department, role, search, sortBy = 'name', order = 'asc' } = req.query;

        let query = {};

        if (department) query.department = department;
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { facultyId: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOrder = order === 'desc' ? -1 : 1;
        const sortOptions = { [sortBy]: sortOrder };

        const faculty = await Faculty.find(query)
            .populate('department')
            .populate('publicationCount')
            .sort(sortOptions);

        res.json({ faculty, count: faculty.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get faculty by ID
router.get('/:id', async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id)
            .populate('department')
            .populate('publicationCount');

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        res.json({ faculty });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create new faculty profile (authenticated users can create their own profile)
router.post('/', authenticate, async (req, res) => {
    try {
        console.log('📝 Faculty creation request received');
        console.log('User:', req.user.email);
        console.log('Request body:', req.body);

        const { name, facultyId, department, role, email, phone, specialization, qualifications, profilePhoto } = req.body;

        // Check if faculty ID already exists
        const existingFaculty = await Faculty.findOne({ facultyId });
        if (existingFaculty) {
            console.log('❌ Faculty ID already exists:', facultyId);
            return res.status(400).json({ message: 'Faculty ID already exists' });
        }

        // Check if email already exists
        const existingEmail = await Faculty.findOne({ email });
        if (existingEmail) {
            console.log('❌ Email already registered as faculty:', email);
            return res.status(400).json({ message: 'Email already registered as faculty' });
        }

        const faculty = new Faculty({
            name,
            facultyId,
            department,
            role,
            email,
            phone,
            specialization,
            qualifications,
            profilePhoto,
            userId: req.user._id
        });

        await faculty.save();
        console.log('✅ Faculty profile saved:', faculty._id);

        // Update user's facultyId reference
        await User.findByIdAndUpdate(req.user._id, { facultyId: faculty._id });
        console.log('✅ User updated with faculty reference');

        const populatedFaculty = await Faculty.findById(faculty._id).populate('department');

        res.status(201).json({
            message: 'Faculty profile created successfully',
            faculty: populatedFaculty
        });
        console.log('✅ Faculty creation completed successfully');
    } catch (error) {
        console.error('❌ Error creating faculty:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update faculty profile
router.put('/:id', authenticate, async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // Check permissions: admin or own profile
        const isAdmin = req.user.role === 'admin';
        const isOwnProfile = faculty.userId.toString() === req.user._id.toString();

        if (!isAdmin && !isOwnProfile) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { name, department, role, phone, specialization, qualifications, profilePhoto } = req.body;

        if (name) faculty.name = name;
        if (department) faculty.department = department;
        if (role && isAdmin) faculty.role = role; // Only admin can change role
        if (phone) faculty.phone = phone;
        if (specialization) faculty.specialization = specialization;
        if (qualifications) faculty.qualifications = qualifications;
        if (profilePhoto) faculty.profilePhoto = profilePhoto;

        await faculty.save();

        const updatedFaculty = await Faculty.findById(faculty._id).populate('department');

        res.json({
            message: 'Faculty updated successfully',
            faculty: updatedFaculty
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete faculty profile (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // Delete associated user account
        await User.findByIdAndDelete(faculty.userId);

        // Delete faculty profile
        await Faculty.findByIdAndDelete(req.params.id);

        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
