// src/app/modules/settings/settings.controller.js
import { getBrandColor as getBrandColorService, setBrandColor as setBrandColorService } from './settings.service.js';

export const getBrandColor = async (req, res) => {
  try {
    const color = await getBrandColorService();
    res.status(200).json({
      success: true,
      brandColor: color
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get brand color',
      error: error.message
    });
  }
};

export const updateBrandColor = async (req, res) => {
  try {
    const { brandColor } = req.body;
    
    if (!brandColor) {
      return res.status(400).json({
        success: false,
        message: 'Brand color is required'
      });
    }

    await setBrandColorService(brandColor);
    
    res.status(200).json({
      success: true,
      message: 'Brand color updated successfully',
      brandColor
    });
  } catch (error) {
    res.status(error.message.includes('Invalid color format') ? 400 : 500).json({
      success: false,
      message: 'Failed to update brand color',
      error: error.message
    });
  }
};
