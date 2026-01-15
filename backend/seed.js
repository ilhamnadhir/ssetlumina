import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Faculty from './models/Faculty.js';
import Department from './models/Department.js';
import Publication from './models/Publication.js';

dotenv.config();

// Sample data
const departments = [
    { name: 'Computer Science', code: 'CS', description: 'Department of Computer Science and Engineering', established: 1990 },
    { name: 'Electronics', code: 'ECE', description: 'Department of Electronics and Communication Engineering', established: 1985 },
    { name: 'Mechanical', code: 'ME', description: 'Department of Mechanical Engineering', established: 1980 },
    { name: 'Civil', code: 'CE', description: 'Department of Civil Engineering', established: 1975 }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Faculty.deleteMany({});
        await Department.deleteMany({});
        await Publication.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create admin user
        const adminUser = new User({
            email: 'admin@college.edu',
            password: 'Admin@123',
            role: 'admin'
        });
        await adminUser.save();
        console.log('👤 Admin user created');

        // Create departments
        const createdDepts = await Department.insertMany(departments);
        console.log(`📚 Created ${createdDepts.length} departments`);

        // Create sample faculty
        const facultyData = [
            {
                name: 'Dr. Rajesh Kumar',
                facultyId: 'FAC001',
                department: createdDepts[0]._id,
                role: 'Professor',
                email: 'rajesh.kumar@college.edu',
                phone: '+91-9876543210',
                specialization: 'Artificial Intelligence, Machine Learning',
                qualifications: ['Ph.D. in Computer Science', 'M.Tech in AI']
            },
            {
                name: 'Dr. Priya Sharma',
                facultyId: 'FAC002',
                department: createdDepts[0]._id,
                role: 'Associate Professor',
                email: 'priya.sharma@college.edu',
                phone: '+91-9876543211',
                specialization: 'Data Science, Big Data Analytics',
                qualifications: ['Ph.D. in Data Science', 'M.Tech in CSE']
            },
            {
                name: 'Dr. Amit Patel',
                facultyId: 'FAC003',
                department: createdDepts[1]._id,
                role: 'Professor',
                email: 'amit.patel@college.edu',
                phone: '+91-9876543212',
                specialization: 'VLSI Design, Embedded Systems',
                qualifications: ['Ph.D. in Electronics', 'M.Tech in VLSI']
            },
            {
                name: 'Dr. Sneha Reddy',
                facultyId: 'FAC004',
                department: createdDepts[1]._id,
                role: 'Assistant Professor',
                email: 'sneha.reddy@college.edu',
                phone: '+91-9876543213',
                specialization: 'Signal Processing, IoT',
                qualifications: ['Ph.D. in ECE', 'M.Tech in Signal Processing']
            },
            {
                name: 'Dr. Vikram Singh',
                facultyId: 'FAC005',
                department: createdDepts[2]._id,
                role: 'HOD',
                email: 'vikram.singh@college.edu',
                phone: '+91-9876543214',
                specialization: 'Thermal Engineering, CFD',
                qualifications: ['Ph.D. in Mechanical Engineering', 'M.Tech in Thermal']
            }
        ];

        const createdFaculty = [];
        for (const fac of facultyData) {
            const user = new User({
                email: fac.email,
                password: 'Faculty@123',
                role: 'faculty'
            });
            await user.save();

            const faculty = new Faculty({
                ...fac,
                userId: user._id
            });
            await faculty.save();

            user.facultyId = faculty._id;
            await user.save();

            createdFaculty.push(faculty);
        }
        console.log(`👨‍🏫 Created ${createdFaculty.length} faculty members`);

        // Create sample publications
        const publications = [
            {
                title: 'Deep Learning Approaches for Image Classification',
                authors: [createdFaculty[0]._id, createdFaculty[1]._id],
                type: 'journal',
                year: 2023,
                department: createdDepts[0]._id,
                abstract: 'This paper presents novel deep learning approaches for image classification tasks.',
                venue: 'IEEE Transactions on Neural Networks',
                volume: '34',
                issue: '5',
                pages: '1234-1245',
                doi: '10.1109/TNN.2023.12345',
                keywords: ['Deep Learning', 'Image Classification', 'CNN'],
                createdBy: adminUser._id
            },
            {
                title: 'Scalable Big Data Analytics Framework',
                authors: [createdFaculty[1]._id],
                type: 'conference',
                year: 2023,
                department: createdDepts[0]._id,
                abstract: 'A novel framework for processing large-scale data efficiently.',
                venue: 'International Conference on Big Data',
                pages: '45-52',
                doi: '10.1145/ICBD.2023.001',
                keywords: ['Big Data', 'Analytics', 'Hadoop'],
                createdBy: adminUser._id
            },
            {
                title: 'Advanced VLSI Design Techniques',
                authors: [createdFaculty[2]._id],
                type: 'journal',
                year: 2022,
                department: createdDepts[1]._id,
                abstract: 'Novel techniques for optimizing VLSI circuit design.',
                venue: 'Journal of VLSI Design',
                volume: '28',
                issue: '3',
                pages: '234-248',
                doi: '10.1016/JVLSI.2022.003',
                keywords: ['VLSI', 'Circuit Design', 'Optimization'],
                createdBy: adminUser._id
            },
            {
                title: 'IoT-based Smart Home Automation',
                authors: [createdFaculty[3]._id, createdFaculty[2]._id],
                type: 'conference',
                year: 2023,
                department: createdDepts[1]._id,
                abstract: 'Implementation of smart home automation using IoT technologies.',
                venue: 'IEEE International Conference on IoT',
                pages: '112-119',
                doi: '10.1109/IoT.2023.456',
                keywords: ['IoT', 'Smart Home', 'Automation'],
                createdBy: adminUser._id
            },
            {
                title: 'Computational Fluid Dynamics in Turbine Design',
                authors: [createdFaculty[4]._id],
                type: 'journal',
                year: 2023,
                department: createdDepts[2]._id,
                abstract: 'Application of CFD techniques in optimizing turbine blade design.',
                venue: 'International Journal of Mechanical Engineering',
                volume: '45',
                issue: '2',
                pages: '78-92',
                doi: '10.1016/IJME.2023.002',
                keywords: ['CFD', 'Turbine', 'Optimization'],
                createdBy: adminUser._id
            }
        ];

        await Publication.insertMany(publications);
        console.log(`📄 Created ${publications.length} publications`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('Admin: admin@college.edu / Admin@123');
        console.log('Faculty: rajesh.kumar@college.edu / Faculty@123');
        console.log('         priya.sharma@college.edu / Faculty@123');
        console.log('         (and other faculty emails with Faculty@123)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
