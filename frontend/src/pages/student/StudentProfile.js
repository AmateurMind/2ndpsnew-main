import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { openResumeSecurely } from '../../utils/resumeViewer';

const StudentProfile = () => {
  const { user, setUser } = useAuth();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    name: user.name || '',
    department: user.department || '',
    semester: user.semester || 1,
    cgpa: user.cgpa || 0,
    skills: (user.skills || []).join(', '),
    resumeLink: user.resumeLink || '',
    phone: user.phone || '',
    address: user.address || ''
  });

  const save = async (e) => {
    e.preventDefault();
    const semesterNum = Number(form.semester);
    const cgpaNum = Number(form.cgpa);
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.department.trim()) { toast.error('Department is required'); return; }
    if (Number.isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) { toast.error('Semester must be between 1 and 8'); return; }
    if (Number.isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) { toast.error('CGPA must be between 0 and 10'); return; }
    try {
      const payload = {
        name: form.name,
        department: form.department,
        semester: semesterNum,
        cgpa: cgpaNum,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        resumeLink: form.resumeLink,
        phone: form.phone,
        address: form.address
      };
      const res = await axios.put('/students/profile', payload);
      toast.success('Profile updated');
      setUser(res.data.student || res.data);
      setEdit(false);
    } catch (e) {
      toast.error('Update failed');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">My Profile</h1>
        <button className="btn-primary" onClick={()=>setEdit(!edit)}>{edit ? 'Cancel' : 'Edit'}</button>
      </div>
      <div className="card p-6">
        {!edit ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name" value={user.name} />
            <Field label="Email" value={user.email} />
            <Field label="Department" value={user.department} />
            <Field label="Semester" value={String(user.semester)} />
            <Field label="CGPA" value={String(user.cgpa)} />
            <Field label="Phone" value={user.phone} />
            <Field label="Address" value={user.address} />
            <Field label="Resume" value={user.resumeLink} studentId={user.id} studentName={user.name} isResume />
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-secondary-700">Skills</label>
              <div className="mt-1 flex flex-wrap gap-1">
                {(user.skills || []).map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-secondary-100 text-secondary-700 rounded-full text-xs">{s}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(v)=>setForm({...form,name:v})} />
            <Input label="Department" value={form.department} onChange={(v)=>setForm({...form,department:v})} />
            <Input label="Semester" type="number" min={1} max={8} value={form.semester} onChange={(v)=>setForm({...form,semester:v})} />
            <Input label="CGPA" type="number" step="0.1" min={0} max={10} value={form.cgpa} onChange={(v)=>setForm({...form,cgpa:v})} />
            <Input label="Phone" value={form.phone} onChange={(v)=>setForm({...form,phone:v})} />
            <Input label="Address" value={form.address} onChange={(v)=>setForm({...form,address:v})} />
            <Input label="Resume Link" value={form.resumeLink} onChange={(v)=>setForm({...form,resumeLink:v})} className="sm:col-span-2" />
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-secondary-700">Skills (comma separated)</label>
              <input className="input-field mt-1" value={form.skills} onChange={(e)=>setForm({...form,skills:e.target.value})} />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={()=>setEdit(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, value, isLink, isResume, studentId, studentName }) => (
  <div>
    <label className="text-sm font-medium text-secondary-700">{label}</label>
    {isResume && value ? (
      <button 
        onClick={() => openResumeSecurely(studentId, studentName)}
        className="block text-primary-600 mt-1 hover:text-primary-700 underline text-left break-words"
      >
        View Resume (Secure)
      </button>
    ) : isLink && value ? (
      <a href={value} target="_blank" rel="noreferrer" className="block text-primary-600 mt-1 break-words">{value}</a>
    ) : (
      <p className="text-secondary-900 break-words">{value || '-'}</p>
    )}
  </div>
);

const Input = ({ label, value, onChange, type = 'text', className = '', step, min, max }) => (
  <div className={className}>
    <label className="text-sm font-medium text-secondary-700">{label}</label>
    <input type={type} step={step} min={min} max={max} className="input-field mt-1" value={value} onChange={(e)=>onChange(e.target.value)} />
  </div>
);

export default StudentProfile;
