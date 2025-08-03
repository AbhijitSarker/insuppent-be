/**
 * Utility function that selects specific properties from an object
 * 
 * @param obj - The source object to pick properties from
 * @param keys - Array of keys to select from the source object
 * @returns A new object containing only the specified keys and their values
 * 
 * @example
 * // Returns { name: 'John', age: 30 }
 * pick({ name: 'John', age: 30, email: 'john@example.com' }, ['name', 'age']);
 * 
 * @example
 * // For filtering API query parameters
 * const filters = pick(req.query, ['status', 'category']);
 */
const pick = (obj, keys) => {
  const finalObj = {};

  for (const key of keys) {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      finalObj[key] = obj[key];
    }
  }
  return finalObj;
};

export default pick;
