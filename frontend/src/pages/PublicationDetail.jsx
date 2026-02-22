import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { publicationsAPI } from '../services/api';
import { FiArrowLeft, FiExternalLink, FiCalendar, FiBook, FiUsers, FiTag, FiAward, FiFileText } from 'react-icons/fi';

const PublicationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [publication, setPublication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPublication();
    }, [id]);

    const fetchPublication = async () => {
        try {
            setLoading(true);
            const response = await publicationsAPI.getById(id);
            setPublication(response.data.publication);
        } catch (error) {
            console.error('Error fetching publication:', error);
            setError('Failed to load publication details');
        } finally {
            setLoading(false);
        }
    };

    // publishedDate is stored as a plain string (dd/mm/yyyy)
    const formatDate = (date) => date || null;

    if (loading) {
        return <div className="loading-container"><div className="loader"></div></div>;
    }

    if (error || !publication) {
        return (
            <div className="home-page">
                <div className="container">
                    <div className="text-center p-xl">
                        <p className="text-muted">{error || 'Publication not found'}</p>
                        <button onClick={() => navigate('/publications')} className="btn btn-primary mt-md">
                            Back to Publications
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isJournal = publication.type === 'journal';
    const isConference = publication.type === 'conference';

    return (
        <div className="home-page">
            <div className="container">
                <button
                    onClick={() => navigate('/publications')}
                    className="btn btn-secondary mb-md"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <FiArrowLeft /> Back to Publications
                </button>

                <div className="section-card">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-lg" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ marginBottom: '1rem' }}>{publication.title}</h1>
                            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                <span className={`badge ${publication.type === 'journal' ? 'badge-primary' : 'badge-success'}`}>
                                    {publication.type === 'journal' ? 'Journal' : 'Conference / Book'}
                                </span>
                                {publication.conferenceSubtype && (
                                    <span className="badge badge-success">
                                        {publication.conferenceSubtype === 'book-paper' ? 'Book Paper' : publication.conferenceSubtype.charAt(0).toUpperCase() + publication.conferenceSubtype.slice(1)}
                                    </span>
                                )}
                                {(publication.journalType || publication.conferenceType) && (
                                    <span className="badge badge-success">
                                        {(publication.journalType || publication.conferenceType).charAt(0).toUpperCase() + (publication.journalType || publication.conferenceType).slice(1)}
                                    </span>
                                )}
                                {publication.paymentType && (
                                    <span className="badge badge-primary">
                                        {publication.paymentType === 'unpaid' ? 'Open Access' : 'Paid'}
                                    </span>
                                )}
                                {publication.department && (
                                    <span className="badge badge-primary">
                                        {publication.department.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Authors */}
                    {((publication.authors && publication.authors.length > 0) || publication.coAuthors) && (
                        <div className="card mb-lg">
                            <div className="flex items-center gap-sm mb-sm">
                                <FiUsers className="text-primary" />
                                <h3 style={{ margin: 0 }}>Authors</h3>
                            </div>
                            <div className="flex flex-column gap-xs">
                                {publication.authors?.map((author) => (
                                    <Link
                                        key={author._id}
                                        to={`/faculty/${author._id}`}
                                        className="text-secondary"
                                        style={{ textDecoration: 'none', fontSize: '1rem' }}
                                    >
                                        {author.name}
                                    </Link>
                                ))}
                                {publication.coAuthors && (
                                    <p className="text-secondary" style={{ margin: 0, fontSize: '1rem' }}>
                                        {publication.coAuthors}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Journal-Specific Information */}
                    {isJournal && (
                        <div className="grid gap-lg mb-lg" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                            {/* Journal Name & Details */}
                            <div className="card">
                                <div className="flex items-center gap-sm mb-sm">
                                    <FiBook className="text-primary" />
                                    <h4 style={{ margin: 0 }}>Journal Information</h4>
                                </div>
                                <p className="text-secondary" style={{ marginBottom: '0.75rem', fontWeight: '500', fontSize: '1.05rem' }}>
                                    {publication.journalName || publication.venue || '—'}
                                </p>
                                <div className="grid gap-xs" style={{ gridTemplateColumns: 'auto 1fr', fontSize: '0.875rem', rowGap: '0.5rem' }}>
                                    {publication.publishedDate && (
                                        <>
                                            <span className="text-muted">Published:</span>
                                            <span className="text-secondary">{publication.publishedDate}</span>
                                        </>
                                    )}
                                    {publication.volume && (
                                        <>
                                            <span className="text-muted">Volume:</span>
                                            <span className="text-secondary">{publication.volume}</span>
                                        </>
                                    )}
                                    {publication.issue && (
                                        <>
                                            <span className="text-muted">Issue:</span>
                                            <span className="text-secondary">{publication.issue}</span>
                                        </>
                                    )}
                                    {publication.pages && (
                                        <>
                                            <span className="text-muted">Pages:</span>
                                            <span className="text-secondary">{publication.pages}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Impact Factor & ISSN */}
                            {(publication.impactFactor || publication.issn) && (
                                <div className="card">
                                    <div className="flex items-center gap-sm mb-sm">
                                        <FiAward className="text-primary" />
                                        <h4 style={{ margin: 0 }}>Journal Metrics</h4>
                                    </div>
                                    <div className="flex flex-column gap-md">
                                        {publication.impactFactor && (
                                            <div>
                                                <p className="text-muted" style={{ fontSize: '0.7rem', margin: 0 }}>Impact Factor</p>
                                                <p className="text-primary" style={{ fontSize: '2rem', fontWeight: '700', margin: '0.25rem 0' }}>
                                                    {publication.impactFactor}
                                                </p>
                                            </div>
                                        )}
                                        {publication.issn && (
                                            <div>
                                                <p className="text-muted" style={{ fontSize: '0.7rem', margin: 0 }}>ISSN</p>
                                                <p className="text-secondary" style={{ fontSize: '1.1rem', fontFamily: 'monospace', margin: '0.25rem 0' }}>
                                                    {publication.issn}
                                                </p>
                                            </div>
                                        )}
                                        {publication.affiliation && (
                                            <div>
                                                <p className="text-muted" style={{ fontSize: '0.7rem', margin: 0 }}>Affiliation</p>
                                                <p className="text-secondary" style={{ margin: '0.25rem 0' }}>
                                                    {publication.affiliation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Indexing */}
                            {publication.indexing && publication.indexing.length > 0 && (
                                <div className="card">
                                    <div className="flex items-center gap-sm mb-sm">
                                        <FiFileText className="text-primary" />
                                        <h4 style={{ margin: 0 }}>Indexing</h4>
                                    </div>
                                    <div className="flex gap-xs" style={{ flexWrap: 'wrap' }}>
                                        {publication.indexing.map((index, idx) => (
                                            <span key={idx} className="badge badge-primary">
                                                {index}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Conference-Specific Information */}
                    {isConference && (
                        <div className="grid gap-lg mb-lg" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                            {/* Conference Name & Details */}
                            <div className="card">
                                <div className="flex items-center gap-sm mb-sm">
                                    <FiBook className="text-primary" />
                                    <h4 style={{ margin: 0 }}>Conference / Book Information</h4>
                                </div>
                                <p className="text-secondary" style={{ marginBottom: '0.75rem', fontWeight: '500', fontSize: '1.05rem' }}>
                                    {publication.conferenceName || publication.venue || '—'}
                                </p>
                                {publication.proceedingsTitle && (
                                    <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem', fontStyle: 'italic' }}>
                                        {publication.proceedingsTitle}
                                    </p>
                                )}
                                <div className="grid gap-xs" style={{ gridTemplateColumns: 'auto 1fr', fontSize: '0.875rem', rowGap: '0.5rem' }}>
                                    {publication.publishedDate && (
                                        <>
                                            <span className="text-muted">Published:</span>
                                            <span className="text-secondary">{publication.publishedDate}</span>
                                        </>
                                    )}
                                    {publication.nameOfPublisher && (
                                        <>
                                            <span className="text-muted">Publisher:</span>
                                            <span className="text-secondary">{publication.nameOfPublisher}</span>
                                        </>
                                    )}
                                    {publication.pages && (
                                        <>
                                            <span className="text-muted">Pages:</span>
                                            <span className="text-secondary">{publication.pages}</span>
                                        </>
                                    )}
                                    {publication.conferenceType && (
                                        <>
                                            <span className="text-muted">Type:</span>
                                            <span className="text-secondary" style={{ textTransform: 'capitalize' }}>{publication.conferenceType}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* ISBN */}
                            {publication.isbn && (
                                <div className="card">
                                    <div className="flex items-center gap-sm mb-sm">
                                        <FiFileText className="text-primary" />
                                        <h4 style={{ margin: 0 }}>ISBN</h4>
                                    </div>
                                    <p className="text-secondary" style={{ fontSize: '1.25rem', fontFamily: 'monospace', margin: 0 }}>
                                        {publication.isbn}
                                    </p>
                                </div>
                            )}

                            {/* Indexing */}
                            {publication.indexing && publication.indexing.length > 0 && (
                                <div className="card">
                                    <div className="flex items-center gap-sm mb-sm">
                                        <FiFileText className="text-primary" />
                                        <h4 style={{ margin: 0 }}>Indexing</h4>
                                    </div>
                                    <div className="flex gap-xs" style={{ flexWrap: 'wrap' }}>
                                        {publication.indexing.map((index, idx) => (
                                            <span key={idx} className="badge badge-primary">
                                                {index}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}



                    {/* Abstract */}
                    {publication.abstract && (
                        <div className="mb-lg">
                            <h3 className="mb-md">Abstract</h3>
                            <p className="text-muted" style={{
                                lineHeight: '1.7',
                                fontSize: '1rem',
                                padding: '1rem',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                borderLeft: '4px solid var(--primary)'
                            }}>
                                {publication.abstract}
                            </p>
                        </div>
                    )}

                    {/* Keywords */}
                    {publication.keywords && publication.keywords.length > 0 && (
                        <div className="mb-lg">
                            <div className="flex items-center gap-sm mb-md">
                                <FiTag className="text-primary" />
                                <h3 style={{ margin: 0 }}>Keywords</h3>
                            </div>
                            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                {publication.keywords.map((keyword, index) => (
                                    <span key={index} className="badge badge-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Links */}
                    <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                        {publication.doi && (
                            <a
                                href={`https://doi.org/${publication.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                View DOI <FiExternalLink />
                            </a>
                        )}
                        {(publication.paperLink || publication.url) && (
                            <a
                                href={publication.paperLink || publication.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                View Paper <FiExternalLink />
                            </a>
                        )}
                        {(publication.journalWebsiteLink || publication.venueUrl) && isJournal && (
                            <a
                                href={publication.journalWebsiteLink || publication.venueUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                Journal Website <FiExternalLink />
                            </a>
                        )}
                        {publication.printJournalContentLink && isJournal && (
                            <a
                                href={publication.printJournalContentLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                Print Content <FiExternalLink />
                            </a>
                        )}
                        {publication.firstPageLink && !isJournal && (
                            <a
                                href={publication.firstPageLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                First Page <FiExternalLink />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicationDetail;
