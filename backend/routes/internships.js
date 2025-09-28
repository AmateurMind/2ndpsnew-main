const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const router = express.Router();

const internshipsPath = path.join(__dirname, '../data/internships.json');

// Helper function to read internships
const readInternships = () => {
  return JSON.parse(fs.readFileSync(internshipsPath, 'utf8'));
};

// Helper function to write internships
const writeInternships = (internships) => {
  fs.writeFileSync(internshipsPath, JSON.stringify(internships, null, 2));
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
    
    // If user is authenticated and is a student, add recommendation scores
    if (req.user && req.user.role === 'student') {
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
        
        return {
          ...internship,
          recommendationScore: Math.round(recommendationScore),
          isEligible: departmentMatch && cgpaEligible && semesterEligible
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

// Get single internship by ID
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const internships = readInternships();
    const internship = internships.find(i => i.id === req.params.id);
    
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    
    // Add recommendation score if user is a student
    if (req.user && req.user.role === 'student') {
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
      
      internship.recommendationScore = Math.round(recommendationScore);
      internship.isEligible = departmentMatch && cgpaEligible && semesterEligible;
    }
    
    res.json(internship);
  } catch (error) {
    console.error('Error fetching internship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new internship (admin only)
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
    
    const newInternship = {
      id: `INT${String(internships.length + 1).padStart(3, '0')}`,
      title,
      company,
      companyLogo: req.body.companyLogo || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100`,
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
      postedBy: req.user.id
    };
    
    internships.push(newInternship);
    writeInternships(internships);
    
    res.status(201).json({
      message: 'Internship created successfully',
      internship: newInternship
    });
  } catch (error) {
    console.error('Error creating internship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update internship (admin only)
router.put('/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    const internships = readInternships();
    const internshipIndex = internships.findIndex(i => i.id === req.params.id);
    
    if (internshipIndex === -1) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    
    const updatedInternship = {
      ...internships[internshipIndex],
      ...req.body,
      id: req.params.id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    internships[internshipIndex] = updatedInternship;
    writeInternships(internships);
    
    res.json({
      message: 'Internship updated successfully',
      internship: updatedInternship
    });
  } catch (error) {
    console.error('Error updating internship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete internship (admin only)
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    const internships = readInternships();
    const internshipIndex = internships.findIndex(i => i.id === req.params.id);
    
    if (internshipIndex === -1) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    
    const deletedInternship = internships.splice(internshipIndex, 1)[0];
    writeInternships(internships);
    
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