const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  wilaya: { type: String, trim: true },
  city: { type: String, trim: true },
  avatar: String,

  // Academic
  university: { type: String, trim: true },
  faculty: { type: String, trim: true },
  fieldOfStudy: { type: String, trim: true },
  degree: {
    type: String,
    enum: ['licence', 'master', 'doctorat', 'ingenieur', 'bts', 'technicien', 'autre'],
  },
  graduationYear: Number,
  gpa: Number,

  // Professional
  bio: { type: String, maxlength: 1000 },
  skills: [{ type: String, trim: true }],
  languages: [{
    language: String,
    level: { type: String, enum: ['debutant', 'intermediaire', 'avance', 'natif'] },
  }],
  experiences: [{
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String,
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    url: String,
  }],
  portfolio: String,
  linkedIn: String,
  github: String,

  // CV
  cv: {
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: Date,
    size: Number,
  },

  // Job preferences
  jobTypes: [{ type: String, enum: ['cdi', 'cdd', 'stage', 'alternance', 'freelance', 'temps_partiel'] }],
  sectors: [String],
  expectedSalary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'DZD' },
  },
  availability: { type: String, enum: ['immediate', '1_mois', '3_mois', 'non_disponible'] },
  remoteWork: { type: Boolean, default: false },

  // Stats
  profileViews: { type: Number, default: 0 },
  profileCompleteness: { type: Number, default: 0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: full name
studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Calculate profile completeness
studentSchema.methods.calculateCompleteness = function () {
  const fields = [
    this.firstName, this.lastName, this.phone, this.wilaya,
    this.university, this.fieldOfStudy, this.degree,
    this.bio, this.skills?.length > 0,
    this.cv?.filename,
  ];
  const filled = fields.filter(Boolean).length;
  this.profileCompleteness = Math.round((filled / fields.length) * 100);
  return this.profileCompleteness;
};

studentSchema.index({ user: 1 });
studentSchema.index({ skills: 1 });
studentSchema.index({ wilaya: 1 });
studentSchema.index({ fieldOfStudy: 'text', bio: 'text', skills: 'text' });

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
