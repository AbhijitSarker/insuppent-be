// src/app/modules/settings/settings.routes.js
import { Router } from 'express';
import { getBrandColor, updateBrandColor, getLeadPricing, updateLeadPricing } from './settings.controller.js';
import { adminAuth } from '../../middlewares/adminAuth.js';

const router = Router();
router.get('/brand-color', getBrandColor);
router.put('/brand-color', updateBrandColor);

// Lead pricing routes - protected with admin auth
router.get('/lead-pricing', adminAuth, getLeadPricing);
router.put('/lead-pricing', adminAuth, updateLeadPricing);

export default router;
export const SettingsRoutes = router;