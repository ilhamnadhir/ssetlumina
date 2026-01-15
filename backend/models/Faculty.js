import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    facultyId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    role: {
        type: String,
        enum: ['HOD', 'Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'],
        required: true
    },
    profilePhoto: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    specialization: {
        type: String,
        trim: true
    },
    qualifications: [{
        type: String
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for publication count
facultySchema.virtual('publicationCount', {
    ref: 'Publication',
    localField: '_id',
    foreignField: 'authors',
    count: true
});

export default mongoose.model('Faculty', facultySchema);
