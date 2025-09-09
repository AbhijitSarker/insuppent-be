// src/app/modules/settings/settings.service.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resetPricingCache } from '../../../utils/leadPricing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_PATH = path.join(__dirname, '../../../config/brandColor.json');
const LEAD_PRICING_PATH = path.join(__dirname, '../../../config/leadPricing.json');

// Default pricing object
const DEFAULT_PRICING = {
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
    // Get existing pricing data
    let existingPricing;
    try {
      const data = await fs.promises.readFile(LEAD_PRICING_PATH, 'utf8');
      existingPricing = JSON.parse(data);
    } catch (err) {
      console.log('Could not read existing pricing, using default');
      existingPricing = DEFAULT_PRICING;
    }
    
    // Validate pricing structure
    const requiredMemberships = ['Subscriber', 'Startup', 'Agency'];
    const requiredTypes = ['auto', 'home', 'mortgage'];
    
    // Merge the new pricing with existing pricing
    const updatedPricing = { ...existingPricing };
    
    // Only update the values that are provided
    for (const membership of Object.keys(pricing)) {
      // Case-insensitive match against required memberships
      const matchedMembership = requiredMemberships.find(
        m => m.toLowerCase() === membership.toLowerCase()
      );
      
      if (matchedMembership) {
        // Use the correctly cased membership from our requirements
        if (!updatedPricing[matchedMembership]) {
          updatedPricing[matchedMembership] = {};
        }
        
        // Update specific lead types if provided
        for (const type of Object.keys(pricing[membership])) {
          if (requiredTypes.includes(type)) {
            const value = pricing[membership][type];
            
            // Ensure values are numbers
            if (isNaN(parseFloat(value))) {
              throw new Error(`Invalid price value for ${matchedMembership}.${type}`);
            }
            
            // Format to 2 decimal places
            updatedPricing[matchedMembership][type] = parseFloat(value).toFixed(2);
          }
        }
      }
    }
    
    // Ensure all required fields exist
    for (const membership of requiredMemberships) {
      if (!updatedPricing[membership]) {
        updatedPricing[membership] = DEFAULT_PRICING[membership];
      }
      
      for (const type of requiredTypes) {
        if (updatedPricing[membership][type] === undefined) {
          updatedPricing[membership][type] = DEFAULT_PRICING[membership][type];
        }
      }
    }
    
    await fs.promises.writeFile(LEAD_PRICING_PATH, JSON.stringify(updatedPricing, null, 2), 'utf8');
    // Reset the cache so calculateLeadPrice will use the new prices
    resetPricingCache();
    return updatedPricing;
  } catch (err) {
    throw new Error('Failed to save lead pricing: ' + err.message);
  }
};
