import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  FileText, 
  User, 
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  Star,
  ArrowRight,
  Calendar,
  Building
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    applications: [],
    recommendedInternships: [],
    recentActivity: [],
    stats: {}
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [applicationsRes, internshipsRes, analyticsRes] = await Promise.all([
        axios.get('/applications'),
        axios.get('/internships?recommended=true'),
        axios.get(`/analytics/student/${user.id}`)
      ]);

      setDashboardData({
        applications: applicationsRes.data.applications.slice(0, 5),
        recommendedInternships: internshipsRes.data.internships.slice(0, 4),
        stats: analyticsRes.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      pending_mentor_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      interview_scheduled: 'bg-purple-100 text-purple-800',
      offered: 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">
          Welcome back, {user.name}!
        </h1>
        <p className="text-secondary-600 mt-2">
          Here's what's happening with your internship journey
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-600">Total Applications</p>
              <p className="text-2xl font-bold text-secondary-900">
                {dashboardData.stats.totalApplications || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-600">Average Rating</p>
              <p className="text-2xl font-bold text-secondary-900">
                {dashboardData.stats.averageRating || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-600">Skills Developed</p>
              <p className="text-2xl font-bold text-secondary-900">
                {dashboardData.stats.skillsDeveloped?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-600">Profile Status</p>
              <p className="text-lg font-semibold text-secondary-900">
                {user.cgpa >= 8 ? '⭐ Excellent' : user.cgpa >= 7 ? '🎯 Good' : '📈 Growing'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-secondary-900">Recent Applications</h2>
              <Link 
                to="/student/applications"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="space-y-4">
              {dashboardData.applications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                  <p className="text-secondary-600">No applications yet</p>
                  <Link 
                    to="/student/internships"
                    className="btn-primary mt-4 inline-flex items-center w-full sm:w-auto justify-center"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Internships
                  </Link>
                </div>
              ) : (
                dashboardData.applications.map((application) => (
                  <div key={application.id} className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-secondary-900">
                          {application.internship?.title || 'Unknown Position'}
                        </h3>
                        <p className="text-sm text-secondary-600 flex items-center mt-1">
                          <Building className="h-4 w-4 mr-1" />
                          {application.internship?.company || 'Unknown Company'}
                        </p>
                        <p className="text-xs text-secondary-500 flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Applied {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {formatStatus(application.status)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-base sm:text-lg font-bold text-secondary-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                to="/student/internships"
                className="w-full btn-primary flex items-center justify-center"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Internships
              </Link>
              <Link 
                to="/student/profile"
                className="w-full sm:w-auto btn-outline flex items-center justify-center"
              >
                <User className="h-4 w-4 mr-2" />
                Update Profile
              </Link>
              <Link 
                to="/student/applications"
                className="w-full btn-secondary flex items-center justify-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                My Applications
              </Link>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Profile Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Basic Info</span>
                <span className="text-green-600 font-medium">✓ Complete</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Skills</span>
                <span className="text-green-600 font-medium">✓ Complete</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Resume</span>
                <span className="text-green-600 font-medium">✓ Complete</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Projects</span>
                <span className="text-green-600 font-medium">✓ Complete</span>
              </div>
            </div>
            <div className="mt-4 bg-green-100 rounded-lg p-3">
              <p className="text-sm text-green-800 font-medium">
                🎉 Your profile is 100% complete!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Internships */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-secondary-900">Recommended For You</h2>
          <Link 
            to="/student/internships"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardData.recommendedInternships.map((internship) => (
            <div key={internship.id} className="card p-6 group hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <img 
                  src={internship.companyLogo} 
                  alt={internship.company}
                  className="h-10 w-10 rounded-lg"
                />
                {internship.recommendationScore && (
                  <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    <Star className="h-3 w-3 mr-1" />
                    {internship.recommendationScore}% Match
                  </div>
                )}
              </div>
              
              <h3 className="font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                {internship.title}
              </h3>
              <p className="text-sm text-secondary-600 mb-3">{internship.company}</p>
              
              <div className="space-y-2 text-sm text-secondary-500">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {internship.location}
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {internship.stipend}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {internship.duration}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-secondary-200">
                <Link 
                  to={`/student/internships`}
                  className="w-full sm:w-auto btn-outline text-sm py-2 flex items-center justify-center"
                >
                  View Details
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;