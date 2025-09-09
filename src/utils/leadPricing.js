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
      return defaultPricing;
    }
    const data = fs.readFileSync(LEAD_PRICING_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading lead pricing file:', err);
    return defaultPricing;
  }
};

export const calculateLeadPrice = (memberLevel, leadType) => {
  const pricing = getPricing();

  const normalizedLevel = String(memberLevel)
  const normalizedType = String(leadType)

  if (!pricing[normalizedLevel] || !pricing[normalizedLevel][normalizedType]) {
    return null;
  }
  return pricing[normalizedLevel][normalizedType];
}