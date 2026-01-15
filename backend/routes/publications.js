import express from 'express';
import Publication from '../models/Publication.js';
import Faculty from '../models/Faculty.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all publications with search and filters
router.get('/', async (req, res) => {
    try {
        const { department, type, year, author, search, page = 1, limit = 20 } = req.query;

        let query = {};

        if (department) query.department = department;
        if (type) query.type = type;
        if (year) query.year = parseInt(year);
        if (author) query.authors = author;

        if (search) {
            query.$text = { $search: search };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const publications = await Publication.find(query)
            .populate('authors', 'name facultyId department')
            .populate('department', 'name code')
            .sort({ year: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Publication.countDocuments(query);

        res.json({
            publications,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get publication by ID
router.get('/:id', async (req, res) => {
    try {
        const publication = await Publication.findById(req.params.id)
            .populate('authors', 'name facultyId department email')
            .populate('department', 'name code')
            .populate('createdBy', 'email role');

        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }

        res.json({ publication });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get publications by faculty
router.get('/faculty/:facultyId', async (req, res) => {
    try {
        const { type, year, search } = req.query;

        let query = { authors: req.params.facultyId };

        if (type) query.type = type;
        if (year) query.year = parseInt(year);
        if (search) {
            query.$text = { $search: search };
        }

        const publications = await Publication.find(query)
            .populate('authors', 'name facultyId')
            .populate('department', 'name code')
            .sort({ year: -1 });

        res.json({ publications, count: publications.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create publication
router.post('/', authenticate, async (req, res) => {
    try {
        const {
            title, authors, type, year, department, abstract, doi, venue,
            volume, issue, pages, publisher, url, keywords,
            publishedDate, venueUrl, affiliation, indexing,
            journalType, issn, impactFactor,
            conferenceType, isbn
        } = req.body;

        // Get user's faculty profile
        const userFaculty = await Faculty.findOne({ userId: req.user._id });

        // If not admin, can only add publications with themselves as author
        if (req.user.role !== 'admin') {
            if (!userFaculty) {
                return res.status(403).json({ message: 'Faculty profile not found' });
            }

            if (!authors.includes(userFaculty._id.toString())) {
                return res.status(403).json({ message: 'You can only add publications where you are an author' });
            }
        }

        const publication = new Publication({
            title,
            authors,
            type,
            year,
            department,
            abstract,
            doi,
            venue,
            volume,
            issue,
            pages,
            publisher,
            url,
            keywords,
            publishedDate,
            venueUrl,
            affiliation,
            indexing,
            journalType,
            issn,
            impactFactor,
            conferenceType,
            isbn,
            createdBy: req.user._id
        });

        await publication.save();

        const populatedPublication = await Publication.findById(publication._id)
            .populate('authors', 'name facultyId')
            .populate('department', 'name code');

        res.status(201).json({
            message: 'Publication created successfully',
            publication: populatedPublication
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update publication
router.put('/:id', authenticate, async (req, res) => {
    try {
        const publication = await Publication.findById(req.params.id);

        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }

        // Check permissions: admin or creator
        const isAdmin = req.user.role === 'admin';
        const isCreator = publication.createdBy.toString() === req.user._id.toString();

        if (!isAdmin && !isCreator) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const {
            title, authors, type, year, department, abstract, doi, venue,
            volume, issue, pages, publisher, url, keywords,
            publishedDate, venueUrl, affiliation, indexing,
            journalType, issn, impactFactor,
            conferenceType, isbn
        } = req.body;

        if (title) publication.title = title;
        if (authors) publication.authors = authors;
        if (type) publication.type = type;
        if (year) publication.year = year;
        if (department) publication.department = department;
        if (abstract) publication.abstract = abstract;
        if (doi) publication.doi = doi;
        if (venue) publication.venue = venue;
        if (volume) publication.volume = volume;
        if (issue) publication.issue = issue;
        if (pages) publication.pages = pages;
        if (publisher) publication.publisher = publisher;
        if (url) publication.url = url;
        if (keywords) publication.keywords = keywords;
        if (publishedDate !== undefined) publication.publishedDate = publishedDate;
        if (venueUrl) publication.venueUrl = venueUrl;
        if (affiliation) publication.affiliation = affiliation;
        if (indexing) publication.indexing = indexing;
        if (journalType !== undefined) publication.journalType = journalType;
        if (issn) publication.issn = issn;
        if (impactFactor !== undefined) publication.impactFactor = impactFactor;
        if (conferenceType !== undefined) publication.conferenceType = conferenceType;
        if (isbn) publication.isbn = isbn;

        await publication.save();

        const updatedPublication = await Publication.findById(publication._id)
            .populate('authors', 'name facultyId')
            .populate('department', 'name code');

        res.json({
            message: 'Publication updated successfully',
            publication: updatedPublication
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete publication
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const publication = await Publication.findById(req.params.id);

        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }

        // Check permissions: admin or creator
        const isAdmin = req.user.role === 'admin';
        const isCreator = publication.createdBy.toString() === req.user._id.toString();

        if (!isAdmin && !isCreator) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Publication.findByIdAndDelete(req.params.id);

        res.json({ message: 'Publication deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
