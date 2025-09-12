// src/app/modules/settings/settings.routes.js
import { Router } from 'express';
import { getBrandColor, updateBrandColor, getLeadPricing, updateLeadPricing } from './settings.controller.js';
import { adminAuth } from '../../middlewares/adminAuth.js';

const router = Router();
// Cache brand color for 10 minutes (600 seconds)
router.get('/brand-color', getBrandColor);
router.put('/brand-color', updateBrandColor);

// Lead pricing routes - protected with admin auth
// Cache lead pricing for 5 minutes (300 seconds)
router.get('/lead-pricing', getLeadPricing);
router.put('/lead-pricing', updateLeadPricing);

export default router;
export const SettingsRoutes = router;