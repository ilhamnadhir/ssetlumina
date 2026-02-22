import mongoose from 'mongoose';

const publicationSchema = new mongoose.Schema({
    // --- Required ---
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['journal', 'conference'],
        required: true
    },

    // --- Common optional fields ---
    authors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
    }],
    coAuthors: {
        // Free-text list of co-author names (non-faculty / external)
        type: String,
        trim: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    doi: {
        type: String,
        trim: true
    },
    publishedDate: {
        // Stored as dd/mm/yyyy string as entered by user
        type: String,
        trim: true
    },
    indexing: [{
        type: String,
        trim: true
    }],
    abstract: {
        type: String,
        trim: true
    },
    keywords: [{
        type: String,
        trim: true
    }],

    // --- Journal-specific fields ---
    journalName: {
        type: String,
        trim: true
    },
    paymentType: {
        type: String,
        enum: ['unpaid', 'paid', ''],
        default: ''
    },
    paperLink: {
        type: String,
        trim: true
    },
    journalWebsiteLink: {
        type: String,
        trim: true
    },
    journalType: {
        type: String,
        enum: ['international', 'national', ''],
        default: ''
    },
    printJournalContentLink: {
        type: String,
        trim: true
    },
    issn: {
        type: String,
        trim: true
    },
    impactFactor: {
        type: Number,
        min: 0
    },
    affiliation: {
        type: String,
        trim: true
    },
    // Journal optional extras
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

    // --- Conference/Book/Book-Paper specific fields ---
    conferenceSubtype: {
        // The specific category within 'conference' type
        type: String,
        enum: ['conference', 'book', 'book-paper', ''],
        default: ''
    },
    conferenceType: {
        // International or national
        type: String,
        enum: ['international', 'national', ''],
        default: ''
    },
    conferenceName: {
        type: String,
        trim: true
    },
    proceedingsTitle: {
        type: String,
        trim: true
    },
    isbn: {
        type: String,
        trim: true
    },
    nameOfPublisher: {
        type: String,
        trim: true
    },
    firstPageLink: {
        type: String,
        trim: true
    },

    // --- Legacy / kept for backwards compat ---
    venue: {
        type: String,
        trim: true
    },
    venueUrl: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        trim: true
    },
    publisher: {
        type: String,
        trim: true
    },
    year: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear() + 1
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
publicationSchema.index({ title: 'text', abstract: 'text', journalName: 'text', conferenceName: 'text', proceedingsTitle: 'text' });
publicationSchema.index({ type: 1 });
publicationSchema.index({ department: 1 });

export default mongoose.model('Publication', publicationSchema);
