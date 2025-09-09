import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LEAD_PRICING_PATH = path.join(__dirname, '../config/leadPricing.json');

// Default pricing if file can't be read
const defaultPricing = {
  Subscriber: {
    auto: 20.50,
    home: 20.50,
    mortgage: 20.50,
  },
  Startup: {
    auto: 20.50,
    home: 20.50,
    mortgage: 20.50,
  },
  Agency: {
    auto: 20.50,
    home: 20.50,
    mortgage: 20.50,
  }
};

// Get pricing from file or use default
const getPricing = () => {
  try {
    if (!fs.existsSync(LEAD_PRICING_PATH)) {
      // If the file doesn't exist, create it with the default pricing
      fs.writeFileSync(LEAD_PRICING_PATH, JSON.stringify(defaultPricing, null, 2), 'utf8');
      return defaultPricing;
    }
    const data = fs.readFileSync(LEAD_PRICING_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading lead pricing file:', err);
    return defaultPricing;
  }
};

// Cache the pricing data to avoid reading the file on every request
let cachedPricing = null;
let lastCacheTime = 0;
const CACHE_TTL = 60000; // 1 minute TTL for cache

// Get pricing with cache
const getCachedPricing = () => {
  const now = Date.now();
  if (!cachedPricing || now - lastCacheTime > CACHE_TTL) {
    cachedPricing = getPricing();
    lastCacheTime = now;
  }
  return cachedPricing;
};

export const calculateLeadPrice = (memberLevel, leadType) => {
  const pricing = getCachedPricing();

  // Normalize inputs for case-insensitive comparison
  const normalizedLevel = String(memberLevel).charAt(0).toUpperCase() + String(memberLevel).slice(1).toLowerCase();
  const normalizedType = String(leadType).toLowerCase();

  if (!pricing[normalizedLevel] || !pricing[normalizedLevel][normalizedType]) {
    console.warn(`Price not found for ${normalizedLevel} - ${normalizedType}`);
    return null;
  }
  return parseFloat(pricing[normalizedLevel][normalizedType]);
}

// Get the full pricing data
export const getPricingData = () => {
  return getCachedPricing();
};

// Reset the pricing cache
export const resetPricingCache = () => {
  cachedPricing = null;
  lastCacheTime = 0;
};