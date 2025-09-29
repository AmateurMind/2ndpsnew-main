const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticate, authorize, verifyInternshipOwnership } = require('../middleware/auth');
const router = express.Router();

// Helper functions to read data files
const readStudents = () => JSON.parse(fs.readFileSync(path.join(__dirname, '../data/students.json'), 'utf8'));
const readInternships = () => JSON.parse(fs.readFileSync(path.join(__dirname, '../data/internships.json'), 'utf8'));
const readApplications = () => JSON.parse(fs.readFileSync(path.join(__dirname, '../data/applications.json'), 'utf8'));
const readFeedback = () => JSON.parse(fs.readFileSync(path.join(__dirname, '../data/feedback.json'), 'utf8'));

// Dashboard analytics for admins
router.get('/dashboard', authenticate, authorize('admin'), (req, res) => {
  try {
    const students = readStudents();
    const internships = readInternships();
    const applications = readApplications();
    const feedback = readFeedback();
    
    // Basic counts
    const totalStudents = students.length;
    const activeInternships = internships.filter(i => i.status === 'active').length;
    const totalApplications = applications.length;
    const placedStudents = students.filter(s => s.isPlaced).length;
    const unplacedStudents = totalStudents - placedStudents;
    
    // Application status breakdown
    const applicationsByStatus = {
      applied: 0,
      pending_mentor_approval: 0,
      approved: 0,
      rejected: 0,
      interview_scheduled: 0,
      interview_completed: 0,
      offered: 0,
      accepted: 0
    };
    
    applications.forEach(app => {
      applicationsByStatus[app.status] = (applicationsByStatus[app.status] || 0) + 1;
    });
    
    // Students by department
    const studentsByDepartment = {};
    students.forEach(student => {
      studentsByDepartment[student.department] = (studentsByDepartment[student.department] || 0) + 1;
    });
    
    // Recent activities (last 10 applications)
    const recentActivities = applications
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
      .slice(0, 10)
      .map(app => {
        const student = students.find(s => s.id === app.studentId);
        const internship = internships.find(i => i.id === app.internshipId);
        return {
          id: app.id,
          student: student?.name || 'Unknown',
          internship: internship?.title || 'Unknown',
          company: internship?.company || 'Unknown',
          status: app.status,
          appliedAt: app.appliedAt
        };
      });
    
    // Upcoming interviews
    const upcomingInterviews = applications
      .filter(app => app.interviewScheduled && new Date(app.interviewScheduled.date) > new Date())
      .sort((a, b) => new Date(a.interviewScheduled.date) - new Date(b.interviewScheduled.date))
      .slice(0, 5)
      .map(app => {
        const student = students.find(s => s.id === app.studentId);
        const internship = internships.find(i => i.id === app.internshipId);
        return {
          id: app.id,
          student: student?.name || 'Unknown',
          internship: internship?.title || 'Unknown',
          company: internship?.company || 'Unknown',
          date: app.interviewScheduled.date,
          mode: app.interviewScheduled.mode
        };
      });
    
    // Top companies by applications
    const companiesMap = {};
    applications.forEach(app => {
      const internship = internships.find(i => i.id === app.internshipId);
      if (internship) {
        companiesMap[internship.company] = (companiesMap[internship.company] || 0) + 1;
      }
    });
    
    const topCompanies = Object.entries(companiesMap)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([company, count]) => ({ company, applications: count }));
    
    const analytics = {
      overview: {
        totalStudents,
        activeInternships,
        totalApplications,
        placedStudents,
        unplacedStudents,
        placementRate: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0
      },
      applicationsByStatus,
      studentsByDepartment,
      recentActivities,
      upcomingInterviews,
      topCompanies,
      monthlyTrends: getMonthlyTrends(applications),
      skillsDemand: getSkillsDemand(internships)
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Student analytics
router.get('/student/:studentId', authenticate, (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check permission
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const applications = readApplications();
    const internships = readInternships();
    const feedback = readFeedback();
    
    const studentApplications = applications.filter(app => app.studentId === studentId);
    const studentFeedback = feedback.filter(f => f.studentId === studentId);
    
    const analytics = {
      totalApplications: studentApplications.length,
      applicationsByStatus: {},
      averageRating: 0,
      skillsDeveloped: [],
      applicationHistory: studentApplications.map(app => {
        const internship = internships.find(i => i.id === app.internshipId);
        return {
          id: app.id,
          internship: internship?.title || 'Unknown',
          company: internship?.company || 'Unknown',
          status: app.status,
          appliedAt: app.appliedAt
        };
      }),
      feedback: studentFeedback
    };
    
    // Calculate application status breakdown
    studentApplications.forEach(app => {
      analytics.applicationsByStatus[app.status] = (analytics.applicationsByStatus[app.status] || 0) + 1;
    });
    
    // Calculate average rating from feedback
    if (studentFeedback.length > 0) {
      const totalRating = studentFeedback.reduce((sum, f) => sum + (f.rating || 0), 0);
      analytics.averageRating = Math.round((totalRating / studentFeedback.length) * 10) / 10;
    }
    
    // Extract skills developed
    const skillsSet = new Set();
    studentFeedback.forEach(f => {
      if (f.skills_developed) {
        f.skills_developed.forEach(skill => skillsSet.add(skill));
      }
    });
    analytics.skillsDeveloped = Array.from(skillsSet);
    
    res.json(analytics);
  } catch (error) {
    console.error('Student analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get monthly trends
function getMonthlyTrends(applications) {
  const monthlyData = {};
  
  applications.forEach(app => {
    const month = new Date(app.appliedAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });
  
  return Object.entries(monthlyData)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([month, count]) => ({ month, applications: count }));
}

// Helper function to get skills demand
function getSkillsDemand(internships) {
  const skillsMap = {};
  
  internships.forEach(internship => {
    internship.requiredSkills.forEach(skill => {
      skillsMap[skill] = (skillsMap[skill] || 0) + 1;
    });
  });
  
  return Object.entries(skillsMap)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([skill, demand]) => ({ skill, demand }));
}

// Recruiter analytics (limited to their own internships)
router.get('/recruiter', authenticate, authorize('recruiter'), (req, res) => {
  try {
    const applications = readApplications();
    const internships = readInternships();
    const students = readStudents();
    
    // Get only recruiter's internships
    const recruiterInternships = internships.filter(
      i => i.postedBy === req.user.id || i.submittedBy === req.user.id
    );
    
    const recruiterInternshipIds = recruiterInternships.map(i => i.id);
    
    // Filter applications to only those for recruiter's internships
    const recruiterApplications = applications.filter(
      app => recruiterInternshipIds.includes(app.internshipId)
    );
    
    // Basic counts
    const totalInternships = recruiterInternships.length;
    const activeInternships = recruiterInternships.filter(i => i.status === 'active').length;
    const pendingInternships = recruiterInternships.filter(i => i.status === 'submitted').length;
    const totalApplications = recruiterApplications.length;
    
    // Application status breakdown
    const applicationsByStatus = {
      applied: 0,
      pending_mentor_approval: 0,
      approved: 0,
      rejected: 0,
      interview_scheduled: 0,
      interview_completed: 0,
      offered: 0,
      accepted: 0
    };
    
    recruiterApplications.forEach(app => {
      applicationsByStatus[app.status] = (applicationsByStatus[app.status] || 0) + 1;
    });
    
    // Applications per internship
    const applicationsByInternship = recruiterInternships.map(internship => {
      const internshipApps = recruiterApplications.filter(app => app.internshipId === internship.id);
      return {
        internshipId: internship.id,
        title: internship.title,
        totalApplications: internshipApps.length,
        approvedApplications: internshipApps.filter(app => app.status === 'approved').length,
        rejectedApplications: internshipApps.filter(app => app.status === 'rejected').length
      };
    });
    
    // Recent activities (last 10 applications to recruiter's internships)
    const recentActivities = recruiterApplications
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
      .slice(0, 10)
      .map(app => {
        const student = students.find(s => s.id === app.studentId);
        const internship = internships.find(i => i.id === app.internshipId);
        return {
          id: app.id,
          student: student?.name || 'Unknown',
          internship: internship?.title || 'Unknown',
          status: app.status,
          appliedAt: app.appliedAt
        };
      });
    
    // Performance metrics
    const performanceMetrics = {
      averageApplicationsPerInternship: totalInternships > 0 ? Math.round(totalApplications / totalInternships) : 0,
      approvalRate: totalApplications > 0 ? Math.round((applicationsByStatus.approved / totalApplications) * 100) : 0,
      responseTime: calculateAverageResponseTime(recruiterApplications)
    };
    
    const analytics = {
      overview: {
        totalInternships,
        activeInternships,
        pendingInternships,
        totalApplications
      },
      applicationsByStatus,
      applicationsByInternship,
      recentActivities,
      performanceMetrics,
      monthlyTrends: getMonthlyTrends(recruiterApplications)
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Recruiter analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to calculate average response time
function calculateAverageResponseTime(applications) {
  const processedApplications = applications.filter(
    app => app.status !== 'applied' && app.processedAt
  );
  
  if (processedApplications.length === 0) return 0;
  
  const totalResponseTime = processedApplications.reduce((sum, app) => {
    const applied = new Date(app.appliedAt);
    const processed = new Date(app.processedAt);
    return sum + (processed - applied);
  }, 0);
  
  // Return average response time in hours
  return Math.round((totalResponseTime / processedApplications.length) / (1000 * 60 * 60));
}

module.exports = router;
