// student.routes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadCV } = require('../config/multer');

router.get('/profile', protect, restrictTo('student'), studentController.getProfile);
router.put('/profile', protect, restrictTo('student'), studentController.updateProfile);
router.post('/cv', protect, restrictTo('student'), uploadCV.single('cv'), studentController.uploadCV);
router.get('/:id', protect, studentController.getPublicProfile);

module.exports = router;
