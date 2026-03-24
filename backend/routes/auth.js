import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';
import { authenticate } from '../middleware/auth.js';
import OTP from '../models/OTP.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Validate domain restriction + whitelist
// (Nodemon restart trigger after .env update)
const validateEmailDomain = (email) => {
    const isAdminEmail = email.toLowerCase() === 'admin@college.edu';
    const whitelistedEmails = [
        'noorulilham3@gmail.com',
        'arjununnikrishnan188@gmail.com',
        'feninsajan1417@gmail.com',
        'nehlafathimah246@gmail.com'
    ];
    const isWhitelisted = whitelistedEmails.includes(email.toLowerCase());
    return isAdminEmail || isWhitelisted || email.toLowerCase().includes('scmsgroup');
};

// Send OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!validateEmailDomain(email)) {
            return res.status(400).json({ message: 'Email must contain "scmsgroup" or be a whitelisted email' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await OTP.findOneAndDelete({ email }); // Delete any old OTPs for this email
        const newOTP = new OTP({ email, otp });
        await newOTP.save();

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        let info = await transporter.sendMail({
            from: `"Faculty Portal" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your Registration OTP",
            text: `Your OTP for registration is ${otp}. It is valid for 5 minutes.`,
        });

        console.log("OTP sent to: %s", email);

        res.status(200).json({ message: 'OTP sent successfully. Please check your email inbox.' });

    } catch (error) {
        res.status(500).json({ message: 'Failed to send OTP', error: error.message });
    }
});

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, role, otp } = req.body;

        if (!otp) {
            return res.status(400).json({ message: 'OTP is required' });
        }

        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) {
            return res.status(400).json({ message: 'OTP expired or not found' });
        }

        if (otpRecord.attempts >= 3) {
            await OTP.deleteOne({ email });
            return res.status(400).json({ message: 'Maximum OTP attempts reached. Please request a new OTP.' });
        }

        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Complete OTP verification
        await OTP.deleteOne({ email });

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            email,
            password,
            role: role || 'faculty'
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
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

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Get faculty profile if exists
        let facultyProfile = null;
        if (user.facultyId) {
            facultyProfile = await Faculty.findById(user.facultyId).populate('department');
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                facultyId: user.facultyId,
                facultyProfile
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
    try {
        let facultyProfile = null;
        if (req.user.facultyId) {
            facultyProfile = await Faculty.findById(req.user.facultyId).populate('department');
        }

        res.json({
            user: {
                id: req.user._id,
                email: req.user.email,
                role: req.user.role,
                facultyId: req.user.facultyId,
                facultyProfile
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
