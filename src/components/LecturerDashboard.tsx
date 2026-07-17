import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Users, QrCode, ClipboardCheck, ArrowRight, RefreshCw, Edit, Save, 
  Trash2, ShieldCheck, CheckCircle2, AlertCircle, Plus, Check, Clock, UserCheck, Phone, Mail, Award,
  Camera
} from 'lucide-react';
import { OpenLabsLogo } from './LandingPage';
import { PRESET_AVATARS, optimizeImage } from '../utils/avatars';

interface LecturerDashboardProps {
  user: any;
  profile: any;
  onLogout: () => void;
  onProfileUpdate: (updatedUser: any, updatedProfile: any) => void;
}

export default function LecturerDashboard({ user, profile, onLogout, onProfileUpdate }: LecturerDashboardProps) {
  const [activeMenu, setActiveMenu] = useState<'courses' | 'qr' | 'attendance' | 'profile'>('courses');
  const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [qrSessions, setQrSessions] = useState<any[]>([]);
  
  // Profile form
  const [profileForm, setProfileForm] = useState({ 
    name: user.name, 
    phone: profile?.phone || '', 
    department: profile?.department || '',
    profileImage: user.profileImage || ''
  });
  
  // QR Generation form
  const [selectedCourse, setSelectedCourse] = useState('');
  const [expirationMin, setExpirationMin] = useState(15);
  const [generatedSession, setGeneratedSession] = useState<any | null>(null);

  // Manual marking form
  const [selectedMarkCourse, setSelectedMarkCourse] = useState('');
  const [markStudentId, setMarkStudentId] = useState('');
  const [markStatus, setMarkStatus] = useState<'present' | 'late' | 'absent' | 'excused'>('present');
  const [markNotes, setMarkNotes] = useState('');

  // Active Session countdown state
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning 🌅';
    if (hr < 17) return 'Good Afternoon ☀️';
    return 'Good Evening 🌌';
  };

  const fetchLecturerData = async () => {
    try {
      const [coursesRes, studentsRes, qrRes, attRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/students'),
        fetch('/api/qr-sessions'),
        fetch('/api/attendance')
      ]);

      const [allCourses, allStudents, allSessions, allAtt] = await Promise.all([
        coursesRes.json(),
        studentsRes.json(),
        qrRes.json(),
        attRes.json()
      ]);

      // Filter courses assigned to this lecturer
      const assigned = allCourses.filter((c: any) => c.lecturerId === profile.id);
      setAssignedCourses(assigned);
      setStudents(allStudents);
      setAttendance(allAtt);

      // Find sessions owned by this lecturer
      const lecSessions = allSessions.filter((qs: any) => qs.lecturerId === profile.id);
      setQrSessions(lecSessions);

      // Check if there is an active session
      const activeSes = lecSessions.find((qs: any) => qs.active === true);
      if (activeSes) {
        setGeneratedSession(activeSes);
      }
    } catch (err) {
      console.error('Error fetching lecturer info', err);
      showToast('error', 'Failed to synchronize live records.');
    }
  };

  useEffect(() => {
    fetchLecturerData();
  }, [activeMenu]);

  // Handle active session countdown timer
  useEffect(() => {
    if (!generatedSession || !generatedSession.active) return;

    const interval = setInterval(() => {
      const expiresAt = new Date(generatedSession.expiresAt).getTime();
      const now = new Date().getTime();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeRemaining('Expired');
        setGeneratedSession(null);
        fetchLecturerData();
        clearInterval(interval);
      } else {
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${mins}m ${secs}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [generatedSession]);

  // Handle Profile Update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          role: 'lecturer',
          name: profileForm.name,
          phone: profileForm.phone,
          department: profileForm.department,
          profileImage: profileForm.profileImage
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      onProfileUpdate(data.user, data.profile);
      showToast('success', 'Corporate profile updated successfully.');
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Generate QR Session
  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) {
      showToast('error', 'Please select a course curriculum.');
      return;
    }

    try {
      const res = await fetch('/api/qr-sessions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse,
          lecturerId: profile.id,
          expirationMinutes: expirationMin
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setGeneratedSession(data);
      showToast('success', 'Secure token QR code session broadcasted.');
      fetchLecturerData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Manual marking submit
  const handleManualMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMarkCourse || !markStudentId || !markStatus) {
      showToast('error', 'Please fill in all marking parameters.');
      return;
    }

    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: markStudentId,
          courseId: selectedMarkCourse,
          lecturerId: profile.id,
          status: markStatus,
          notes: markNotes,
          markedBy: 'lecturer'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to mark attendance');

      showToast('success', 'Attendance roster updated successfully.');
      setMarkStudentId('');
      setMarkNotes('');
      fetchLecturerData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Quick action to flip status on attendance table (super helpful for lecturers!)
  const toggleAttendanceStatus = async (attId: string, currentStatus: any) => {
    const statuses: ('present' | 'late' | 'absent' | 'excused')[] = ['present', 'late', 'absent', 'excused'];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];

    const attObj = attendance.find(a => a.id === attId);
    if (!attObj) return;

    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: attObj.studentId,
          courseId: attObj.courseId,
          lecturerId: profile.id,
          status: nextStatus,
          notes: attObj.notes || 'Status updated via fast switcher',
          markedBy: 'lecturer'
        })
      });

      if (!res.ok) throw new Error('Failed to change status');
      showToast('success', `Attendance updated to ${nextStatus.toUpperCase()}.`);
      fetchLecturerData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Find students belonging to current lecturer's courses
  const filteredStudents = students.filter(s => 
    s.registeredCourses.some((cid: string) => assignedCourses.some(ac => ac.id === cid))
  );

  // Find attendance for lecturer's assigned courses
  const lecAttendance = attendance.filter(a => 
    assignedCourses.some(ac => ac.id === a.courseId)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">
      
      {/* Toast Feedbacks */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold transition-all duration-300 animate-bounce ${
          toast.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 flex flex-col print:hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <OpenLabsLogo className="h-7" variant="dark" />
        </div>
        
        <div className="p-4 bg-slate-950 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            {user.profileImage ? (
              <img 
                src={user.profileImage} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border border-[#FF7A00]/45"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-orange-500/15 border border-orange-500/35 flex items-center justify-center font-bold text-orange-500 font-mono text-xs">
                {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'FC'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Lecturer Console</p>
              <p className="text-sm font-bold text-white truncate max-w-[140px]" title={user.name}>{user.name}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => setActiveMenu('courses')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${
              activeMenu === 'courses' ? 'bg-[#FF7A00] text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen size={18} />
            My Courses ({assignedCourses.length})
          </button>
          
          <button
            onClick={() => setActiveMenu('qr')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${
              activeMenu === 'qr' ? 'bg-[#FF7A00] text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <QrCode size={18} />
            QR Session Engine
            {generatedSession?.active && (
              <span className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
            )}
          </button>
          
          <button
            onClick={() => setActiveMenu('attendance')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${
              activeMenu === 'attendance' ? 'bg-[#FF7A00] text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ClipboardCheck size={18} />
            Record Attendance
          </button>
          
          <button
            onClick={() => setActiveMenu('profile')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${
              activeMenu === 'profile' ? 'bg-[#FF7A00] text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users size={18} />
            Faculty Profile
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-red-900/40 text-red-400 hover:text-red-200 border border-slate-700 hover:border-red-800/40 rounded-xl text-sm font-bold tracking-tight transition-all"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        
        {/* Header Toolbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-orange-50 text-[#FF7A00] rounded-lg">
              <Award size={18} />
            </span>
            <h2 className="text-lg font-black text-gray-900 tracking-tight capitalize">
              {activeMenu === 'courses' ? 'Assigned Curriculums' : 
               activeMenu === 'qr' ? 'Live QR Broadcaster' : 
               activeMenu === 'attendance' ? 'Student Check-In Registry' : 'Corporate Profile'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-full">
            <span className="text-[10px] font-bold text-[#FF7A00] uppercase tracking-wider">{profile?.department || 'Faculty'}</span>
          </div>
        </header>

        <div className="p-6 flex-1 space-y-6">

          {/* Time-Based Greeting Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-sm border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#FF7A00]/15 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#FF7A00]/60 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-[#FF7A00]/40 flex items-center justify-center font-black text-[#FF7A00] text-sm shrink-0 font-mono">
                  {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'FC'}
                </div>
              )}
              <div>
                <h3 className="text-base font-extrabold tracking-tight">
                  {getGreeting()}, <span className="text-[#FF7A00]">{user.name}</span>!
                </h3>
                <p className="text-xs text-gray-400">
                  Welcome back to your OpenLabs lecturer workspace. Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                </p>
              </div>
            </div>
            
            <div className="text-right sm:text-right shrink-0 relative z-10">
              <span className="inline-block px-3 py-1 bg-slate-800 border border-slate-700/80 rounded-full text-[10px] font-mono text-gray-300 font-bold tracking-wider uppercase">
                {profile?.department || 'General Faculty'}
              </span>
            </div>
          </div>

          {/* 1. MY ASSIGNED COURSES */}
          {activeMenu === 'courses' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-6">
                {assignedCourses.map(course => {
                  const enrollCount = students.filter(s => s.registeredCourses.includes(course.id)).length;
                  const courseLogs = lecAttendance.filter(a => a.courseId === course.id);
                  const presentCount = courseLogs.filter(cl => cl.status === 'present' || cl.status === 'late').length;
                  const attendancePercentage = courseLogs.length > 0 ? Math.round((presentCount / courseLogs.length) * 100) : 100;

                  return (
                    <div key={course.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                      
                      {/* Ambient Orange Circle Background */}
                      <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#FF7A00]/5 rounded-full group-hover:scale-125 transition-all duration-500"></div>

                      <div className="space-y-3.5">
                        <span className="font-mono text-xs font-bold text-[#FF7A00] tracking-wider bg-orange-50 px-2.5 py-1 rounded-md">
                          {course.code}
                        </span>
                        
                        <h3 className="text-base font-black text-gray-950 tracking-tight leading-snug">
                          {course.title}
                        </h3>
                        
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {course.description || 'No description listed.'}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-50 grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                        <div>
                          <p className="text-gray-400 font-semibold uppercase tracking-wider">Credits</p>
                          <p className="text-sm font-extrabold text-gray-900 mt-0.5">{course.creditHours} Hrs</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-semibold uppercase tracking-wider">Enrolled</p>
                          <p className="text-sm font-extrabold text-gray-900 mt-0.5">{enrollCount} Students</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-semibold uppercase tracking-wider">Average Att.</p>
                          <p className={`text-sm font-extrabold mt-0.5 ${attendancePercentage < 75 ? 'text-red-500' : 'text-green-600'}`}>{attendancePercentage}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {assignedCourses.length === 0 && (
                  <div className="col-span-2 bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center text-gray-400 flex flex-col items-center justify-center">
                    <BookOpen size={48} className="text-gray-300 mb-2" />
                    <p className="text-sm font-bold text-gray-800">No courses assigned to your profile yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Please contact the Registrar Admin to assign your course indexes.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. QR SESSION GENERATOR */}
          {activeMenu === 'qr' && (
            <div className="grid lg:grid-cols-12 gap-6 animate-fade-in">
              
              {/* Form Input Generator */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm lg:col-span-5 h-fit">
                <h3 className="text-base font-black text-gray-950 tracking-tight mb-5 flex items-center gap-2">
                  <QrCode size={18} className="text-[#FF7A00]" />
                  Broadcast Class QR Code
                </h3>

                <form onSubmit={handleGenerateQR} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Lecture Course</label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    >
                      <option value="">Choose class...</option>
                      {assignedCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">QR Expiration Interval</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[10, 15, 20].map(mins => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setExpirationMin(mins)}
                          className={`py-2 px-3 border text-xs font-bold rounded-xl transition-all ${
                            expirationMin === mins 
                              ? 'border-[#FF7A00] bg-orange-50 text-[#FF7A00]' 
                              : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          {mins} Minutes
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <QrCode size={16} />
                    Generate Expiring QR Code
                  </button>
                </form>

                {generatedSession && (
                  <div className="mt-6 p-4 bg-orange-50/50 rounded-2xl border border-orange-100 flex flex-col items-center text-center">
                    <span className="text-[10px] uppercase font-bold text-[#FF7A00] tracking-wider mb-1">Active Class Beacon</span>
                    <span className="font-mono text-sm font-black text-gray-900 tracking-wider mb-2">{generatedSession.code}</span>
                    
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-700">
                      <Clock size={14} className="text-[#FF7A00] animate-pulse" />
                      <span>Expiring in: <strong className="text-orange-600 font-extrabold">{timeRemaining}</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Visualization Overlay */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm lg:col-span-7 flex flex-col items-center justify-center text-center">
                {generatedSession ? (
                  <div className="space-y-6 flex flex-col items-center">
                    <div>
                      <h4 className="text-xl font-black text-gray-950 tracking-tight">Project Projector View</h4>
                      <p className="text-xs text-gray-400 max-w-sm mt-1 mx-auto leading-relaxed">
                        Students can point their smartphones at this screen to record check-in instantly. Screen refreshes on scan.
                      </p>
                    </div>

                    {/* Massive Holographic QR Code Box */}
                    <div className="relative p-6 bg-slate-900 rounded-3xl border-8 border-slate-950 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
                      {/* Laser pointer sweep */}
                      <div className="absolute inset-x-0 h-0.5 bg-[#FF7A00]/80 shadow-[0_0_15px_#FF7A00] z-20 top-1/2 animate-bounce"></div>
                      
                      {/* Real looking stylized QR Canvas */}
                      <div className="bg-white p-4 rounded-2xl shadow-inner relative z-10">
                        <div className="grid grid-cols-5 gap-1.5 w-48 h-48">
                          {/* Anchor corners */}
                          <div className="border-8 border-black w-10 h-10 rounded"></div>
                          <div className="bg-black/10"></div>
                          <div className="bg-black/20"></div>
                          <div className="bg-black/5"></div>
                          <div className="border-8 border-black w-10 h-10 rounded"></div>
                          
                          <div className="bg-black/5"></div>
                          <div className="bg-black w-3 h-3 rounded-full justify-self-center align-self-center"></div>
                          <div className="bg-black/30"></div>
                          <div className="bg-black w-3 h-3 rounded-full justify-self-center align-self-center"></div>
                          <div className="bg-black/10"></div>
                          
                          <div className="bg-black/40"></div>
                          <div className="bg-black/15"></div>
                          <div className="bg-black/25"></div>
                          <div className="bg-black/5"></div>
                          <div className="bg-black/30"></div>

                          <div className="bg-black/10"></div>
                          <div className="bg-black w-3 h-3 rounded-full justify-self-center align-self-center"></div>
                          <div className="bg-black/15"></div>
                          <div className="bg-black w-3 h-3 rounded-full justify-self-center align-self-center"></div>
                          <div className="bg-black/20"></div>

                          <div className="border-8 border-black w-10 h-10 rounded"></div>
                          <div className="bg-black/5"></div>
                          <div className="bg-black/40"></div>
                          <div className="bg-black/25"></div>
                          <div className="bg-black w-4 h-4 rounded-sm justify-self-center align-self-center"></div>
                        </div>
                      </div>

                      {/* Small Overlay Code tag */}
                      <div className="mt-4 px-4 py-1 bg-[#FF7A00] text-white rounded-full text-xs font-mono font-bold select-all cursor-pointer">
                        {generatedSession.code}
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-[#FF7A00] tracking-wider animate-pulse flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-[#FF7A00] rounded-full"></span>
                      ACTIVE LIVE BROADCAST PROTOCOL
                    </p>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center max-w-sm">
                    <div className="p-4 bg-orange-50 text-[#FF7A00] rounded-full mb-4">
                      <QrCode size={36} />
                    </div>
                    <h4 className="text-base font-bold text-gray-900">QR Generator Is Idle</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Select an assigned course on the left panel, configure the expirations, and trigger the session generator to project check-in codes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. RECORD ATTENDANCE PANEL */}
          {activeMenu === 'attendance' && (
            <div className="grid lg:grid-cols-12 gap-6 animate-fade-in">
              
              {/* Manual Roster Check-In Maker */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm lg:col-span-4 h-fit">
                <h3 className="text-base font-black text-gray-950 tracking-tight mb-4 flex items-center gap-2">
                  <ClipboardCheck size={18} className="text-[#FF7A00]" />
                  Direct Manual Check-In
                </h3>

                <form onSubmit={handleManualMark} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Course</label>
                    <select
                      value={selectedMarkCourse}
                      onChange={(e) => setSelectedMarkCourse(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 bg-white"
                    >
                      <option value="">Select course...</option>
                      {assignedCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Student Enrollment</label>
                    <select
                      value={markStudentId}
                      onChange={(e) => setMarkStudentId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 bg-white"
                    >
                      <option value="">Choose student...</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Check-In Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'present', label: 'Present' },
                        { key: 'late', label: 'Late' },
                        { key: 'absent', label: 'Absent' },
                        { key: 'excused', label: 'Excused' }
                      ].map(item => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setMarkStatus(item.key as any)}
                          className={`py-2 px-3 border text-xs font-bold rounded-xl transition-all ${
                            markStatus === item.key 
                              ? 'border-[#FF7A00] bg-orange-50 text-[#FF7A00]' 
                              : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Notes / Reasons (Optional)</label>
                    <textarea
                      placeholder="e.g. medical excuse, bad weather transit, etc."
                      value={markNotes}
                      onChange={(e) => setMarkNotes(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 h-16 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus size={16} />
                    Commit Roster Log
                  </button>
                </form>
              </div>

              {/* Roster logs viewing */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm lg:col-span-8 flex flex-col h-[492px]">
                <h3 className="text-base font-black text-gray-950 tracking-tight mb-4">
                  Faculty Roster Logs ({lecAttendance.length})
                </h3>

                <div className="flex-1 overflow-y-auto rounded-xl border border-gray-100">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Course Code</th>
                        <th className="p-3">Date / Time</th>
                        <th className="p-3">Status Indicator</th>
                        <th className="p-3 text-right">Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs font-medium">
                      {lecAttendance.length > 0 ? (
                        lecAttendance.map(att => (
                          <tr key={att.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-3 font-bold text-gray-950">{att.studentName}</td>
                            <td className="p-3 font-mono font-bold text-[#FF7A00]">{att.courseCode}</td>
                            <td className="p-3 text-gray-400 font-mono">
                              {att.date} <span className="text-[10px] ml-1">{att.time}</span>
                            </td>
                            <td className="p-3">
                              {/* STATUS SWITCHER TOGGLE ACTION */}
                              <button
                                onClick={() => toggleAttendanceStatus(att.id, att.status)}
                                className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wide cursor-pointer transition-all hover:scale-105 hover:shadow-sm ${
                                  att.status === 'present' ? 'bg-green-100 text-green-800' :
                                  att.status === 'late' ? 'bg-amber-100 text-amber-800' :
                                  att.status === 'absent' ? 'bg-red-100 text-red-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}
                                title="Click to rotate status directly"
                              >
                                {att.status} 🔄
                              </button>
                            </td>
                            <td className="p-3 text-right text-[10px] uppercase font-bold text-gray-400">{att.markedBy}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-gray-400">
                            No attendance recorded for your assigned courses yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="text-[10px] text-gray-400 mt-3 text-center italic">
                  💡 Tip: Click on any student's status pill (e.g. <strong>PRESENT</strong>) to cycle their status directly if there was an error!
                </p>
              </div>
            </div>
          )}

          {/* 4. FACULTY PROFILE UPDATING */}
          {activeMenu === 'profile' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm max-w-2xl animate-fade-in">
              <h3 className="text-base font-black text-gray-950 tracking-tight mb-5 flex items-center gap-2">
                <Users size={18} className="text-[#FF7A00]" />
                Revise Faculty Profile
              </h3>

              <form onSubmit={handleProfileUpdate} className="space-y-5">
                {/* Profile Picture Selection */}
                <div className="bg-gray-50 border border-gray-100/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative group shrink-0">
                    {profileForm.profileImage ? (
                      <img 
                        src={profileForm.profileImage} 
                        alt="Preview" 
                        className="w-20 h-20 rounded-full object-cover border-2 border-[#FF7A00]/60 shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center font-black text-orange-600 text-xl font-mono">
                        {profileForm.name ? profileForm.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'FC'}
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 w-7 h-7 bg-[#FF7A00] hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110">
                      <Camera size={13} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const optimized = await optimizeImage(file);
                              setProfileForm({ ...profileForm, profileImage: optimized });
                              showToast('success', 'Custom photo loaded. Save corporate settings below!');
                            } catch (err) {
                              showToast('error', 'Failed to compress image.');
                            }
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h4 className="text-xs font-extrabold text-gray-900 tracking-wider uppercase mb-1">Select Profile Picture</h4>
                    <p className="text-xs text-gray-400 mb-3">Upload a custom image or choose an academic preset avatar</p>
                    
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      {PRESET_AVATARS.map((avatar) => (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => {
                            setProfileForm({ ...profileForm, profileImage: avatar.dataUrl });
                            showToast('success', `${avatar.name} chosen. Save settings to apply!`);
                          }}
                          className={`w-9 h-9 rounded-full overflow-hidden transition-all hover:scale-110 active:scale-95 border-2 ${
                            profileForm.profileImage === avatar.dataUrl 
                              ? 'border-[#FF7A00] ring-2 ring-[#FF7A00]/20 shadow-sm scale-105' 
                              : 'border-transparent hover:border-gray-300'
                          }`}
                          title={avatar.name}
                        >
                          <img src={avatar.dataUrl} alt={avatar.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      
                      {profileForm.profileImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileForm({ ...profileForm, profileImage: '' });
                            showToast('success', 'Cleared profile picture. Save settings to apply!');
                          }}
                          className="w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center border-2 border-dashed border-red-200 hover:border-red-300 transition-all"
                          title="Remove Profile Image"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Academic Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-950 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Department Assigned</label>
                    <select
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-950 bg-white"
                    >
                      <option value="Software Development">Software Development</option>
                      <option value="Network Engineering">Network Engineering</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Multimedia & Design">Multimedia & Design</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Contact Phone</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                        <Phone size={14} />
                      </span>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-950"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Corporate Email (Read Only)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                        <Mail size={14} />
                      </span>
                      <input
                        type="email"
                        disabled
                        value={user.email}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400 font-medium select-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-1.5 mt-2"
                >
                  <Save size={16} />
                  Save Corporate Settings
                </button>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
