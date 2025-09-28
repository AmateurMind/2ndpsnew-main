const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

const studentsPath = path.join(__dirname, '../data/students.json');

const readStudents = () => JSON.parse(fs.readFileSync(studentsPath, 'utf8'));
const writeStudents = (students) => fs.writeFileSync(studentsPath, JSON.stringify(students, null, 2));

// Create a new student (admin only)
router.post('/', authenticate, authorize('admin'), (req, res) => {
  try {
    const students = readStudents();
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

    if (students.find(s => s.email === email)) {
      return res.status(400).json({ error: 'Student with this email already exists' });
    }

    const newStudent = {
      id: `STU${String(students.length + 1).padStart(3, '0')}`,
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
      dateOfBirth,
      profilePicture,
      projects: [],
      achievements: [],
      isPlaced: false,
      placementStatus: 'active',
      createdAt: new Date().toISOString()
    };

    students.push(newStudent);
    writeStudents(students);
    const { password, ...rest } = newStudent;
    res.status(201).json({ message: 'Student created', student: rest });
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Quick demo route to add a test student (development only)
router.post('/demo-add', (req, res) => {
  try {
    const students = readStudents();
    const count = students.length + 1;
    const testStudent = {
      id: `STU${String(count).padStart(3, '0')}`,
      name: req.body.name || `Test Student ${count}`,
      email: req.body.email || `test${count}@college.edu`,
      password: '$2a$10$example.hash.here',
      role: 'student',
      department: req.body.department || 'Computer Science',
      semester: parseInt(req.body.semester || 5),
      cgpa: parseFloat(req.body.cgpa || 7.5),
      skills: req.body.skills || ['JavaScript', 'React'],
      resumeLink: req.body.resumeLink || 'https://example.com/resume.pdf',
      phone: req.body.phone || '+91-9000000000',
      address: req.body.address || 'Demo Address',
      dateOfBirth: req.body.dateOfBirth || '2002-01-01',
      profilePicture: req.body.profilePicture || '',
      projects: [],
      achievements: [],
      isPlaced: false,
      placementStatus: 'active',
      createdAt: new Date().toISOString()
    };
    students.push(testStudent);
    writeStudents(students);
    const { password, ...rest } = testStudent;
    res.status(201).json({ message: 'Demo student added', student: rest });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all students (admin/mentor/recruiter only)
router.get('/', authenticate, authorize('admin', 'mentor', 'recruiter'), (req, res) => {
  try {
    const students = readStudents();
    const { department, semester, skills, cgpa } = req.query;
    
    let filteredStudents = students.filter(student => {
      if (department && student.department !== department) return false;
      if (semester && student.semester !== parseInt(semester)) return false;
      if (cgpa && student.cgpa < parseFloat(cgpa)) return false;
      if (skills) {
        const skillsArray = skills.split(',').map(s => s.trim());
        const hasSkill = skillsArray.some(skill => 
          student.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        );
        if (!hasSkill) return false;
      }
      return true;
    });
    
    // Remove sensitive data
    filteredStudents = filteredStudents.map(({ password, ...student }) => student);
    
    res.json({ students: filteredStudents, total: filteredStudents.length });
  } catch (error) {
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