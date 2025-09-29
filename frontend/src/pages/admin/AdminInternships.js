import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, MapPin, DollarSign, Clock, Building, X } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyForm = {
  id: '',
  title: '',
  company: '',
  companyLogo: '',
  description: '',
  requiredSkills: '',
  preferredSkills: '',
  eligibleDepartments: '',
  minimumSemester: 4,
  minimumCGPA: 6,
  stipend: '',
  duration: '',
  location: '',
  workMode: 'On-site',
  applicationDeadline: '',
  startDate: '',
  maxApplications: 50,
};

const AdminInternships = () => {
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState([]);
  const [pending, setPending] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchInternships();
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showForm) {
        setShowForm(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showForm]);

  const handleModalClick = (e) => {
    // Close modal if clicking on backdrop
    if (e.target === e.currentTarget) {
      setShowForm(false);
    }
  };

  const fetchInternships = async () => {
    setLoading(true);
    try {
      let allRes;
      try {
        allRes = await axios.get('/internships');
      } catch (errPrimary) {
        // Fallback: try explicitly requesting active internships
        try {
          allRes = await axios.get('/internships?status=active');
        } catch (errFallback) {
          console.error('Admin internships load error:', errFallback?.response?.data || errFallback?.message);
          toast.error(errFallback?.response?.data?.error || 'Failed to load internships');
          allRes = { data: { internships: [] } };
        }
      }

      let pendingRes;
      try {
        pendingRes = await axios.get('/internships/pending');
      } catch (errPending) {
        console.warn('Pending submissions load failed:', errPending?.response?.data || errPending?.message);
        pendingRes = { data: { internships: [] } };
      }

      setInternships(allRes.data.internships || []);
      setPending(pendingRes.data.internships || []);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setShowForm(true);
  };

  const openEdit = (i) => {
    setForm({
      id: i.id,
      title: i.title,
      company: i.company,
      companyLogo: i.companyLogo || '',
      description: i.description || '',
      requiredSkills: (i.requiredSkills || []).join(', '),
      preferredSkills: (i.preferredSkills || []).join(', '),
      eligibleDepartments: (i.eligibleDepartments || []).join(', '),
      minimumSemester: i.minimumSemester || 4,
      minimumCGPA: i.minimumCGPA || 6,
      stipend: i.stipend || '',
      duration: i.duration || '',
      location: i.location || '',
      workMode: i.workMode || 'On-site',
      applicationDeadline: i.applicationDeadline ? i.applicationDeadline.substring(0, 10) : '',
      startDate: i.startDate ? i.startDate.substring(0, 10) : '',
      maxApplications: i.maxApplications || 50,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const saveForm = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        company: form.company,
        companyLogo: form.companyLogo,
        description: form.description,
        requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        preferredSkills: form.preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
        eligibleDepartments: form.eligibleDepartments.split(',').map(s => s.trim()).filter(Boolean),
        minimumSemester: Number(form.minimumSemester),
        minimumCGPA: Number(form.minimumCGPA),
        stipend: form.stipend,
        duration: form.duration,
        location: form.location,
        workMode: form.workMode,
        applicationDeadline: form.applicationDeadline ? new Date(form.applicationDeadline).toISOString() : undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        maxApplications: Number(form.maxApplications)
      };
      if (isEditing) {
        await axios.put(`/internships/${form.id}`, payload);
        toast.success('Internship updated');
      } else {
        await axios.post('/internships', payload);
        toast.success('Internship created');
      }
      setShowForm(false);
      await fetchInternships();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Save failed');
    }
  };

  const toggleStatus = async (i) => {
    try {
      const newStatus = i.status === 'active' ? 'inactive' : 'active';
      await axios.put(`/internships/${i.id}`, { status: newStatus });
      toast.success(`Internship ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      await fetchInternships();
    } catch (e) {
      toast.error('Failed to toggle status');
    }
  };

  const confirmDelete = async (id) => {
    if (!window.confirm('Delete this internship?')) return;
    try {
      await axios.delete(`/internships/${id}`);
      toast.success('Internship deleted');
      await fetchInternships();
    } catch (e) {
      toast.error('Delete failed');
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Manage Internships</h1>
        <button onClick={openCreate} className="btn-primary flex items-center justify-center">
          <Plus className="h-4 w-4 mr-2" /> New Internship
        </button>
      </div>

      {pending.length > 0 && (
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          You have <span className="font-semibold">{pending.length}</span> pending submission{pending.length>1?'s':''} awaiting review.
        </div>
      )}

      {/* Pending Submissions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Pending Submissions</h2>
        {pending.length === 0 ? (
          <div className="card p-4 text-secondary-600">No pending submissions</div>
        ) : (
          <div className="space-y-3">
            {pending.map((p) => (
              <div key={p.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-sm text-secondary-600">{p.company} • Submitted by {p.submittedBy} on {new Date(p.submittedAt).toLocaleString()}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">Pending</span>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Admin Notes</label>
                    <textarea className="input-field h-20" value={adminNotes} onChange={(e)=>setAdminNotes(e.target.value)} placeholder="Optional notes for recruiter" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rejection Reason</label>
                    <textarea className="input-field h-20" value={rejectionReason} onChange={(e)=>setRejectionReason(e.target.value)} placeholder="Required if rejecting" />
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button 
                    onClick={async()=>{try{await axios.put(`/internships/${p.id}/approve`,{adminNotes}); toast.success('Approved'); setAdminNotes(''); setRejectionReason(''); fetchInternships();}catch(e){toast.error(e.response?.data?.error||'Approve failed')}}} 
                    className="btn-primary">
                    Approve
                  </button>
                  <button 
                    onClick={async()=>{if(!rejectionReason){return toast.error('Enter rejection reason');} try{await axios.put(`/internships/${p.id}/reject`,{rejectionReason, adminNotes}); toast.success('Rejected'); setAdminNotes(''); setRejectionReason(''); fetchInternships();}catch(e){toast.error(e.response?.data?.error||'Reject failed')}}} 
                    className="btn-danger">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Internships */}
      <h2 className="text-xl font-semibold mb-3">All Internships</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {internships.map((i) => (
          <div key={i.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-secondary-900 truncate">{i.title}</h3>
                <p className="text-sm text-secondary-600 flex items-center mt-1">
                  <Building className="h-4 w-4 mr-1" />{i.company}
                </p>
              </div>
              {i.companyLogo && (
                <img src={i.companyLogo} alt={i.company} className="h-10 w-10 rounded-lg object-cover" />
              )}
            </div>
            <div className="mt-3 space-y-1 text-sm text-secondary-600">
              <p className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{i.location} • {i.workMode}</p>
              <p className="flex items-center"><DollarSign className="h-4 w-4 mr-1" />{i.stipend}</p>
              <p className="flex items-center"><Clock className="h-4 w-4 mr-1" />{i.duration}</p>
            </div>
            <div className="mt-3">
              <div className="flex flex-wrap gap-1 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  i.status === 'active' ? 'bg-green-100 text-green-700' :
                  i.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                  i.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-secondary-100 text-secondary-700'
                }`}>
                  {i.status === 'submitted' ? 'Pending' :
                   i.status === 'rejected' ? 'Rejected' :
                   i.status === 'active' ? 'Active' :
                   i.status || 'active'}
                </span>
                {i.submittedBy && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                    By: {i.submittedBy}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {(i.requiredSkills || []).slice(0,4).map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs">{s}</span>
                ))}
                {i.requiredSkills?.length > 4 && (
                  <span className="px-2 py-0.5 bg-secondary-100 text-secondary-700 rounded-full text-xs">+{i.requiredSkills.length - 4}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {(i.eligibleDepartments || []).map((d) => (
                  <span key={d} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs">{d}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => openEdit(i)} className="btn-outline flex-1 flex items-center justify-center">
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </button>
              <button onClick={() => toggleStatus(i)} className="btn-primary flex-1 flex items-center justify-center">
                {i.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => confirmDelete(i.id)} className="btn-danger flex-1 flex items-center justify-center">
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={handleModalClick}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-secondary-200 p-4 flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-semibold text-secondary-900">{isEditing ? 'Edit Internship' : 'New Internship'}</h2>
              <div className="flex items-center gap-2">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Close</button>
                <button 
                  type="button" 
                  className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                  onClick={() => setShowForm(false)}
                  title="Close modal"
                >
                  <X className="h-5 w-5 text-secondary-600" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={saveForm} className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input className="input-field" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required />
              </div>
              <div>
                <label className="text-sm font-medium">Company</label>
                <input className="input-field" value={form.company} onChange={(e)=>setForm({...form,company:e.target.value})} required />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Company Logo URL</label>
                <input className="input-field" value={form.companyLogo} onChange={(e)=>setForm({...form,companyLogo:e.target.value})} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea className="input-field h-24" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Required Skills (comma separated)</label>
                <input className="input-field" value={form.requiredSkills} onChange={(e)=>setForm({...form,requiredSkills:e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Preferred Skills (comma separated)</label>
                <input className="input-field" value={form.preferredSkills} onChange={(e)=>setForm({...form,preferredSkills:e.target.value})} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Eligible Departments (comma separated)</label>
                <input className="input-field" value={form.eligibleDepartments} onChange={(e)=>setForm({...form,eligibleDepartments:e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Minimum Semester</label>
                <input type="number" className="input-field" value={form.minimumSemester} onChange={(e)=>setForm({...form,minimumSemester:e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Minimum CGPA</label>
                <input type="number" step="0.1" className="input-field" value={form.minimumCGPA} onChange={(e)=>setForm({...form,minimumCGPA:e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Stipend</label>
                <input className="input-field" value={form.stipend} onChange={(e)=>setForm({...form,stipend:e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Duration</label>
                <input className="input-field" value={form.duration} onChange={(e)=>setForm({...form,duration:e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <input className="input-field" value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Work Mode</label>
                <select className="input-field" value={form.workMode} onChange={(e)=>setForm({...form,workMode:e.target.value})}>
                  <option>On-site</option>
                  <option>Remote</option>
                  <option>Hybrid</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Application Deadline</label>
                <input type="date" className="input-field" value={form.applicationDeadline} onChange={(e)=>setForm({...form,applicationDeadline:e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <input type="date" className="input-field" value={form.startDate} onChange={(e)=>setForm({...form,startDate:e.target.value})} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Max Applications</label>
                <input type="number" className="input-field" value={form.maxApplications} onChange={(e)=>setForm({...form,maxApplications:e.target.value})} />
              </div>
                <div className="sm:col-span-2 flex justify-end gap-2 pt-4 border-t border-secondary-200 mt-4">
                  <button type="button" className="btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">{isEditing ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInternships;
