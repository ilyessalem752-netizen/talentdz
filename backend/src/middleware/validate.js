const Joi = require('joi');

/**
 * Validate request body against a Joi schema
 */
exports.validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const messages = error.details.map(d => d.message.replace(/"/g, ''));
    return res.status(400).json({ success: false, message: 'Données invalides', errors: messages });
  }
  next();
};

// ---- Schemas ----
exports.registerStudentSchema = Joi.object({
  email: Joi.string().email().required().messages({ 'string.email': 'Email invalide', 'any.required': 'Email requis' }),
  password: Joi.string().min(8).required().messages({ 'string.min': 'Minimum 8 caractères' }),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
});

exports.registerCompanySchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).max(100).required(),
  wilaya: Joi.string().optional(),
  sector: Joi.string().optional(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.jobSchema = Joi.object({
  title: Joi.string().min(3).max(150).required(),
  description: Joi.string().min(50).required(),
  requirements: Joi.string().optional().allow(''),
  responsibilities: Joi.string().optional().allow(''),
  type: Joi.string().valid('cdi', 'cdd', 'stage', 'alternance', 'freelance', 'temps_partiel').required(),
  level: Joi.string().valid('junior', 'intermediaire', 'senior', 'manager', 'directeur', 'etudiant').required(),
  sector: Joi.string().optional(),
  wilaya: Joi.string().optional(),
  city: Joi.any().optional(),
  remote: Joi.string().valid('onsite', 'remote', 'hybrid').default('onsite'),
  skills: Joi.array().items(Joi.string()).optional(),
  education: Joi.string().optional(),
  experience: Joi.string().optional(),
  deadline: Joi.date().greater('now').optional(),
  positions: Joi.number().integer().min(1).default(1),
  salary: Joi.object({
    min: Joi.number().optional(),
    max: Joi.number().optional(),
    negotiable: Joi.boolean().default(false),
    display: Joi.boolean().default(true),
  }).optional(),
});

exports.applicationSchema = Joi.object({
  coverLetter: Joi.string().max(3000).optional().allow(''),
});

exports.statusSchema = Joi.object({
  status: Joi.string().valid('viewed', 'shortlisted', 'interview', 'offered', 'rejected').required(),
  note: Joi.string().max(500).optional().allow(''),
  interviewDate: Joi.date().optional(),
  interviewLocation: Joi.string().optional().allow(''),
});
