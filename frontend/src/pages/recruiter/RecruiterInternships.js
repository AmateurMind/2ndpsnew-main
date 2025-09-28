import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, MapPin, DollarSign, Clock, Building, X } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const emptyForm = {
  id: '',
  title: '',
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
  companyDescription: '',
  requirements: '',
  benefits: ''
};

const RecruiterInternships = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchMyInternships();
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

  const fetchMyInternships = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/internships/my-postings');
      setInternships(res.data.internships || []);
    } catch (e) {
      toast.error('Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm({
      ...emptyForm,
      // Pre-fill company info from recruiter profile
      company: user.company || '',
      companyLogo: user.companyLogo || '',
      location: user.companyDetails?.location || ''
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const openEdit = (internship) => {
    setForm({
      id: internship.id,
      title: internship.title,
      description: internship.description || '',
      requiredSkills: (internship.requiredSkills || []).join(', '),
      preferredSkills: (internship.preferredSkills || []).join(', '),
      eligibleDepartments: (internship.eligibleDepartments || []).join(', '),
      minimumSemester: internship.minimumSemester || 4,
      minimumCGPA: internship.minimumCGPA || 6,
      stipend: internship.stipend || '',
      duration: internship.duration || '',
      location: internship.location || '',
      workMode: internship.workMode || 'On-site',
      applicationDeadline: internship.applicationDeadline ? internship.applicationDeadline.substring(0, 10) : '',
      startDate: internship.startDate ? internship.startDate.substring(0, 10) : '',
      maxApplications: internship.maxApplications || 50,
      companyDescription: internship.companyDescription || '',
      requirements: (internship.requirements || []).join('\n'),
      benefits: (internship.benefits || []).join('\n')
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const saveForm = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        company: user.company, // Always use recruiter's company
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
        maxApplications: Number(form.maxApplications),
        companyDescription: form.companyDescription,
        requirements: form.requirements.split('\n').map(r => r.trim()).filter(Boolean),
        benefits: form.benefits.split('\n').map(b => b.trim()).filter(Boolean)
      };

      if (isEditing) {
        await axios.put(`/internships/${form.id}`, payload);
        toast.success('Internship updated successfully');
      } else {
        await axios.post('/internships', payload);
        toast.success('Internship posted successfully');
      }
      setShowForm(false);
      await fetchMyInternships();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Save failed');
    }
  };

  const toggleStatus = async (internship) => {
    try {
      const newStatus = internship.status === 'active' ? 'inactive' : 'active';
      await axios.put(`/internships/${internship.id}`, { status: newStatus });
      toast.success(`Internship ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      await fetchMyInternships();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const confirmDelete = async (id) => {
    if (!window.confirm('Delete this internship posting? This action cannot be undone.')) return;
    try {
      await axios.delete(`/internships/${id}`);
      toast.success('Internship deleted successfully');
      await fetchMyInternships();
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">My Internship Postings</h1>
          <p className="text-secondary-600 mt-1">Manage internship opportunities for {user.company}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center justify-center">
          <Plus className="h-4 w-4 mr-2" /> Post New Internship
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-2xl font-bold text-primary-600">{internships.length}</div>
          <div className="text-sm text-secondary-600">Total Postings</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-green-600">
            {internships.filter(i => i.status === 'active').length}
          </div>
          <div className="text-sm text-secondary-600">Active Postings</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-blue-600">
            {internships.reduce((sum, i) => sum + (i.currentApplications || 0), 0)}
          </div>
          <div className="text-sm text-secondary-600">Total Applications</div>
        </div>
      </div>

      {/* Internship List */}
      {internships.length === 0 ? (
        <div className="card p-8 text-center">
          <Building className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">No internships posted yet</h3>
          <p className="text-secondary-600 mb-4">Start by posting your first internship opportunity</p>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" /> Post Your First Internship
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <div key={internship.id} className="card p-6 group hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-secondary-900 truncate group-hover:text-primary-600 transition-colors">
                    {internship.title}
                  </h3>
                  <p className="text-sm text-secondary-600 flex items-center mt-1">
                    <Building className="h-4 w-4 mr-1" />
                    {internship.company}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  internship.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-secondary-100 text-secondary-800'
                }`}>
                  {internship.status || 'active'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-secondary-500 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {internship.location} • {internship.workMode}
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

              <p className="text-sm text-secondary-600 mb-4 line-clamp-2">
                {internship.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {(internship.requiredSkills || []).slice(0, 3).map((skill) => (
                  <span key={skill} className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                    {skill}
                  </span>
                ))}
                {internship.requiredSkills?.length > 3 && (
                  <span className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full">
                    +{internship.requiredSkills.length - 3} more
                  </span>
                )}
              </div>

              <div className="text-sm text-secondary-600 mb-4">
                <span className="font-medium">{internship.currentApplications || 0}</span> applications received
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => openEdit(internship)} 
                  className="btn-outline flex-1 flex items-center justify-center text-sm"
                >
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </button>
                <button 
                  onClick={() => toggleStatus(internship)} 
                  className="btn-primary flex-1 flex items-center justify-center text-sm"
                >
                  {internship.status === 'active' ? 'Pause' : 'Activate'}
                </button>
                <button 
                  onClick={() => confirmDelete(internship.id)} 
                  className="btn-danger flex items-center justify-center text-sm px-3"
                  title="Delete internship"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={handleModalClick}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-secondary-200 p-6 flex-shrink-0">
              <h2 className="text-xl font-semibold text-secondary-900">
                {isEditing ? 'Edit Internship Posting' : 'Post New Internship'}
              </h2>
              <div className="flex items-center gap-2">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Close
                </button>
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
            
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={saveForm} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Position Title *
                    </label>
                    <input 
                      className="input-field" 
                      value={form.title} 
                      onChange={(e) => setForm({...form, title: e.target.value})} 
                      required 
                      placeholder="e.g., Software Engineering Intern"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Company
                    </label>
                    <input 
                      className="input-field bg-secondary-50" 
                      value={user.company} 
                      disabled
                      title="Company is automatically set from your profile"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Job Description *
                  </label>
                  <textarea 
                    className="input-field h-32" 
                    value={form.description} 
                    onChange={(e) => setForm({...form, description: e.target.value})} 
                    required
                    placeholder="Describe the internship role, responsibilities, and what the intern will learn..."
                  />
                </div>

                {/* Skills and Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Required Skills * (comma separated)
                    </label>
                    <input 
                      className="input-field" 
                      value={form.requiredSkills} 
                      onChange={(e) => setForm({...form, requiredSkills: e.target.value})} 
                      required
                      placeholder="JavaScript, React, Node.js"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Preferred Skills (comma separated)
                    </label>
                    <input 
                      className="input-field" 
                      value={form.preferredSkills} 
                      onChange={(e) => setForm({...form, preferredSkills: e.target.value})} 
                      placeholder="TypeScript, AWS, Docker"
                    />
                  </div>
                </div>

                {/* Eligibility */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Eligible Departments * (comma separated)
                    </label>
                    <input 
                      className="input-field" 
                      value={form.eligibleDepartments} 
                      onChange={(e) => setForm({...form, eligibleDepartments: e.target.value})} 
                      required
                      placeholder="Computer Science, IT"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Minimum Semester
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      max="8" 
                      className="input-field" 
                      value={form.minimumSemester} 
                      onChange={(e) => setForm({...form, minimumSemester: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Minimum CGPA
                    </label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="10" 
                      className="input-field" 
                      value={form.minimumCGPA} 
                      onChange={(e) => setForm({...form, minimumCGPA: e.target.value})} 
                    />
                  </div>
                </div>

                {/* Compensation and Logistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Stipend
                    </label>
                    <input 
                      className="input-field" 
                      value={form.stipend} 
                      onChange={(e) => setForm({...form, stipend: e.target.value})} 
                      placeholder="₹20,000/month"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Duration
                    </label>
                    <input 
                      className="input-field" 
                      value={form.duration} 
                      onChange={(e) => setForm({...form, duration: e.target.value})} 
                      placeholder="6 months"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Max Applications
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      className="input-field" 
                      value={form.maxApplications} 
                      onChange={(e) => setForm({...form, maxApplications: e.target.value})} 
                    />
                  </div>
                </div>

                {/* Location and Work Mode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Location
                    </label>
                    <input 
                      className="input-field" 
                      value={form.location} 
                      onChange={(e) => setForm({...form, location: e.target.value})} 
                      placeholder="Mumbai, Delhi, Remote"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Work Mode
                    </label>
                    <select 
                      className="input-field" 
                      value={form.workMode} 
                      onChange={(e) => setForm({...form, workMode: e.target.value})}
                    >
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Application Deadline
                    </label>
                    <input 
                      type="date" 
                      className="input-field" 
                      value={form.applicationDeadline} 
                      onChange={(e) => setForm({...form, applicationDeadline: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Start Date
                    </label>
                    <input 
                      type="date" 
                      className="input-field" 
                      value={form.startDate} 
                      onChange={(e) => setForm({...form, startDate: e.target.value})} 
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Company Description
                  </label>
                  <textarea 
                    className="input-field h-24" 
                    value={form.companyDescription} 
                    onChange={(e) => setForm({...form, companyDescription: e.target.value})} 
                    placeholder="Brief description of your company..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Additional Requirements (one per line)
                    </label>
                    <textarea 
                      className="input-field h-24" 
                      value={form.requirements} 
                      onChange={(e) => setForm({...form, requirements: e.target.value})} 
                      placeholder="Strong communication skills&#10;Ability to work in a team&#10;Problem-solving mindset"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Benefits Offered (one per line)
                    </label>
                    <textarea 
                      className="input-field h-24" 
                      value={form.benefits} 
                      onChange={(e) => setForm({...form, benefits: e.target.value})} 
                      placeholder="Mentorship from senior developers&#10;Flexible working hours&#10;Certificate of completion&#10;Networking opportunities"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {isEditing ? 'Update Internship' : 'Post Internship'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterInternships;