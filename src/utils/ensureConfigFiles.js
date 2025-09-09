// src/utils/ensureConfigFiles.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LEAD_PRICING_PATH = path.join(__dirname, '../config/leadPricing.json');

// Default pricing structure
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

// Ensure the lead pricing JSON file exists and has the correct structure
export const ensureLeadPricingFile = async () => {
  try {
    // Check if file exists
    let needsUpdate = false;
    let pricingData = DEFAULT_PRICING;
    
    if (fs.existsSync(LEAD_PRICING_PATH)) {
      try {
        // Read existing data
        const data = await fs.promises.readFile(LEAD_PRICING_PATH, 'utf8');
        const existingData = JSON.parse(data);
        
        // Check if the structure is correct
        const memberships = ['Subscriber', 'Startup', 'Agency'];
        const leadTypes = ['auto', 'home', 'mortgage'];
        
        // Validate structure and merge with defaults if needed
        needsUpdate = false;
        
        for (const membership of memberships) {
          if (!existingData[membership]) {
            existingData[membership] = DEFAULT_PRICING[membership];
            needsUpdate = true;
          }
          
          for (const type of leadTypes) {
            if (existingData[membership][type] === undefined) {
              existingData[membership][type] = DEFAULT_PRICING[membership][type];
              needsUpdate = true;
            }
          }
        }
        
        pricingData = existingData;
      } catch (err) {
        console.error('Error reading lead pricing file:', err);
        needsUpdate = true;
      }
    } else {
      needsUpdate = true;
    }
    
    // Update file if needed
    if (needsUpdate) {
      await fs.promises.writeFile(
        LEAD_PRICING_PATH, 
        JSON.stringify(pricingData, null, 2),
        'utf8'
      );
      console.log('Lead pricing configuration file created/updated');
    }
    
    return true;
  } catch (err) {
    console.error('Failed to ensure lead pricing file:', err);
    return false;
  }
};
