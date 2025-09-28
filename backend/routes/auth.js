const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { loadUsers } = require('../middleware/auth');
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const users = loadUsers();
    const user = users.find(u => u.email === email && (!role || u.role === role));
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // For demo purposes, we'll accept any password
    // In production, use: const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = true; // Demo mode
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'campus-placement-secret',
      { expiresIn: '24h' }
    );
    
    // Remove sensitive data
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', require('../middleware/auth').authenticate, (req, res) => {
  try {
    const { password, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Demo login credentials endpoint (for development only)
router.get('/demo-credentials', (req, res) => {
  const demoUsers = [
    { role: 'student', email: 'aarav.sharma@college.edu', password: 'demo123', name: 'Aarav Sharma' },
    { role: 'student', email: 'priya.patel@college.edu', password: 'demo123', name: 'Priya Patel' },
    { role: 'mentor', email: 'rajesh.kumar@college.edu', password: 'demo123', name: 'Dr. Rajesh Kumar' },
    { role: 'admin', email: 'sunita.mehta@college.edu', password: 'demo123', name: 'Dr. Sunita Mehta' },
    { role: 'recruiter', email: 'amit.singh@techcorp.com', password: 'demo123', name: 'Amit Singh' }
  ];
  
  res.json({
    message: 'Demo login credentials (Development only)',
    credentials: demoUsers
  });
});

// Logout route (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful. Please remove token from client.' });
});

// Verify token route
router.get('/verify', require('../middleware/auth').authenticate, (req, res) => {
  try {
    const { password, ...userWithoutPassword } = req.user;
    res.json({ 
      valid: true, 
      user: userWithoutPassword 
    });
  } catch (error) {
    res.status(401).json({ 
      valid: false, 
      error: 'Invalid token' 
    });
  }
});

module.exports = router;