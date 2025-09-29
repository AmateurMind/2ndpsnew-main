const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import database connection and models
const connectDB = require('../config/database');
const {
  Student,
  Internship,
  Application,
  Admin,
  Mentor,
  Recruiter,
  Feedback,
  AdminAudit
} = require('../models');

// File paths
const dataDir = path.join(__dirname, '../data');
const files = {
  students: path.join(dataDir, 'students.json'),
  internships: path.join(dataDir, 'internships.json'),
  applications: path.join(dataDir, 'applications.json'),
  admins: path.join(dataDir, 'admins.json'),
  mentors: path.join(dataDir, 'mentors.json'),
  recruiters: path.join(dataDir, 'recruiters.json'),
  feedback: path.join(dataDir, 'feedback.json'),
  admin_audit: path.join(dataDir, 'admin_audit.json')
};

// Helper function to read JSON file
const readJSONFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return [];
  }
};

// Helper function to convert date strings to Date objects
const processDateFields = (data, dateFields) => {
  dateFields.forEach(field => {
    if (data[field] && typeof data[field] === 'string') {
      data[field] = new Date(data[field]);
    }
  });
  return data;
};

// Migration functions for each collection
const migrateStudents = async () => {
  console.log('📚 Migrating Students...');
  const students = readJSONFile(files.students);
  
  for (const student of students) {
    try {
      // Convert date fields
      processDateFields(student, ['dateOfBirth', 'createdAt', 'updatedAt']);
      
      // Convert placedAt.joinDate if exists
      if (student.placedAt && student.placedAt.joinDate) {
        student.placedAt.joinDate = new Date(student.placedAt.joinDate);
      }
      
      await Student.create(student);
      console.log(`✅ Student migrated: ${student.name}`);
    } catch (error) {
      console.error(`❌ Error migrating student ${student.name}:`, error.message);
    }
  }
};

const migrateInternships = async () => {
  console.log('💼 Migrating Internships...');
  const internships = readJSONFile(files.internships);
  
  for (const internship of internships) {
    try {
      // Convert date fields
      processDateFields(internship, [
        'applicationDeadline', 
        'startDate', 
        'createdAt', 
        'submittedAt', 
        'approvedAt', 
        'updatedAt'
      ]);
      
      await Internship.create(internship);
      console.log(`✅ Internship migrated: ${internship.title}`);
    } catch (error) {
      console.error(`❌ Error migrating internship ${internship.title}:`, error.message);
    }
  }
};

const migrateApplications = async () => {
  console.log('📝 Migrating Applications...');
  const applications = readJSONFile(files.applications);
  
  for (const application of applications) {
    try {
      // Convert date fields
      processDateFields(application, ['appliedAt', 'updatedAt']);
      
      // Convert nested date fields
      if (application.interviewScheduled && application.interviewScheduled.date) {
        application.interviewScheduled.date = new Date(application.interviewScheduled.date);
      }
      
      if (application.offerDetails) {
        if (application.offerDetails.startDate) {
          application.offerDetails.startDate = new Date(application.offerDetails.startDate);
        }
        if (application.offerDetails.offerExpiry) {
          application.offerDetails.offerExpiry = new Date(application.offerDetails.offerExpiry);
        }
      }
      
      await Application.create(application);
      console.log(`✅ Application migrated: ${application.id}`);
    } catch (error) {
      console.error(`❌ Error migrating application ${application.id}:`, error.message);
    }
  }
};

const migrateAdmins = async () => {
  console.log('👑 Migrating Admins...');
  const admins = readJSONFile(files.admins);
  
  for (const admin of admins) {
    try {
      // Convert date fields
      processDateFields(admin, ['lastLogin', 'createdAt', 'updatedAt']);
      
      await Admin.create(admin);
      console.log(`✅ Admin migrated: ${admin.name}`);
    } catch (error) {
      console.error(`❌ Error migrating admin ${admin.name}:`, error.message);
    }
  }
};

const migrateMentors = async () => {
  console.log('🧑‍🏫 Migrating Mentors...');
  const mentors = readJSONFile(files.mentors);
  
  for (const mentor of mentors) {
    try {
      // Convert date fields
      processDateFields(mentor, ['createdAt', 'updatedAt']);
      
      await Mentor.create(mentor);
      console.log(`✅ Mentor migrated: ${mentor.name}`);
    } catch (error) {
      console.error(`❌ Error migrating mentor ${mentor.name}:`, error.message);
    }
  }
};

const migrateRecruiters = async () => {
  console.log('🏢 Migrating Recruiters...');
  const recruiters = readJSONFile(files.recruiters);
  
  for (const recruiter of recruiters) {
    try {
      // Convert date fields
      processDateFields(recruiter, ['verifiedAt', 'createdAt', 'updatedAt']);
      
      await Recruiter.create(recruiter);
      console.log(`✅ Recruiter migrated: ${recruiter.name}`);
    } catch (error) {
      console.error(`❌ Error migrating recruiter ${recruiter.name}:`, error.message);
    }
  }
};

const migrateFeedback = async () => {
  console.log('💬 Migrating Feedback...');
  const feedbacks = readJSONFile(files.feedback);
  
  for (const feedback of feedbacks) {
    try {
      // Convert date fields
      processDateFields(feedback, ['createdAt', 'updatedAt']);
      
      await Feedback.create(feedback);
      console.log(`✅ Feedback migrated: ${feedback.id}`);
    } catch (error) {
      console.error(`❌ Error migrating feedback ${feedback.id}:`, error.message);
    }
  }
};

const migrateAdminAudit = async () => {
  console.log('🔍 Migrating Admin Audit...');
  const audits = readJSONFile(files.admin_audit);
  
  for (const audit of audits) {
    try {
      // Convert date fields
      processDateFields(audit, ['timestamp']);
      
      await AdminAudit.create(audit);
      console.log(`✅ Audit migrated: ${audit.id}`);
    } catch (error) {
      console.error(`❌ Error migrating audit ${audit.id}:`, error.message);
    }
  }
};

// Main migration function
const runMigration = async () => {
  try {
    console.log('🚀 Starting MongoDB Migration...');
    console.log('=====================================');
    
    // Connect to MongoDB
    await connectDB();
    
    // Clear existing data (optional - comment out if you want to preserve existing data)
    console.log('🗑️  Clearing existing collections...');
    await Student.deleteMany({});
    await Internship.deleteMany({});
    await Application.deleteMany({});
    await Admin.deleteMany({});
    await Mentor.deleteMany({});
    await Recruiter.deleteMany({});
    await Feedback.deleteMany({});
    await AdminAudit.deleteMany({});
    console.log('✅ Collections cleared');
    
    // Run migrations in order (to handle any potential dependencies)
    await migrateAdmins();
    await migrateMentors();
    await migrateRecruiters();
    await migrateStudents();
    await migrateInternships();
    await migrateApplications();
    await migrateFeedback();
    await migrateAdminAudit();
    
    // Display final statistics
    console.log('=====================================');
    console.log('📊 Migration Summary:');
    console.log(`👨‍🎓 Students: ${await Student.countDocuments()}`);
    console.log(`💼 Internships: ${await Internship.countDocuments()}`);
    console.log(`📝 Applications: ${await Application.countDocuments()}`);
    console.log(`👑 Admins: ${await Admin.countDocuments()}`);
    console.log(`🧑‍🏫 Mentors: ${await Mentor.countDocuments()}`);
    console.log(`🏢 Recruiters: ${await Recruiter.countDocuments()}`);
    console.log(`💬 Feedback: ${await Feedback.countDocuments()}`);
    console.log(`🔍 Admin Audit: ${await AdminAudit.countDocuments()}`);
    console.log('=====================================');
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the connection
    process.exit(0);
  }
};

// Run the migration
if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
