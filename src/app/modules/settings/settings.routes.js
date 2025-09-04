// src/app/modules/settings/settings.routes.js
import { Router } from 'express';
import { getBrandColor, updateBrandColor } from './settings.controller.js';

const router = Router();
router.get('/brand-color', getBrandColor);
router.put('/brand-color', updateBrandColor);

export default router;
export const SettingsRoutes = router;