/**
 * Test the new ultra-flexible eligibility logic
 */

// Test the new eligibility logic directly
function testNewEligibility(userDepartment, internshipDepts, userCGPA, minCGPA, userSemester, minSemester) {
  // ULTRA-FLEXIBLE DEMO MODE: Allow all CS/IT students to apply to ALL internships
  const userDeptLower = userDepartment ? userDepartment.toLowerCase().trim() : '';
  const isCSITStudent = userDeptLower.includes('computer') || 
                       userDeptLower.includes('information') || 
                       userDeptLower.includes('it') || 
                       userDeptLower.includes('software') ||
                       userDeptLower.includes('science') ||
                       userDeptLower.includes('technology');
  
  // If it's a CS/IT student, make them eligible for everything
  const departmentMatch = isCSITStudent ? true : 
    internshipDepts && userDepartment && 
    internshipDepts.some(dept => {
      if (!dept) return false;
      const deptLower = dept.toLowerCase().trim();
      return deptLower === userDeptLower;
    });
  
  // Ultra-lenient requirements for demo
  const cgpaEligible = userCGPA >= Math.max(0, minCGPA - 2.0); // Allow 2.0 CGPA buffer
  const semesterEligible = userSemester >= Math.max(1, minSemester - 4); // Allow 4 semester buffer

  const overallEligible = departmentMatch && cgpaEligible && semesterEligible;

  return {
    departmentMatch,
    cgpaEligible,
    semesterEligible,
    overallEligible,
    isCSITStudent
  };
}

console.log('🚀 Testing Ultra-Flexible Eligibility Logic\n');

// Test cases for our demo students
const testCases = [
  {
    name: 'Aarav Sharma (Computer Science)',
    userDept: 'Computer Science',
    userCGPA: 8.5,
    userSemester: 6
  },
  {
    name: 'Priya Patel (Information Technology)', 
    userDept: 'Information Technology',
    userCGPA: 8.8,
    userSemester: 6
  },
  {
    name: 'Arjun Gupta (Information Technology)',
    userDept: 'Information Technology', 
    userCGPA: 7.8,
    userSemester: 4
  },
  {
    name: 'Sneha Reddy (Electronics)',
    userDept: 'Electronics',
    userCGPA: 8.2,
    userSemester: 6
  }
];

// Frontend Development Intern requirements
const frontendInternship = {
  name: 'Frontend Development Intern',
  eligibleDepartments: ['Computer Science', 'Information Technology'],
  minimumCGPA: 7.5,
  minimumSemester: 5
};

console.log(`Testing against: ${frontendInternship.name}`);
console.log(`Required Departments: ${frontendInternship.eligibleDepartments.join(', ')}`);
console.log(`Minimum CGPA: ${frontendInternship.minimumCGPA}`);
console.log(`Minimum Semester: ${frontendInternship.minimumSemester}\n`);

testCases.forEach(student => {
  const result = testNewEligibility(
    student.userDept,
    frontendInternship.eligibleDepartments,
    student.userCGPA,
    frontendInternship.minimumCGPA,
    student.userSemester,
    frontendInternship.minimumSemester
  );

  console.log(`👨‍💻 ${student.name}:`);
  console.log(`   Department: ${student.userDept} (CS/IT Student: ${result.isCSITStudent ? '✅' : '❌'})`);
  console.log(`   CGPA: ${student.userCGPA} (Required: ≥${Math.max(0, frontendInternship.minimumCGPA - 2.0).toFixed(1)})`);
  console.log(`   Semester: ${student.userSemester} (Required: ≥${Math.max(1, frontendInternship.minimumSemester - 4)})`);
  console.log(`   Department Match: ${result.departmentMatch ? '✅' : '❌'}`);
  console.log(`   CGPA Eligible: ${result.cgpaEligible ? '✅' : '❌'}`);
  console.log(`   Semester Eligible: ${result.semesterEligible ? '✅' : '❌'}`);
  console.log(`   🎯 OVERALL ELIGIBLE: ${result.overallEligible ? '✅ YES' : '❌ NO'}`);
  console.log('');
});

console.log('📋 Summary of Changes:');
console.log('✅ All CS/IT students can now apply to ANY internship');
console.log('✅ CGPA requirement reduced by 2.0 points');
console.log('✅ Semester requirement reduced by 4 semesters');
console.log('✅ More flexible department name matching');