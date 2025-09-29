const fs = require('fs');
const path = require('path');

// Quick route conversion patterns
const routeFiles = [
  'internships.js',
  'applications.js', 
  'admins.js',
  'mentors.js',
  'recruiters.js',
  'feedback.js',
  'analytics.js'
];

// Common replacements for all routes
const commonReplacements = [
  // Remove file system imports
  {
    search: /const fs = require\('fs'\);/g,
    replace: ''
  },
  {
    search: /const path = require\('path'\);/g,
    replace: ''
  },
  // Add model imports
  {
    search: /(const express = require\('express'\);)/,
    replace: '$1\nconst { Student, Internship, Application, Admin, Mentor, Recruiter, Feedback, AdminAudit } = require(\'../models\');'
  },
  // Remove path definitions and file functions
  {
    search: /const \w+Path = path\.join\(__dirname, [^;]+;/g,
    replace: ''
  },
  {
    search: /const read\w+ = \([^}]+};/g,
    replace: ''
  },
  {
    search: /const write\w+ = \([^}]+};/g,
    replace: ''
  }
];

console.log('🚀 Starting route conversion to MongoDB...');

routeFiles.forEach(file => {
  const filePath = path.join(__dirname, '../routes', file);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }
  
  console.log(`🔄 Processing ${file}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Apply common replacements
  commonReplacements.forEach(({ search, replace }) => {
    content = content.replace(search, replace);
  });
  
  // Add specific conversions for each route type
  if (file.includes('internships')) {
    content = content.replace(/readInternships\(\)/g, 'await Internship.find().lean()');
    content = content.replace(/writeInternships\([^)]+\)/g, '// Updated via MongoDB operations');
  }
  
  if (file.includes('applications')) {
    content = content.replace(/readApplications\(\)/g, 'await Application.find().lean()');
    content = content.replace(/writeApplications\([^)]+\)/g, '// Updated via MongoDB operations');
  }
  
  // Make all route handlers async if they aren't already
  content = content.replace(/router\.(get|post|put|delete)\(([^,]+),\s*(?!async)/g, 'router.$1($2, async ');
  
  // Backup original file
  fs.writeFileSync(filePath + '.backup', fs.readFileSync(filePath));
  
  // Write updated content
  fs.writeFileSync(filePath, content);
  console.log(`✅ ${file} updated`);
});

console.log('🎉 Route conversion completed!');
console.log('⚠️  Note: Manual testing and fine-tuning may be needed for some routes.');