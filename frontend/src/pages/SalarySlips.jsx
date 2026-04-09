import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Download, FileText, IndianRupee, Loader2, PlayCircle, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const SalarySlips = () => {
  const { user } = useAuth();
  const [salaries, setSalaries] = useState([]);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSalaries();
  }, [month]);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/salary/${month}`);
      setSalaries(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateSalaries = async () => {
    setGenerating(true);
    try {
      await API.post(`/salary/${month}/generate`);
      alert('Salaries generated');
      fetchSalaries();
    } catch (error) {
      alert('Error generating salaries');
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = async (id, name) => {
    try {
      const response = await API.get(`/salary/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `salary-slip-${name}-${month}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
       alert('Error downloading PDF');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <IndianRupee className="text-primary w-8 h-8" /> Salary Management
        </h1>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input type="month" className="input-field pl-10 w-48" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          {user.role === 'admin' && (
            <button disabled={generating} onClick={generateSalaries} className="btn-primary flex items-center gap-2 whitespace-nowrap">
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><PlayCircle className="w-5 h-5" /> Generate Salaries</>}
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/40 font-semibold text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-5">Employee Name</th>
                <th className="p-5">Month</th>
                <th className="p-5">Attendance Stats</th>
                <th className="p-5">Basic Salary</th>
                <th className="p-5">Deductions</th>
                <th className="p-5">Net Salary</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                   <td colSpan="6" className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></td>
                </tr>
              ) : salaries.length > 0 ? salaries.map(salary => (
                <tr key={salary._id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-5 font-medium text-slate-200">
                    {salary.userId?.name || 'N/A'}
                    <span className="block text-[10px] text-slate-500 font-normal uppercase tracking-tight">{salary.userId?.email}</span>
                  </td>
                  <td className="p-5 text-slate-400 font-medium">{salary.month}</td>
                  <td className="p-5">
                    <div className="flex gap-3 text-xs font-semibold">
                       <span className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">P: {salary.presentDays}</span>
                       <span className="text-rose-500 bg-rose-500/10 px-2 py-1 rounded">A: {salary.absentDays}</span>
                       <span className="text-amber-500 bg-amber-500/10 px-2 py-1 rounded">L: {salary.lateMarks || 0}</span>
                    </div>
                  </td>
                  <td className="p-5 text-slate-300 font-semibold group-hover:text-primary-light transition-colors">₹ {salary.basicSalary}</td>
                  <td className="p-5 text-rose-500 font-medium">
                    <span className="block">₹ {salary.deductions}</span>
                    <span className="text-[10px] text-slate-500 font-normal uppercase tracking-tight w-max block">Includes Late Pen: ₹{salary.lateDeduction || 0}</span>
                  </td>
                  <td className="p-5 text-emerald-500 font-bold">₹ {salary.netSalary}</td>
                  <td className="p-5 text-right">
                    <button onClick={() => downloadPDF(salary._id, salary.userId.name)} className="btn-secondary rounded-lg px-4 py-2 text-xs flex items-center gap-2 ml-auto">
                       <FileText className="w-4 h-4" /> PDF Slip
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500 italic">No salary records found for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalarySlips;
