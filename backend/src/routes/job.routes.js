const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');
const { validate, jobSchema } = require('../middleware/validate');

router.get('/', optionalAuth, jobController.getJobs);
router.get('/company/mine', protect, restrictTo('company'), jobController.getMyJobs);
router.get('/:id', optionalAuth, jobController.getJob);
router.post('/', protect, restrictTo('company'), validate(jobSchema), jobController.createJob);
router.put('/:id', protect, restrictTo('company', 'admin'), jobController.updateJob);
router.delete('/:id', protect, restrictTo('company', 'admin'), jobController.deleteJob);

module.exports = router;
