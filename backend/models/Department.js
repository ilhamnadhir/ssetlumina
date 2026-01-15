import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    established: {
        type: Number,
        min: 1900
    },
    head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for faculty count
departmentSchema.virtual('facultyCount', {
    ref: 'Faculty',
    localField: '_id',
    foreignField: 'department',
    count: true
});

export default mongoose.model('Department', departmentSchema);
