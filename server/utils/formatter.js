export function formatNamiId(input) {
    // Ensure input is a string and trim any extra spaces
    let namiId = input.trim();

    // Format the first 4 characters as "Nami"
    let formattedPrefix = "Nami";

    // Get the last 10 characters of the input and convert them to uppercase
    let formattedSuffix = namiId.slice(-10).toUpperCase();

    // Combine the formatted prefix and the formatted suffix
    return formattedPrefix + formattedSuffix;
}

export const formatFloat = (number) => {
    if (typeof number !== 'number') {
        return 'Invalid input'; // Handle non-number inputs
    }

    return number.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2 // Adjust this if you want more or fewer decimal places
    });
};