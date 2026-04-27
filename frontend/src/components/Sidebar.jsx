import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  Calendar, 
  IndianRupee, 
  LogOut, 
  FileText,
  ChevronRight,
  UserCircle,
  ClipboardList,
  Settings
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Employees List', path: '/admin/employees', icon: Users },
    { name: 'Add Employee', path: '/admin/employees/add', icon: UserPlus },
    { name: 'Attendance', path: '/admin/attendance', icon: Calendar },
    { name: 'Leaves', path: '/admin/leaves', icon: ClipboardList },
    { name: 'Salary Units', path: '/admin/salary', icon: IndianRupee },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const employeeLinks = [
    { name: 'Dashboard', path: '/employee', icon: LayoutDashboard },
    { name: 'Profile', path: '/employee/profile', icon: UserCircle },
    { name: 'Leaves', path: '/employee/leaves', icon: ClipboardList },
    { name: 'Salary Slips', path: '/employee/salary', icon: FileText },
    { name: 'Settings', path: '/employee/settings', icon: Settings },
  ];

  const links = user?.role === 'admin' ? adminLinks : employeeLinks;

  return (
    <div className="w-64 glass-dark flex flex-col h-screen sticky top-0 shrink-0 z-50 shadow-2xl border-r border-white/5">
      <div className="p-8 pb-12 flex items-center space-x-3 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] -z-10 pointer-events-none" />
        <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center ring-1 ring-white/20 shadow-lg shadow-cyan-500/30">
          <LayoutDashboard className="text-white w-5 h-5" />
        </div>
        <span className="text-[17px] font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-wider uppercase">MiniHR App</span>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`flex items-center justify-between group px-4 py-3.5 rounded-xl transition-all duration-300 ${
              location.pathname === link.path 
                ? 'bg-cyan-500/10 text-white border border-cyan-500/20 shadow-[0_4px_15px_rgba(6,182,212,0.15)]' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center space-x-3 font-medium">
              <link.icon className={`w-5 h-5 transition-colors duration-300 ${location.pathname === link.path ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`} />
              <span className="text-[14px]">{link.name}</span>
            </div>
            {location.pathname === link.path && <ChevronRight className="w-4 h-4 text-cyan-400/70 animate-pulse" />}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 mt-auto relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-cyan-900/10 to-transparent -z-10 pointer-events-none" />
        <div className="bg-[#0b1120]/60 p-3.5 rounded-2xl mb-3 border border-white/5 shadow-inner">
            <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/20">
                    {user?.name?.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-[13px] font-bold text-slate-200 truncate">{user?.name}</p>
                    <p className="text-[10px] text-cyan-400 uppercase font-black tracking-widest">{user?.role}</p>
                </div>
            </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center space-x-2 px-4 py-3 w-full text-rose-400 font-bold hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="text-sm tracking-wide">Secure Logout</span>
        </button>
      </div>
    </div>
  );
};
