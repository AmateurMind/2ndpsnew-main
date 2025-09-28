const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

const applicationsPath = path.join(__dirname, '../data/applications.json');
const internshipsPath = path.join(__dirname, '../data/internships.json');
const mentorsPath = path.join(__dirname, '../data/mentors.json');
const studentsPath = path.join(__dirname, '../data/students.json');

// Helper functions
const readApplications = () => JSON.parse(fs.readFileSync(applicationsPath, 'utf8'));
const writeApplications = (applications) => fs.writeFileSync(applicationsPath, JSON.stringify(applications, null, 2));
const readInternships = () => JSON.parse(fs.readFileSync(internshipsPath, 'utf8'));
const writeInternships = (internships) => fs.writeFileSync(internshipsPath, JSON.stringify(internships, null, 2));
const readMentors = () => JSON.parse(fs.readFileSync(mentorsPath, 'utf8'));
const readStudents = () => JSON.parse(fs.readFileSync(studentsPath, 'utf8'));

// Get applications based on user role
router.get('/', authenticate, (req, res) => {
  try {
    const applications = readApplications();
    const internships = readInternships();
    const students = readStudents();
    
    let filteredApplications = [];
    
    switch (req.user.role) {
      case 'student':
        filteredApplications = applications.filter(app => app.studentId === req.user.id);
        break;
      case 'mentor':
        filteredApplications = applications.filter(app => app.mentorId === req.user.id);
        break;
      case 'admin':
      case 'recruiter':
        filteredApplications = applications;
        break;
      default:
        return res.status(403).json({ error: 'Access denied' });
    }
    
    // Enrich with internship and student data
    const enrichedApplications = filteredApplications.map(app => {
      const internship = internships.find(i => i.id === app.internshipId);
      const student = students.find(s => s.id === app.studentId);
      return {
        ...app,
        internship: internship ? {
          id: internship.id,
          title: internship.title,
          company: internship.company,
          location: internship.location,
          stipend: internship.stipend,
          duration: internship.duration,
        } : null,
        student: student ? {
          id: student.id,
          name: student.name,
          email: student.email,
          resumeLink: student.resumeLink,
          department: student.department,
          cgpa: student.cgpa,
          semester: student.semester,
        } : null
      };
    });
    
    res.json({
      applications: enrichedApplications,
      total: enrichedApplications.length
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single application
router.get('/:id', authenticate, (req, res) => {
  try {
    const applications = readApplications();
    const application = applications.find(app => app.id === req.params.id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Check access permissions
    if (req.user.role === 'student' && application.studentId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'mentor' && application.mentorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new application (students only)
router.post('/', authenticate, authorize('student'), (req, res) => {
  try {
    const applications = readApplications();
    const internships = readInternships();
    const mentors = readMentors();
    const { internshipId, coverLetter, mentorId } = req.body;
    
    if (!internshipId || !coverLetter) {
      return res.status(400).json({ error: 'Internship ID and cover letter are required' });
    }
    
    const internship = internships.find(i => i.id === internshipId);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    
    // Check if student already applied
    const existingApplication = applications.find(app => 
      app.studentId === req.user.id && app.internshipId === internshipId
    );
    
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this internship' });
    }
    
    // Check eligibility
    const isEligible = internship.eligibleDepartments.includes(req.user.department) &&
                      req.user.cgpa >= internship.minimumCGPA &&
                      req.user.semester >= internship.minimumSemester;
    
    if (!isEligible) {
      return res.status(400).json({ error: 'You are not eligible for this internship' });
    }

    // Determine mentor assignment
    let assignedMentorId = mentorId || null;
    if (!assignedMentorId) {
      // Auto-assign a mentor from the same department if available, otherwise first mentor
      const deptMentor = mentors.find(m => m.department === req.user.department);
      assignedMentorId = deptMentor ? deptMentor.id : (mentors[0] ? mentors[0].id : null);
    }
    
    const newApplication = {
      id: `APP${String(applications.length + 1).padStart(3, '0')}`,
      studentId: req.user.id,
      internshipId,
      status: assignedMentorId ? 'pending_mentor_approval' : 'applied',
      appliedAt: new Date().toISOString(),
      coverLetter,
      mentorId: assignedMentorId,
      mentorApproval: null,
      mentorFeedback: null,
      interviewScheduled: null,
      interviewFeedback: null,
      finalStatus: null,
      updatedAt: new Date().toISOString()
    };
    
    applications.push(newApplication);
    writeApplications(applications);
    
    // Update internship application count
    const internshipIndex = internships.findIndex(i => i.id === internshipId);
    if (internshipIndex !== -1) {
      internships[internshipIndex].currentApplications += 1;
      writeInternships(internships);
    }
    
    res.status(201).json({
      message: 'Application submitted successfully',
      application: newApplication
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update application status (mentors and admins)
router.put('/:id/status', authenticate, authorize('mentor', 'admin'), (req, res) => {
  try {
    const applications = readApplications();
    const { status, feedback, interviewDetails, offerDetails } = req.body;
    
    const applicationIndex = applications.findIndex(app => app.id === req.params.id);
    if (applicationIndex === -1) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const application = applications[applicationIndex];
    
    // Check permissions
    if (req.user.role === 'mentor' && application.mentorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Update application
    const updatedApplication = {
      ...application,
      status,
      updatedAt: new Date().toISOString()
    };
    
    if (req.user.role === 'mentor') {
      updatedApplication.mentorApproval = status === 'approved' ? 'approved' : 'rejected';
      updatedApplication.mentorFeedback = feedback;
    }
    
    if (interviewDetails) {
      updatedApplication.interviewScheduled = {
        ...interviewDetails,
        date: new Date(interviewDetails.date).toISOString()
      };
    }
    
    if (offerDetails) {
      updatedApplication.offerDetails = offerDetails;
    }
    
    if (feedback && status === 'interview_completed') {
      updatedApplication.interviewFeedback = feedback;
    }
    
    applications[applicationIndex] = updatedApplication;
    writeApplications(applications);
    
    res.json({
      message: 'Application status updated successfully',
      application: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending approvals for mentor
router.get('/pending/mentor', authenticate, authorize('mentor'), (req, res) => {
  try {
    const applications = readApplications();
    const internships = readInternships();
    const students = readStudents();
    const pendingApplications = applications.filter(app => 
      app.mentorId === req.user.id && app.status === 'pending_mentor_approval'
    ).map(app => {
      const internship = internships.find(i => i.id === app.internshipId);
      const student = students.find(s => s.id === app.studentId);
      return {
        ...app,
        internship: internship ? {
          id: internship.id,
          title: internship.title,
          company: internship.company,
          location: internship.location,
          stipend: internship.stipend,
          duration: internship.duration,
        } : null,
        student: student ? {
          id: student.id,
          name: student.name,
          email: student.email,
          resumeLink: student.resumeLink,
          department: student.department,
          cgpa: student.cgpa,
          semester: student.semester,
        } : null
      };
    });
    
    res.json({
      applications: pendingApplications,
      total: pendingApplications.length
    });
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get application analytics
router.get('/analytics/overview', authenticate, authorize('admin'), (req, res) => {
  try {
    const applications = readApplications();
    
    const analytics = {
      total: applications.length,
      byStatus: {},
      byMonth: {},
      recentApplications: applications.slice(-10)
    };
    
    applications.forEach(app => {
      analytics.byStatus[app.status] = (analytics.byStatus[app.status] || 0) + 1;
      
      const month = new Date(app.appliedAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      analytics.byMonth[month] = (analytics.byMonth[month] || 0) + 1;
    });
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching application analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;