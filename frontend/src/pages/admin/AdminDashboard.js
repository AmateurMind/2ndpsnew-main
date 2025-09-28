import React, { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, TrendingUp, Calendar, Building } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/analytics/dashboard');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-8">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-600">Total Students</p>
              <p className="text-2xl font-bold text-secondary-900">
                {analytics?.overview?.totalStudents || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-600">Active Internships</p>
              <p className="text-2xl font-bold text-secondary-900">
                {analytics?.overview?.activeInternships || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-600">Total Applications</p>
              <p className="text-2xl font-bold text-secondary-900">
                {analytics?.overview?.totalApplications || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-600">Placement Rate</p>
              <p className="text-2xl font-bold text-secondary-900">
                {analytics?.overview?.placementRate || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-secondary-900 mb-6">Recent Activities</h2>
          <div className="space-y-4">
            {analytics?.recentActivities?.map((activity) => (
              <div key={activity.id} className="border-l-4 border-primary-500 pl-4">
                <p className="font-medium text-secondary-900">
                  {activity.student} applied for {activity.internship}
                </p>
                <p className="text-sm text-secondary-600">
                  {activity.company} • {new Date(activity.appliedAt).toLocaleDateString()}
                </p>
              </div>
            )) || []}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-secondary-900 mb-6">Upcoming Interviews</h2>
          <div className="space-y-4">
            {analytics?.upcomingInterviews?.map((interview) => (
              <div key={interview.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">{interview.student}</p>
                  <p className="text-sm text-secondary-600">
                    {interview.internship} at {interview.company}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-secondary-900">
                    {new Date(interview.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-secondary-500">{interview.mode}</p>
                </div>
              </div>
            )) || []}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;