
/**
 * Converts English digits to Nepali digits if the language is set to 'ne'
 * @param {string|number} input - The string or number to convert
 * @param {string} language - The current language ('en' or 'ne')
 * @returns {string} - The localized string
 */
export const localizeDigits = (input, language) => {
    if (language !== 'ne') return String(input);

    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return String(input).replace(/[0-9]/g, (digit) => nepaliDigits[parseInt(digit)]);
};
