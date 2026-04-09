import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import { Phone, Mail, MapPin, Calendar, Briefcase, FileText, Download, UserCircle, Loader2 } from 'lucide-react';

const EmployeeProfile = ({ userId: propsUserId }) => {
  const { userId: paramsUserId } = useParams();
  const userId = paramsUserId || propsUserId;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get(`/employees/${userId}`);
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  if (!profile) return <div className="text-center p-10 text-slate-400">Profile Not Found</div>;

  const photoUrl = profile.profilePhoto ? `http://localhost:5000/${profile.profilePhoto}` : null;

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Photo & Brief Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-6 bg-slate-800 ring-4 ring-primary/20 ring-offset-4 ring-offset-[#0f172a]">
              {photoUrl ? (
                <img src={photoUrl} alt={profile.userId.name} className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-full h-full text-slate-600 p-2" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white text-center">{profile.userId.name}</h1>
            <p className="text-primary-light font-medium mt-1">{profile.designation}</p>
            <div className="w-full h-px bg-slate-700/50 my-6"></div>
            
            <div className="w-full space-y-4">
              <div className="flex items-center space-x-3 text-slate-300">
                <div className="p-2 bg-slate-800/50 rounded-lg"><Mail className="w-4 h-4 text-primary-light" /></div>
                <span className="text-sm truncate">{profile.userId.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <div className="p-2 bg-slate-800/50 rounded-lg"><Phone className="w-4 h-4 text-primary-light" /></div>
                <span className="text-sm truncate">{profile.phone}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300 items-start">
                <div className="p-2 bg-slate-800/50 rounded-lg shrink-0"><MapPin className="w-4 h-4 text-primary-light" /></div>
                <span className="text-sm leading-relaxed">{profile.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info & Documents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-6 text-white border-b border-slate-700/50 pb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" /> Employment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</p>
                <p className="text-slate-200 font-medium">{profile.department}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Basic Salary</p>
                <p className="text-slate-200 font-medium">₹ {profile.basicSalary}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</p>
                <p className="text-slate-200 font-medium">{profile.gender}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date of Birth</p>
                <p className="text-slate-200 font-medium flex items-center gap-2">
                   <Calendar className="w-4 h-4 text-slate-500" /> {new Date(profile.dob).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-6 text-white border-b border-slate-700/50 pb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Documents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.documents && profile.documents.length > 0 ? profile.documents.map((doc, idx) => (
                <div key={idx} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-center justify-between hover:bg-slate-800/60 transition-all group">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="p-2 bg-slate-700/50 rounded-lg shrink-0"><FileText className="w-5 h-5 text-slate-400 group-hover:text-primary-light" /></div>
                    <span className="text-sm font-medium text-slate-300 truncate">{doc.title}</span>
                  </div>
                  <a href={`http://localhost:5000/${doc.path}`} download target="_blank" className="p-2 hover:bg-primary/20 rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-slate-400 hover:text-primary-light" />
                  </a>
                </div>
              )) : <p className="text-slate-500 italic p-2">No documents uploaded.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
