export const months = [
  'January', 
  'February', 
  'March', 
  'April', 
  'May', 
  'June',
  'July', 
  'August', 
  'September', 
  'October', 
  'November', 
  'December',
];

// Function to format dates to DD-MM-YYYY
export const formatDate = (dateString: string | undefined, isTimestamp = false) => {
    try {
            const date = dateString ? new Date(dateString) : new Date('2025-05-02T10:42:50');
            if (isNaN(date.getTime())) throw new Error('Invalid date');
            const day = String(date.getDate()).padStart(2, '0');
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (err: any) {
           return (err.message || 'Failed to format dates')
    }
}

// Function to get current month's start and end dates
export const getCurrentMonthDates = () => {
  const today = new Date();
  // Ensure dates are set in local timezone without UTC conversion issues
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const result = {
    startDate: formatDate(startDate), 
    endDate: formatDate(endDate),
  };
  console.log('getCurrentMonthDates result:', result);
  return result;
};