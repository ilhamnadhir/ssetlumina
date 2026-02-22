import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Publication from './models/Publication.js';
import Faculty from './models/Faculty.js';

dotenv.config();

async function syncAuthorNames() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const publications = await Publication.find({});
        console.log(`Processing ${publications.length} publications...`);

        for (const pub of publications) {
            if (pub.authors && pub.authors.length > 0) {
                const facultyDocs = await Faculty.find({ _id: { $in: pub.authors } }).select('name');
                pub.authorNames = facultyDocs.map(f => f.name).join(', ');
                await pub.save({ validateBeforeSave: false }); // Use .save() to trigger pre-save hooks (though we manually set authorNames here)
            }
        }

        console.log('Successfully synced author names for all publications.');
        process.exit(0);
    } catch (error) {
        console.error('Error syncing author names:', error);
        process.exit(1);
    }
}

syncAuthorNames();
