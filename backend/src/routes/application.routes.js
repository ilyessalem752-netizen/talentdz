const express = require('express');
const router = express.Router();
const appController = require('../controllers/application.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { validate, applicationSchema, statusSchema } = require('../middleware/validate');
const { uploadCV } = require('../config/multer');

router.post('/:jobId', protect, restrictTo('student'), uploadCV.single('cv'), validate(applicationSchema), appController.apply);
router.get('/mine', protect, restrictTo('student'), appController.getMyApplications);
router.get('/job/:jobId', protect, restrictTo('company'), appController.getJobApplications);
router.put('/:id/status', protect, restrictTo('company'), validate(statusSchema), appController.updateStatus);
router.put('/:id/withdraw', protect, restrictTo('student'), appController.withdraw);

module.exports = router;
