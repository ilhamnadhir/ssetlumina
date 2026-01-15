import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Faculty from './models/Faculty.js';

dotenv.config();

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'sonal@scmsgroup.org';

        // Find the user
        const user = await User.findOne({ email }).select('-password');
        if (user) {
            console.log('\n👤 User found:');
            console.log('  Email:', user.email);
            console.log('  Role:', user.role);
            console.log('  User ID:', user._id);
            console.log('  Faculty ID:', user.facultyId);
        } else {
            console.log('\n❌ User not found with email:', email);
        }

        // Find the faculty profile
        const faculty = await Faculty.findOne({ email });
        if (faculty) {
            console.log('\n👥 Faculty profile found:');
            console.log('  Name:', faculty.name);
            console.log('  Faculty ID:', faculty.facultyId);
            console.log('  Profile ID:', faculty._id);
            console.log('  User ID:', faculty.userId);
            console.log('  Department:', faculty.department);
        } else {
            console.log('\n❌ Faculty profile not found with email:', email);
        }

        // Check if they match
        if (user && faculty) {
            console.log('\n🔍 Comparison:');
            console.log('  user.facultyId:', user.facultyId);
            console.log('  faculty._id:', faculty._id);
            console.log('  Match?', user.facultyId?.toString() === faculty._id.toString());
            console.log('  user._id:', user._id);
            console.log('  faculty.userId:', faculty.userId);
            console.log('  Match?', user._id.toString() === faculty.userId?.toString());
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkUser();
