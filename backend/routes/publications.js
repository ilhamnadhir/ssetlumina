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
            .sort({ createdAt: -1 })
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
            .sort({ createdAt: -1 });

        res.json({ publications, count: publications.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create publication
router.post('/', authenticate, async (req, res) => {
    try {
        const {
            title, type, authors, coAuthors, department,
            doi, publishedDate, indexing, abstract, keywords,
            // Journal fields
            journalName, paymentType, paperLink, journalWebsiteLink,
            journalType, issn, impactFactor, affiliation,
            volume, issue, pages,
            // Conference/Book fields
            conferenceSubtype, conferenceType, conferenceName, proceedingsTitle,
            isbn, nameOfPublisher, firstPageLink,
            // Legacy
            venue, venueUrl, url, publisher, year
        } = req.body;

        // Get user's faculty profile
        const userFaculty = await Faculty.findOne({ userId: req.user._id });

        // If not admin, can only add publications with themselves as author
        if (req.user.role !== 'admin') {
            if (!userFaculty) {
                return res.status(403).json({ message: 'Faculty profile not found' });
            }

            if (authors && authors.length > 0 && !authors.includes(userFaculty._id.toString())) {
                return res.status(403).json({ message: 'You can only add publications where you are an author' });
            }
        }

        const publication = new Publication({
            title,
            type,
            authors: authors || [],
            coAuthors,
            department,
            doi,
            publishedDate,
            indexing,
            abstract,
            keywords,
            // Journal
            journalName,
            paymentType,
            paperLink,
            journalWebsiteLink,
            journalType,
            issn,
            impactFactor: impactFactor ? parseFloat(impactFactor) : undefined,
            affiliation,
            volume,
            issue,
            pages,
            // Conference/Book
            conferenceSubtype,
            conferenceType,
            conferenceName,
            proceedingsTitle,
            isbn,
            nameOfPublisher,
            firstPageLink,
            // Legacy
            venue,
            venueUrl,
            url,
            publisher,
            year,
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
            title, type, authors, coAuthors, department,
            doi, publishedDate, indexing, abstract, keywords,
            journalName, paymentType, paperLink, journalWebsiteLink,
            journalType, issn, impactFactor, affiliation,
            volume, issue, pages,
            conferenceSubtype, conferenceType, conferenceName, proceedingsTitle,
            isbn, nameOfPublisher, firstPageLink,
            venue, venueUrl, url, publisher, year
        } = req.body;

        if (title !== undefined) publication.title = title;
        if (type !== undefined) publication.type = type;
        if (authors !== undefined) publication.authors = authors;
        if (coAuthors !== undefined) publication.coAuthors = coAuthors;
        if (department !== undefined) publication.department = department;
        if (doi !== undefined) publication.doi = doi;
        if (publishedDate !== undefined) publication.publishedDate = publishedDate;
        if (indexing !== undefined) publication.indexing = indexing;
        if (abstract !== undefined) publication.abstract = abstract;
        if (keywords !== undefined) publication.keywords = keywords;
        // Journal
        if (journalName !== undefined) publication.journalName = journalName;
        if (paymentType !== undefined) publication.paymentType = paymentType;
        if (paperLink !== undefined) publication.paperLink = paperLink;
        if (journalWebsiteLink !== undefined) publication.journalWebsiteLink = journalWebsiteLink;
        if (journalType !== undefined) publication.journalType = journalType;
        if (issn !== undefined) publication.issn = issn;
        if (impactFactor !== undefined) publication.impactFactor = impactFactor ? parseFloat(impactFactor) : undefined;
        if (affiliation !== undefined) publication.affiliation = affiliation;
        if (volume !== undefined) publication.volume = volume;
        if (issue !== undefined) publication.issue = issue;
        if (pages !== undefined) publication.pages = pages;
        // Conference/Book
        if (conferenceSubtype !== undefined) publication.conferenceSubtype = conferenceSubtype;
        if (conferenceType !== undefined) publication.conferenceType = conferenceType;
        if (conferenceName !== undefined) publication.conferenceName = conferenceName;
        if (proceedingsTitle !== undefined) publication.proceedingsTitle = proceedingsTitle;
        if (isbn !== undefined) publication.isbn = isbn;
        if (nameOfPublisher !== undefined) publication.nameOfPublisher = nameOfPublisher;
        if (firstPageLink !== undefined) publication.firstPageLink = firstPageLink;
        // Legacy
        if (venue !== undefined) publication.venue = venue;
        if (venueUrl !== undefined) publication.venueUrl = venueUrl;
        if (url !== undefined) publication.url = url;
        if (publisher !== undefined) publication.publisher = publisher;
        if (year !== undefined) publication.year = year;

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
