const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const AppError = require('../utils/AppError');
const { successResponse, paginatedResponse } = require('../utils/response');

// GET /api/jobs — public, with filters & pagination
exports.getJobs = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12, search, type, level, wilaya, sector,
      remote, minSalary, maxSalary, skills, sortBy = 'createdAt'
    } = req.query;

    const query = { status: 'active' };

    if (search) {
      
  query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { skills: { $regex: search, $options: 'i' } }
  ];
}

    if (type) query.type = type;
    if (level) query.level = level;
    if (wilaya) query.wilaya = wilaya;
    if (sector) query.sector = new RegExp(sector, 'i');
    if (remote) query.remote = remote;
    if (skills) {
      const skillArr = Array.isArray(skills) ? skills : skills.split(',');
      query.skills = { $in: skillArr };
    }
    if (minSalary || maxSalary) {
      query['salary.min'] = {};
      if (minSalary) query['salary.min'].$gte = parseInt(minSalary);
      if (maxSalary) query['salary.max'] = { $lte: parseInt(maxSalary) };
    }

    const sortOptions = {
      createdAt: { createdAt: -1 },
      salary: { 'salary.min': -1 },
      views: { views: -1 },
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('company', 'name logo sector wilaya city isVerified')
        .sort(sortOptions[sortBy] || { createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Job.countDocuments(query),
    ]);
console.log(jobs)
    paginatedResponse(res, jobs, total, page, limit);
  } catch (err) { next(err); }
};

// GET /api/jobs/:id
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name logo sector wilaya city description website phone isVerified');

    if (!job) return next(new AppError('Offre introuvable', 404));
    if (job.status !== 'active' && req.user?.id !== job.postedBy.toString()) {
      return next(new AppError('Offre non disponible', 404));
    }

    // Increment views
    await Job.findByIdAndUpdate(job._id, { $inc: { views: 1 } });

    // Check if already applied
    let hasApplied = false;
    if (req.user?.role === 'student') {
      const Student = require('../models/Student');
      const student = await Student.findOne({ user: req.user.id });
      if (student) {
        hasApplied = !!(await Application.findOne({ job: job._id, student: student._id }));
      }
    }

    successResponse(res, { job: { ...job.toObject(), hasApplied } });
  } catch (err) { next(err); }
};

// POST /api/jobs — company only
exports.createJob = async (req, res, next) => {
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) return next(new AppError('Profil entreprise introuvable', 404));

    const job = await Job.create({
      ...req.body,
      company: company._id,
      postedBy: req.user.id,
    });

    await Company.findByIdAndUpdate(company._id, {
      $inc: { totalJobs: 1, activeJobs: 1 }
    });

    successResponse(res, { job }, 'Offre publiée avec succès', 201);
  } catch (err) { next(err); }
};

// PUT /api/jobs/:id
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return next(new AppError('Offre introuvable', 404));
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Non autorisé', 403));
    }

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate('company', 'name logo');

    successResponse(res, { job: updated }, 'Offre mise à jour');
  } catch (err) { next(err); }
};

// DELETE /api/jobs/:id
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return next(new AppError('Offre introuvable', 404));
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Non autorisé', 403));
    }

    await job.deleteOne();
    await Company.findByIdAndUpdate(job.company, { $inc: { totalJobs: -1 } });

    successResponse(res, {}, 'Offre supprimée');
  } catch (err) { next(err); }
};

// GET /api/jobs/company/mine — company's own jobs
exports.getMyJobs = async (req, res, next) => {
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) return next(new AppError('Profil entreprise introuvable', 404));

    const { page = 1, limit = 10, status } = req.query;
    const query = { company: company._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [jobs, total] = await Promise.all([
      Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Job.countDocuments(query),
    ]);

    paginatedResponse(res, jobs, total, page, limit);
  } catch (err) { next(err); }
};
