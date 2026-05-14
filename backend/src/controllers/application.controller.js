const Application = require('../models/Application');
const Job = require('../models/Job');
const Student = require('../models/Student');
const Company = require('../models/Company');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { successResponse, paginatedResponse } = require('../utils/response');
const notifService = require('../services/notification.service');
const path = require('path');

// POST /api/applications/:jobId — student applies
exports.apply = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || job.status !== 'active') {
      return next(new AppError('Offre non disponible', 404));
    }
    if (job.deadline && job.deadline < new Date()) {
      return next(new AppError('La date limite de candidature est dépassée', 400));
    }

    const student = await Student.findOne({ user: req.user.id });
    if (!student) return next(new AppError('Profil étudiant introuvable', 404));

    // Check duplicate
    const existing = await Application.findOne({ job: job._id, student: student._id });
    if (existing) return next(new AppError('Vous avez déjà postulé à cette offre', 409));

    // Determine CV
    let cvData = student.cv || null;
    if (req.file) {
      cvData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        uploadedAt: new Date(),
      };
    }
    if (!cvData) return next(new AppError('Veuillez uploader un CV avant de postuler', 400));

    const application = await Application.create({
      job: job._id,
      student: student._id,
      company: job.company,
      coverLetter: req.body.coverLetter || '',
      cv: cvData,
      statusHistory: [{ status: 'pending', changedAt: new Date() }],
    });

    // Update counters
    await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });
    await Company.findByIdAndUpdate(job.company, { $inc: { totalApplications: 1 } });

    // Notify company
    const companyUser = await User.findById(req.user.id);
    const company = await Company.findById(job.company);
    if (company) {
      const companyOwner = company.user;
      await notifService.notifyNewApplication(
        companyOwner, job.title,
        `${student.firstName} ${student.lastName}`,
        application._id
      );
    }

    successResponse(res, { application }, 'Candidature envoyée avec succès', 201);
  } catch (err) { next(err); }
};

// GET /api/applications/mine — student's applications
exports.getMyApplications = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return next(new AppError('Profil introuvable', 404));

    const { page = 1, limit = 10, status } = req.query;
    const query = { student: student._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate({ path: 'job', select: 'title type level wilaya deadline status', populate: { path: 'company', select: 'name logo' } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(query),
    ]);

    paginatedResponse(res, applications, total, page, limit);
  } catch (err) { next(err); }
};

// GET /api/applications/job/:jobId — company views applications for a job
exports.getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return next(new AppError('Offre introuvable', 404));

    const company = await Company.findOne({ user: req.user.id });
    if (!company || job.company.toString() !== company._id.toString()) {
      return next(new AppError('Non autorisé', 403));
    }

    const { page = 1, limit = 10, status } = req.query;
    const query = { job: job._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('student', 'firstName lastName university fieldOfStudy degree skills avatar cv wilaya')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(query),
    ]);

    paginatedResponse(res, applications, total, page, limit);
  } catch (err) { next(err); }
};

// PUT /api/applications/:id/status — company updates status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note, interviewDate, interviewLocation } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('student', 'user firstName lastName');
    if (!application) return next(new AppError('Candidature introuvable', 404));

    // Verify company owns this
    const company = await Company.findOne({ user: req.user.id });
    if (!company || application.company.toString() !== company._id.toString()) {
      return next(new AppError('Non autorisé', 403));
    }

    application.status = status;
    application.statusHistory.push({ status, changedAt: new Date(), note, changedBy: req.user.id });
    if (interviewDate) {
      application.interviewDate = interviewDate;
      application.interviewLocation = interviewLocation;
    }
    await application.save();

    // Notify student
    await notifService.notifyApplicationStatus(application, status, application.student.user);

    successResponse(res, { application }, 'Statut mis à jour');
  } catch (err) { next(err); }
};

// PUT /api/applications/:id/withdraw — student withdraws
exports.withdraw = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const application = await Application.findOne({ _id: req.params.id, student: student._id });
    if (!application) return next(new AppError('Candidature introuvable', 404));
    if (['offered', 'rejected'].includes(application.status)) {
      return next(new AppError('Impossible de retirer cette candidature', 400));
    }

    application.status = 'withdrawn';
    application.statusHistory.push({ status: 'withdrawn', changedAt: new Date() });
    await application.save();

    await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });

    successResponse(res, {}, 'Candidature retirée');
  } catch (err) { next(err); }
};
