const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', companyController.getCompanies);
router.get('/profile', protect, restrictTo('company'), companyController.getProfile);
router.put('/profile', protect, restrictTo('company'), companyController.updateProfile);
router.get('/:id', companyController.getPublicProfile);

module.exports = router;
