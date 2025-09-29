const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorize, optionalAuth, verifyInternshipOwnership, logAdminAction } = require('../middleware/auth');
const router = express.Router();

const internshipsPath = path.join(__dirname, '../data/internships.json');
const applicationsPath = path.join(__dirname, '../data/applications.json');

// Helper function to read internships
const readInternships = () => {
  return JSON.parse(fs.readFileSync(internshipsPath, 'utf8'));
};

// Helper function to write internships
const writeInternships = (internships) => {
  fs.writeFileSync(internshipsPath, JSON.stringify(internships, null, 2));
};

// Helper function to read applications
const readApplications = () => {
  return JSON.parse(fs.readFileSync(applicationsPath, 'utf8'));
};

// Get all internships (with optional filtering)
router.get('/', optionalAuth, (req, res) => {
  try {
    const internships = readInternships();
    const { 
      department, 
      skills, 
      location, 
      workMode, 
      company, 
      status = 'active',
      minStipend,
      maxStipend 
    } = req.query;
    
    let filteredInternships = internships.filter(internship => {
      // Filter out submitted internships for non-admin users
      if (internship.status === 'submitted' && (!req.user || req.user.role !== 'admin')) return false;
      // Filter out rejected internships for everyone except admins and the submitter
      if (internship.status === 'rejected' && (!req.user || (req.user.role !== 'admin' && req.user.id !== internship.submittedBy))) return false;
      
      if (status && internship.status !== status) return false;
      if (department && !internship.eligibleDepartments.includes(department)) return false;
      if (location && !internship.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (workMode && internship.workMode !== workMode) return false;
      if (company && !internship.company.toLowerCase().includes(company.toLowerCase())) return false;
      
      // Skills matching
      if (skills) {
        const skillsArray = skills.split(',').map(s => s.trim());
        const hasMatchingSkill = skillsArray.some(skill => 
          internship.requiredSkills.some(reqSkill => 
            reqSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        if (!hasMatchingSkill) return false;
      }
      
      // Stipend filtering (simplified - extract number from stipend string)
      if (minStipend || maxStipend) {
        const stipendMatch = internship.stipend.match(/₹(\d+,?\d*)/);
        if (stipendMatch) {
          const stipendAmount = parseInt(stipendMatch[1].replace(',', ''));
          if (minStipend && stipendAmount < parseInt(minStipend)) return false;
          if (maxStipend && stipendAmount > parseInt(maxStipend)) return false;
        }
      }
      
      return true;
    });
    
    // If user is authenticated and is a student, add recommendation scores and application status
    if (req.user && req.user.role === 'student') {
      const applications = readApplications();
      
      filteredInternships = filteredInternships.map(internship => {
        const skillMatch = internship.requiredSkills.filter(skill => 
          req.user.skills.includes(skill)
        ).length;
        const departmentMatch = internship.eligibleDepartments.includes(req.user.department);
        const cgpaEligible = req.user.cgpa >= internship.minimumCGPA;
        const semesterEligible = req.user.semester >= internship.minimumSemester;
        
        const recommendationScore = (
          (skillMatch / internship.requiredSkills.length) * 40 +
          (departmentMatch ? 30 : 0) +
          (cgpaEligible ? 20 : 0) +
          (semesterEligible ? 10 : 0)
        );
        
        // Check if student has already applied to this internship
        const hasApplied = applications.some(app => 
          app.studentId === req.user.id && app.internshipId === internship.id
        );
        
        return {
          ...internship,
          recommendationScore: Math.round(recommendationScore),
          isEligible: departmentMatch && cgpaEligible && semesterEligible,
          hasApplied: hasApplied
        };
      });
      
      // Sort by recommendation score if this is for recommendations
      if (req.query.recommended === 'true') {
        filteredInternships.sort((a, b) => b.recommendationScore - a.recommendationScore);
      }
    }
    
    res.json({
      internships: filteredInternships,
      total: filteredInternships.length,
      filters: { department, skills, location, workMode, company, status }
    });
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get internships posted/submitted by current recruiter (must be before /:id route)
router.get('/my-postings', authenticate, authorize('recruiter'), (req, res) => {
  try {
    const internships = readInternships();
    // Include both submitted and posted internships by the recruiter
    const myInternships = internships.filter(i => 
      i.postedBy === req.user.id || i.submittedBy === req.user.id
    );
    
    res.json({
      internships: myInternships,
      total: myInternships.length
    });
  } catch (error) {
    console.error('Error fetching recruiter internships:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending internship submissions (admin only) - placed BEFORE dynamic :id route to avoid conflicts
router.get('/pending', authenticate, authorize('admin'), (req, res) => {
  try {
    const internships = readInternships();
    const pendingInternships = internships.filter(i => i.status === 'submitted');

    res.json({
      internships: pendingInternships,
      total: pendingInternships.length
    });
  } catch (error) {
    console.error('Error fetching pending internships:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single internship by ID
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const internships = readInternships();
    const internship = internships.find(i => i.id === req.params.id);
    
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    
    // Add recommendation score and application status if user is a student
    if (req.user && req.user.role === 'student') {
      const applications = readApplications();
      
      const skillMatch = internship.requiredSkills.filter(skill => 
        req.user.skills.includes(skill)
      ).length;
      const departmentMatch = internship.eligibleDepartments.includes(req.user.department);
      const cgpaEligible = req.user.cgpa >= internship.minimumCGPA;
      const semesterEligible = req.user.semester >= internship.minimumSemester;
      
      const recommendationScore = (
        (skillMatch / internship.requiredSkills.length) * 40 +
        (departmentMatch ? 30 : 0) +
        (cgpaEligible ? 20 : 0) +
        (semesterEligible ? 10 : 0)
      );
      
      // Check if student has already applied to this internship
      const hasApplied = applications.some(app => 
        app.studentId === req.user.id && app.internshipId === internship.id
      );
      
      internship.recommendationScore = Math.round(recommendationScore);
      internship.isEligible = departmentMatch && cgpaEligible && semesterEligible;
      internship.hasApplied = hasApplied;
    }
    
    res.json(internship);
  } catch (error) {
    console.error('Error fetching internship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new internship (admin only - direct posting)
router.post('/', authenticate, authorize('admin'), (req, res) => {
  try {
    const internships = readInternships();
    const {
      title,
      company,
      description,
      requiredSkills,
      eligibleDepartments,
      minimumSemester,
      minimumCGPA,
      stipend,
      duration,
      location,
      workMode,
      applicationDeadline,
      startDate,
      maxApplications
    } = req.body;
    
    // Validation
    if (!title || !company || !description || !requiredSkills || !eligibleDepartments) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, company, description, requiredSkills, eligibleDepartments' 
      });
    }
    
    // Admin directly posting internships
    const finalCompany = company;
    const finalCompanyLogo = req.body.companyLogo;
    
    const newInternship = {
      id: `INT${String(internships.length + 1).padStart(3, '0')}`,
      title,
      company: finalCompany,
      companyLogo: finalCompanyLogo,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills],
      preferredSkills: req.body.preferredSkills || [],
      eligibleDepartments: Array.isArray(eligibleDepartments) ? eligibleDepartments : [eligibleDepartments],
      minimumSemester: minimumSemester || 4,
      minimumCGPA: minimumCGPA || 6.0,
      stipend,
      duration,
      location,
      workMode: workMode || 'On-site',
      applicationDeadline,
      startDate,
      maxApplications: maxApplications || 50,
      currentApplications: 0,
      status: 'active',
      companyDescription: req.body.companyDescription || '',
      requirements: req.body.requirements || [],
      benefits: req.body.benefits || [],
      createdAt: new Date().toISOString(),
      postedBy: req.user.id,
      postedByRole: req.user.role,
      submittedBy: null,
      approvedBy: req.user.id,
      submittedAt: null,
      approvedAt: new Date().toISOString(),
      adminNotes: '',
      recruiterNotes: '',
      rejectionReason: ''
    };
    
    internships.push(newInternship);
    writeInternships(internships);
    
    // Log admin action
    logAdminAction(req.user.id, 'CREATE_INTERNSHIP', {
      internshipId: newInternship.id,
      title: newInternship.title,
      company: newInternship.company
    });
    
    res.status(201).json({
      message: 'Internship created successfully',
      internship: newInternship
    });
  } catch (error) {
    console.error('Error creating internship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit internship for approval (recruiters only)
router.post('/submit', authenticate, authorize('recruiter'), (req, res) => {
  try {
    const internships = readInternships();
    const {
      title,
      description,
      requiredSkills,
      eligibleDepartments,
      minimumSemester,
      minimumCGPA,
      stipend,
      duration,
      location,
      workMode,
      applicationDeadline,
      startDate,
      maxApplications,
      companyDescription,
      requirements,
      benefits,
      recruiterNotes
    } = req.body;
    
    // Validation
    if (!title || !description || !requiredSkills || !eligibleDepartments) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, description, requiredSkills, eligibleDepartments' 
      });
    }
    
    // Auto-fill company info from recruiter profile
    const finalCompany = req.user.company || 'Company Name';
    const finalCompanyLogo = req.user.companyLogo || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100`;
    
    const newSubmission = {
      id: `INT${String(internships.length + 1).padStart(3, '0')}`,
      title,
      company: finalCompany,
      companyLogo: finalCompanyLogo,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills],
      preferredSkills: req.body.preferredSkills || [],
      eligibleDepartments: Array.isArray(eligibleDepartments) ? eligibleDepartments : [eligibleDepartments],
      minimumSemester: minimumSemester || 4,
      minimumCGPA: minimumCGPA || 6.0,
      stipend,
      duration,
      location,
      workMode: workMode || 'On-site',
      applicationDeadline,
      startDate,
      maxApplications: maxApplications || 50,
      currentApplications: 0,
      status: 'submitted', // Submitted for approval
      companyDescription: companyDescription || '',
      requirements: requirements || [],
      benefits: benefits || [],
      createdAt: new Date().toISOString(),
      postedBy: null, // Will be set when approved
      postedByRole: null,
      submittedBy: req.user.id,
      approvedBy: null,
      submittedAt: new Date().toISOString(),
      approvedAt: null,
      adminNotes: '',
      recruiterNotes: recruiterNotes || '',
      rejectionReason: ''
    };
    
    internships.push(newSubmission);
    writeInternships(internships);
    
    res.status(201).json({
      message: 'Internship submitted for approval successfully',
      internship: newSubmission
    });
  } catch (error) {
    console.error('Error submitting internship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve internship submission (admin only)
router.put('/:id/approve', authenticate, authorize('admin'), (req, res) => {
  try {
    const internships = readInternships();
    const internshipIndex = internships.findIndex(i => i.id === req.params.id);
    
    if (internshipIndex === -1) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    
    const internship = internships[internshipIndex];
    
    // Check if internship is in submitted status
    if (internship.status !== 'submitted') {
      return res.status(400).json({ error: 'Internship is not in submitted status' });
    }
    
    const { adminNotes } = req.body;
    
    // Update internship to approved status
    internships[internshipIndex] = {
      ...internship,
      status: 'active',
      postedBy: internship.submittedBy, // Set the recruiter as poster
      postedByRole: 'recruiter',
      approvedBy: req.user.id,
      approvedAt: new Date().toISOString(),
      adminNotes: adminNotes || '',
      updatedAt: new Date().toISOString()
    };
    
    writeInternships(internships);
    
    // Log admin action
    logAdminAction(req.user.id, 'APPROVE_INTERNSHIP', {
      internshipId: req.params.id,
      title: internship.title,
      submittedBy: internship.submittedBy,
      adminNotes
    });
    
    res.json({
      message: 'Internship approved successfully',
      internship: internships[internshipIndex]
    });
  } catch (error) {
    console.error('Error approving internship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject internship submission (admin only)
router.put('/:id/reject', authenticate, authorize('admin'), (req, res) => {
  try {
    const internships = readInternships();
    const internshipIndex = internships.findIndex(i => i.id === req.params.id);
    
    if (internshipIndex === -1) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    
    const internship = internships[internshipIndex];
    
    // Check if internship is in submitted status
    if (internship.status !== 'submitted') {
      return res.status(400).json({ error: 'Internship is not in submitted status' });
    }
    
    const { rejectionReason, adminNotes } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    // Update internship to rejected status
    internships[internshipIndex] = {
      ...internship,
      status: 'rejected',
      approvedBy: req.user.id,
      approvedAt: new Date().toISOString(),
      adminNotes: adminNotes || '',
      rejectionReason,
      updatedAt: new Date().toISOString()
    };
    
    writeInternships(internships);
    
    // Log admin action
    logAdminAction(req.user.id, 'REJECT_INTERNSHIP', {
      internshipId: req.params.id,
      title: internship.title,
      submittedBy: internship.submittedBy,
      rejectionReason,
      adminNotes
    });
    
    res.json({
      message: 'Internship rejected',
      internship: internships[internshipIndex]
    });
  } catch (error) {
    console.error('Error rejecting internship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update internship (admin and recruiter with ownership verification)
router.put('/:id', authenticate, authorize('admin', 'recruiter'), verifyInternshipOwnership, (req, res) => {
  try {
    const internships = readInternships();
    const internshipIndex = internships.findIndex(i => i.id === req.params.id);
    
    if (internshipIndex === -1) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    
    const existingInternship = internships[internshipIndex];
    
    // Additional check: Recruiters can only edit approved internships, not submitted ones
    if (req.user.role === 'recruiter' && existingInternship.status === 'submitted') {
      return res.status(403).json({ error: 'Cannot edit internship while it is pending approval.' });
    }
    
    const updatedInternship = {
      ...internships[internshipIndex],
      ...req.body,
      id: req.params.id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    internships[internshipIndex] = updatedInternship;
    writeInternships(internships);
    
    // Log admin action if admin is updating
    if (req.user.role === 'admin') {
      logAdminAction(req.user.id, 'UPDATE_INTERNSHIP', {
        internshipId: req.params.id,
        title: updatedInternship.title
      });
    }
    
    res.json({
      message: 'Internship updated successfully',
      internship: updatedInternship
    });
  } catch (error) {
    console.error('Error updating internship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete internship (admin and recruiter with ownership verification)
router.delete('/:id', authenticate, authorize('admin', 'recruiter'), verifyInternshipOwnership, (req, res) => {
  try {
    const internships = readInternships();
    const internshipIndex = internships.findIndex(i => i.id === req.params.id);
    
    if (internshipIndex === -1) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    
    const existingInternship = internships[internshipIndex];
    
    // Recruiters can only delete their own submissions, and only if they're not yet approved
    if (req.user.role === 'recruiter' && existingInternship.status === 'active') {
      return res.status(403).json({ error: 'Cannot delete active internships. Please contact admin.' });
    }
    
    const deletedInternship = internships.splice(internshipIndex, 1)[0];
    writeInternships(internships);
    
    // Log admin action if admin is deleting
    if (req.user.role === 'admin') {
      logAdminAction(req.user.id, 'DELETE_INTERNSHIP', {
        internshipId: req.params.id,
        title: deletedInternship.title
      });
    }
    
    res.json({
      message: 'Internship deleted successfully',
      internship: deletedInternship
    });
  } catch (error) {
    console.error('Error deleting internship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Get internship statistics (admin only)
router.get('/stats/overview', authenticate, authorize('admin'), (req, res) => {
  try {
    const internships = readInternships();
    
    const stats = {
      total: internships.length,
      active: internships.filter(i => i.status === 'active').length,
      inactive: internships.filter(i => i.status === 'inactive').length,
      byLocation: {},
      byCompany: {},
      totalApplications: internships.reduce((sum, i) => sum + i.currentApplications, 0)
    };
    
    internships.forEach(internship => {
      stats.byLocation[internship.location] = (stats.byLocation[internship.location] || 0) + 1;
      stats.byCompany[internship.company] = (stats.byCompany[internship.company] || 0) + 1;
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching internship stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;