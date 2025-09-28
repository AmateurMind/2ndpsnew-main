import React, { useState, useEffect } from 'react';
import { Building, Calendar } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get('/applications');
      setApplications(response.data.applications);
    } catch (error) {
      console.error('Failed to fetch applications');
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-8">My Applications</h1>
      
      <div className="space-y-4">
        {applications.map((application) => (
          <div key={application.id} className="card p-6">
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
        ))}
      </div>
    </div>
  );
};

export default StudentApplications;