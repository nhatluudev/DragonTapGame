import moment from 'moment-timezone';

export const formatFloat = (number) => {
    if (typeof number !== 'number') {
        return 'Invalid input'; // Handle non-number inputs
    }

    return number.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2 // Adjust this if you want more or fewer decimal places
    });
};

export const convertUTCToLocalDateTime = (dt) => {
    if (!dt) return null; // Handle undefined or null values
    
    // Convert UTC datetime to Vietnam local time and return as a JavaScript Date object
    return moment(dt).tz('Asia/Ho_Chi_Minh').toDate(); // Return JavaScript Date object
};