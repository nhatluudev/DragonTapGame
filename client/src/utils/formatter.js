export const formatFloat = (number) => {
    if (typeof number !== 'number') {
        return 'Invalid input'; // Handle non-number inputs
    }

    return number.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2 // Adjust this if you want more or fewer decimal places
    });
};