const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  companyLogo: { type: String },
  description: { type: String, required: true },
  requiredSkills: [{ type: String }],
  preferredSkills: [{ type: String }],
  eligibleDepartments: [{ type: String }],
  minimumSemester: { type: Number, required: true },
  minimumCGPA: { type: Number, required: true },
  stipend: { type: String },
  duration: { type: String, required: true },
  location: { type: String, required: true },
  workMode: { 
    type: String, 
    enum: ['Remote', 'On-site', 'Hybrid'], 
    required: true 
  },
  applicationDeadline: { type: Date, required: true },
  startDate: { type: Date, required: true },
  maxApplications: { type: Number, default: 50 },
  currentApplications: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['active', 'closed', 'draft', 'pending_approval'], 
    default: 'active' 
  },
  companyDescription: { type: String },
  requirements: [{ type: String }],
  benefits: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  postedBy: { type: String, required: true },
  postedByRole: { 
    type: String, 
    enum: ['admin', 'recruiter'], 
    required: true 
  },
  submittedBy: { type: String },
  approvedBy: { type: String },
  submittedAt: { type: Date },
  approvedAt: { type: Date },
  adminNotes: { type: String, default: '' },
  recruiterNotes: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
internshipSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
internshipSchema.index({ status: 1, applicationDeadline: 1 });
internshipSchema.index({ eligibleDepartments: 1, minimumSemester: 1, minimumCGPA: 1 });

module.exports = mongoose.model('Internship', internshipSchema);