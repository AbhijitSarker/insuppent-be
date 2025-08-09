import zipcodes from 'zipcodes';

/**
 * Get state from zip code
 * @param {string} zipCode - The zip code to lookup
 * @returns {string|null} The state abbreviation or null if not found
 */
export const getStateFromZipCode = zipCode => {
  if (!zipCode) return null;

  const cleanZipCode = zipCode.trim();
  const locationInfo = zipcodes.lookup(cleanZipCode);
  return locationInfo?.state || null;
};

/**
 * Validate if a zip code is valid
 * @param {string} zipCode - The zip code to validate
 * @returns {boolean} Whether the zip code is valid
 */
export const isValidZipCode = zipCode => {
  if (!zipCode) return false;

  const cleanZipCode = zipCode.trim();
  return zipcodes.lookup(cleanZipCode) !== undefined;
};
