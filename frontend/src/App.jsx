import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AddEmployee from './pages/AddEmployee';
import EmployeeProfile from './pages/EmployeeProfile';
import AttendanceCalendar from './pages/AttendanceCalendar';
import SalarySlips from './pages/SalarySlips';
import LeaveRequests from './pages/LeaveRequests';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import EmployeeList from './pages/EmployeeList';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AccountSettings from './pages/AccountSettings';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 font-sans overflow-hidden">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} />} />
      
      {/* Admin Routes */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/admin/employees" element={<Layout><EmployeeList /></Layout>} />
        <Route path="/admin/employees/add" element={<Layout><AddEmployee /></Layout>} />
        <Route path="/admin/employees/profile/:userId" element={<Layout><EmployeeProfile /></Layout>} />
        <Route path="/admin/attendance" element={<Layout><AttendanceCalendar /></Layout>} />
        <Route path="/admin/leaves" element={<Layout><LeaveRequests /></Layout>} />
        <Route path="/admin/salary" element={<Layout><SalarySlips /></Layout>} />
        <Route path="/admin/settings" element={<Layout><AccountSettings /></Layout>} />
      </Route>

      {/* Employee Routes */}
      <Route element={<ProtectedRoute role="employee" />}>
        <Route path="/employee" element={<Layout><EmployeeDashboard /></Layout>} />
        <Route path="/employee/profile" element={<Layout><EmployeeProfile userId={user?._id} /></Layout>} />
        <Route path="/employee/leaves" element={<Layout><LeaveRequests /></Layout>} />
        <Route path="/employee/salary" element={<Layout><SalarySlips /></Layout>} />
        <Route path="/employee/settings" element={<Layout><AccountSettings /></Layout>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

/** Production builds use hash routes so static hosts (e.g. Vercel CDN) work without SPA rewrites. */
const AppRouter = import.meta.env.PROD ? HashRouter : BrowserRouter;

function App() {
  return (
    <AppRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </AppRouter>
  );
}

export default App;
