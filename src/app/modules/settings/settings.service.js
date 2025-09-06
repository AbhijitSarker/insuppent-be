// src/app/modules/settings/settings.service.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_PATH = path.join(__dirname, '../../../config/brandColor.json');

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
