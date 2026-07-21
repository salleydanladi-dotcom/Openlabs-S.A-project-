import React, { useState, useEffect } from 'react';
import { 
  Compass, QrCode, ClipboardCopy, Bell, User, LogOut, CheckCircle2, AlertTriangle, 
  BookOpen, Calendar, Clock, RefreshCw, Star, HeartPulse, ChevronRight, Award, MessageSquareQuote,
  Camera, Trash2, HelpCircle
} from 'lucide-react';
import { OpenLabsLogo } from './LandingPage';
import QRScanner from './QRScanner';
import { PRESET_AVATARS, optimizeImage } from '../utils/avatars';

interface StudentDashboardProps {
  user: any;
  profile: any;
  onLogout: () => void;
  onProfileUpdate: (updatedUser: any, updatedProfile: any) => void;
}

export default function StudentDashboard({ user, profile, onLogout, onProfileUpdate }: StudentDashboardProps) {
  const [activeMenu, setActiveMenu] = useState<'scan' | 'courses' | 'history' | 'profile'>('scan');
  const [courses, setCourses] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, present: 0, late: 0, absent: 0, excused: 0 });

  // Profile form state
  const [profileForm, setProfileForm] = useState({ 
    name: user.name, 
    phone: profile?.phone || '', 
    department: profile?.department || '', 
    studentId: profile?.studentId || '',
    profileImage: user.profileImage || ''
  });

  // Scanner status states
  const [isScanLoading, setIsScanLoading] = useState(false);
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

  const fetchStudentData = async () => {
    try {
      const [coursesRes, attRes, notifRes, studentsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch(`/api/attendance`),
        fetch(`/api/notifications?userId=${user.id}`),
        fetch('/api/students')
      ]);

      const [allCourses, allAtt, allNotif, allStudents] = await Promise.all([
        coursesRes.json(),
        attRes.json(),
        notifRes.json(),
        studentsRes.json()
      ]);

      // Find current student profile
      const sProf = allStudents.find((s: any) => s.userId === user.id);
      if (sProf) {
        setStats(sProf.attendanceStats);
        
        // Filter student's registered courses
        const reg = allCourses.filter((c: any) => sProf.registeredCourses?.includes(c.id));
        setCourses(reg);

        // Filter student's attendance records
        const attLogs = allAtt.filter((a: any) => a.studentId === sProf.id);
        setAttendance(attLogs);
      }

      setNotifications(allNotif);
    } catch (err) {
      console.error('Error synchronizing student data', err);
      showToast('error', 'Failed to synchronize console records.');
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [activeMenu]);

  // Read notification
  const markNotifRead = async (notifId: string) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notifId })
      });
      fetchStudentData();
    } catch (err) {
      console.error(err);
    }
  };

  // Submit profile edit
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          role: 'student',
          name: profileForm.name,
          phone: profileForm.phone,
          department: profileForm.department,
          studentId: profileForm.studentId,
          profileImage: profileForm.profileImage
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to revise settings');

      onProfileUpdate(data.user, data.profile);
      showToast('success', 'Academic profile successfully updated.');
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // QR Scan Success Handler
  const handleQRScanSuccess = async (scannedCode: string) => {
    setIsScanLoading(true);
    try {
      const res = await fetch('/api/qr-sessions/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: profile.id,
          code: scannedCode
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Check-in validation failed');
      }

      showToast('success', `Roster checked in successfully! Marked: ${data.attendance.status.toUpperCase()}`);
      fetchStudentData();
      setActiveMenu('history');
    } catch (err: any) {
      showToast('error', err.message || 'Verification failed');
    } finally {
      setIsScanLoading(false);
    }
  };

  const handleQRScanFailure = (errorMsg: string) => {
    showToast('error', errorMsg);
  };

  // Overall attendance calculation
  const overallRate = stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 100;

  // Unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">
      
      {/* Toast Alert Feedback */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold transition-all duration-300 animate-bounce ${
          toast.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
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
                {profile?.studentId ? profile.studentId.substring(profile.studentId.length - 3) : 'OL'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Student Console</p>
              <p className="text-sm font-bold text-white truncate max-w-[140px]" title={user.name}>{user.name}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => setActiveMenu('scan')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${
              activeMenu === 'scan' ? 'bg-[#FF7A00] text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Camera size={18} />
            Scan Lecture QR
          </button>
          
          <button
            onClick={() => setActiveMenu('courses')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${
              activeMenu === 'courses' ? 'bg-[#FF7A00] text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen size={18} />
            My Courses ({courses.length})
          </button>
          
          <button
            onClick={() => setActiveMenu('history')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${
              activeMenu === 'history' ? 'bg-[#FF7A00] text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar size={18} />
            My Attendance History
          </button>
          
          <button
            onClick={() => setActiveMenu('profile')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${
              activeMenu === 'profile' ? 'bg-[#FF7A00] text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User size={18} />
            Student Profile
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('floating-support-btn');
              if (el) el.click();
            }}
            type="button"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight text-gray-400 hover:text-white hover:bg-slate-800 transition-all text-left"
          >
            <HelpCircle size={18} className="text-[#FF7A00]" />
            Help &amp; Feedback Support
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
              <Compass size={18} />
            </span>
            <h2 className="text-lg font-black text-gray-900 tracking-tight capitalize">
              {activeMenu === 'scan' ? 'Mark Attendance' : 
               activeMenu === 'courses' ? 'Registered Course Index' : 
               activeMenu === 'history' ? 'My Attendance Ledger' : 'My Student Profile'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {activeMenu !== 'scan' && (
              <button
                onClick={() => setActiveMenu('scan')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-[#FF7A00] text-[#FF7A00] hover:text-white border border-orange-100/60 hover:border-[#FF7A00] rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                title="Tap to scan QR Code"
              >
                <Camera size={13} className="animate-pulse" />
                <span>Tap to Scan</span>
              </button>
            )}
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-full">
              <span className="text-[10px] font-mono font-bold text-[#FF7A00] uppercase tracking-wider">{profile?.studentId || 'STUDENT'}</span>
            </div>
          </div>
        </header>

        {/* Inner Content panels */}
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
                  {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
                </div>
              )}
              <div>
                <h3 className="text-base font-extrabold tracking-tight">
                  {getGreeting()}, <span className="text-[#FF7A00]">{user.name}</span>!
                </h3>
                <p className="text-xs text-gray-400">
                  Welcome back to your OpenLabs student console. Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                </p>
              </div>
            </div>
            
            <div className="text-right sm:text-right shrink-0 relative z-10">
              <span className="inline-block px-3 py-1 bg-slate-800 border border-slate-700/80 rounded-full text-[10px] font-mono text-gray-300 font-bold tracking-wider uppercase">
                {profile?.department || 'General Academic'}
              </span>
            </div>
          </div>

          {/* Low Attendance Alert Trigger */}
          {overallRate < 75 && stats.total >= 3 && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-2xl p-4 flex items-start gap-3.5 shadow-sm animate-pulse">
              <div className="p-2 bg-red-100 text-red-700 rounded-xl">
                <AlertTriangle size={20} />
              </div>
              <div className="text-xs">
                <h4 className="font-extrabold text-red-900 uppercase tracking-wider mb-0.5">Low Attendance warning</h4>
                <p className="text-red-700 leading-relaxed max-w-2xl font-medium">
                  Your collective attendance percentage is currently at <strong className="font-extrabold text-sm">{overallRate}%</strong>, which is below the minimum required 75%. Please scan active lecture QR codes regularly to prevent exams barments.
                </p>
              </div>
            </div>
          )}

          {/* 1. SCAN QR CODE VIEW */}
          {activeMenu === 'scan' && (
            <div className="grid lg:grid-cols-12 gap-6 animate-fade-in">
              {/* QR Scanner Container */}
              <div className="lg:col-span-6 h-fit">
                <QRScanner 
                  onScanSuccess={handleQRScanSuccess} 
                  onScanFailure={handleQRScanFailure}
                  isLoading={isScanLoading}
                />
              </div>

              {/* Attendance quick gauge & Notifications feeds */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Circular Gauge Card */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden group">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Overall Att. Rate</h3>
                    <p className="text-3xl font-black text-gray-950">{overallRate}%</p>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                      Calculated over <strong className="text-gray-900">{stats.total}</strong> general lectures.
                    </p>
                  </div>
                  
                  {/* Gauge indicator */}
                  <div className="relative w-24 h-24 flex items-center justify-center select-none shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="38" stroke="#F3F4F6" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="48" 
                        cy="48" 
                        r="38" 
                        stroke={overallRate < 75 ? '#EF4444' : '#10B981'} 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 38}
                        strokeDashoffset={2 * Math.PI * 38 * (1 - overallRate / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <span className="absolute text-xs font-black text-gray-800">{overallRate}%</span>
                  </div>
                </div>

                {/* Live Notifications Feed */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col h-[232px]">
                  <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Bell size={16} className="text-[#FF7A00]" />
                    Academic Notifications ({unreadCount} unread)
                  </h3>

                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => !n.read && markNotifRead(n.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                            n.read 
                              ? 'bg-gray-50/50 border-gray-100 text-gray-500' 
                              : 'bg-orange-50/50 border-orange-100 text-gray-800 hover:border-orange-200'
                          }`}
                        >
                          {!n.read && <span className="w-2 h-2 bg-[#FF7A00] rounded-full shrink-0 mt-1.5"></span>}
                          <div className="flex-1 space-y-0.5">
                            <h4 className="font-bold text-gray-950">{n.title}</h4>
                            <p className="leading-relaxed font-medium">{n.message}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-6">
                        <Bell size={28} className="text-gray-300 mb-1.5" />
                        <span className="text-xs font-semibold">You have no new alerts.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. REGISTERED COURSES LIST */}
          {activeMenu === 'courses' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {courses.map(course => {
                const logs = attendance.filter(a => a.courseId === course.id);
                const present = logs.filter(l => l.status === 'present' || l.status === 'late').length;
                const rate = logs.length > 0 ? Math.round((present / logs.length) * 100) : 100;

                return (
                  <div key={course.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                    <div className="space-y-3">
                      <span className="font-mono text-[10px] font-black text-[#FF7A00] tracking-wider bg-orange-50 px-2.5 py-1 rounded-md">
                        {course.code}
                      </span>
                      
                      <h4 className="text-sm font-black text-gray-950 tracking-tight leading-snug">
                        {course.title}
                      </h4>
                      
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {course.description || 'No course details listed.'}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] font-bold">
                      <span className="text-gray-400">Class Attendance:</span>
                      <span className={`px-2 py-0.5 rounded ${rate < 75 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{rate}%</span>
                    </div>
                  </div>
                );
              })}

              {courses.length === 0 && (
                <div className="col-span-3 bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center text-gray-400 flex flex-col items-center justify-center">
                  <BookOpen size={44} className="text-gray-300 mb-2" />
                  <p className="text-sm font-bold text-gray-800">No course enrollments found.</p>
                  <p className="text-xs text-gray-400 mt-1">Please consult the Registrar Admin to enroll your profile in curriculum indexes.</p>
                </div>
              )}
            </div>
          )}

          {/* 3. ATTENDANCE HISTORY LIST */}
          {activeMenu === 'history' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col animate-fade-in">
              <h3 className="text-base font-black text-gray-950 tracking-tight mb-4">
                Personal Attendance Ledger ({attendance.length})
              </h3>

              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                      <th className="p-3.5">Course Code</th>
                      <th className="p-3.5">Course Title</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Checked In At</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-semibold">
                    {attendance.length > 0 ? (
                      attendance.map(att => (
                        <tr key={att.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-3.5 font-mono text-[#FF7A00] font-bold">{att.courseCode}</td>
                          <td className="p-3.5 font-bold text-gray-950">{att.courseTitle}</td>
                          <td className="p-3.5 text-gray-550">{att.date}</td>
                          <td className="p-3.5 font-mono text-gray-500">{att.time || '--:--:--'}</td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                              att.status === 'present' ? 'bg-green-100 text-green-800' :
                              att.status === 'late' ? 'bg-amber-100 text-amber-800' :
                              att.status === 'absent' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {att.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right text-[10px] uppercase font-bold text-gray-400">{att.markedBy}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-gray-400">
                          No attendance history found. Scan QR codes or seek instructor marking.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. STUDENT PROFILE UPDATE */}
          {activeMenu === 'profile' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm max-w-2xl animate-fade-in">
              <h3 className="text-base font-black text-gray-950 tracking-tight mb-5 flex items-center gap-2">
                <User size={18} className="text-[#FF7A00]" />
                Academic Settings
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
                        {profileForm.name ? profileForm.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'OL'}
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
                              showToast('success', 'Custom photo loaded. Save changes below!');
                            } catch (err) {
                              showToast('error', 'Failed to process image.');
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
                            showToast('success', `${avatar.name} selected. Save settings to apply!`);
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
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Student Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-950 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Official Student ID</label>
                    <input
                      type="text"
                      required
                      value={profileForm.studentId}
                      onChange={(e) => setProfileForm({ ...profileForm, studentId: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono text-gray-950 outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Contact Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Department Enrollments</label>
                    <select
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-950 bg-white"
                    >
                      <option value="Software Development">Software Development</option>
                      <option value="Network Engineering">Network Engineering</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Multimedia & Design">Multimedia & Design</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-1.5 mt-2"
                >
                  Save Academic Profile
                </button>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
