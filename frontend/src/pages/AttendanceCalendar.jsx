import { useState, useEffect } from 'react';
import API from '../api/axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Search, User, Loader2 } from 'lucide-react';

const DEFAULT_HOLIDAYS = ['01-26', '08-15', '10-02', '10-31', '12-25']; // Typical Fixed Date Holidays

const AttendanceCalendar = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [attendance, setAttendance] = useState([]);
  const [batchAction, setBatchAction] = useState({ userId: '', status: 'present', date: format(new Date(), 'yyyy-MM-dd'), timeIn: '09:30', timeOut: '18:30' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await API.get('/employees');
      setEmployees(data);
    };
    fetchEmployees();
  }, []);

  const fetchAttendance = async (empId = selectedEmployee) => {
    if (!empId) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/attendance?userId=${empId}&month=${month}`);
      setAttendance(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (e) => {
    e.preventDefault();
    try {
      await API.post('/attendance', batchAction);
      alert('Attendance marked');
      setSelectedEmployee(batchAction.userId);
      fetchAttendance(batchAction.userId);
    } catch (error) {
      alert(error.response?.data?.message || 'Error');
    }
  };

  const startDate = new Date(`${month}-01T00:00:00`);
  const days = eachDayOfInterval({
    start: startOfMonth(startDate),
    end: endOfMonth(startDate)
  });
  const startDayOffset = startDate.getDay();
  const blanks = Array.from({ length: startDayOffset });

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <CalendarIcon className="text-primary w-8 h-8" /> Attendance Tracker
        </h1>
        
        <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <select className="input-field pl-10 pr-10 w-64" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                        <option key={emp.userId._id} value={emp.userId._id}>{emp.userId.name}</option>
                    ))}
                </select>
            </div>
            <input type="month" className="input-field w-40" value={month} onChange={(e) => setMonth(e.target.value)} />
            <button className="btn-primary" onClick={fetchAttendance}>View Data</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="card h-full">
            <h2 className="text-xl font-bold mb-6 text-white border-b border-slate-700/50 pb-4">Mark Attendance</h2>
            <form onSubmit={markAttendance} className="space-y-4">
               <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Employee</label>
                <select required className="input-field" value={batchAction.userId} onChange={(e) => setBatchAction({...batchAction, userId: e.target.value})}>
                    <option value="">Select</option>
                    {employees.map(emp => (
                        <option key={emp.userId._id} value={emp.userId._id}>{emp.userId.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Date</label>
                <input type="date" required className="input-field" value={batchAction.date} onChange={(e) => setBatchAction({...batchAction, date: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Status</label>
                <select className="input-field" value={batchAction.status} onChange={(e) => setBatchAction({...batchAction, status: e.target.value})}>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                </select>
              </div>
              
              {batchAction.status === 'present' && (
                <div className="flex gap-3">
                  <div className="w-1/2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Time In</label>
                    <input type="time" className="input-field px-3 py-2" value={batchAction.timeIn} onChange={(e) => setBatchAction({...batchAction, timeIn: e.target.value})} />
                  </div>
                  <div className="w-1/2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Time Out</label>
                    <input type="time" className="input-field px-3 py-2" value={batchAction.timeOut} onChange={(e) => setBatchAction({...batchAction, timeOut: e.target.value})} />
                  </div>
                </div>
              )}
              <button type="submit" className="btn-secondary w-full">Save Record</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card overflow-hidden">
            <div className="grid grid-cols-7 gap-px bg-slate-700 border border-slate-700 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="bg-slate-800 p-4 text-center text-xs font-bold text-slate-400 uppercase">{d}</div>
                ))}
                
                {blanks.map((_, idx) => (
                    <div key={`blank-${idx}`} className="bg-slate-900/40 p-4 min-h-[100px] border-t border-slate-700"></div>
                ))}
                
                {days.map((day, idx) => {
                    const cellIdx = idx + startDayOffset;
                    const record = attendance.find(a => isSameDay(new Date(a.date), day));
                    const isSunday = day.getDay() === 0;
                    const isHoliday = DEFAULT_HOLIDAYS.includes(format(day, 'MM-dd'));
                    
                    return (
                        <div key={idx} className={`bg-slate-900/80 p-4 min-h-[100px] flex flex-col items-center justify-center transition-colors relative hover:bg-slate-800 border-t ${cellIdx % 7 === 0 ? '' : 'border-l'} border-slate-700`}>
                            <span className={`absolute top-2 left-3 text-xs font-bold ${(isSunday||isHoliday) ? 'text-amber-600/50' : 'text-slate-600'}`}>{format(day, 'd')}</span>
                            {loading ? <div className="animate-pulse w-8 h-8 bg-slate-800 rounded-full"></div> : record ? (
                                record.status === 'present' ? (
                                    <div className="flex flex-col items-center gap-1 w-full relative">
                                        <CheckCircle2 className={`w-5 h-5 ${record.earlyLeave ? 'text-amber-500' : 'text-emerald-500'}`} />
                                        <span className={`text-[10px] ${record.earlyLeave ? 'text-amber-500' : 'text-emerald-500'} font-bold uppercase`}>{record.earlyLeave ? 'Early L.' : 'Present'}</span>
                                        {record.timeIn && <span className="text-[10px] font-mono text-emerald-400 mt-1 uppercase">IN: {format(new Date(record.timeIn), 'hh:mm a')}</span>}
                                        {record.timeOut && <span className="text-[10px] font-mono text-rose-400 uppercase">OUT: {format(new Date(record.timeOut), 'hh:mm a')}</span>}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <XCircle className="w-6 h-6 text-rose-500" />
                                        <span className="text-[10px] text-rose-500 font-bold uppercase">Absent</span>
                                    </div>
                                )
                            ) : (isSunday || isHoliday) ? (
                                <span className="text-[10px] text-amber-500/70 font-bold uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded">Holiday</span>
                            ) : <span className="text-[10px] text-slate-700 font-medium uppercase">No Record</span>}
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-8 flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-slate-400">Present: {attendance.filter(a => a.status === 'present').length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                    <span className="text-slate-400">Absent: {attendance.filter(a => a.status === 'absent').length}</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
