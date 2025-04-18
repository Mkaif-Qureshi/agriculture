import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { uploadProfileImage } from '../controllers/upload.controller.js';
import { upload } from '../config/multer.config.js';

const router = express.Router();

router.post('/profile-image', protectRoute, upload.single('profileImage'), uploadProfileImage);

export default router;
