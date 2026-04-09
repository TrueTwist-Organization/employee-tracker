import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Users, Briefcase, IndianRupee, Calendar as CalendarIcon, Loader2, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalSalary: 0,
    recentEmployees: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await API.get('/employees');
        
        const depts = new Set(data.map(emp => emp.department));
        const salary = data.reduce((acc, emp) => acc + Number(emp.basicSalary || 0), 0);
        
        setStats({
          totalEmployees: data.length,
          totalDepartments: depts.size,
          totalSalary: salary,
          recentEmployees: data.slice(0, 5) // Show top 5
        });
      } catch (error) {
        console.error('Error fetching admin dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Company overview and quick statistics.</p>
        </div>
        <Link to="/admin/employees/add" className="btn-primary">
          + Add New Employee
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Total Employees</p>
              <h3 className="text-3xl font-bold text-white">{stats.totalEmployees}</h3>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="card bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Departments</p>
              <h3 className="text-3xl font-bold text-white">{stats.totalDepartments}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="card bg-amber-500/5 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Monthly Payroll</p>
              <h3 className="text-3xl font-bold text-white"><span className="text-lg opacity-50 block sm:inline">₹</span>{stats.totalSalary.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="card bg-blue-500/5 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Leaves Pending</p>
              <h3 className="text-3xl font-bold text-white">0</h3>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 Recent Employees
              </h2>
              <Link to="/admin/employees" className="text-sm text-primary hover:text-primary-light flex items-center gap-1 font-medium transition-colors">
                View All <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {stats.recentEmployees.map(emp => (
                <div key={emp._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold overflow-hidden">
                       {emp.profilePhoto ? <img src={`http://localhost:5000/${emp.profilePhoto}`} className="w-full h-full object-cover" /> : emp.userId?.name?.charAt(0)}
                     </div>
                     <div>
                       <p className="text-sm font-bold text-white">{emp.userId?.name}</p>
                       <p className="text-xs text-slate-400">{emp.designation}</p>
                     </div>
                  </div>
                  <Link to={`/admin/employees/profile/${emp.userId?._id}`} className="px-3 py-1.5 bg-slate-700 text-xs font-medium text-slate-300 rounded hover:bg-slate-600 transition-colors">
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
