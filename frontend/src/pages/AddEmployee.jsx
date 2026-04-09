import { useState } from 'react';
import API from '../api/axios';
import { Camera, FileUp, Loader2, Save } from 'lucide-react';

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', gender: 'Male',
    dob: '', address: '', basicSalary: '', overtimeRate: '0',
    designation: '', department: ''
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (profilePhoto) data.append('profilePhoto', profilePhoto);
    documentFiles.forEach(file => data.append('documentFiles', file));

    try {
      await API.post('/employees', data);
      setMessage({ type: 'success', text: 'Employee added successfully!' });
      // Reset form if needed.
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error adding employee' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in delay-100">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Add New Employee</h1>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl text-center text-sm ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card space-y-5 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-primary-light">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Full Name</label>
              <input type="text" name="name" required className="input-field" placeholder="John Doe" onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Email</label>
              <input type="email" name="email" required className="input-field" placeholder="john@example.com" onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Password</label>
              <input type="password" name="password" required className="input-field" placeholder="••••••••" onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Phone Number</label>
              <input type="text" name="phone" required className="input-field" placeholder="+91 98765 43210" onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Date of Birth</label>
              <input type="date" name="dob" required className="input-field" onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Gender</label>
              <select name="gender" className="input-field" onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Address</label>
              <textarea name="address" required className="input-field h-24 pt-3" placeholder="123 Street Name, City" onChange={handleChange}></textarea>
            </div>
          </div>
        </div>

        <div className="card space-y-5">
          <h2 className="text-xl font-semibold mb-4 text-primary-light">Designation & Salary</h2>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Designation</label>
            <input type="text" name="designation" required className="input-field" placeholder="Software Engineer" onChange={handleChange} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Department</label>
            <input type="text" name="department" required className="input-field" placeholder="Technology" onChange={handleChange} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Basic Salary</label>
            <input type="number" name="basicSalary" required className="input-field" placeholder="e.g. 30000" onChange={handleChange} />
          </div>
        </div>

        <div className="card space-y-5">
          <h2 className="text-xl font-semibold mb-4 text-primary-light">Files & Documents</h2>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Profile Photo</label>
            <div className="flex items-center justify-center border-2 border-dashed border-slate-700 hover:border-primary/50 transition-colors rounded-xl p-4 cursor-pointer" onClick={() => document.getElementById('photo-input').click()}>
              <div className="flex flex-col items-center">
                <Camera className="text-slate-500 w-8 h-8 mb-2" />
                <span className="text-sm text-slate-400">{profilePhoto ? profilePhoto.name : 'Click to upload photo'}</span>
              </div>
              <input id="photo-input" type="file" accept="image/*" hidden onChange={(e) => setProfilePhoto(e.target.files[0])} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Upload Documents (PDF/Docs)</label>
            <div className="flex items-center justify-center border-2 border-dashed border-slate-700 hover:border-primary/50 transition-colors rounded-xl p-4 cursor-pointer" onClick={() => document.getElementById('doc-input').click()}>
               <div className="flex flex-col items-center">
                <FileUp className="text-slate-500 w-8 h-8 mb-2" />
                <span className="text-sm text-slate-400">{documentFiles.length > 0 ? `${documentFiles.length} files selected` : 'Click to select files'}</span>
              </div>
              <input id="doc-input" type="file" multiple hidden onChange={(e) => setDocumentFiles(Array.from(e.target.files))} />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end mt-4">
          <button type="submit" disabled={loading} className="btn-primary min-w-[200px] flex items-center justify-center space-x-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> <span>Save Employee</span></>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
