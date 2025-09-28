import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Building, 
  Users, 
  FileText, 
  TrendingUp, 
  Plus, 
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  BarChart3
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    myInternships: [],
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedStudents: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [internshipsRes, applicationsRes] = await Promise.all([
        axios.get('/internships/my-postings'),
        axios.get('/applications')
      ]);
      
      const myInternships = internshipsRes.data.internships || [];
      const allApplications = applicationsRes.data.applications || [];
      
      // Filter applications for my internships
      const myInternshipIds = new Set(myInternships.map(i => i.id));
      const myApplications = allApplications.filter(app => 
        myInternshipIds.has(app.internshipId)
      );
      
      setAnalytics({
        myInternships,
        totalApplications: myApplications.length,
        pendingApplications: myApplications.filter(app => 
          ['applied', 'pending_mentor_approval'].includes(app.status)
        ).length,
        shortlistedStudents: myApplications.filter(app => 
          ['approved', 'interview_scheduled'].includes(app.status)
        ).length
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const { myInternships, totalApplications, pendingApplications, shortlistedStudents } = analytics;
  const activeInternships = myInternships.filter(i => i.status === 'active').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-secondary-600 mt-1">
            Manage your internship postings and candidate pipeline at {user.company}
          </p>
        </div>
        <Link to="/recruiter/internships" className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Post New Internship
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Building className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-600">Total Postings</p>
              <p className="text-2xl font-bold text-secondary-900">{myInternships.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-600">Active Postings</p>
              <p className="text-2xl font-bold text-secondary-900">{activeInternships}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-600">Total Applications</p>
              <p className="text-2xl font-bold text-secondary-900">{totalApplications}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-600">Shortlisted</p>
              <p className="text-2xl font-bold text-secondary-900">{shortlistedStudents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/recruiter/internships" className="btn-outline flex items-center justify-center">
              <Building className="h-4 w-4 mr-2" />
              Manage Postings
            </Link>
            <Link to="/recruiter/students" className="btn-outline flex items-center justify-center">
              <Users className="h-4 w-4 mr-2" />
              Browse Candidates
            </Link>
            <button className="btn-outline flex items-center justify-center" disabled>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Interviews
            </button>
            <button className="btn-outline flex items-center justify-center" disabled>
              <FileText className="h-4 w-4 mr-2" />
              View Reports
            </button>
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Application Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                <span className="text-sm text-secondary-700">Pending Review</span>
              </div>
              <span className="text-sm font-medium text-secondary-900">{pendingApplications}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                <span className="text-sm text-secondary-700">Shortlisted</span>
              </div>
              <span className="text-sm font-medium text-secondary-900">{shortlistedStudents}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                <span className="text-sm text-secondary-700">Total Received</span>
              </div>
              <span className="text-sm font-medium text-secondary-900">{totalApplications}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Internship Postings */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Recent Postings
          </h3>
          <Link to="/recruiter/internships" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
            View All
            <Eye className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {myInternships.length === 0 ? (
          <div className="text-center py-8">
            <Building className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600 mb-4">No internships posted yet</p>
            <Link to="/recruiter/internships" className="btn-primary">
              <Plus className="h-4 w-4 mr-2" /> Post Your First Internship
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-2 font-medium text-secondary-700">Position</th>
                  <th className="text-left py-2 font-medium text-secondary-700">Status</th>
                  <th className="text-left py-2 font-medium text-secondary-700">Applications</th>
                  <th className="text-left py-2 font-medium text-secondary-700">Posted</th>
                </tr>
              </thead>
              <tbody>
                {myInternships.slice(0, 5).map((internship) => (
                  <tr key={internship.id} className="border-b border-secondary-100">
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-secondary-900">{internship.title}</p>
                        <p className="text-xs text-secondary-500">{internship.location} • {internship.workMode}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        internship.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-secondary-100 text-secondary-800'
                      }`}>
                        {internship.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="font-medium text-secondary-900">
                        {internship.currentApplications || 0}
                      </span>
                    </td>
                    <td className="py-3 text-secondary-600">
                      {new Date(internship.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
