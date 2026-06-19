import User from './models/User.js';
import Faculty from './models/Faculty.js';
import Department from './models/Department.js';
import Publication from './models/Publication.js';

const departments = [
    { name: 'M.Tech-EE', code: 'MTEEE', description: 'M.Tech - Electrical Engineering', established: 2010 },
    { name: 'M.Tech-CSE', code: 'MTCSE', description: 'M.Tech - Computer Science and Engineering', established: 2012 },
    { name: 'MCA', code: 'MCA', description: 'Master of Computer Applications', established: 2005 },
    { name: 'B.Tech-CSE', code: 'BTCSE', description: 'B.Tech - Computer Science and Engineering', established: 1990 },
    { name: 'B.Tech-AI&DS', code: 'BTAIDS', description: 'B.Tech - Artificial Intelligence and Data Science', established: 2020 },
    { name: 'B.Tech-ECE', code: 'BTECE', description: 'B.Tech - Electronics and Communication Engineering', established: 1985 },
    { name: 'B.Tech-ECE(VLSI)', code: 'BTECEV', description: 'B.Tech - ECE (VLSI)', established: 2021 },
    { name: 'B.Tech-EEE', code: 'BTEEE', description: 'B.Tech - Electrical and Electronics Engineering', established: 1995 },
    { name: 'B.Tech-ME', code: 'BTME', description: 'B.Tech - Mechanical Engineering', established: 1980 },
    { name: 'B.Tech-AU', code: 'BTAU', description: 'B.Tech - Automobile Engineering', established: 2008 },
    { name: 'B.Tech-CE', code: 'BTCE', description: 'B.Tech - Civil Engineering', established: 1975 }
];

export async function autoSeedIfEmpty() {
    try {
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            console.log('📦 Database already has data, skipping auto-seed.');
            return;
        }

        console.log('🌱 Empty database detected, auto-seeding...');

        // Create admin user
        const adminUser = new User({ email: 'admin@college.edu', password: 'Admin@123', role: 'admin' });
        await adminUser.save();
        console.log('👤 Admin user created: admin@college.edu / Admin@123');

        // Create departments
        const createdDepts = await Department.insertMany(departments);
        console.log(`📚 Created ${createdDepts.length} departments`);

        // Create sample faculty
        const facultyData = [
            { name: 'Dr. Rajesh Kumar', facultyId: 'FAC001', department: createdDepts[0]._id, role: 'Professor', email: 'rajesh.kumar@college.edu', phone: '+91-9876543210', specialization: 'Artificial Intelligence, Machine Learning', qualifications: ['Ph.D. in Computer Science', 'M.Tech in AI'] },
            { name: 'Dr. Priya Sharma', facultyId: 'FAC002', department: createdDepts[0]._id, role: 'Associate Professor', email: 'priya.sharma@college.edu', phone: '+91-9876543211', specialization: 'Data Science, Big Data Analytics', qualifications: ['Ph.D. in Data Science', 'M.Tech in CSE'] },
            { name: 'Dr. Amit Patel', facultyId: 'FAC003', department: createdDepts[1]._id, role: 'Professor', email: 'amit.patel@college.edu', phone: '+91-9876543212', specialization: 'VLSI Design, Embedded Systems', qualifications: ['Ph.D. in Electronics', 'M.Tech in VLSI'] },
            { name: 'Dr. Sneha Reddy', facultyId: 'FAC004', department: createdDepts[1]._id, role: 'Assistant Professor', email: 'sneha.reddy@college.edu', phone: '+91-9876543213', specialization: 'Signal Processing, IoT', qualifications: ['Ph.D. in ECE', 'M.Tech in Signal Processing'] },
            { name: 'Dr. Vikram Singh', facultyId: 'FAC005', department: createdDepts[2]._id, role: 'HOD', email: 'vikram.singh@college.edu', phone: '+91-9876543214', specialization: 'Thermal Engineering, CFD', qualifications: ['Ph.D. in Mechanical Engineering', 'M.Tech in Thermal'] }
        ];

        const createdFaculty = [];
        for (const fac of facultyData) {
            const user = new User({ email: fac.email, password: 'Faculty@123', role: 'faculty' });
            await user.save();
            const faculty = new Faculty({ ...fac, userId: user._id });
            await faculty.save();
            user.facultyId = faculty._id;
            await user.save();
            createdFaculty.push(faculty);
        }
        console.log(`👨‍🏫 Created ${createdFaculty.length} faculty members`);

        // Create sample publications
        const publications = [
            { title: 'Deep Learning Approaches for Image Classification', authors: [createdFaculty[0]._id, createdFaculty[1]._id], type: 'journal', year: 2023, department: createdDepts[0]._id, abstract: 'This paper presents novel deep learning approaches for image classification tasks.', venue: 'IEEE Transactions on Neural Networks', volume: '34', issue: '5', pages: '1234-1245', doi: '10.1109/TNN.2023.12345', keywords: ['Deep Learning', 'Image Classification', 'CNN'], createdBy: adminUser._id },
            { title: 'Scalable Big Data Analytics Framework', authors: [createdFaculty[1]._id], type: 'conference', year: 2023, department: createdDepts[0]._id, abstract: 'A novel framework for processing large-scale data efficiently.', venue: 'International Conference on Big Data', pages: '45-52', doi: '10.1145/ICBD.2023.001', keywords: ['Big Data', 'Analytics', 'Hadoop'], createdBy: adminUser._id },
            { title: 'Advanced VLSI Design Techniques', authors: [createdFaculty[2]._id], type: 'journal', year: 2022, department: createdDepts[1]._id, abstract: 'Novel techniques for optimizing VLSI circuit design.', venue: 'Journal of VLSI Design', volume: '28', issue: '3', pages: '234-248', doi: '10.1016/JVLSI.2022.003', keywords: ['VLSI', 'Circuit Design', 'Optimization'], createdBy: adminUser._id },
            { title: 'IoT-based Smart Home Automation', authors: [createdFaculty[3]._id, createdFaculty[2]._id], type: 'conference', year: 2023, department: createdDepts[1]._id, abstract: 'Implementation of smart home automation using IoT technologies.', venue: 'IEEE International Conference on IoT', pages: '112-119', doi: '10.1109/IoT.2023.456', keywords: ['IoT', 'Smart Home', 'Automation'], createdBy: adminUser._id },
            { title: 'Computational Fluid Dynamics in Turbine Design', authors: [createdFaculty[4]._id], type: 'journal', year: 2023, department: createdDepts[2]._id, abstract: 'Application of CFD techniques in optimizing turbine blade design.', venue: 'International Journal of Mechanical Engineering', volume: '45', issue: '2', pages: '78-92', doi: '10.1016/IJME.2023.002', keywords: ['CFD', 'Turbine', 'Optimization'], createdBy: adminUser._id }
        ];

        await Publication.insertMany(publications);
        console.log(`📄 Created ${publications.length} publications`);

        console.log('✅ Auto-seed complete! Login: admin@college.edu / Admin@123');
    } catch (error) {
        console.error('❌ Auto-seed error:', error.message);
    }
}

export async function ensureGuestUser() {
    try {
        const email = 'guest@college.edu';
        let user = await User.findOne({ email });
        if (!user) {
            console.log('🌱 Guest user not found, creating guest account...');
            // Find a department to associate
            let department = await Department.findOne();
            if (!department) {
                // Create a fallback department if none exist
                department = new Department({
                    name: 'Computer Science and Engineering',
                    code: 'CSE',
                    description: 'Computer Science & Engineering Department'
                });
                await department.save();
            }

            user = new User({
                email,
                password: 'GuestPassword123!',
                role: 'faculty'
            });
            await user.save();

            const faculty = new Faculty({
                name: 'Guest User',
                facultyId: 'FACGUEST',
                department: department._id,
                role: 'Assistant Professor',
                email,
                phone: '+91-0000000000',
                specialization: 'Demo Guest Account',
                qualifications: ['B.Tech'],
                userId: user._id
            });
            await faculty.save();

            user.facultyId = faculty._id;
            await user.save();
            console.log('✅ Guest user created: guest@college.edu / GuestPassword123!');
        } else {
            console.log('📦 Guest user already exists: guest@college.edu');
        }
    } catch (err) {
        console.error('❌ Error ensuring guest user:', err.message);
    }
}
