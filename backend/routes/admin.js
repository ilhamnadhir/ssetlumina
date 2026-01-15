import express from 'express';
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';
import Publication from '../models/Publication.js';
import Department from '../models/Department.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics (accessible to all authenticated users)
router.get('/stats', authenticate, async (req, res) => {
    try {
        const totalFaculty = await Faculty.countDocuments();
        const totalPublications = await Publication.countDocuments();
        const totalDepartments = await Department.countDocuments();
        const totalUsers = await User.countDocuments();

        // Publication breakdown by type
        const journalCount = await Publication.countDocuments({ type: 'journal' });
        const conferenceCount = await Publication.countDocuments({ type: 'conference' });

        // Publications by year (last 5 years)
        const currentYear = new Date().getFullYear();
        const yearlyStats = await Publication.aggregate([
            {
                $match: {
                    year: { $gte: currentYear - 4, $lte: currentYear }
                }
            },
            {
                $group: {
                    _id: '$year',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Publications by department
        const departmentStats = await Publication.aggregate([
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            {
                $unwind: '$department'
            },
            {
                $project: {
                    departmentName: '$department.name',
                    departmentCode: '$department.code',
                    count: 1
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Top publishers (faculty with most publications)
        const topPublishers = await Publication.aggregate([
            {
                $unwind: '$authors'
            },
            {
                $group: {
                    _id: '$authors',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: 'faculties',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'faculty'
                }
            },
            {
                $unwind: '$faculty'
            },
            {
                $project: {
                    name: '$faculty.name',
                    facultyId: '$faculty.facultyId',
                    department: '$faculty.department',
                    count: 1
                }
            }
        ]);

        res.json({
            overview: {
                totalFaculty,
                totalPublications,
                totalDepartments,
                totalUsers
            },
            publicationBreakdown: {
                journal: journalCount,
                conference: conferenceCount
            },
            yearlyStats,
            departmentStats,
            topPublishers
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all users
router.get('/users', authenticate, requireAdmin, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('facultyId', 'name facultyId department')
            .sort({ createdAt: -1 });

        res.json({ users, count: users.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user role
router.put('/users/:id/role', authenticate, requireAdmin, async (req, res) => {
    try {
        const { role } = req.body;

        if (!['faculty', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({
            message: 'User role updated successfully',
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
