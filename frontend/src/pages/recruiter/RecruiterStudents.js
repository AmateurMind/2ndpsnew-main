import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Filter, CheckCircle2, Bookmark, GraduationCap } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { openResumeSecurely } from '../../utils/resumeViewer';

const RecruiterStudents = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({ department: '', cgpa: '', skills: '' });
  const [shortlist, setShortlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recruiter_shortlist') || '[]'); } catch { return []; }
  });
  const [showShortlistOnly, setShowShortlistOnly] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/students');
      setStudents(res.data.students || []);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    const params = new URLSearchParams();
    if (filters.department) params.append('department', filters.department);
    if (filters.cgpa) params.append('cgpa', filters.cgpa);
    if (filters.skills) params.append('skills', filters.skills);
    const url = params.toString() ? `/students?${params.toString()}` : '/students';
    try {
      setLoading(true);
      const res = await axios.get(url);
      setStudents(res.data.students || []);
    } finally {
      setLoading(false);
    }
  };

  const departments = Array.from(new Set(students.map(s => s.department).filter(Boolean)));

  const toggleShortlist = (id) => {
    setShortlist(prev => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('recruiter_shortlist', JSON.stringify(next));
      toast.success(exists ? 'Removed from shortlist' : 'Added to shortlist');
      return next;
    });
  };

  const visibleStudents = useMemo(() => {
    const base = students;
    return showShortlistOnly ? base.filter(s => shortlist.includes(s.id)) : base;
  }, [students, shortlist, showShortlistOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Student Applicants</h1>
          <p className="text-secondary-600 mt-1">Students who have applied to your internship postings</p>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-secondary-700">Filters</div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-primary-600" checked={showShortlistOnly} onChange={(e)=>setShowShortlistOnly(e.target.checked)} />
            Show shortlist only
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium">Department</label>
            <select className="input-field" value={filters.department} onChange={(e)=>setFilters({...filters,department:e.target.value})}>
              <option value="">All</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Min CGPA</label>
            <input type="number" step="0.1" className="input-field" value={filters.cgpa} onChange={(e)=>setFilters({...filters,cgpa:e.target.value})} />
          </div>
          <div className="lg:col-span-2">
            <label className="text-sm font-medium">Skills (comma separated)</label>
            <input className="input-field" placeholder="e.g. React, Node.js" value={filters.skills} onChange={(e)=>setFilters({...filters,skills:e.target.value})} />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={applyFilters} className="btn-primary">Apply Filters</button>
          <button onClick={()=>{setFilters({department:'',cgpa:'',skills:''}); fetchStudents();}} className="btn-secondary">Reset</button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center"><LoadingSpinner size="large" /></div>
      ) : visibleStudents.length === 0 ? (
        <div className="card p-8 text-center">
          <GraduationCap className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">No applicants yet</h3>
          <p className="text-secondary-600">Students who apply to your internship postings will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleStudents.map(s => (
            <div key={s.id} className="card p-4">
              <div className="flex items-center gap-3">
                {s.profilePicture ? (
                  <img src={s.profilePicture} alt={s.name} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                    {s.name?.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-secondary-900 truncate">{s.name}</h3>
                  <p className="text-sm text-secondary-600">{s.department} • CGPA {s.cgpa}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {(s.skills || []).slice(0,5).map(skill => (
                  <span key={skill} className="px-2 py-0.5 bg-secondary-100 text-secondary-700 rounded-full text-xs">{skill}</span>
                ))}
              </div>
              {Array.isArray(s.applicationContext) && s.applicationContext.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-secondary-600 mb-1">Applied to your postings:</div>
                  <div className="flex flex-wrap gap-1">
                    {s.applicationContext.map(ctx => (
                      <span key={ctx.internshipId} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs">
                        {ctx.internshipTitle} • {ctx.applicationStatus}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <button onClick={()=>toggleShortlist(s.id)} className="btn-outline text-sm flex items-center">
{shortlist.includes(s.id) ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <Bookmark className="h-4 w-4 mr-1" />}
                  {shortlist.includes(s.id) ? 'Shortlisted' : 'Shortlist'}
                </button>
                {s.resumeLink && (
                  <button onClick={() => openResumeSecurely(s.id, s.name)} className="btn-secondary text-sm">View Resume</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterStudents;