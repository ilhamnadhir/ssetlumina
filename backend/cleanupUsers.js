import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Faculty from './models/Faculty.js';

dotenv.config();

async function cleanupOrphanedUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all users
        const users = await User.find();
        console.log(`\n📋 Total users: ${users.length}`);

        let orphanedCount = 0;

        for (const user of users) {
            // Skip admin users
            if (user.role === 'admin') {
                console.log(`⏭️  Skipping admin: ${user.email}`);
                continue;
            }

            // Check if user has a faculty profile
            if (!user.facultyId) {
                console.log(`\n🗑️  Found orphaned user: ${user.email}`);
                await User.findByIdAndDelete(user._id);
                console.log(`✅ Deleted orphaned user: ${user.email}`);
                orphanedCount++;
            }
        }

        console.log(`\n✅ Cleanup complete. Deleted ${orphanedCount} orphaned user(s).`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cleanupOrphanedUsers();
