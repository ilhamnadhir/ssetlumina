import mongoose from 'mongoose';

const publicationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    authors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    }],
    type: {
        type: String,
        enum: ['journal', 'conference'],
        required: true
    },
    year: {
        type: Number,
        required: true,
        min: 1900,
        max: new Date().getFullYear() + 1
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    abstract: {
        type: String,
        trim: true
    },
    doi: {
        type: String,
        trim: true
    },
    venue: {
        type: String,
        required: true,
        trim: true
    },
    volume: {
        type: String,
        trim: true
    },
    issue: {
        type: String,
        trim: true
    },
    pages: {
        type: String,
        trim: true
    },
    publisher: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        trim: true
    },
    keywords: [{
        type: String,
        trim: true
    }],
    // Common fields
    publishedDate: {
        type: Date
    },
    venueUrl: {
        type: String,
        trim: true
    },
    affiliation: {
        type: String,
        trim: true
    },
    indexing: [{
        type: String,
        trim: true
    }],
    // Journal-specific fields
    journalType: {
        type: String,
        enum: ['international', 'national', ''],
        default: ''
    },
    issn: {
        type: String,
        trim: true
    },
    impactFactor: {
        type: Number,
        min: 0
    },
    // Conference-specific fields
    conferenceType: {
        type: String,
        enum: ['conference', 'book', 'book-chapter', ''],
        default: ''
    },
    isbn: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for efficient searching
publicationSchema.index({ title: 'text', abstract: 'text', venue: 'text' });
publicationSchema.index({ year: -1 });
publicationSchema.index({ type: 1 });
publicationSchema.index({ department: 1 });

export default mongoose.model('Publication', publicationSchema);
