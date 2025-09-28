# Campus Placement Portal

A comprehensive campus internship and placement portal built with React, Node.js, Express, and Tailwind CSS. This system facilitates seamless interaction between students, mentors, placement administrators, and recruiters.

## 🚀 Features

### For Students
- **Personal Dashboard**: Overview of applications, recommendations, and profile status
- **Internship Discovery**: Browse available internships with smart recommendations
- **Application Management**: Apply for internships and track application status
- **Profile Management**: Maintain comprehensive academic and professional profiles

### For Mentors/Faculty
- **Application Reviews**: Approve or reject student applications with feedback
- **Student Progress Tracking**: Monitor student development and achievements
- **Guidance Dashboard**: Centralized view of assigned students and applications

### For Placement Cell/Admin
- **Internship Management**: Create, edit, and manage internship postings
- **Application Oversight**: View and manage all applications across departments
- **Analytics & Reports**: Comprehensive insights on placements and student performance
- **User Management**: Manage students, mentors, and recruiters

### For Recruiters
- **Student Discovery**: Browse eligible students based on criteria
- **Interview Scheduling**: Coordinate interviews and hiring processes
- **Application Processing**: Review applications and make hiring decisions

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

### Data Storage
- **JSON Files** - For demo data (easily replaceable with MongoDB/PostgreSQL)
- **File System API** - Data persistence

## 🏗 Project Structure

```
campus-placement-portal/
├── backend/
│   ├── data/                 # Dummy data files
│   ├── middleware/           # Authentication & authorization
│   ├── routes/              # API routes
│   ├── server.js            # Main server file
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Role-based page components
│   │   ├── context/         # React context for state management
│   │   └── App.js           # Main app component
│   └── package.json
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

## 🔐 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | aarav.sharma@college.edu | demo123 |
| Student | priya.patel@college.edu | demo123 |
| Mentor | rajesh.kumar@college.edu | demo123 |
| Admin | sunita.mehta@college.edu | demo123 |
| Recruiter | amit.singh@techcorp.com | demo123 |

## 📱 Key Features Implemented

### Smart Matching Engine
- Skills-based internship recommendations
- Department and eligibility filtering
- CGPA and semester requirements matching

### Role-Based Access Control
- Secure authentication with JWT
- Protected routes based on user roles
- Appropriate data access permissions

### Real-Time Application Tracking
- Application status updates
- Mentor approval workflow
- Interview scheduling system

### Comprehensive Analytics
- Placement statistics
- Application trends
- Student performance metrics
- Department-wise insights

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
```

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

- **Real Database Integration**: MongoDB or PostgreSQL
- **File Upload System**: Resume and document management
- **Email Notifications**: Application status updates
- **Video Interview Integration**: Built-in interview scheduling
- **Mobile App**: React Native companion app
- **Advanced Analytics**: Machine learning insights
- **Multi-Campus Support**: Support for multiple institutions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 About

This project was created as a comprehensive solution for managing campus internship and placement processes. It demonstrates modern web development practices with React, Node.js, and responsive design principles.

---

**Made with ❤️ for educational institutions and students worldwide**