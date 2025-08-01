import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getProfile, updateProfile, updatePassword } from '../controllers/userController.js';
import validate from '../middleware/validation.js';
import { updateProfileSchema, updatePasswordSchema } from '../validations/userValidation.js';

const router = Router();

// Protect all routes after this middleware
router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', validate(updateProfileSchema), updateProfile);
router.patch('/password', validate(updatePasswordSchema), updatePassword);

export default router;