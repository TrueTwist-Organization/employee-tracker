import { useState, useEffect } from 'react';
import API from '../api/axios';
import { assetUrl } from '../utils/assetUrl';
import { Users, Mail, Phone, Briefcase, MapPin, Search, Loader2, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await API.get('/employees');
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to completely remove ${name}'s data and access?`)) {
      try {
        await API.delete(`/employees/${id}`);
        setEmployees(employees.filter(emp => emp._id !== id));
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting employee');
      }
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.userId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.userId?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm, setEditForm] = useState({ designation: '', department: '', basicSalary: '', phone: '' });

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setEditForm({ 
      designation: emp.designation, 
      department: emp.department, 
      basicSalary: emp.basicSalary, 
      phone: emp.phone 
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put(`/employees/${editingEmployee._id}`, editForm);
      setEmployees(employees.map(emp => emp._id === editingEmployee._id ? data : emp));
      setEditingEmployee(null);
      alert('Employee updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating employee');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-primary w-8 h-8" /> Employee Records
          </h1>
          <p className="text-slate-400 mt-1">Manage and view all registered staff members stored in Supabase.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by name, email or role..." 
            className="input-field pl-12 pr-6 py-3 w-80 shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Edit Employee Record</h2>
              <p className="text-slate-400 mb-6 text-sm">Update details for <span className="font-bold text-white">{editingEmployee.userId?.name}</span></p>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                 <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Designation</label>
                    <input required className="input-field mt-1" value={editForm.designation} onChange={e => setEditForm({...editForm, designation: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Department</label>
                    <input required className="input-field mt-1" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Basic Salary (Monthly)</label>
                    <input required type="number" className="input-field mt-1" value={editForm.basicSalary} onChange={e => setEditForm({...editForm, basicSalary: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Phone Number</label>
                    <input required className="input-field mt-1" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                 </div>
                 
                 <div className="flex gap-3 justify-end pt-4">
                    <button type="button" onClick={() => setEditingEmployee(null)} className="btn-secondary py-2 border-slate-700 bg-slate-800 hover:bg-slate-700">Cancel</button>
                    <button type="submit" className="btn-primary py-2">Save Changes</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-slate-400 font-medium">Loading employee directory...</p>
          </div>
        ) : filteredEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role & Dept</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5 overflow-hidden">
                          {emp.profilePhoto ? (
                            <img src={assetUrl(emp.profilePhoto) || ''} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{emp.userId?.name}</p>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5 uppercase tracking-tighter">ID: {emp._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                           <span className="text-sm text-slate-300 font-medium">{emp.designation}</span>
                        </div>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full w-fit font-bold uppercase border border-slate-700">{emp.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 group/text">
                           <Mail className="w-3.5 h-3.5 text-slate-500 group-hover/text:text-primary transition-colors" />
                           <span className="text-xs text-slate-400 truncate max-w-[150px]">{emp.userId?.email}</span>
                        </div>
                        <div className="flex items-center gap-2 uppercase tracking-tighter">
                           <Phone className="w-3.5 h-3.5 text-slate-500" />
                           <span className="text-xs text-slate-400 font-medium">{emp.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-sm font-mono font-bold text-emerald-400 ring-1 ring-emerald-500/20 bg-emerald-500/5 px-2 py-1 rounded">₹{Number(emp.basicSalary).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2 text-right">
                          <Link to={`/admin/employees/profile/${emp.userId?._id}`} className="p-2 bg-slate-800 rounded-lg hover:bg-primary/20 hover:text-primary transition-all text-slate-400 border border-slate-700/50 shadow-sm" title="View Profile">
                             <Eye className="w-4 h-4" />
                          </Link>
                          <button onClick={() => openEditModal(emp)} className="p-2 bg-slate-800 rounded-lg hover:bg-emerald-500/20 hover:text-emerald-500 transition-all text-slate-400 border border-slate-700/50 shadow-sm" title="Edit">
                             <Edit className="w-4 h-4" />
                          </button>
                          <button 
                             onClick={() => handleDelete(emp._id, emp.userId?.name)}
                             className="p-2 bg-slate-800 rounded-lg hover:bg-rose-500/20 hover:text-rose-500 transition-all text-slate-400 border border-slate-700/50 shadow-sm" title="Delete"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 px-6">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
               <Users className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Employees Found</h3>
            <p className="text-slate-500 max-w-xs mx-auto">We couldn't find any employees matching your search criteria in Supabase.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
