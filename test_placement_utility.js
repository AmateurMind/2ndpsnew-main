/**
 * Test the placement utility
 */

const { getPlacementStats } = require('./backend/utils/placementUpdater');

console.log('📊 Current Placement Statistics\n');

const stats = getPlacementStats();

if (stats) {
  console.log(`📈 Overall Statistics:`);
  console.log(`   Total Students: ${stats.totalStudents}`);
  console.log(`   Placed Students: ${stats.placedStudents}`);
  console.log(`   Unplaced Students: ${stats.unplacedStudents}`);
  console.log(`   Placement Rate: ${stats.placementRate}%`);
  
  console.log(`\n✅ Placed Students:`);
  stats.placedStudentsList.forEach((student, index) => {
    console.log(`   ${index + 1}. ${student.name} → ${student.company} (${student.position}) - ${student.package}`);
  });
  
  if (stats.placementRate >= 80) {
    console.log(`\n🎉 Excellent placement rate! ${stats.placementRate}% is above industry standards.`);
  } else if (stats.placementRate >= 60) {
    console.log(`\n👍 Good placement rate! ${stats.placementRate}% is competitive.`);
  } else if (stats.placementRate >= 40) {
    console.log(`\n📈 Moderate placement rate. ${stats.placementRate}% has room for improvement.`);
  } else {
    console.log(`\n⚠️  Low placement rate. ${stats.placementRate}% needs attention.`);
  }
} else {
  console.log('❌ Failed to get placement statistics');
}