export const formatDate = (timestamp: number | string): string => {
  if (!timestamp) return ''
  
  try {
    // Convert string to number if needed
    const timeMs = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp
    
    // Create date from milliseconds
    const date = new Date(timeMs)
    
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  } catch (e) {
    console.error('Error formatting date:', timestamp, e)
    return 'Invalid date'
  }
} 