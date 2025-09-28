const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

const mentorsPath = path.join(__dirname, '../data/mentors.json');
const readMentors = () => JSON.parse(fs.readFileSync(mentorsPath, 'utf8'));

router.get('/', authenticate, (req, res) => {
  try {
    const mentors = readMentors().map(({ password, ...mentor }) => mentor);
    res.json({ mentors, total: mentors.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/profile', authenticate, authorize('mentor'), (req, res) => {
  try {
    const { password, ...mentorData } = req.user;
    res.json(mentorData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;