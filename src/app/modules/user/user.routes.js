import express from 'express';
import { UserController } from './user.controller.js';

const router = express.Router();


router.post('/', UserController.createUser);
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getSingleUser);
// PATCH /users/:id/status
router.patch('/:id/status', UserController.updateUserStatus);

export const UserRoutes = router;
