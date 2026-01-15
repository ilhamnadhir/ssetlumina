import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Faculty from './models/Faculty.js';

dotenv.config();

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all users
        const users = await User.find().select('email role facultyId');
        console.log('\n📋 All users in database:');
        console.log('Total users:', users.length);

        for (const user of users) {
            console.log(`- ${user.email} (${user.role}) - Faculty ID: ${user.facultyId || 'None'}`);
        }

        // Get all faculty
        const faculty = await Faculty.find().select('name email facultyId');
        console.log('\n👥 All faculty profiles:');
        console.log('Total faculty:', faculty.length);

        for (const fac of faculty) {
            console.log(`- ${fac.name} (${fac.email}) - ID: ${fac.facultyId}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

listUsers();
