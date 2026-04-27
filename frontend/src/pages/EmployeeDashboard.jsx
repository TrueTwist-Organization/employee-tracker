import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { assetUrl } from '../utils/assetUrl';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { 
  Building2, 
  Calendar, 
  Clock, 
  IndianRupee, 
  CheckCircle2, 
  XCircle, 
  UserCircle, 
  Phone, 
  Mail, 
  MapPin,
  Loader2,
  LogIn,
  LogOut
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMarking, setIsMarking] = useState(false);
  
  const currentMonth = format(new Date(), 'yyyy-MM');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, attendanceRes] = await Promise.all([
          API.get(`/employees/${user._id}`),
          API.get(`/attendance?userId=${user._id}&month=${currentMonth}`)
        ]);
        setProfile(profileRes.data);
        setAttendance(attendanceRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchDashboardData();
  }, [user, currentMonth]);

  const markSelfAttendance = async (isEarlyLeave = false) => {
    setIsMarking(true);
    try {
      await API.post('/attendance/self', { isEarlyLeave });
      
      // Refresh attendance data
      const { data } = await API.get(`/attendance?userId=${user._id}&month=${currentMonth}`);
      setAttendance(data);
      alert(isEarlyLeave ? 'Early Leave recorded successfully!' : 'Attendance marked successfully for today!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error marking attendance');
    } finally {
      setIsMarking(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  if (!profile) return <div className="text-center p-10 text-slate-400">Profile Not Found</div>;

  const photoUrl = assetUrl(profile.profilePhoto);
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const absentDays = attendance.filter(a => a.status === 'absent').length;
  
  const startDate = startOfMonth(new Date());
  const days = eachDayOfInterval({
    start: startDate,
    end: new Date() // Only show up to today
  });
  
  const startDayOffset = startDate.getDay();
  const blanks = Array.from({ length: startDayOffset });

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700/50 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Building2 className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-800 ring-4 ring-primary/30 ring-offset-4 ring-offset-slate-900 shadow-xl">
            {photoUrl ? (
              <img src={photoUrl} alt={profile.userId?.name} className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-full h-full text-slate-600 p-2" />
            )}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {profile.userId?.name}! 👋</h1>
            <p className="text-slate-400 text-lg flex flex-wrap items-center justify-center md:justify-start gap-4">
              <span className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> {profile.department}</span>
              <span className="hidden md:inline text-slate-600">•</span>
              <span className="text-primary-light font-medium">{profile.designation}</span>
            </p>
          </div>
          <div className="ml-auto mt-4 md:mt-0">
             {(() => {
               const todayRecord = attendance.find(a => isSameDay(new Date(a.date), new Date()));
               if (!todayRecord) {
                 return (
                   <button onClick={markSelfAttendance} disabled={isMarking} className="btn-primary flex items-center gap-2">
                     {isMarking ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-5 h-5" />}
                     Time In
                   </button>
                 );
               } else if (!todayRecord.timeOut) {
                 return (
                   <div className="flex gap-2">
                     <button onClick={() => markSelfAttendance(false)} disabled={isMarking} className="btn-secondary bg-rose-500 hover:bg-rose-600 text-white border-transparent flex items-center gap-2">
                       {isMarking ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-5 h-5" />}
                       Time Out
                     </button>
                     <button onClick={() => markSelfAttendance(true)} disabled={isMarking} className="btn-secondary bg-amber-500 hover:bg-amber-600 text-white border-transparent flex items-center gap-2">
                       {isMarking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-5 h-5" />}
                       Early Leave
                     </button>
                   </div>
                 );
               } else {
                 return (
                   <button disabled className="btn-primary flex items-center gap-2 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-600">
                     <CheckCircle2 className="w-5 h-5" /> Completed Today
                   </button>
                 );
               }
             })()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card bg-emerald-500/10 border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Present Days</p>
                <h3 className="text-3xl font-bold text-white">{presentDays}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>
          <div className="card bg-rose-500/10 border-rose-500/20">
            <div className="flex items-center justify-between">
               <div>
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Absent Days</p>
                <h3 className="text-3xl font-bold text-white">{absentDays}</h3>
              </div>
              <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-rose-400" />
              </div>
            </div>
          </div>
          <div className="card bg-blue-500/10 border-blue-500/20">
            <div className="flex items-center justify-between">
               <div>
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Leaves Balance</p>
                <h3 className="text-3xl font-bold text-white">12 <span className="text-sm font-normal text-slate-500">days</span></h3>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="card bg-amber-500/10 border-amber-500/20">
            <div className="flex items-center justify-between">
               <div>
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Basic Salary</p>
                <h3 className="text-3xl font-bold text-white"><span className="text-lg opacity-50 block sm:inline">₹</span>{profile.basicSalary.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="lg:col-span-1">
          <div className="card h-full">
            <h2 className="text-lg font-bold text-white mb-6 border-b border-slate-700/50 pb-4">Personal Info</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary-light" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Email Address</p>
                  <p className="text-sm text-slate-300 truncate font-medium mt-0.5">{profile.userId?.email}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary-light" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Phone Number</p>
                  <p className="text-sm text-slate-300 font-medium mt-0.5">{profile.phone}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary-light" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Address</p>
                  <p className="text-sm text-slate-300 font-medium mt-0.5 leading-relaxed">{profile.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="lg:col-span-2">
           <div className="card h-full">
            <div className="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-4">
               <h2 className="text-lg font-bold text-white flex items-center gap-2">
                 <Clock className="w-5 h-5 text-primary" /> Month Attendance ({format(new Date(), 'MMMM')})
               </h2>
            </div>
            
            <div className="grid grid-cols-7 gap-px bg-slate-700 border border-slate-700 rounded-xl overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="bg-slate-800 py-2 text-center text-xs font-bold text-slate-400">{d}</div>
                ))}

                {blanks.map((_, idx) => (
                    <div key={`blank-${idx}`} className="bg-slate-900/40 p-3 min-h-[80px] border-t border-slate-700"></div>
                ))}
                
                {days.map((day, idx) => {
                    const record = attendance.find(a => isSameDay(new Date(a.date), day));
                    return (
                        <div key={idx} className="bg-slate-900/80 p-3 min-h-[80px] flex flex-col items-center justify-center relative border-t border-slate-700">
                            <span className="absolute text-[10px] top-1 left-2 font-bold text-slate-600">{format(day, 'd')}</span>
                            {record ? (
                                record.status === 'present' ? 
                                  <div className="flex flex-col items-center">
                                    {record.timeIn ? <span className="text-[10px] text-emerald-400 font-mono mt-2">IN: {format(new Date(record.timeIn), 'HH:mm')}</span> : null}
                                    {record.timeOut ? <span className="text-[10px] text-rose-400 font-mono">OUT: {format(new Date(record.timeOut), 'HH:mm')}</span> : null}
                                    {record.earlyLeave ? <span className="text-[10px] text-amber-500 font-bold uppercase mt-1">EARLY LEAVE</span> : null}
                                    {!record.timeIn && !record.timeOut && <div className="bg-emerald-500/20 text-emerald-500 rounded p-1"><CheckCircle2 className="w-5 h-5" /></div>}
                                  </div> : 
                                  <div className="bg-rose-500/20 text-rose-500 rounded p-1"><XCircle className="w-5 h-5" /></div>
                            ) : <span className="text-[10px] text-slate-500">-</span>}
                        </div>
                    );
                })}
            </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
