import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#60a5fa','#34d399','#fbbf24','#f87171','#a78bfa','#f472b6','#10b981','#f59e0b'];

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/analytics/dashboard');
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center"><LoadingSpinner size="large"/></div>
    );
  }

  if (!data) return null;

  const statusData = Object.entries(data.applicationsByStatus || {}).map(([name, value]) => ({ name: name.replace(/_/g,' '), value }));
  const studentsDept = Object.entries(data.studentsByDepartment || {}).map(([department, value]) => ({ department, value }));
  const monthly = (data.monthlyTrends || []).map(d => ({ month: d.month, applications: d.applications }));
  const skills = (data.skillsDemand || []).map(d => ({ skill: d.skill, demand: d.demand }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Analytics & Reports</h1>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard label="Total Students" value={data.overview?.totalStudents} />
        <OverviewCard label="Active Internships" value={data.overview?.activeInternships} />
        <OverviewCard label="Total Applications" value={data.overview?.totalApplications} />
        <OverviewCard label="Placement Rate" value={`${data.overview?.placementRate || 0}%`} />
      </div>

      {/* Applications by Status (Pie) */}
      <div className="card p-4">
        <h2 className="font-semibold mb-3">Applications by Status</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={80} label>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Applications (Line) */}
      <div className="card p-4">
        <h2 className="font-semibold mb-3">Monthly Applications</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={monthly}>
              <XAxis dataKey="month"/>
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Students by Department (Bar) */}
      <div className="card p-4">
        <h2 className="font-semibold mb-3">Students by Department</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={studentsDept}>
              <XAxis dataKey="department"/>
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skills Demand (Bar) */}
      <div className="card p-4">
        <h2 className="font-semibold mb-3">Top Skills Demand</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={skills}>
              <XAxis dataKey="skill" interval={0} angle={-20} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="demand" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const OverviewCard = ({ label, value }) => (
  <div className="card p-4">
    <div className="text-sm text-secondary-600">{label}</div>
    <div className="text-2xl font-bold text-secondary-900">{value ?? '-'}</div>
  </div>
);

export default AdminAnalytics;
