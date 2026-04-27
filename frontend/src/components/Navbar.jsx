import { Bell, Search, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user } = useAuth();
  const settingsPath = user?.role === 'admin' ? '/admin/settings' : '/employee/settings';

  return (
    <header className="h-[88px] glass-dark border-b border-white/5 flex items-center justify-between px-10 shrink-0 sticky top-0 z-40 bg-[#020617]/50 backdrop-blur-3xl">
      <div className="flex items-center space-x-12">
        <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
           Good day, {user?.name.split(' ')[0]} 👋
        </h1>
        <div className="hidden md:flex relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search records or employees..." 
            className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all w-96 text-white placeholder-slate-500 shadow-inner backdrop-blur-md" 
          />
        </div>
      </div>

      <div className="flex items-center space-x-5">
        <button className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 group relative overflow-hidden active:scale-95 shadow-sm">
          <Bell className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-black/50 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse"></div>
        </button>
        <Link to={settingsPath} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 group active:scale-95 shadow-sm">
          <Settings className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors rotate-0 group-hover:rotate-45 duration-500" />
        </Link>
      </div>
    </header>
  );
};
