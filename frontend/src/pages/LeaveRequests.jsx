import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Check, X, Clock, HelpCircle, Loader2, Send } from 'lucide-react';
import { format } from 'date-fns';

const LeaveRequests = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ date: '', type: 'casual', reason: '' });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const url = user.role === 'admin' ? '/leaves/pending' : `/leaves/user/${user._id}`;
      const { data } = await API.get(url);
      setLeaves(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await API.post('/leaves', formData);
      alert('Leave requested');
      fetchLeaves();
      setFormData({ date: '', type: 'casual', reason: '' });
    } catch (error) {
      alert('Error applying leaf');
    }
  };

  const handleUpdate = async (id, status) => {
    try {
      await API.put(`/leaves/${id}`, { status });
      setLeaves(leaves.filter(l => l._id !== id));
    } catch (error) {
      alert('Error updating leaf');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ClipboardList className="text-primary w-8 h-8" /> {user.role === 'admin' ? 'Leave Approvals' : 'My Leave Requests'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {user.role === 'employee' && (
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-bold mb-6 text-white border-b border-slate-700/50 pb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" /> Apply for Leave
              </h2>
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Date</label>
                  <input type="date" required className="input-field" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Type</label>
                  <select className="input-field" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Reason</label>
                  <textarea required className="input-field h-24 pt-3" placeholder="Reason for leave..." value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}></textarea>
                </div>
                <button type="submit" className="btn-primary w-full">Submit Request</button>
              </form>
            </div>
          </div>
        )}

        <div className={user.role === 'employee' ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <div className="card min-h-[400px]">
            <h2 className="text-xl font-bold mb-6 text-white border-b border-slate-700/50 pb-4">
              {user.role === 'admin' ? 'Pending Requests' : 'Request History'}
            </h2>
            
            {loading ? <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> : (
              <div className="space-y-4 text-white">
                {leaves.length > 0 ? leaves.map(leave => (
                  <div key={leave._id} className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                          <span className="text-lg font-bold">{format(new Date(leave.date), 'dd MMM yyyy')}</span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${leave.type === 'sick' ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>{leave.type}</span>
                       </div>
                       {user.role === 'admin' && <p className="text-sm font-semibold text-primary/80">Requested by: {leave.userId?.name}</p>}
                       <p className="text-sm text-slate-400 italic">"{leave.reason}"</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {leave.status === 'pending' ? (
                        user.role === 'admin' ? (
                          <>
                            <button onClick={() => handleUpdate(leave._id, 'approved')} className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl transition-all border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                              <Check className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleUpdate(leave._id, 'rejected')} className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20 shadow-lg shadow-rose-500/5">
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20">
                            <Clock className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Pending</span>
                          </div>
                        )
                      ) : (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${leave.status === 'approved' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-500 bg-rose-500/10 border-rose-500/20'}`}>
                           {leave.status === 'approved' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                           <span className="text-xs font-bold uppercase">{leave.status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )) : <div className="text-center p-10 text-slate-500 italic">No leave requests found.</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequests;
