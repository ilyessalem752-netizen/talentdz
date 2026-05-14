const Student = require('../models/Student');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const path = require('path');
const fs = require('fs');

// GET /api/students/profile
exports.getProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate('user', 'email isVerified createdAt lastLogin');
    if (!student) return next(new AppError('Profil introuvable', 404));
    successResponse(res, { student });
  } catch (err) { next(err); }
};

// PUT /api/students/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const forbidden = ['user', 'cv', 'profileViews'];
    forbidden.forEach(f => delete req.body[f]);

    let student = await Student.findOne({ user: req.user.id });
    if (!student) return next(new AppError('Profil introuvable', 404));

    Object.assign(student, req.body);
    student.calculateCompleteness();
    await student.save();

    successResponse(res, { student }, 'Profil mis à jour');
  } catch (err) { next(err); }
};

// POST /api/students/cv — upload PDF CV
exports.uploadCV = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('Aucun fichier PDF reçu', 400));

    const student = await Student.findOne({ user: req.user.id });
    if (!student) return next(new AppError('Profil introuvable', 404));

    // Delete old CV file
    if (student.cv?.path && fs.existsSync(student.cv.path)) {
      fs.unlinkSync(student.cv.path);
    }

    student.cv = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      uploadedAt: new Date(),
      size: req.file.size,
    };
    student.calculateCompleteness();
    await student.save();

    successResponse(res, {
      cv: {
        filename: student.cv.filename,
        originalName: student.cv.originalName,
        uploadedAt: student.cv.uploadedAt,
        size: student.cv.size,
        url: `/uploads/cvs/${student.cv.filename}`,
      }
    }, 'CV uploadé avec succès');
  } catch (err) { next(err); }
};

// GET /api/students/:id — public profile (for company)
exports.getPublicProfile = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .select('-cv.path');

    if (!student) return next(new AppError('Profil introuvable', 404));

    await Student.findByIdAndUpdate(student._id, { $inc: { profileViews: 1 } });
    successResponse(res, { student });
  } catch (err) { next(err); }
};
