import React from 'react';

const map = {
  applied: 'bg-blue-100 text-blue-800',
  pending_mentor_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  interview_scheduled: 'bg-purple-100 text-purple-800',
  interview_completed: 'bg-indigo-100 text-indigo-800',
  offered: 'bg-emerald-100 text-emerald-800',
  accepted: 'bg-emerald-200 text-emerald-900'
};

const StatusBadge = ({ status, className = '' }) => {
  const cls = map[status] || 'bg-secondary-100 text-secondary-700';
  const label = String(status || '')?.replace(/_/g, ' ');
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls} ${className}`}>{label}</span>
  );
};

export default StatusBadge;