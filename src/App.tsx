import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import LecturerDashboard from './components/LecturerDashboard';
import StudentDashboard from './components/StudentDashboard';
import SupportWidget from './components/SupportWidget';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    totalLecturers: 0,
    totalCourses: 0,
    attendanceToday: 0,
    attendancePercentage: 0,
    recentAttendance: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ol_session_user');
    const savedProfile = localStorage.getItem('ol_session_profile');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    setIsLoading(false);
  }, []);

  // Fetch stats when user changes
  useEffect(() => {
    if (!user) return;
    
    const fetchGlobalStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      }
    };
    
    fetchGlobalStats();
  }, [user]);

  const handleLoginSuccess = (loggedInUser: any, userProfile: any) => {
    setUser(loggedInUser);
    setProfile(userProfile);
    localStorage.setItem('ol_session_user', JSON.stringify(loggedInUser));
    if (userProfile) {
      localStorage.setItem('ol_session_profile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('ol_session_profile');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('ol_session_user');
    localStorage.removeItem('ol_session_profile');
  };

  const handleProfileUpdate = (updatedUser: any, updatedProfile: any) => {
    setUser(updatedUser);
    setProfile(updatedProfile);
    localStorage.setItem('ol_session_user', JSON.stringify(updatedUser));
    localStorage.setItem('ol_session_profile', JSON.stringify(updatedProfile));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-orange-500 border-r-transparent border-l-transparent border-b-transparent animate-spin"></div>
          <span className="text-gray-400 font-bold text-sm tracking-widest uppercase">Syncing Registry...</span>
        </div>
      </div>
    );
  }

  // Auth Routing
  if (!user) {
    return (
      <>
        <LandingPage onLoginSuccess={handleLoginSuccess} />
        <SupportWidget user={null} profile={null} />
      </>
    );
  }

  // Role routing
  if (user.role === 'admin') {
    return (
      <>
        <AdminDashboard 
          user={user} 
          onLogout={handleLogout} 
          stats={stats} 
          setStats={setStats} 
        />
        <SupportWidget user={user} profile={null} />
      </>
    );
  }

  if (user.role === 'lecturer') {
    return (
      <>
        <LecturerDashboard 
          user={user} 
          profile={profile} 
          onLogout={handleLogout} 
          onProfileUpdate={handleProfileUpdate} 
        />
        <SupportWidget user={user} profile={profile} />
      </>
    );
  }

  if (user.role === 'student') {
    return (
      <>
        <StudentDashboard 
          user={user} 
          profile={profile} 
          onLogout={handleLogout} 
          onProfileUpdate={handleProfileUpdate} 
        />
        <SupportWidget user={user} profile={profile} />
      </>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans p-6 text-center text-white">
      <h2 className="text-2xl font-black mb-2">Unrecognized User Role Context</h2>
      <p className="text-sm text-gray-400 mb-6 max-w-sm">
        The credentials associated with your profile have an unknown permission role identifier.
      </p>
      <button onClick={handleLogout} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-sm">
        Return to login
      </button>
    </div>
  );
}
