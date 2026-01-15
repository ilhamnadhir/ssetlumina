// Test the URL conversion
const url = "https://drive.google.com/file/d/1BRhAbP2WabMc/view?usp=sharing";

const convertDriveUrl = (url) => {
    if (!url) return url;

    // Remove query parameters like ?usp=sharing
    const cleanUrl = url.split('?')[0];

    // Check if it's a Google Drive link
    const driveMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
        const fileId = driveMatch[1];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    // Check if it's already a direct Drive link
    if (url.includes('drive.google.com/uc?')) {
        return url;
    }

    // Return original URL if not a Drive link
    return url;
};

console.log('Original URL:', url);
console.log('Converted URL:', convertDriveUrl(url));
console.log('\nTest this URL in your browser:');
console.log(convertDriveUrl(url));
