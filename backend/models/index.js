const mongoose = require('mongoose');

// Admin Schema
const adminSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  permissions: [{ type: String }],
  phone: { type: String },
  department: { type: String },
  profilePicture: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Mentor Schema
const mentorSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'mentor' },
  department: { type: String, required: true },
  specialization: [{ type: String }],
  experience: { type: Number }, // years of experience
  phone: { type: String },
  profilePicture: { type: String },
  assignedStudents: [{ type: String }], // Array of student IDs
  maxStudents: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Recruiter Schema
const recruiterSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'recruiter' },
  company: { type: String, required: true },
  position: { type: String },
  phone: { type: String },
  profilePicture: { type: String },
  companyWebsite: { type: String },
  linkedinProfile: { type: String },
  isVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  verifiedBy: { type: String }, // Admin ID who verified
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  studentId: { type: String, required: true },
  internshipId: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  feedback: { type: String, required: true },
  categories: {
    workEnvironment: { type: Number, min: 1, max: 5 },
    learningOpportunity: { type: Number, min: 1, max: 5 },
    mentorship: { type: Number, min: 1, max: 5 },
    compensation: { type: Number, min: 1, max: 5 },
    overallSatisfaction: { type: Number, min: 1, max: 5 }
  },
  wouldRecommend: { type: Boolean },
  suggestions: { type: String },
  isAnonymous: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'approved', 'flagged'], 
    default: 'submitted' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Admin Audit Schema
const adminAuditSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  adminId: { type: String, required: true },
  action: { type: String, required: true },
  targetType: { 
    type: String, 
    enum: ['student', 'mentor', 'recruiter', 'internship', 'application', 'feedback'], 
    required: true 
  },
  targetId: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed }, // Can store any object
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// Add pre-save middleware to update updatedAt
[adminSchema, mentorSchema, recruiterSchema, feedbackSchema].forEach(schema => {
  schema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });
});

// Create and export models
const Admin = mongoose.model('Admin', adminSchema);
const Mentor = mongoose.model('Mentor', mentorSchema);
const Recruiter = mongoose.model('Recruiter', recruiterSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const AdminAudit = mongoose.model('AdminAudit', adminAuditSchema);

// Also import the other models
const Student = require('./Student');
const Internship = require('./Internship');
const Application = require('./Application');

module.exports = {
  Student,
  Internship,
  Application,
  Admin,
  Mentor,
  Recruiter,
  Feedback,
  AdminAudit
};