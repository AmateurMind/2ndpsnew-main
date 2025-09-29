const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  githubLink: { type: String }
}, { _id: false });

const placementSchema = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  package: { type: String, required: true },
  joinDate: { type: Date }
}, { _id: false });

const studentSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  cgpa: { type: Number, required: true },
  skills: [{ type: String }],
  resumeLink: { type: String },
  phone: { type: String },
  address: { type: String },
  dateOfBirth: { type: Date },
  profilePicture: { type: String },
  projects: [projectSchema],
  achievements: [{ type: String }],
  isPlaced: { type: Boolean, default: false },
  placementStatus: { 
    type: String, 
    enum: ['active', 'placed', 'inactive'], 
    default: 'active' 
  },
  placedAt: placementSchema,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Student', studentSchema);