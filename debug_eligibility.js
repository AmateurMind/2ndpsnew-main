/**
 * Debug script to check eligibility calculation
 * Run this to see exactly what's happening with the eligibility logic
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function debugEligibility() {
  try {
    console.log('🔍 Debugging Eligibility Issue\n');
    
    // First, let's get the internships without authentication to see the raw data
    console.log('1. Fetching internships without authentication...');
    const internshipsResponse = await axios.get(`${BASE_URL}/internships`);
    
    const frontendInternship = internshipsResponse.data.internships.find(i => i.title === "Frontend Development Intern");
    
    if (frontendInternship) {
      console.log('✅ Found Frontend Development Intern:');
      console.log('   - ID:', frontendInternship.id);
      console.log('   - eligibleDepartments:', JSON.stringify(frontendInternship.eligibleDepartments));
      console.log('   - minimumCGPA:', frontendInternship.minimumCGPA);
      console.log('   - minimumSemester:', frontendInternship.minimumSemester);
      console.log('   - status:', frontendInternship.status);
    } else {
      console.log('❌ Frontend Development Intern not found');
      console.log('Available internships:');
      internshipsResponse.data.internships.forEach(i => {
        console.log('   -', i.title);
      });
    }
    
    console.log('\n2. Sample students data:');
    const fs = require('fs');
    const path = require('path');
    const studentsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'backend/data/students.json'), 'utf8'));
    
    studentsData.slice(0, 3).forEach(student => {
      console.log(`   - ${student.name}:`);
      console.log(`     Department: "${student.department}"`);
      console.log(`     CGPA: ${student.cgpa}`);
      console.log(`     Semester: ${student.semester}`);
    });
    
    console.log('\n3. Testing eligibility logic manually...');
    
    if (frontendInternship) {
      const priyaStudent = studentsData.find(s => s.name === "Priya Patel");
      
      if (priyaStudent) {
        console.log('\n📊 Manual Eligibility Check for Priya Patel:');
        
        // Check department match
        const deptMatch = frontendInternship.eligibleDepartments.some(dept => 
          dept && dept.toLowerCase().trim() === priyaStudent.department.toLowerCase().trim()
        );
        
        // Check CGPA
        const cgpaMatch = priyaStudent.cgpa >= frontendInternship.minimumCGPA;
        
        // Check semester
        const semesterMatch = priyaStudent.semester >= frontendInternship.minimumSemester;
        
        console.log(`   Department Match: ${deptMatch ? '✅' : '❌'}`);
        console.log(`   CGPA Match: ${cgpaMatch ? '✅' : '❌'} (${priyaStudent.cgpa} >= ${frontendInternship.minimumCGPA})`);
        console.log(`   Semester Match: ${semesterMatch ? '✅' : '❌'} (${priyaStudent.semester} >= ${frontendInternship.minimumSemester})`);
        
        const overallEligible = deptMatch && cgpaMatch && semesterMatch;
        console.log(`   Overall Eligible: ${overallEligible ? '✅' : '❌'}`);
        
        if (!overallEligible) {
          console.log('\n🔧 Issues found:');
          if (!deptMatch) console.log('   - Department mismatch');
          if (!cgpaMatch) console.log('   - CGPA too low');
          if (!semesterMatch) console.log('   - Semester too low');
        }
      } else {
        console.log('❌ Priya Patel not found in students data');
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 5000');
      console.log('   Run: cd backend && npm start');
    }
  }
}

// Run the debug
debugEligibility();