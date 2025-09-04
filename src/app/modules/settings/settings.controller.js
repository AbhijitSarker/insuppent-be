// src/app/modules/settings/settings.controller.js
import { getBrandColor as getBrandColorService, setBrandColor as setBrandColorService } from './settings.service.js';

export const getBrandColor = async (req, res) => {
  const color = await getBrandColorService();
  res.json({ brandColor: color });
};

export const updateBrandColor = async (req, res) => {
  const { brandColor } = req.body;
  await setBrandColorService(brandColor);
  res.json({ success: true, brandColor });
};
