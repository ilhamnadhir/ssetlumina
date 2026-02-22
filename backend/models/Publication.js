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

    academicYear: {
        type: String, // e.g., "2025-26"
        trim: true,
        index: true
    },
    yearStr: {
        type: String, // String version of year for text indexing
        index: true
    },
    dateForFilter: {
        type: Date,
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Pre-save middleware to calculate academicYear, dateForFilter, and yearStr
publicationSchema.pre('save', function (next) {
    // Handle yearStr for text indexing
    if (this.year) {
        this.yearStr = this.year.toString();
    }

    if (this.publishedDate) {
        try {
            const [day, month, year] = this.publishedDate.split('/').map(Number);
            if (day && month && year) {
                const date = new Date(year, month - 1, day);
                this.dateForFilter = date;

                // Academic Year Logic: June (6) to May (5)
                const academicStartYear = month >= 6 ? year : year - 1;
                const academicEndYearString = (academicStartYear + 1).toString().slice(-2);
                this.academicYear = `${academicStartYear}-${academicEndYearString}`;

                // If year field is empty or mismatch, update it
                this.year = year;
                this.yearStr = year.toString();
            }
        } catch (err) {
            console.error('Error calculating academic year:', err);
        }
    } else if (this.year && !this.academicYear) {
        // Fallback for legacy data with only year: assume it matches calendar year mostly or just leave academicYear blank
        // To be safe, let's not guess academic year for legacy data if we only have year number
        this.yearStr = this.year.toString();
    }
    next();
});

// Indexes for efficient searching
publicationSchema.index({
    title: 'text',
    abstract: 'text',
    journalName: 'text',
    conferenceName: 'text',
    proceedingsTitle: 'text',
    academicYear: 'text',
    yearStr: 'text',
    publishedDate: 'text'
});
publicationSchema.index({ type: 1 });
publicationSchema.index({ department: 1 });

export default mongoose.model('Publication', publicationSchema);
