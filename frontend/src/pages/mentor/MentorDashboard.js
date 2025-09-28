import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, FileText, Calendar, Building, MessageSquare } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { openResumeSecurely } from '../../utils/resumeViewer';

const MentorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, allRes] = await Promise.all([
        axios.get('/applications/pending/mentor'),
        axios.get('/applications')
      ]);
      setPending(pendingRes.data.applications || []);
      setAssigned(allRes.data.applications || []);
    } catch (e) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (appId, action) => {
    try {
      setLoading(true);
      const feedback = feedbackMap[appId] || '';
      await axios.put(`/applications/${appId}/status`, {
        status: action === 'approve' ? 'approved' : 'rejected',
        feedback
      });
      toast.success(`Application ${action === 'approve' ? 'approved' : 'rejected'}`);
      await fetchData();
    } catch (e) {
      toast.error('Action failed');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-6">Mentor Dashboard</h1>

      {/* Pending Approvals */}
      <section className="card p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-secondary-900">Pending Approvals</h2>
          <span className="text-sm text-secondary-600">{pending.length} pending</span>
        </div>

        {pending.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-10 w-10 text-secondary-400 mx-auto mb-2" />
            <p className="text-secondary-600">No applications awaiting your approval</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {pending.map((app) => (
              <li key={app.id} className="border border-secondary-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-secondary-900 truncate">
                      {app.internship?.title || 'Unknown Position'}
                    </h3>
                    <p className="text-sm text-secondary-600 flex items-center mt-1">
                      <Building className="h-4 w-4 mr-1" />
                      {app.internship?.company || 'Unknown Company'}
                    </p>
                    <p className="text-xs text-secondary-500 flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </p>

                    {app.student && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-secondary-900">Applicant: {app.student.name}</p>
                        <p className="text-xs text-secondary-600">{app.student.email} • {app.student.department} • CGPA {app.student.cgpa}</p>
                        {app.student.resumeLink && (
                          <button
                            onClick={() => openResumeSecurely(app.student.id, app.student.name)}
                            className="inline-block mt-2 btn-outline text-xs sm:text-sm"
                          >
                            View Resume
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="w-full sm:w-auto">
                    <textarea
                      value={feedbackMap[app.id] || ''}
                      onChange={(e) => setFeedbackMap({ ...feedbackMap, [app.id]: e.target.value })}
                      placeholder="Optional feedback..."
                      className="w-full sm:w-64 h-20 p-2 border border-secondary-300 rounded-md text-sm"
                    />
                    <div className="flex gap-2 mt-2 w-full">
                      <button
                        onClick={() => handleAction(app.id, 'approve')}
                        className="btn-primary flex-1 sm:flex-none"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1 inline" /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(app.id, 'reject')}
                        className="btn-danger flex-1 sm:flex-none"
                      >
                        <XCircle className="h-4 w-4 mr-1 inline" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* All Assigned Applications */}
      <section className="card p-4 sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-secondary-900">All Assigned Applications</h2>
          <span className="text-sm text-secondary-600">{assigned.length} total</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assigned.map((app) => (
            <div key={app.id} className="border border-secondary-200 rounded-lg p-4">
              <h3 className="font-semibold text-secondary-900">
                {app.internship?.title || 'Unknown Position'}
              </h3>
              <p className="text-sm text-secondary-600 flex items-center mt-1">
                <Building className="h-4 w-4 mr-1" />
                {app.internship?.company || 'Unknown Company'}
              </p>
              <div className="mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(app.status)}`}>
                  {formatStatus(app.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

function formatStatus(status) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function statusColor(status) {
  const map = {
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    pending_mentor_approval: 'bg-yellow-100 text-yellow-800',
    applied: 'bg-blue-100 text-blue-800',
    interview_scheduled: 'bg-purple-100 text-purple-800',
    offered: 'bg-emerald-100 text-emerald-800'
  };
  return map[status] || 'bg-gray-100 text-gray-800';
}

export default MentorDashboard;
