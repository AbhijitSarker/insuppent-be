// src/app/modules/settings/settings.service.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_PATH = path.join(__dirname, '../../../config/brandColor.json');
const LEAD_PRICING_PATH = path.join(__dirname, '../../../config/leadPricing.json');

// Default pricing object
const DEFAULT_PRICING = {
  subscriber: {
    auto: 20.50,
    home: 20.50,
    mortgage: 20.50,
  },
  startup: {
    auto: 20.50,
    home: 20.50,
    mortgage: 20.50,
  },
  agency: {
    auto: 20.50,
    home: 20.50,
    mortgage: 20.50,
  }
};

export const getBrandColor = async () => {
  try {
    const data = await fs.promises.readFile(SETTINGS_PATH, 'utf8');
    return JSON.parse(data).brandColor || '#2563EB';
  } catch (err) {
    return '#2563EB'; // default
  }
};

export const setBrandColor = async (color) => {
  try {
    // Validate color format (hex color code)
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      throw new Error('Invalid color format');
    }
    
    await fs.promises.writeFile(SETTINGS_PATH, JSON.stringify({ brandColor: color }, null, 2), 'utf8');
    return true;
  } catch (err) {
    throw new Error('Failed to save brand color: ' + err.message);
  }
};

// Get lead pricing from JSON file
export const getLeadPricing = async () => {
  try {
    // Create the file if it doesn't exist
    if (!fs.existsSync(LEAD_PRICING_PATH)) {
      await fs.promises.writeFile(LEAD_PRICING_PATH, JSON.stringify(DEFAULT_PRICING, null, 2), 'utf8');
      return DEFAULT_PRICING;
    }
    
    const data = await fs.promises.readFile(LEAD_PRICING_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading lead pricing:', err);
    return DEFAULT_PRICING;
  }
};

// Set lead pricing in JSON file
export const setLeadPricing = async (pricing) => {
  try {
    // Validate pricing structure
    const requiredMemberships = ['subscriber', 'startup', 'agency'];
    const requiredTypes = ['auto', 'home', 'mortgage'];
    
    // Check if pricing has required memberships
    for (const membership of requiredMemberships) {
      if (!pricing[membership]) {
        throw new Error(`Missing required membership: ${membership}`);
      }
      
      // Check if membership has required lead types
      for (const type of requiredTypes) {
        if (pricing[membership][type] === undefined) {
          throw new Error(`Missing required lead type ${type} for ${membership}`);
        }
        
        // Ensure values are numbers
        if (isNaN(parseFloat(pricing[membership][type]))) {
          throw new Error(`Invalid price value for ${membership}.${type}`);
        }
        
        // Format to 2 decimal places
        pricing[membership][type] = parseFloat(pricing[membership][type]).toFixed(2);
      }
    }
    
    await fs.promises.writeFile(LEAD_PRICING_PATH, JSON.stringify(pricing, null, 2), 'utf8');
    return pricing;
  } catch (err) {
    throw new Error('Failed to save lead pricing: ' + err.message);
  }
};
