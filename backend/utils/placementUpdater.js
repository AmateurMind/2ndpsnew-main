/**
 * Utility to automatically update student placement status
 * based on accepted applications
 */

const fs = require('fs');
const path = require('path');

const studentsPath = path.join(__dirname, '../data/students.json');
const applicationsPath = path.join(__dirname, '../data/applications.json');
const internshipsPath = path.join(__dirname, '../data/internships.json');

/**
 * Update student placement status when an application is accepted
 */
function updatePlacementStatus(studentId, applicationId) {
  try {
    const students = JSON.parse(fs.readFileSync(studentsPath, 'utf8'));
    const applications = JSON.parse(fs.readFileSync(applicationsPath, 'utf8'));
    const internships = JSON.parse(fs.readFileSync(internshipsPath, 'utf8'));

    // Find the accepted application
    const application = applications.find(app => app.id === applicationId && app.studentId === studentId);
    if (!application || application.status !== 'accepted') {
      console.log('Application not found or not accepted');
      return false;
    }

    // Find the internship
    const internship = internships.find(i => i.id === application.internshipId);
    if (!internship) {
      console.log('Internship not found');
      return false;
    }

    // Find and update the student
    const studentIndex = students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) {
      console.log('Student not found');
      return false;
    }

    // Update student placement status
    students[studentIndex] = {
      ...students[studentIndex],
      isPlaced: true,
      placementStatus: 'placed',
      placedAt: {
        company: internship.company,
        position: internship.title,
        package: internship.stipend || 'Not specified',
        joinDate: internship.startDate || new Date().toISOString(),
        applicationId: applicationId,
        internshipId: application.internshipId
      },
      updatedAt: new Date().toISOString()
    };

    // Save updated students data
    fs.writeFileSync(studentsPath, JSON.stringify(students, null, 2));
    
    console.log(`✅ Student ${students[studentIndex].name} marked as placed at ${internship.company}`);
    return true;

  } catch (error) {
    console.error('Error updating placement status:', error);
    return false;
  }
}

/**
 * Get current placement statistics
 */
function getPlacementStats() {
  try {
    const students = JSON.parse(fs.readFileSync(studentsPath, 'utf8'));
    
    const totalStudents = students.length;
    const placedStudents = students.filter(s => s.isPlaced).length;
    const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

    return {
      totalStudents,
      placedStudents,
      unplacedStudents: totalStudents - placedStudents,
      placementRate,
      placedStudentsList: students.filter(s => s.isPlaced).map(s => ({
        name: s.name,
        company: s.placedAt?.company,
        position: s.placedAt?.position,
        package: s.placedAt?.package
      }))
    };
  } catch (error) {
    console.error('Error getting placement stats:', error);
    return null;
  }
}

/**
 * Mark student as unplaced (for testing or corrections)
 */
function markAsUnplaced(studentId) {
  try {
    const students = JSON.parse(fs.readFileSync(studentsPath, 'utf8'));
    const studentIndex = students.findIndex(s => s.id === studentId);
    
    if (studentIndex === -1) {
      console.log('Student not found');
      return false;
    }

    students[studentIndex] = {
      ...students[studentIndex],
      isPlaced: false,
      placementStatus: 'active',
      placedAt: undefined,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(studentsPath, JSON.stringify(students, null, 2));
    console.log(`✅ Student ${students[studentIndex].name} marked as unplaced`);
    return true;

  } catch (error) {
    console.error('Error marking student as unplaced:', error);
    return false;
  }
}

module.exports = {
  updatePlacementStatus,
  getPlacementStats,
  markAsUnplaced
};