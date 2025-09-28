const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

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

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  loadUsers
};