/**
 * Analyze placement rate calculation
 */

const fs = require('fs');
const path = require('path');

// Read student data
const studentsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'backend/data/students.json'), 'utf8'));

console.log('🎓 Placement Rate Analysis\n');

console.log('📊 Student Status Breakdown:');

let totalStudents = studentsData.length;
let placedStudents = 0;

studentsData.forEach((student, index) => {
  const status = student.isPlaced ? '✅ PLACED' : '❌ NOT PLACED';
  const placementInfo = student.isPlaced && student.placedAt ? 
    ` (${student.placedAt.company} - ${student.placedAt.position})` : '';
  
  console.log(`${index + 1}. ${student.name}: ${status}${placementInfo}`);
  
  if (student.isPlaced) {
    placedStudents++;
  }
});

console.log('\n📈 Calculation:');
console.log(`Total Students: ${totalStudents}`);
console.log(`Placed Students: ${placedStudents}`);

const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

console.log(`Placement Rate: ${placedStudents}/${totalStudents} × 100 = ${placementRate}%`);

console.log('\n🔍 Why 20%?');
console.log(`Out of ${totalStudents} students, only ${placedStudents} student(s) have "isPlaced": true`);
console.log(`${placedStudents}/${totalStudents} = ${(placedStudents/totalStudents)} = ${placementRate}%`);

console.log('\n💡 To increase placement rate, you need to:');
console.log('1. Set more students\' "isPlaced": true');
console.log('2. Add "placedAt" information with company details');
console.log('3. Update student placement status through applications');