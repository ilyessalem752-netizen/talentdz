const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  requirements: { type: String },
  responsibilities: { type: String },

  sector: { type: String, trim: true },
  category: { type: String, trim: true },

  type: {
    type: String,
    enum: ['cdi', 'cdd', 'stage', 'alternance', 'freelance', 'temps_partiel'],
    required: true,
  },
  level: {
    type: String,
    enum: ['junior', 'intermediaire', 'senior', 'manager', 'directeur', 'etudiant'],
    required: true,
  },

  wilaya: { type: String, trim: true },
  city: { type: String, trim: true },
  remote: { type: String, enum: ['onsite', 'remote', 'hybrid'], default: 'onsite' },

  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'DZD' },
    negotiable: { type: Boolean, default: false },
    display: { type: Boolean, default: true },
  },

  skills: [{ type: String, trim: true }],
  languages: [{ type: String, trim: true }],
  education: {
    type: String,
    enum: ['bac', 'bts', 'licence', 'master', 'doctorat', 'ingenieur', 'indifferent'],
  },
  experience: {
    type: String,
    enum: ['sans', '1-2', '2-5', '5-10', '10+'],
    default: 'sans',
  },

  deadline: Date,
  startDate: Date,
  positions: { type: Number, default: 1 },

  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed', 'expired'],
    default: 'active',
  },

  isFeatured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  applicationsCount: { type: Number, default: 0 },

  tags: [String],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Auto slug
jobSchema.pre('save', async function (next) {
  if (this.isModified('title') || this.isNew) {
    const slugify = require('slugify');
    const base = slugify(this.title, { lower: true, strict: true });
    const suffix = Date.now().toString(36);
    this.slug = `${base}-${suffix}`;
  }
  // Auto-expire
  if (this.deadline && this.deadline < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

jobSchema.index({ company: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ wilaya: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ title: 'text', description: 'text', skills: 'text', sector: 'text' });

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
