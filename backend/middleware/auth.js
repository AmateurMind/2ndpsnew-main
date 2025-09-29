const jwt = require('jsonwebtoken');
const { Student, Admin, Mentor, Recruiter, AdminAudit, Application, Internship } = require('../models');

// Audit logging for admin actions
const logAdminAction = async (adminId, action, details = {}) => {
  try {
    const auditCount = await AdminAudit.countDocuments();
    const logEntry = new AdminAudit({
      id: `AUDIT${String(auditCount + 1).padStart(3, '0')}`,
      adminId,
      action,
      details,
      timestamp: new Date()
    });
    
    await logEntry.save();
    
    // Clean up old logs (keep last 1000)
    const totalLogs = await AdminAudit.countDocuments();
    if (totalLogs > 1000) {
      const oldLogs = await AdminAudit.find().sort({ timestamp: 1 }).limit(totalLogs - 1000);
      await AdminAudit.deleteMany({ _id: { $in: oldLogs.map(log => log._id) } });
    }
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus-placement-secret');
    
    // Find user in appropriate collection
    let user = null;
    user = await Student.findOne({ id: decoded.id, email: decoded.email }).lean();
    if (!user) user = await Admin.findOne({ id: decoded.id, email: decoded.email }).lean();
    if (!user) user = await Mentor.findOne({ id: decoded.id, email: decoded.email }).lean();
    if (!user) user = await Recruiter.findOne({ id: decoded.id, email: decoded.email }).lean();
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Access denied. User not authenticated.' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        required: roles,
        current: req.user.role
      });
    }
    
    next();
  };
};

// Optional authentication (for public routes that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus-placement-secret');
      
      // Find user in appropriate collection
      let user = null;
      user = await Student.findOne({ id: decoded.id, email: decoded.email }).lean();
      if (!user) user = await Admin.findOne({ id: decoded.id, email: decoded.email }).lean();
      if (!user) user = await Mentor.findOne({ id: decoded.id, email: decoded.email }).lean();
      if (!user) user = await Recruiter.findOne({ id: decoded.id, email: decoded.email }).lean();
      
      req.user = user;
    } catch (error) {
      // Token invalid, but continue without user context
    }
  }
  
  next();
};

// Middleware to verify recruiter owns/manages specific internships
const verifyInternshipOwnership = (req, res, next) => {
  if (req.user.role !== 'recruiter') {
    return next(); // Not a recruiter, skip ownership check
  }
  
  const fs = require('fs');
  const path = require('path');
  
  try {
    const internshipsPath = path.join(__dirname, '../data/internships.json');
    const internships = JSON.parse(fs.readFileSync(internshipsPath, 'utf8'));
    
    // If checking a specific internship ID from params
    if (req.params.id) {
      const internship = internships.find(i => i.id === req.params.id);
      if (!internship) {
        return res.status(404).json({ error: 'Internship not found' });
      }
      
      // Check if recruiter owns this internship
      if (internship.postedBy !== req.user.id && internship.submittedBy !== req.user.id) {
        return res.status(403).json({ error: 'Access denied. You can only access internships you posted or submitted.' });
      }
    }
    
    next();
  } catch (error) {
    console.error('Ownership verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to verify recruiter can only access students who applied to their internships
const verifyStudentAccess = async (req, res, next) => {
  if (req.user.role !== 'recruiter') {
    return next(); // Not a recruiter, skip check
  }
  
  const fs = require('fs');
  const path = require('path');
  
  try {
    const applicationsPath = path.join(__dirname, '../data/applications.json');
    const internshipsPath = path.join(__dirname, '../data/internships.json');
    
    const applications = JSON.parse(fs.readFileSync(applicationsPath, 'utf8'));
    const internships = JSON.parse(fs.readFileSync(internshipsPath, 'utf8'));
    
    // Get all internships owned by this recruiter
    const recruiterInternships = internships
      .filter(i => i.postedBy === req.user.id || i.submittedBy === req.user.id)
      .map(i => i.id);
    
    // Get all students who applied to recruiter's internships
    const allowedStudents = applications
      .filter(app => recruiterInternships.includes(app.internshipId))
      .map(app => app.studentId);
    
    // Store allowed students for use in route handlers
    req.allowedStudents = allowedStudents;
    req.recruiterInternships = recruiterInternships;
    
    next();
  } catch (error) {
    console.error('Student access verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  verifyInternshipOwnership,
  verifyStudentAccess,
  logAdminAction
};
