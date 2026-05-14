const Company = require('../models/Company');
const AppError = require('../utils/AppError');
const { successResponse, paginatedResponse } = require('../utils/response');

// GET /api/companies/profile
exports.getProfile = async (req, res, next) => {
  try {
    const company = await Company.findOne({ user: req.user.id })
      .populate('user', 'email isVerified createdAt lastLogin');
    if (!company) return next(new AppError('Profil entreprise introuvable', 404));
    successResponse(res, { company });
  } catch (err) { next(err); }
};

// PUT /api/companies/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const forbidden = ['user', 'totalJobs', 'activeJobs', 'totalApplications', 'isVerified'];
    forbidden.forEach(f => delete req.body[f]);

    const company = await Company.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!company) return next(new AppError('Profil introuvable', 404));

    successResponse(res, { company }, 'Profil mis à jour');
  } catch (err) { next(err); }
};

// GET /api/companies/:id — public
exports.getPublicProfile = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id)
      .select('-contactPerson.email -contactPerson.phone');
    if (!company) return next(new AppError('Entreprise introuvable', 404));

    await Company.findByIdAndUpdate(company._id, { $inc: { profileViews: 1 } });
    successResponse(res, { company });
  } catch (err) { next(err); }
};

// GET /api/companies — list
exports.getCompanies = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, sector, wilaya } = req.query;
    const query = {};

    if (search) query.$text = { $search: search };
    if (sector) query.sector = new RegExp(sector, 'i');
    if (wilaya) query.wilaya = wilaya;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [companies, total] = await Promise.all([
      Company.find(query)
        .select('name logo sector wilaya city isVerified activeJobs description')
        .sort({ isVerified: -1, activeJobs: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Company.countDocuments(query),
    ]);

    paginatedResponse(res, companies, total, page, limit);
  } catch (err) { next(err); }
};
