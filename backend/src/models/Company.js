const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  logo: String,
  coverImage: String,

  // Identity
  registrationNumber: { type: String, trim: true }, // NIF/RC
  taxId: String,
  founded: Number,
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
  },
  type: {
    type: String,
    enum: ['sarl', 'spa', 'eurl', 'snc', 'etat', 'association', 'autre'],
  },

  // Location
  wilaya: { type: String, trim: true },
  city: { type: String, trim: true },
  address: String,
  website: String,
  phone: String,

  // Profile
  sector: { type: String, trim: true },
  description: { type: String, maxlength: 2000 },
  mission: String,
  benefits: [String],
  socialLinks: {
    linkedin: String,
    facebook: String,
    twitter: String,
  },

  // Verification
  isVerified: { type: Boolean, default: false },
  verifiedAt: Date,

  // Stats
  totalJobs: { type: Number, default: 0 },
  activeJobs: { type: Number, default: 0 },
  totalApplications: { type: Number, default: 0 },
  profileViews: { type: Number, default: 0 },

  // Contact person
  contactPerson: {
    name: String,
    title: String,
    email: String,
    phone: String,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Auto-generate slug
companySchema.pre('save', async function (next) {
  if (this.isModified('name') || this.isNew) {
    const slugify = require('slugify');
    const base = slugify(this.name, { lower: true, strict: true });
    let slug = base;
    let count = 1;
    while (await mongoose.model('Company').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${count++}`;
    }
    this.slug = slug;
  }
  next();
});

companySchema.index({ user: 1 });
companySchema.index({ sector: 1 });
companySchema.index({ wilaya: 1 });
companySchema.index({ name: 'text', description: 'text', sector: 'text' });

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
