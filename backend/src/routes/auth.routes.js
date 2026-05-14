const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { validate, registerStudentSchema, registerCompanySchema, loginSchema } = require('../middleware/validate');

router.post('/register/student', validate(registerStudentSchema), authController.registerStudent);
router.post('/register/company', validate(registerCompanySchema), authController.registerCompany);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
