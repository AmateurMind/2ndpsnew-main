const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

const recruitersPath = path.join(__dirname, '../data/recruiters.json');
const readRecruiters = () => JSON.parse(fs.readFileSync(recruitersPath, 'utf8'));

router.get('/profile', authenticate, authorize('recruiter'), (req, res) => {
  try {
    const { password, ...recruiterData } = req.user;
    res.json(recruiterData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;