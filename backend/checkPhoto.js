import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Faculty from './models/Faculty.js';

dotenv.config();

async function checkFacultyPhoto() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'sonal@scmsgroup.org';

        const faculty = await Faculty.findOne({ email });
        if (faculty) {
            console.log('\n👥 Faculty found:');
            console.log('  Name:', faculty.name);
            console.log('  Email:', faculty.email);
            console.log('  Profile Photo:', faculty.profilePhoto || 'NOT SET');
            console.log('  Faculty ID:', faculty.facultyId);
        } else {
            console.log('\n❌ Faculty not found with email:', email);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkFacultyPhoto();
