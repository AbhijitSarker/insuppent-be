// src/app/modules/settings/settings.service.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_PATH = path.join(__dirname, '../../../config/brandColor.json');

export const getBrandColor = () => {
  try {
    const data = fs.readFileSync(SETTINGS_PATH, 'utf8');
    return JSON.parse(data).brandColor || '#2563EB';
  } catch (err) {
    return '#2563EB'; // default
  }
};

export const setBrandColor = (color) => {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify({ brandColor: color }), 'utf8');
};
