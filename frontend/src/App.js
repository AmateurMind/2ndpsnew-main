 import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';

// Import components
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentInternships from './pages/student/StudentInternships';
import StudentApplications from './pages/student/StudentApplications';
import MentorDashboard from './pages/mentor/MentorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminInternships from './pages/admin/AdminInternships';
import AdminApplications from './pages/admin/AdminApplications';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterStudents from './pages/recruiter/RecruiterStudents';
import LoadingSpinner from './components/LoadingSpinner';

// Context for authentication
import { AuthProvider, useAuth } from './context/AuthContext';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-secondary-50">
          <Toaster position="top-right" />
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <>
      {user && <Navbar />}
      <main className={user ? "pt-16" : ""}>
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={getDashboardRoute(user.role)} />} />
          
          {/* Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/student/profile" 
            element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} 
          />
          <Route 
            path="/student/internships" 
            element={<ProtectedRoute role="student"><StudentInternships /></ProtectedRoute>} 
          />
          <Route 
            path="/student/applications" 
            element={<ProtectedRoute role="student"><StudentApplications /></ProtectedRoute>} 
          />
          
          {/* Mentor Routes */}
          <Route 
            path="/mentor/dashboard" 
            element={<ProtectedRoute role="mentor"><MentorDashboard /></ProtectedRoute>} 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/internships" 
            element={<ProtectedRoute role="admin"><AdminInternships /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/applications" 
            element={<ProtectedRoute role="admin"><AdminApplications /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/analytics" 
            element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} 
          />
          
          {/* Recruiter Routes */}
          <Route 
            path="/recruiter/dashboard" 
            element={<ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/recruiter/students" 
            element={<ProtectedRoute role="recruiter"><RecruiterStudents /></ProtectedRoute>} 
          />
          
          {/* Default redirects */}
          <Route 
            path="/" 
            element={
              user ? 
                <Navigate to={getDashboardRoute(user.role)} /> : 
                <Navigate to="/login" />
            } 
          />
          
          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to={getDashboardRoute(user.role)} />;
  }
  
  return children;
}

function getDashboardRoute(role) {
  const routes = {
    student: '/student/dashboard',
    mentor: '/mentor/dashboard',
    admin: '/admin/dashboard',
    recruiter: '/recruiter/dashboard'
  };
  return routes[role] || '/login';
}

export default App;