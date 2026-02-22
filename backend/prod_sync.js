import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Department from './models/Department.js';
import Faculty from './models/Faculty.js';
import Publication from './models/Publication.js';

dotenv.config();

/**
 * PRODUCTION SYNC SCRIPT
 * This script synchronizes the hosted database with the new department names,
 * calculates academic years, and updates search indexes.
 */

const targetDepartments = [
    { name: 'M.Tech-EE', code: 'MTEEE', description: 'M.Tech - Electrical Engineering' },
    { name: 'M.Tech-CSE', code: 'MTCSE', description: 'M.Tech - Computer Science and Engineering' },
    { name: 'MCA', code: 'MCA', description: 'Master of Computer Applications' },
    { name: 'B.Tech-CSE', code: 'BTCSE', description: 'B.Tech - Computer Science and Engineering' },
    { name: 'B.Tech-AI&DS', code: 'BTAIDS', description: 'B.Tech - Artificial Intelligence and Data Science' },
    { name: 'B.Tech-ECE', code: 'BTECE', description: 'B.Tech - Electronics and Communication Engineering' },
    { name: 'B.Tech-ECE(VLSI)', code: 'BTECEV', description: 'B.Tech - ECE (VLSI)' },
    { name: 'B.Tech-EEE', code: 'BTEEE', description: 'B.Tech - Electrical and Electronics Engineering' },
    { name: 'B.Tech-ME', code: 'BTME', description: 'B.Tech - Mechanical Engineering' },
    { name: 'B.Tech-AU', code: 'BTAU', description: 'B.Tech - Automobile Engineering' },
    { name: 'B.Tech-CE', code: 'BTCE', description: 'B.Tech - Civil Engineering' }
];

const renameMap = {
    'Computer Science': 'B.Tech-CSE',
    'Electronics': 'B.Tech-ECE',
    'Civil': 'B.Tech-CE',
    'Mechanical': 'B.Tech-ME'
};

async function sync() {
    try {
        const uri = process.env.PROD_MONGODB_URI || process.env.MONGODB_URI;
        console.log(`📡 Connecting to: ${uri.replace(/:([^:@]{1,})@/, ':****@')}`);
        await mongoose.connect(uri);

        console.log('\n--- 1. Syncing Departments ---');
        // Ensure all target depts exist
        const deptIdMap = {};
        for (const d of targetDepartments) {
            let dept = await Department.findOne({ name: d.name });
            if (!dept) {
                dept = await Department.create(d);
                console.log(`✅ Created department: ${d.name}`);
            }
            deptIdMap[d.name] = dept._id;
        }

        // Rename and Merge
        for (const [oldName, newName] of Object.entries(renameMap)) {
            const oldDept = await Department.findOne({ name: oldName });
            const newDept = await Department.findOne({ name: newName });

            if (oldDept && newDept && oldDept._id.toString() !== newDept._id.toString()) {
                console.log(`🔄 Merging ${oldName} -> ${newName}...`);
                await Faculty.updateMany({ department: oldDept._id }, { $set: { department: newDept._id } });
                await Publication.updateMany({ department: oldDept._id }, { $set: { department: newDept._id } });
                await Department.findByIdAndDelete(oldDept._id);
                console.log(`🗑️ Deleted legacy department: ${oldName}`);
            }
        }

        console.log('\n--- 2. Syncing Publication Metadata (Academic Years & Search) ---');
        const publications = await Publication.find({});
        let pubCount = 0;
        for (const pub of publications) {
            // Re-saving triggers the pre-save hook in Publication.js
            await pub.save();
            pubCount++;
        }
        console.log(`✅ Refreshed ${pubCount} publications with academic years, author names, and search strings.`);

        console.log('\n--- 3. Rebuilding Search Indexes ---');
        try {
            const db = mongoose.connection.db;
            const collection = db.collection('publications');
            const indexes = await collection.indexes();
            const textIndex = indexes.find(idx => idx.name.includes('_text'));

            if (textIndex) {
                await collection.dropIndex(textIndex.name);
                console.log('🗑️ Dropped old search index.');
            }
            await Publication.createIndexes();
            console.log('✅ New search index created.');
        } catch (idxError) {
            console.warn('⚠️ Index rebuild warning (this is usually fine):', idxError.message);
        }

        console.log('\n🎉 ALL DONE! Your hosted database is now in sync with the new features.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Sync failed:', err);
        process.exit(1);
    }
}

sync();
