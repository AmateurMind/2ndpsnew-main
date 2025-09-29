const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  interviewer: { type: String, required: true },
  mode: { 
    type: String, 
    enum: ['Video Call', 'In-person', 'Phone'], 
    required: true 
  },
  meetingLink: { type: String },
  location: { type: String }
}, { _id: false });

const offerDetailsSchema = new mongoose.Schema({
  stipend: { type: String, required: true },
  startDate: { type: Date, required: true },
  duration: { type: String, required: true },
  offerExpiry: { type: Date, required: true }
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  studentId: { type: String, required: true },
  internshipId: { type: String, required: true },
  status: { 
    type: String, 
    enum: [
      'applied', 
      'under_review', 
      'approved', 
      'rejected', 
      'interview_scheduled', 
      'interviewed', 
      'offered', 
      'accepted', 
      'declined',
      'pending_mentor_approval'
    ], 
    default: 'applied' 
  },
  appliedAt: { type: Date, default: Date.now },
  coverLetter: { type: String, required: true },
  mentorId: { type: String },
  mentorApproval: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  mentorFeedback: { type: String, default: '' },
  interviewScheduled: interviewSchema,
  interviewFeedback: { type: String },
  finalStatus: { 
    type: String, 
    enum: ['selected', 'rejected', 'waitlisted', 'offered']
  },
  offerDetails: offerDetailsSchema,
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
applicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for efficient queries
applicationSchema.index({ studentId: 1, status: 1 });
applicationSchema.index({ internshipId: 1, status: 1 });
applicationSchema.index({ mentorId: 1, mentorApproval: 1 });

module.exports = mongoose.model('Application', applicationSchema);