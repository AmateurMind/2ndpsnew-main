const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { authenticate, authorize, loadUsers } = require('../middleware/auth');
const router = express.Router();

const studentsPath = path.join(__dirname, '../data/students.json');

// Helper function to read students
const readStudents = () => {
  return JSON.parse(fs.readFileSync(studentsPath, 'utf8'));
};

// Get student resume - generates PDF on-the-fly
router.get('/:studentId', authenticate, (req, res) => {
  try {
    const { studentId } = req.params;
    const students = readStudents();
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Role-based access control
    const canAccess = checkResumeAccess(req.user, studentId);
    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions to view this resume.' });
    }
    
    // Generate PDF resume on-the-fly
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${student.name.replace(/\s+/g, '_')}_resume.pdf"`);
    res.setHeader('Cache-Control', 'private, no-cache');
    
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);
    
    // Header
    doc.fontSize(28).fillColor('#2563eb').text(student.name, { align: 'center' });
    doc.fontSize(16).fillColor('#6b7280').text(student.email, { align: 'center' });
    doc.fontSize(14).text(student.phone || 'Phone not provided', { align: 'center' });
    doc.moveDown(2);
    
    // Personal Information
    doc.fontSize(18).fillColor('#1f2937').text('Personal Information', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#374151');
    doc.text(`Department: ${student.department}`);
    doc.text(`Semester: ${student.semester}`);
    doc.text(`CGPA: ${student.cgpa}`);
    if (student.address) doc.text(`Address: ${student.address}`);
    if (student.dateOfBirth) doc.text(`Date of Birth: ${new Date(student.dateOfBirth).toLocaleDateString()}`);
    doc.moveDown(1.5);
    
    // Skills
    if (student.skills && student.skills.length > 0) {
      doc.fontSize(18).fillColor('#1f2937').text('Technical Skills', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#374151');
      const skillsText = student.skills.join(', ');
      doc.text(skillsText, { width: 500, lineGap: 2 });
      doc.moveDown(1.5);
    }
    
    // Projects
    if (student.projects && student.projects.length > 0) {
      doc.fontSize(18).fillColor('#1f2937').text('Projects', { underline: true });
      doc.moveDown(0.5);
      
      student.projects.forEach((project, index) => {
        doc.fontSize(14).fillColor('#2563eb').text(project.title);
        doc.fontSize(12).fillColor('#374151');
        if (project.description) doc.text(project.description, { width: 500 });
        if (project.technologies && project.technologies.length > 0) {
          doc.text(`Technologies: ${project.technologies.join(', ')}`, { width: 500 });
        }
        if (project.githubLink) {
          doc.fillColor('#2563eb').text(`GitHub: ${project.githubLink}`, { link: project.githubLink });
        }
        if (index < student.projects.length - 1) doc.moveDown(1);
      });
      doc.moveDown(1.5);
    }
    
    // Achievements
    if (student.achievements && student.achievements.length > 0) {
      doc.fontSize(18).fillColor('#1f2937').text('Achievements', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#374151');
      
      student.achievements.forEach((achievement, index) => {
        doc.text(`• ${achievement}`);
      });
      doc.moveDown(1.5);
    }
    
    // Footer
    doc.fontSize(10).fillColor('#9ca3af');
    doc.text(`Generated on ${new Date().toLocaleDateString()} via Campus Placement Portal`, { align: 'center' });
    
    doc.end();
    
  } catch (error) {
    console.error('Error generating resume:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if user can access student's resume
function checkResumeAccess(user, studentId) {
  switch (user.role) {
    case 'student':
      // Students can only view their own resume
      return user.id === studentId;
      
    case 'admin':
      // Admins can view any resume
      return true;
      
    case 'mentor':
      // Mentors can view any resume (they guide students)
      return true;
      
    case 'recruiter':
      // Recruiters can view resumes of students who applied to their internships
      // For now, allow all - in production you'd check application relationships
      return true;
      
    default:
      return false;
  }
}

// Get student basic info (for resume access verification)
router.get('/:studentId/info', authenticate, (req, res) => {
  try {
    const { studentId } = req.params;
    const students = readStudents();
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Role-based access control
    const canAccess = checkResumeAccess(req.user, studentId);
    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Return basic info needed for resume viewing
    res.json({
      id: student.id,
      name: student.name,
      email: student.email,
      department: student.department,
      semester: student.semester,
      cgpa: student.cgpa,
      hasResume: !!student.resumeLink
    });
    
  } catch (error) {
    console.error('Error fetching student info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;