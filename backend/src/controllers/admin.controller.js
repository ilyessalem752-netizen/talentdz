const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const AppError = require('../utils/AppError');
const { successResponse, paginatedResponse } = require('../utils/response');

// GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [
      totalStudents, totalCompanies, totalJobs, totalApplications,
      activeJobs, pendingApplications, recentUsers, recentJobs
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'company' }),
      Job.countDocuments(),
      Application.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Application.countDocuments({ status: 'pending' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('email role createdAt isActive'),
      Job.find().sort({ createdAt: -1 }).limit(5)
        .populate('company', 'name')
        .select('title type status createdAt applicationsCount'),
    ]);

    // Applications by status
    const appsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Jobs by type
    const jobsByType = await Job.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Registrations last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    successResponse(res, {
      stats: {
        totalStudents, totalCompanies, totalJobs, totalApplications,
        activeJobs, pendingApplications, newUsersThisWeek,
      },
      charts: { appsByStatus, jobsByType },
      recent: { users: recentUsers, jobs: recentJobs },
    });
  } catch (err) { next(err); }
};

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, isActive } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.email = new RegExp(search, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
        .select('-password -refreshTokens'),
      User.countDocuments(query),
    ]);

    paginatedResponse(res, users, total, page, limit);
  } catch (err) { next(err); }
};

// PUT /api/admin/users/:id/status
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('Utilisateur introuvable', 404));
    if (user.role === 'admin') return next(new AppError('Impossible de modifier un admin', 403));

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    successResponse(res, { user: { id: user._id, isActive: user.isActive } },
      `Compte ${user.isActive ? 'activé' : 'désactivé'}`);
  } catch (err) { next(err); }
};

// PUT /api/admin/companies/:id/verify
exports.verifyCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verifiedAt: new Date() },
      { new: true }
    );
    if (!company) return next(new AppError('Entreprise introuvable', 404));
    successResponse(res, { company }, 'Entreprise vérifiée');
  } catch (err) { next(err); }
};

// GET /api/admin/jobs
exports.getAllJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('company', 'name')
        .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Job.countDocuments(query),
    ]);
    paginatedResponse(res, jobs, total, page, limit);
  } catch (err) { next(err); }
};

// DELETE /api/admin/jobs/:id
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return next(new AppError('Offre introuvable', 404));
    successResponse(res, {}, 'Offre supprimée');
  } catch (err) { next(err); }
};
