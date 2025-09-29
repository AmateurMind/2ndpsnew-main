const express = require('express');
const { authenticate, authorize, verifyStudentAccess } = require('../middleware/auth');
const { Student, Application, Internship } = require('../models');
const router = express.Router();

// Create a new student (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const {
      name,
      email,
      department,
      semester = 1,
      cgpa = 0,
      skills = [],
      resumeLink = '',
      phone = '',
      address = '',
      dateOfBirth = '',
      profilePicture = ''
    } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({ error: 'name, email, and department are required' });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ error: 'Student with this email already exists' });
    }

    const studentCount = await Student.countDocuments();
    const newStudent = new Student({
      id: `STU${String(studentCount + 1).padStart(3, '0')}`,
      name,
      email,
      password: '$2a$10$example.hash.here',
      role: 'student',
      department,
      semester: parseInt(semester),
      cgpa: parseFloat(cgpa),
      skills: Array.isArray(skills) ? skills : String(skills).split(',').map(s => s.trim()).filter(Boolean),
      resumeLink,
      phone,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      profilePicture,
      projects: [],
      achievements: [],
      isPlaced: false,
      placementStatus: 'active'
    });

    await newStudent.save();
    const { password, ...rest } = newStudent.toObject();
    res.status(201).json({ message: 'Student created', student: rest });
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Quick demo route to add a test student (development only)
router.post('/demo-add', async (req, res) => {
  try {
    const count = await Student.countDocuments();
    const testStudent = new Student({
      id: `STU${String(count + 1).padStart(3, '0')}`,
      name: req.body.name || `Test Student ${count + 1}`,
      email: req.body.email || `test${count + 1}@college.edu`,
      password: '$2a$10$example.hash.here',
      role: 'student',
      department: req.body.department || 'Computer Science',
      semester: parseInt(req.body.semester || 5),
      cgpa: parseFloat(req.body.cgpa || 7.5),
      skills: req.body.skills || ['JavaScript', 'React'],
      resumeLink: req.body.resumeLink || 'https://example.com/resume.pdf',
      phone: req.body.phone || '+91-9000000000',
      address: req.body.address || 'Demo Address',
      dateOfBirth: new Date(req.body.dateOfBirth || '2002-01-01'),
      profilePicture: req.body.profilePicture || '',
      projects: [],
      achievements: [],
      isPlaced: false,
      placementStatus: 'active'
    });
    await testStudent.save();
    const { password, ...rest } = testStudent.toObject();
    res.status(201).json({ message: 'Demo student added', student: rest });
  } catch (err) {
    console.error('Demo add error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all students (admin/mentor/recruiter only)
router.get('/', authenticate, authorize('admin', 'mentor', 'recruiter'), verifyStudentAccess, async (req, res) => {
  try {
    const { department, semester, skills, cgpa } = req.query;
    
    // Build query filter
    let query = {};
    
    // For recruiters, only show students who applied to their internships
    if (req.user.role === 'recruiter' && req.allowedStudents) {
      query.id = { $in: req.allowedStudents };
    }
    
    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);
    if (cgpa) query.cgpa = { $gte: parseFloat(cgpa) };
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
    }
    
    const students = await Student.find(query).select('-password').lean();
    
    // Add application context for recruiters
    const enrichedStudents = await Promise.all(students.map(async (student) => {
      if (req.user.role === 'recruiter' && req.allowedStudents) {
        try {
          const studentApplications = await Application.find({
            studentId: student.id,
            internshipId: { $in: req.recruiterInternships }
          }).lean();
          
          const applicationContext = await Promise.all(studentApplications.map(async (app) => {
            const internship = await Internship.findOne({ id: app.internshipId }).select('title').lean();
            return {
              internshipId: app.internshipId,
              internshipTitle: internship?.title || 'Unknown',
              applicationStatus: app.status,
              appliedAt: app.appliedAt
            };
          }));
          
          student.applicationContext = applicationContext;
        } catch (error) {
          console.error('Error adding application context:', error);
          student.applicationContext = [];
        }
      }
      return student;
    }));
    
    res.json({ students: enrichedStudents, total: enrichedStudents.length });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student profile
router.get('/profile', authenticate, authorize('student'), (req, res) => {
  try {
    const { password, ...studentData } = req.user;
    res.json(studentData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update student profile
router.put('/profile', authenticate, authorize('student'), (req, res) => {
  try {
    const students = readStudents();
    const studentIndex = students.findIndex(s => s.id === req.user.id);
    
    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const updatedStudent = {
      ...students[studentIndex],
      ...req.body,
      id: req.user.id, // Ensure ID doesn't change
      email: req.user.email, // Ensure email doesn't change
      role: req.user.role, // Ensure role doesn't change
      updatedAt: new Date().toISOString()
    };
    
    students[studentIndex] = updatedStudent;
    writeStudents(students);
    
    const { password, ...studentData } = updatedStudent;
    res.json({ message: 'Profile updated successfully', student: studentData });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;