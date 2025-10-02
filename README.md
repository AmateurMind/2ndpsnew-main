# Campus Placement Portal

A comprehensive campus internship and placement portal built with React, Node.js, Express, and Tailwind CSS. This system facilitates seamless interaction between students, mentors, placement administrators, and recruiters with advanced features for modern placement management.

## 🚀 Key Features

### For Students
- **Smart Dashboard**: Real-time overview with application status, recommendations, and analytics
- **Intelligent Internship Discovery**: Browse internships with AI-powered recommendations based on skills, CGPA, and department
- **Application Management**: Apply with cover letters, track status in real-time, and see "Applied" status instantly
- **Secure Profile Management**: Comprehensive academic profiles with secure resume viewing
- **Application Status Tracking**: Visual indicators for applied, pending, approved, and rejected applications
- **Skills-Based Matching**: Get personalized internship recommendations with match percentages

### For Mentors/Faculty
- **Application Review Dashboard**: Streamlined approval process with feedback system
- **Student Progress Monitoring**: Track mentee development and application success rates
- **Bulk Application Management**: Efficient review of multiple applications
- **Secure Resume Access**: View student resumes through authenticated, secure PDF viewer
- **Approval Workflow**: Structured approval process with detailed feedback options

### For Placement Cell/Admin
- **Complete Internship Management**: Create, edit, delete, and manage all internship postings
- **Advanced Analytics Dashboard**: Real-time insights on applications, placements, and trends
- **Application Oversight**: Monitor all applications across departments with filtering
- **User Management**: Manage students, mentors, and recruiters with role-based permissions
- **Secure Document Viewing**: Certificate-style secure resume viewing system
- **Department-wise Analytics**: Detailed insights by department and program

### For Recruiters
- **Internship Posting Platform**: Create and manage company-specific internship postings
- **Student Discovery Engine**: Browse eligible candidates with advanced filtering
- **Application Management**: Review applications with secure resume access
- **Company Analytics**: Track posting performance and application metrics
- **Recruiter Dashboard**: Dedicated interface for managing company internships
- **Application Insights**: View detailed candidate information and application history

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Elegant notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **Helmet** - Security middleware

### 📊 Data Storage
- **JSON Files** - For demo data (easily replaceable with MongoDB/PostgreSQL)
- **File System API** - Data persistence
- **PDFKit** - Dynamic PDF generation for secure document viewing
- **Multer Ready** - File upload system architecture in place

## 🌐 API Architecture

### Core Endpoints

**Authentication**
- `POST /auth/login` - User authentication
- `POST /auth/register` - New user registration
- `GET /auth/profile` - User profile information

**Internships**
- `GET /internships` - List internships with filtering and recommendations
- `GET /internships/:id` - Get single internship details
- `POST /internships` - Create new internship (Admin/Recruiter)
- `PUT /internships/:id` - Update internship (Admin/Recruiter)
- `DELETE /internships/:id` - Delete internship (Admin/Recruiter)
- `GET /internships/my-postings` - Get recruiter's own postings

**Applications**
- `GET /applications` - List applications (role-based filtering)
- `POST /applications` - Submit new application
- `PUT /applications/:id/status` - Update application status
- `GET /applications/pending/mentor` - Get pending mentor approvals

**Analytics**
- `GET /analytics/student/:id` - Student performance analytics
- `GET /analytics/admin/overview` - Admin dashboard metrics
- `GET /analytics/recruiter/overview` - Recruiter dashboard metrics
- `GET /analytics/mentor/overview` - Mentor dashboard metrics

**Secure Documents**
- `GET /documents/resume/:studentId` - Secure resume PDF viewer
- `GET /documents/certificate/:studentId` - Generate achievement certificates

### Authentication Middleware
- **JWT Verification**: All protected routes use JWT token validation
- **Role Authorization**: Granular permissions based on user roles
- **Route Protection**: Automatic access control for sensitive endpoints

## 🏧 Project Structure

```
campus-placement-portal/
├── backend/
│   ├── data/                 # JSON data files
│   │   ├── students.json     # Student profiles and data
│   │   ├── internships.json  # Internship postings
│   │   ├── applications.json # Application records
│   │   ├── mentors.json      # Mentor profiles
│   │   ├── admins.json       # Admin accounts
│   │   └── recruiters.json   # Recruiter profiles
│   ├── middleware/
│   │   └── auth.js          # JWT authentication & RBAC
│   ├── routes/
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── internships.js   # Internship CRUD operations
│   │   ├── applications.js  # Application management
│   │   ├── analytics.js     # Dashboard analytics
│   │   └── documents.js     # Secure document generation
│   ├── server.js            # Express server configuration
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoadingSpinner.js
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/
│   │   │   ├── student/         # Student interface
│   │   │   │   ├── StudentDashboard.js
│   │   │   │   ├── StudentInternships.js
│   │   │   │   ├── StudentApplications.js
│   │   │   │   └── StudentProfile.js
│   │   │   ├── mentor/          # Mentor interface
│   │   │   │   └── MentorDashboard.js
│   │   │   ├── admin/           # Admin interface
│   │   │   │   ├── AdminDashboard.js
│   │   │   │   ├── AdminInternships.js
│   │   │   │   └── AdminApplications.js
│   │   │   ├── recruiter/       # Recruiter interface
│   │   │   │   ├── RecruiterDashboard.js
│   │   │   │   ├── RecruiterInternships.js
│   │   │   │   └── RecruiterStudents.js
│   │   │   └── LoginPage.js
│   │   ├── context/
│   │   │   └── AuthContext.js   # Global authentication state
│   │   ├── utils/
│   │   │   └── documentViewer.js # Secure document utilities
│   │   ├── App.js              # Main application component
│   │   ├── index.js            # React entry point
│   │   └── index.css           # Global styles & Tailwind
│   └── package.json
├── package.json             # Root package.json
└── README.md
```

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## 🚀 Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd campus-placement-portal
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Start the development servers**
```bash
npm run dev
```

This will start both frontend (http://localhost:3000) and backend (http://localhost:5000) servers.

## 🏗️ What's Built So Far

### 🎆 Complete Feature Set
Our campus placement portal is a **fully functional application** with enterprise-grade features:

**🎨 Frontend (React 18)**
- ✅ Responsive, mobile-first design with Tailwind CSS
- ✅ Role-based interfaces for Students, Mentors, Admins, and Recruiters
- ✅ Real-time application status tracking with visual indicators
- ✅ Smart internship discovery with filtering and recommendations
- ✅ Interactive dashboards with analytics and insights
- ✅ Secure document viewing with PDF generation
- ✅ Form validation and error handling
- ✅ Loading states and user feedback systems

**🔧 Backend (Node.js + Express)**
- ✅ RESTful API with 25+ endpoints
- ✅ JWT-based authentication with role-based access control
- ✅ Complete CRUD operations for all entities
- ✅ Advanced filtering, search, and recommendation engine
- ✅ Real-time analytics and reporting system
- ✅ Secure PDF generation for documents
- ✅ Error handling and validation middleware
- ✅ CORS and security configurations

**📈 Key Workflows**
- ✅ **Student Journey**: Registration → Profile Setup → Browse Internships → Apply → Track Status
- ✅ **Mentor Workflow**: Review Applications → Approve/Reject → Provide Feedback
- ✅ **Admin Management**: Create Internships → Monitor Applications → Generate Reports
- ✅ **Recruiter Process**: Post Internships → Review Applications → Manage Hiring

### 🎯 Production-Ready Features
- **🔐 Security**: Comprehensive authentication and authorization
- **📄 Data Management**: Complete application lifecycle management
- **📊 Analytics**: Real-time dashboards and performance metrics
- **🎨 UX/UI**: Modern, accessible, and responsive design
- **🚀 Performance**: Optimized API calls and efficient data handling

## 🔐 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | aarav.sharma@college.edu | demo123 |
| Student | priya.patel@college.edu | demo123 |
| Mentor | rajesh.kumar@college.edu | demo123 |
| Admin | sunita.mehta@college.edu | demo123 |
| Recruiter | amit.singh@techcorp.com | demo123 |

## 📱 Advanced Features Implemented

### 🎯 Smart Matching Engine
- **Skills-Based Recommendations**: AI-powered matching with percentage scores
- **Multi-Criteria Filtering**: Department, CGPA, semester, and skills-based eligibility
- **Real-Time Eligibility Check**: Instant feedback on application eligibility
- **Personalized Rankings**: Custom sorting based on student profile fit

### 🔐 Enterprise-Grade Security
- **JWT Authentication**: Secure token-based authentication system
- **Role-Based Access Control**: Four-tier permission system (Student, Mentor, Admin, Recruiter)
- **Secure Document Viewer**: Certificate-style PDF generation and viewing
- **Protected API Routes**: Middleware-based route protection
- **CORS Security**: Cross-origin resource sharing configuration

### 📊 Real-Time Application Management
- **Instant Status Updates**: Live application status tracking
- **Visual Status Indicators**: Color-coded application states
- **Mentor Approval Workflow**: Structured review and approval process
- **Application History**: Complete audit trail of application changes
- **Bulk Operations**: Efficient management of multiple applications

### 📈 Comprehensive Analytics Dashboard
- **Real-Time Metrics**: Live statistics and performance indicators
- **Department Analytics**: Detailed insights by academic department
- **Placement Trends**: Historical data analysis and forecasting
- **Student Performance**: Individual and aggregate performance metrics
- **Company Insights**: Recruiter engagement and posting analytics

### 🏢 Recruiter Management System
- **Independent Posting Platform**: Recruiters can create and manage their own internships
- **Company-Scoped Access**: Restricted access to own postings and applications
- **Analytics Dashboard**: Dedicated metrics for recruiter performance
- **Student Discovery**: Advanced filtering to find suitable candidates
- **Application Processing**: Streamlined review and decision-making tools

### 🎨 Modern UI/UX Design
- **Responsive Design**: Mobile-first approach with full responsiveness
- **Tailwind CSS**: Utility-first styling with custom design system
- **Interactive Components**: Smooth animations and transitions
- **Accessibility**: WCAG compliant with screen reader support
- **Dark/Light Theme**: Consistent design across all components

## 🚢 Deployment

### Frontend (Vercel)
1. Connect your repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/build`

### Backend (Render/Railway)
1. Connect your repository
2. Set build command: `cd backend && npm install`
3. Set start command: `cd backend && npm start`
4. Configure environment variables

## 🎯 Future Enhancements

### ✅ Recently Implemented
- ✅ **Recruiter Internship Posting**: Complete CRUD operations for recruiters
- ✅ **Secure Document Viewing**: PDF generation and secure access system
- ✅ **Application Status Tracking**: Real-time status updates and visual indicators
- ✅ **Advanced Analytics**: Role-based dashboards with comprehensive metrics
- ✅ **Smart Matching Engine**: Skills and eligibility-based recommendations

### 🛠️ In Development
- **Real Database Integration**: MongoDB or PostgreSQL migration
- **File Upload System**: Resume and document management with cloud storage
- **Email Notifications**: Automated status updates and reminders
- **Advanced Search**: Full-text search with filters and sorting

### 🎆 Planned Features
- **Video Interview Integration**: Built-in interview scheduling and management
- **Mobile App**: React Native companion app for students and recruiters
- **Machine Learning**: AI-powered job matching and career recommendations
- **Multi-Campus Support**: Support for multiple institutions and departments
- **Integration APIs**: Third-party job board and ATS integrations
- **Advanced Reports**: Automated report generation and insights
- **Chatbot Support**: AI assistant for common queries and guidance

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
