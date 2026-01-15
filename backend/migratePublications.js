import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Publication from './models/Publication.js';

dotenv.config();

// Sample data pools
const publishers = {
    journal: ['Elsevier', 'Springer', 'IEEE', 'Wiley', 'Taylor & Francis', 'SAGE Publications', 'Oxford University Press'],
    conference: ['IEEE', 'ACM', 'Springer', 'Elsevier', 'Wiley']
};

const indexingDatabases = ['Scopus', 'Web of Science', 'IEEE Xplore', 'Google Scholar', 'PubMed', 'DBLP', 'ACM Digital Library'];

const affiliations = [
    'APJ Abdul Kalam Technological University',
    'Kerala Technological University',
    'Department of Computer Science and Engineering',
    'School of Engineering'
];

// Generate random ISSN (format: XXXX-XXXX)
const generateISSN = () => {
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    return `${part1}-${part2}`;
};

// Generate random ISBN (format: 978-X-XXX-XXXXX-X)
const generateISBN = () => {
    const part1 = Math.floor(Math.random() * 10);
    const part2 = Math.floor(100 + Math.random() * 900);
    const part3 = Math.floor(10000 + Math.random() * 90000);
    const part4 = Math.floor(Math.random() * 10);
    return `978-${part1}-${part2}-${part3}-${part4}`;
};

// Generate random impact factor (2.0 - 8.5)
const generateImpactFactor = () => {
    return (Math.random() * 6.5 + 2.0).toFixed(3);
};

// Get random items from array
const getRandomItems = (arr, min = 1, max = 3) => {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// Get random item from array
const getRandomItem = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
};

// Generate random date in the past 5 years
const generatePublishedDate = (year) => {
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    return new Date(year, month, day);
};

const migratePublications = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all publications
        const publications = await Publication.find({});
        console.log(`Found ${publications.length} publications to migrate`);

        let updatedCount = 0;

        for (const pub of publications) {
            const updateData = {};

            // Common fields
            if (!pub.publisher) {
                updateData.publisher = getRandomItem(publishers[pub.type]);
            }

            if (!pub.publishedDate) {
                updateData.publishedDate = generatePublishedDate(pub.year);
            }

            if (!pub.affiliation) {
                updateData.affiliation = getRandomItem(affiliations);
            }

            if (!pub.indexing || pub.indexing.length === 0) {
                updateData.indexing = getRandomItems(indexingDatabases, 2, 4);
            }

            // Generate venue URL if not present
            if (!pub.venueUrl) {
                const venueSlug = pub.venue.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                updateData.venueUrl = `https://www.${venueSlug}.org`;
            }

            // Journal-specific fields
            if (pub.type === 'journal') {
                if (!pub.journalType) {
                    updateData.journalType = Math.random() > 0.3 ? 'international' : 'national';
                }

                if (!pub.issn) {
                    updateData.issn = generateISSN();
                }

                if (!pub.impactFactor) {
                    updateData.impactFactor = parseFloat(generateImpactFactor());
                }
            }

            // Conference-specific fields
            if (pub.type === 'conference') {
                if (!pub.conferenceType) {
                    const types = ['conference', 'book', 'book-chapter'];
                    updateData.conferenceType = getRandomItem(types);
                }

                if (!pub.isbn) {
                    updateData.isbn = generateISBN();
                }
            }

            // Update the publication if there are changes
            if (Object.keys(updateData).length > 0) {
                await Publication.findByIdAndUpdate(pub._id, updateData);
                updatedCount++;
                console.log(`Updated: ${pub.title}`);
                console.log(`  Added fields: ${Object.keys(updateData).join(', ')}`);
            }
        }

        console.log(`\n✅ Migration complete!`);
        console.log(`   Total publications: ${publications.length}`);
        console.log(`   Updated: ${updatedCount}`);
        console.log(`   Skipped (already had data): ${publications.length - updatedCount}`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
};

// Run the migration
migratePublications();
