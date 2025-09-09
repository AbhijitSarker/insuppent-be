// src/app/modules/settings/settings.controller.js
import { getBrandColor as getBrandColorService, setBrandColor as setBrandColorService, getLeadPricing as getLeadPricingService, setLeadPricing as setLeadPricingService } from './settings.service.js';

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

export const getLeadPricing = async (req, res) => {
  try {
    const pricing = await getLeadPricingService();
    res.status(200).json({
      success: true,
      pricing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get lead pricing',
      error: error.message
    });
  }
};

export const updateLeadPricing = async (req, res) => {
  try {
    const { pricing } = req.body;
    console.log('Received pricing update request:', pricing);
    
    if (!pricing || typeof pricing !== 'object' || Object.keys(pricing).length === 0) {
      console.log('Error: Pricing data is missing or invalid');
      return res.status(400).json({
        success: false,
        message: 'Valid pricing data is required'
      });
    }

    const updatedPricing = await setLeadPricingService(pricing);
    console.log('Lead pricing updated successfully');
    
    res.status(200).json({
      success: true,
      message: 'Lead pricing updated successfully',
      pricing: updatedPricing
    });
  } catch (error) {
    console.error('Error updating lead pricing:', error.message);
    res.status(400).json({
      success: false,
      message: 'Failed to update lead pricing',
      error: error.message
    });
  }
};
