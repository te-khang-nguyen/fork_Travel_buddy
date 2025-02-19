// Utility function to format date
export const formatDate = (dateString: string, format: 'full' | 'short' = 'full') => {
    const date = new Date(dateString);
    
    if (format === 'short') {
        // Short format: e.g., "Feb 18"
        return date.toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Full format
    return date.toLocaleString('en-GB', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })
    .replace(',', ' ')
    .replace(/\//g, '-');
};