import React, { useState } from 'react';
import { Mail, Lock, User, Briefcase, GraduationCap, Shield, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onLoginSuccess: (user: any, profile: any) => void;
}

export function OpenLabsLogo({ className = "h-8", variant = "light" }: { className?: string; variant?: 'light' | 'dark' }) {
  const textColor = variant === 'light' ? 'text-gray-900' : 'text-white';
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <div className="flex items-center">
        <span className="text-[#FF7A00] font-black tracking-tight text-2xl">Open</span>
        {/* Beautiful custom chevron logo matching the arrow */}
        <div className="flex items-center mx-1.5 mt-0.5">
          <svg className="w-5 h-5 text-[#FF7A00]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 4L13 12L5 20H10L18 12L10 4H5Z" />
          </svg>
          <svg className="w-5 h-5 text-[#FF7A00] -ml-2.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 4L13 12L5 20H10L18 12L10 4H5Z" />
          </svg>
        </div>
        <span className={`${textColor} font-bold text-2xl`}>Labs</span>
      </div>
      <div className="border-l border-gray-400/30 pl-2 ml-1 h-6 flex items-center">
        <span className="text-[9px] tracking-[0.2em] font-extrabold text-[#FF7A00] block">GHANA</span>
      </div>
    </div>
  );
}

export default function LandingPage({ onLoginSuccess }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'student' | 'lecturer' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const departments = [
    'Software Development',
    'Network Engineering',
    'Data Science',
    'Cybersecurity',
    'Multimedia & Design'
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLoginSuccess(data.user, data.profile);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          phone,
          department,
          studentId: role === 'student' ? studentId : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Automatically log the user in after registration
      onLoginSuccess(data.user, data.profile);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickDemo = (demoRole: 'admin' | 'lecturer' | 'student') => {
    setError('');
    setActiveTab('login');
    if (demoRole === 'admin') {
      setEmail('admin@openlabs.edu.gh');
      setPassword('adminpassword');
    } else if (demoRole === 'lecturer') {
      setEmail('lecturer@openlabs.edu.gh');
      setPassword('lecturerpassword');
    } else {
      setEmail('student@openlabs.edu.gh');
      setPassword('studentpassword');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F0F] via-[#1F1F1F] to-[#121212] flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden relative">
      {/* Background Watermarks & Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF7A00]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Branding Panel */}
        <div className="md:col-span-6 flex flex-col justify-center text-white p-4 md:p-6">
          <OpenLabsLogo className="h-10 mb-6" variant="dark" />
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
            Next-Gen <span className="text-[#FF7A00]">Attendance</span> Tracking System
          </h1>
          
          <p className="text-gray-400 text-base mb-8 max-w-md leading-relaxed">
            Eliminate manuals and paper sign-sheets. Create instantaneous lectures, generate expiring secure QR codes, scan, and record real-time classroom check-ins at OpenLabs Ghana.
          </p>

          {/* Quick Demo Accout Selector */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 mb-6 shadow-xl">
            <h4 className="text-sm font-bold text-gray-200 mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              Evaluate Instantly with Demo Accounts:
            </h4>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => fillQuickDemo('admin')}
                className="py-2.5 px-2 bg-white/5 hover:bg-[#FF7A00]/20 hover:border-[#FF7A00]/40 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all flex flex-col items-center gap-1.5"
              >
                <Shield size={16} className="text-[#FF7A00]" />
                Admin Profile
              </button>
              
              <button
                onClick={() => fillQuickDemo('lecturer')}
                className="py-2.5 px-2 bg-white/5 hover:bg-[#FF7A00]/20 hover:border-[#FF7A00]/40 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all flex flex-col items-center gap-1.5"
              >
                <Briefcase size={16} className="text-[#FF7A00]" />
                Lecturer Profile
              </button>
              
              <button
                onClick={() => fillQuickDemo('student')}
                className="py-2.5 px-2 bg-white/5 hover:bg-[#FF7A00]/20 hover:border-[#FF7A00]/40 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all flex flex-col items-center gap-1.5"
              >
                <GraduationCap size={16} className="text-[#FF7A00]" />
                Student Profile
              </button>
            </div>
            
            <p className="text-[10px] text-gray-500 mt-3 text-center italic">
              Click any role profile to auto-fill credentials instantly!
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-6 bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 relative overflow-hidden flex flex-col">
          
          {/* Decorative Corner Arc */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#FF7A00]/5 rounded-full pointer-events-none"></div>

          {/* Form Selector Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-[#FF7A00] shadow'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'signup'
                  ? 'bg-white text-[#FF7A00] shadow'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Corporate / Academic Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="e.g. yourname@openlabs.edu.gh"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none transition-all placeholder:text-gray-400 text-gray-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Secure Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none transition-all text-gray-950"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                id="submit-login-btn"
                className="w-full py-3 bg-[#FF7A00] hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-6"
              >
                {isLoading ? 'Verifying credentials...' : 'Access Dashboard'}
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Choose Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      role === 'student'
                        ? 'border-[#FF7A00] bg-orange-50 text-[#FF7A00]'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <GraduationCap size={14} />
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('lecturer')}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      role === 'lecturer'
                        ? 'border-[#FF7A00] bg-orange-50 text-[#FF7A00]'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <Briefcase size={14} />
                    Lecturer
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Kwame Mensah"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none transition-all text-gray-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Academic Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@openlabs.edu.gh"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none transition-all text-gray-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Secure Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none transition-all text-gray-950"
                  />
                </div>
              </div>

              {role === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Student ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. OL-2026-004"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none transition-all text-gray-950 font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-2.5 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none transition-all text-gray-950 bg-white"
                  >
                    <option value="">Select Dept</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +233..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none transition-all text-gray-950"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                id="submit-register-btn"
                className="w-full py-3 bg-[#FF7A00] hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? 'Creating credentials...' : 'Create Account'}
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Footer watermarks */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
            <span>OpenLabs Ghana Admin Console v2.0</span>
            <span className="flex items-center gap-1">
              <Shield size={12} className="text-green-500" />
              Secure SHA-256
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
