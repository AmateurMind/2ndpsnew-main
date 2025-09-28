const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

const feedbackPath = path.join(__dirname, '../data/feedback.json');
const readFeedback = () => JSON.parse(fs.readFileSync(feedbackPath, 'utf8'));
const writeFeedback = (feedback) => fs.writeFileSync(feedbackPath, JSON.stringify(feedback, null, 2));

// Get feedback based on user role
router.get('/', authenticate, (req, res) => {
  try {
    const feedback = readFeedback();
    let filteredFeedback = [];
    
    switch (req.user.role) {
      case 'student':
        filteredFeedback = feedback.filter(f => f.studentId === req.user.id);
        break;
      case 'mentor':
      case 'admin':
      case 'recruiter':
        filteredFeedback = feedback;
        break;
      default:
        return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({ feedback: filteredFeedback, total: filteredFeedback.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create feedback (mentors/admins only)
router.post('/', authenticate, authorize('mentor', 'admin'), (req, res) => {
  try {
    const feedback = readFeedback();
    const newFeedback = {
      id: `FB${String(feedback.length + 1).padStart(3, '0')}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    feedback.push(newFeedback);
    writeFeedback(feedback);
    
    res.status(201).json({ message: 'Feedback created successfully', feedback: newFeedback });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;