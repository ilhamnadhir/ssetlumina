import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Faculty from './models/Faculty.js';

dotenv.config();

async function deleteFaculty() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'mansih@scmsgroup.org';

        // Find the faculty profile
        const faculty = await Faculty.findOne({ email });
        if (!faculty) {
            console.log('❌ Faculty not found with email:', email);
            process.exit(0);
        }

        console.log('Found faculty:', faculty.name, 'ID:', faculty._id);

        // Find and delete associated user
        if (faculty.userId) {
            const user = await User.findByIdAndDelete(faculty.userId);
            if (user) {
                console.log('✅ Deleted user account:', user.email);
            }
        }

        // Delete the faculty profile
        await Faculty.findByIdAndDelete(faculty._id);
        console.log('✅ Deleted faculty profile:', faculty.name);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

deleteFaculty();
