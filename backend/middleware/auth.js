const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Audit logging for admin actions
const logAdminAction = (adminId, action, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    adminId,
    action,
    details
  };
  
  try {
    const logPath = path.join(__dirname, '../data/admin_audit.json');
    let logs = [];
    
    if (fs.existsSync(logPath)) {
      logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    }
    
    logs.push(logEntry);
    
    // Keep only last 1000 log entries
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }
    
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

// Load all user data
const loadUsers = () => {
  const students = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/students.json'), 'utf8'));
  const mentors = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/mentors.json'), 'utf8'));
  const admins = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/admins.json'), 'utf8'));
  const recruiters = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/recruiters.json'), 'utf8'));
  
  return [...students, ...mentors, ...admins, ...recruiters];
};

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus-placement-secret');
    const users = loadUsers();
    const user = users.find(u => u.id === decoded.id && u.email === decoded.email);
    
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
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus-placement-secret');
      const users = loadUsers();
      const user = users.find(u => u.id === decoded.id && u.email === decoded.email);
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
  loadUsers,
  verifyInternshipOwnership,
  verifyStudentAccess,
  logAdminAction
};
