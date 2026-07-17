import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, BookOpen, Calendar, TrendingUp, Search, Plus, Edit2, Trash2, 
  Download, Moon, Sun, LogOut, ChevronRight, CheckCircle2, AlertCircle, X, Shield, Filter, Award, Bell
} from 'lucide-react';
import { OpenLabsLogo } from './LandingPage';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
  stats: any;
  setStats: React.Dispatch<React.SetStateAction<any>>;
}

export default function AdminDashboard({ user, onLogout, stats, setStats }: AdminDashboardProps) {
  const [activeMenu, setActiveMenu] = useState<'overview' | 'students' | 'lecturers' | 'courses' | 'reports'>('overview');
  const [students, setStudents] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [reportFilterCourse, setReportFilterCourse] = useState('all');
  const [reportFilterStatus, setReportFilterStatus] = useState('all');
  const [reportFilterDate, setReportFilterDate] = useState('');

  // Modals
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showLecturerModal, setShowLecturerModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  
  // Current editing target
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [editingLecturer, setEditingLecturer] = useState<any | null>(null);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);

  // Form Fields
  const [studentForm, setStudentForm] = useState({ name: '', email: '', department: '', phone: '', studentId: '', registeredCourses: [] as string[] });
  const [lecturerForm, setLecturerForm] = useState({ name: '', email: '', department: '', phone: '', assignedCourses: [] as string[] });
  const [courseForm, setCourseForm] = useState({ code: '', title: '', description: '', creditHours: 3, department: '', lecturerId: 'unassigned' });

  // Notifications feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAllData = async () => {
    try {
      const [studentsRes, lecturersRes, coursesRes, attendanceRes, statsRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/lecturers'),
        fetch('/api/courses'),
        fetch('/api/attendance'),
        fetch('/api/stats')
      ]);

      const [studentsData, lecturersData, coursesData, attendanceData, statsData] = await Promise.all([
        studentsRes.json(),
        lecturersRes.json(),
        coursesRes.json(),
        attendanceRes.json(),
        statsRes.json()
      ]);

      setStudents(studentsData);
      setLecturers(lecturersData);
      setCourses(coursesData);
      setAttendance(attendanceData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching admin data', err);
      showToast('error', 'Failed to synchronize console data.');
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [activeMenu]);

  // -- CRUD STUDENTS --
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
      const method = editingStudent ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to save student');

      showToast('success', editingStudent ? 'Student details updated successfully.' : 'New student created successfully.');
      setShowStudentModal(false);
      setEditingStudent(null);
      setStudentForm({ name: '', email: '', department: '', phone: '', studentId: '', registeredCourses: [] });
      fetchAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this student? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete student');
      showToast('success', 'Student record removed from registry.');
      fetchAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // -- CRUD LECTURERS --
  const handleSaveLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingLecturer ? `/api/lecturers/${editingLecturer.id}` : '/api/lecturers';
      const method = editingLecturer ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lecturerForm)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to save lecturer');

      showToast('success', editingLecturer ? 'Lecturer profile updated.' : 'New lecturer account registered.');
      setShowLecturerModal(false);
      setEditingLecturer(null);
      setLecturerForm({ name: '', email: '', department: '', phone: '', assignedCourses: [] });
      fetchAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleDeleteLecturer = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this lecturer? All assigned courses will be set to unassigned.')) return;
    try {
      const res = await fetch(`/api/lecturers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete lecturer');
      showToast('success', 'Lecturer account removed.');
      fetchAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // -- CRUD COURSES --
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses';
      const method = editingCourse ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to save course');

      showToast('success', editingCourse ? 'Course curriculum revised.' : 'New course syllabus indexed.');
      setShowCourseModal(false);
      setEditingCourse(null);
      setCourseForm({ code: '', title: '', description: '', creditHours: 3, department: '', lecturerId: 'unassigned' });
      fetchAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Delete this course? All associated attendance, QR codes, and student enrollments will be wiped.')) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete course');
      showToast('success', 'Course curriculum deleted.');
      fetchAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Open Edit Modals
  const openEditStudent = (stud: any) => {
    setEditingStudent(stud);
    setStudentForm({
      name: stud.name,
      email: stud.email,
      department: stud.department,
      phone: stud.phone || '',
      studentId: stud.studentId,
      registeredCourses: stud.registeredCourses || []
    });
    setShowStudentModal(true);
  };

  const openEditLecturer = (lect: any) => {
    setEditingLecturer(lect);
    setLecturerForm({
      name: lect.name,
      email: lect.email,
      department: lect.department,
      phone: lect.phone || '',
      assignedCourses: lect.assignedCourses || []
    });
    setShowLecturerModal(true);
  };

  const openEditCourse = (course: any) => {
    setEditingCourse(course);
    setCourseForm({
      code: course.code,
      title: course.title,
      description: course.description || '',
      creditHours: course.creditHours || 3,
      department: course.department,
      lecturerId: course.lecturerId || 'unassigned'
    });
    setShowCourseModal(true);
  };

  // Print PDF/Print Report
  const handlePrintReport = () => {
    window.print();
  };

  // Filters application
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLecturers = lecturers.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAttendance = attendance.filter(att => {
    const courseMatch = reportFilterCourse === 'all' || att.courseId === reportFilterCourse;
    const statusMatch = reportFilterStatus === 'all' || att.status === reportFilterStatus;
    const dateMatch = !reportFilterDate || att.date === reportFilterDate;
    const searchMatch = !searchQuery || 
      att.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.studentOLId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.courseCode.toLowerCase().includes(searchQuery.toLowerCase());

    return courseMatch && statusMatch && dateMatch && searchMatch;
  });

  // Chart data extraction (Attendance frequency by date for the past week)
  const getAttendanceChartData = () => {
    const datesMap: { [key: string]: { present: number, absent: number, late: number } } = {};
    
    // Seed past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      datesMap[d] = { present: 0, absent: 0, late: 0 };
    }

    attendance.forEach(att => {
      if (datesMap[att.date]) {
        if (att.status === 'present') datesMap[att.date].present += 1;
        else if (att.status === 'late') datesMap[att.date].late += 1;
        else if (att.status === 'absent') datesMap[att.date].absent += 1;
      }
    });

    return Object.entries(datesMap).map(([date, stats]) => ({
      date: date.substring(5), // MM-DD
      ...stats,
      total: stats.present + stats.late + stats.absent
    }));
  };

  const chartData = getAttendanceChartData();
  const maxChartValue = Math.max(...chartData.map(d => d.total), 5);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">
      
      {/* Toast Alert Feedback */}
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
            <div className="w-10 h-10 rounded-full bg-[#FF7A00]/20 border border-[#FF7A00]/40 flex items-center justify-center font-bold text-[#FF7A00]">
              OP
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">System Admin</p>
              <p className="text-sm font-bold text-white truncate max-w-[140px]">{user.name}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => { setActiveMenu('overview'); setSearchQuery(''); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${
              activeMenu === 'overview'
                ? 'bg-[#FF7A00] text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp size={18} />
            Overview Dashboard
          </button>
          
          <button
            onClick={() => { setActiveMenu('students'); setSearchQuery(''); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${
              activeMenu === 'students'
                ? 'bg-[#FF7A00] text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users size={18} />
            Manage Students
          </button>
          
          <button
            onClick={() => { setActiveMenu('lecturers'); setSearchQuery(''); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${
              activeMenu === 'lecturers'
                ? 'bg-[#FF7A00] text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Briefcase size={18} />
            Manage Lecturers
          </button>
          
          <button
            onClick={() => { setActiveMenu('courses'); setSearchQuery(''); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${
              activeMenu === 'courses'
                ? 'bg-[#FF7A00] text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen size={18} />
            Manage Courses
          </button>
          
          <button
            onClick={() => { setActiveMenu('reports'); setSearchQuery(''); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${
              activeMenu === 'reports'
                ? 'bg-[#FF7A00] text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar size={18} />
            Generate Reports
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-red-900/40 text-red-400 hover:text-red-200 border border-slate-700 hover:border-red-800/40 rounded-xl text-sm font-bold tracking-tight transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        
        {/* Header toolbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-orange-50 text-[#FF7A00] rounded-lg">
              <Shield size={18} />
            </span>
            <h2 className="text-lg font-black text-gray-900 tracking-tight capitalize">
              {activeMenu === 'overview' ? 'OpenLabs Registrar Console' : `${activeMenu} registries`}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 font-medium font-mono">UTC Session: {new Date().toLocaleDateString()}</span>
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
          </div>
        </header>

        {/* Dynamic Inner Panels */}
        <div className="p-6 flex-1 space-y-6">

          {/* 1. OVERVIEW DASHBOARD */}
          {activeMenu === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Quick statistics cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                  <div className="p-3 bg-orange-50 text-[#FF7A00] rounded-xl group-hover:scale-110 transition-all">
                    <Users size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Students</p>
                    <p className="text-2xl font-black text-gray-950 mt-0.5">{stats.totalStudents}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                  <div className="p-3 bg-orange-50 text-[#FF7A00] rounded-xl group-hover:scale-110 transition-all">
                    <Briefcase size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Lecturers</p>
                    <p className="text-2xl font-black text-gray-950 mt-0.5">{stats.totalLecturers}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                  <div className="p-3 bg-orange-50 text-[#FF7A00] rounded-xl group-hover:scale-110 transition-all">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Courses</p>
                    <p className="text-2xl font-black text-gray-950 mt-0.5">{stats.totalCourses}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                  <div className="p-3 bg-orange-50 text-[#FF7A00] rounded-xl group-hover:scale-110 transition-all">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Att. Percentage</p>
                    <p className="text-2xl font-black text-gray-950 mt-0.5">{stats.attendancePercentage}%</p>
                  </div>
                </div>
              </div>

              {/* Graphical Trend and Recent logs Grid */}
              <div className="grid lg:grid-cols-12 gap-6">
                
                {/* Custom SVG Attendance Trend Chart */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 lg:col-span-7 shadow-sm">
                  <h3 className="text-base font-bold text-gray-900 mb-5 tracking-tight flex items-center gap-2">
                    <TrendingUp size={18} className="text-[#FF7A00]" />
                    Attendance Trends (Past 7 Sessions)
                  </h3>
                  
                  {/* Custom SVG Bar Graph */}
                  <div className="h-64 flex items-end justify-between gap-2 pt-6 pb-2 px-4 relative">
                    {/* Horizontal Reference lines */}
                    <div className="absolute inset-x-0 bottom-[10%] border-t border-gray-100 pointer-events-none"></div>
                    <div className="absolute inset-x-0 bottom-[40%] border-t border-gray-100 pointer-events-none"></div>
                    <div className="absolute inset-x-0 bottom-[70%] border-t border-gray-100 pointer-events-none"></div>
                    <div className="absolute inset-x-0 bottom-[95%] border-t border-gray-100 pointer-events-none"></div>

                    {chartData.map((d, index) => {
                      const presentHeight = (d.present / maxChartValue) * 100;
                      const lateHeight = (d.late / maxChartValue) * 100;
                      
                      return (
                        <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end group/bar relative">
                          {/* Bars Stack */}
                          <div className="w-8 flex flex-col justify-end h-full relative z-10 select-none">
                            <div 
                              className="bg-[#FF7A00] w-full rounded-t-sm" 
                              style={{ height: `${presentHeight}%` }}
                              title={`Present: ${d.present}`}
                            />
                            <div 
                              className="bg-amber-400 w-full rounded-t-sm" 
                              style={{ height: `${lateHeight}%` }}
                              title={`Late: ${d.late}`}
                            />
                          </div>

                          <span className="text-[10px] text-gray-400 font-semibold mt-2 tracking-wider">{d.date}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chart Legend */}
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-center gap-6 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <span className="w-2.5 h-2.5 bg-[#FF7A00] rounded-sm"></span>
                      Present (On-Time)
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm"></span>
                      Late Scans
                    </span>
                  </div>
                </div>

                {/* Recent Activities Panel */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 lg:col-span-5 shadow-sm flex flex-col h-[352px]">
                  <h3 className="text-base font-bold text-gray-900 mb-4 tracking-tight flex items-center gap-2">
                    <Calendar size={18} className="text-[#FF7A00]" />
                    Recent Live Scans
                  </h3>
                  
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                    {stats.recentAttendance && stats.recentAttendance.length > 0 ? (
                      stats.recentAttendance.map((att: any) => (
                        <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100 text-xs hover:border-orange-200 transition-all">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-gray-900">{att.studentName}</span>
                            <span className="text-[10px] font-mono text-gray-400 tracking-wider">
                              {att.studentOLId} | {att.courseCode}
                            </span>
                          </div>
                          
                          <div className="text-right flex flex-col items-end gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                              att.status === 'present' ? 'bg-green-100 text-green-800' :
                              att.status === 'late' ? 'bg-amber-100 text-amber-800' :
                              att.status === 'absent' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {att.status}
                            </span>
                            <span className="text-[9px] font-mono text-gray-400 font-medium">{att.date} {att.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-4">
                        <Calendar size={32} className="text-gray-300 mb-2" />
                        <span className="text-xs font-semibold">No attendance log events recorded.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. MANAGE STUDENTS */}
          {activeMenu === 'students' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by student name, ID, or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none transition-all placeholder:text-gray-400 text-gray-950"
                  />
                </div>
                
                <button
                  onClick={() => {
                    setEditingStudent(null);
                    setStudentForm({ name: '', email: '', department: '', phone: '', studentId: '', registeredCourses: [] });
                    setShowStudentModal(true);
                  }}
                  id="add-student-btn"
                  className="bg-[#FF7A00] hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-orange-500/10 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Enroll New Student
                </button>
              </div>

              {/* Table Data View */}
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase text-gray-500 tracking-wider">
                      <th className="p-4">Student ID</th>
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Phone / Contact</th>
                      <th className="p-4">Enrollments</th>
                      <th className="p-4">Att. Rate</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(s => {
                        const stats = s.attendanceStats;
                        const presentRate = stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 100;
                        
                        return (
                          <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 font-mono font-bold text-gray-700 text-xs">{s.studentId}</td>
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900">{s.name}</span>
                                <span className="text-xs text-gray-400">{s.email}</span>
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-gray-600">{s.department}</td>
                            <td className="p-4 text-xs font-medium text-gray-500">{s.phone || 'N/A'}</td>
                            <td className="p-4">
                              <span className="bg-orange-50 text-[#FF7A00] px-2 py-1 rounded-md text-[10px] font-extrabold">
                                {s.registeredCourses?.length || 0} Course(s)
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-xs ${presentRate < 75 ? 'text-red-500' : 'text-green-600'}`}>
                                  {presentRate}%
                                </span>
                                <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${presentRate < 75 ? 'bg-red-500' : 'bg-green-500'}`} 
                                    style={{ width: `${presentRate}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditStudent(s)}
                                  className="p-1.5 hover:bg-orange-50 text-gray-400 hover:text-[#FF7A00] rounded-lg transition-colors"
                                  title="Edit student"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(s.id)}
                                  className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                                  title="Remove student"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400">
                          No students found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. MANAGE LECTURERS */}
          {activeMenu === 'lecturers' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search lecturers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none transition-all placeholder:text-gray-400 text-gray-950"
                  />
                </div>
                
                <button
                  onClick={() => {
                    setEditingLecturer(null);
                    setLecturerForm({ name: '', email: '', department: '', phone: '', assignedCourses: [] });
                    setShowLecturerModal(true);
                  }}
                  id="add-lecturer-btn"
                  className="bg-[#FF7A00] hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-orange-500/10 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add New Lecturer
                </button>
              </div>

              {/* Table Data View */}
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase text-gray-500 tracking-wider">
                      <th className="p-4">Lecturer Name</th>
                      <th className="p-4">Academic Email</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Contact Phone</th>
                      <th className="p-4">Assigned Courses</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {filteredLecturers.length > 0 ? (
                      filteredLecturers.map(l => (
                        <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-950">{l.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-650">{l.email}</td>
                          <td className="p-4 font-semibold text-gray-600">{l.department}</td>
                          <td className="p-4 text-xs font-mono font-medium text-gray-500">{l.phone || 'N/A'}</td>
                          <td className="p-4">
                            <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-[10px] font-bold">
                              {l.assignedCourses?.length || 0} course(s)
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditLecturer(l)}
                                className="p-1.5 hover:bg-orange-50 text-gray-400 hover:text-[#FF7A00] rounded-lg transition-colors"
                                title="Edit profile"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteLecturer(l.id)}
                                className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                                title="Delete lecturer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">
                          No lecturers match search parameters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. MANAGE COURSES */}
          {activeMenu === 'courses' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none transition-all placeholder:text-gray-400 text-gray-950"
                  />
                </div>
                
                <button
                  onClick={() => {
                    setEditingCourse(null);
                    setCourseForm({ code: '', title: '', description: '', creditHours: 3, department: '', lecturerId: 'unassigned' });
                    setShowCourseModal(true);
                  }}
                  id="add-course-btn"
                  className="bg-[#FF7A00] hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-orange-500/10 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Index New Course
                </button>
              </div>

              {/* Table Data View */}
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase text-gray-500 tracking-wider">
                      <th className="p-4">Code</th>
                      <th className="p-4">Course Title</th>
                      <th className="p-4">Credits</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Assigned Instructor</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map(c => {
                        const assignedLec = lecturers.find(l => l.id === c.lecturerId);
                        
                        return (
                          <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 font-mono font-bold text-[#FF7A00] text-xs">{c.code}</td>
                            <td className="p-4">
                              <div className="flex flex-col max-w-sm">
                                <span className="font-bold text-gray-950 leading-snug">{c.title}</span>
                                <span className="text-xs text-gray-400 line-clamp-1">{c.description || 'No description listed.'}</span>
                              </div>
                            </td>
                            <td className="p-4 font-bold text-xs">{c.creditHours} Hrs</td>
                            <td className="p-4 font-medium text-gray-550">{c.department}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                                c.lecturerId === 'unassigned' 
                                  ? 'bg-red-50 text-red-700 border border-red-100' 
                                  : 'bg-green-50 text-green-700 border border-green-100'
                              }`}>
                                {assignedLec ? assignedLec.name : 'Unassigned'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditCourse(c)}
                                  className="p-1.5 hover:bg-orange-50 text-gray-400 hover:text-[#FF7A00] rounded-lg transition-colors"
                                  title="Edit course info"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCourse(c.id)}
                                  className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                                  title="Delete course"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">
                          No academic courses match query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. GENERATE REPORTS */}
          {activeMenu === 'reports' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              
              {/* Reports Filter Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 print:hidden">
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wide mb-1">Filter Course</label>
                  <select
                    value={reportFilterCourse}
                    onChange={(e) => setReportFilterCourse(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="all">All Registered Courses</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wide mb-1">Filter Status</label>
                  <select
                    value={reportFilterStatus}
                    onChange={(e) => setReportFilterStatus(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="all">All Check-In Statuses</option>
                    <option value="present">Present (On-Time)</option>
                    <option value="late">Late Scans</option>
                    <option value="absent">Marked Absent</option>
                    <option value="excused">Excused Absences</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wide mb-1">Filter Date</label>
                  <input
                    type="date"
                    value={reportFilterDate}
                    onChange={(e) => setReportFilterDate(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handlePrintReport}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#FF7A00] hover:bg-orange-600 font-bold text-white text-xs rounded-xl shadow-lg shadow-orange-500/10 transition-all cursor-pointer"
                  >
                    <Download size={14} />
                    Download / Print PDF
                  </button>
                </div>
              </div>

              {/* Printable Area Header wrapper */}
              <div className="space-y-4">
                <div className="hidden print:flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
                  <OpenLabsLogo className="h-8" variant="light" />
                  <div className="text-right text-[10px] text-gray-400">
                    <p className="font-bold text-gray-800">Attendance Report Log</p>
                    <p>Printed on: {new Date().toLocaleString()}</p>
                    <p>Scope: {reportFilterCourse === 'all' ? 'All Classes' : courses.find(c => c.id === reportFilterCourse)?.title}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between print:hidden">
                  <h4 className="text-sm font-black text-gray-950 uppercase tracking-wide">
                    Live Attendance Registry Records ({filteredAttendance.length})
                  </h4>
                </div>

                {/* Report Table View */}
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase text-gray-500 tracking-wider">
                        <th className="p-4">Student ID</th>
                        <th className="p-4">Student Name</th>
                        <th className="p-4">Course</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Marked By</th>
                        <th className="p-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs">
                      {filteredAttendance.length > 0 ? (
                        filteredAttendance.map(att => (
                          <tr key={att.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 font-mono font-bold text-gray-600">{att.studentOLId}</td>
                            <td className="p-4 font-bold text-gray-900">{att.studentName}</td>
                            <td className="p-4 font-semibold text-gray-650">
                              <span className="text-[#FF7A00] mr-1.5">{att.courseCode}</span>
                              {att.courseTitle}
                            </td>
                            <td className="p-4 font-medium text-gray-600">{att.date}</td>
                            <td className="p-4 font-mono text-gray-500">{att.time || '--:--:--'}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                                att.status === 'present' ? 'bg-green-100 text-green-800' :
                                att.status === 'late' ? 'bg-amber-100 text-amber-800' :
                                att.status === 'absent' ? 'bg-red-100 text-red-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {att.status}
                              </span>
                            </td>
                            <td className="p-4 font-semibold text-[10px] text-gray-500 uppercase">{att.markedBy}</td>
                            <td className="p-4 italic text-gray-400">{att.notes || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-gray-400">
                            No attendance records match active filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ---------------- MODALS LAYER ---------------- */}

      {/* A. STUDENT MODAL */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowStudentModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-4">
              {editingStudent ? 'Edit Student Details' : 'Enroll New Student'}
            </h3>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Student Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abena Boateng"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none text-gray-950"
                />
              </div>

              {!editingStudent && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email (Academic login)</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. abena@openlabs.edu.gh"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none text-gray-950"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Student ID Code</label>
                  <input
                    type="text"
                    placeholder="OL-2026-###"
                    value={studentForm.studentId}
                    onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none text-gray-950 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+233..."
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none text-gray-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                <select
                  value={studentForm.department}
                  onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none text-gray-950 bg-white"
                >
                  <option value="">Choose department</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Network Engineering">Network Engineering</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Multimedia & Design">Multimedia & Design</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Registered Course Enrolments</label>
                <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-xl p-3 space-y-2">
                  {courses.map(c => {
                    const checked = studentForm.registeredCourses.includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked 
                              ? studentForm.registeredCourses.filter(cid => cid !== c.id)
                              : [...studentForm.registeredCourses, c.id];
                            setStudentForm({ ...studentForm, registeredCourses: next });
                          }}
                          className="rounded text-orange-500 focus:ring-orange-500"
                        />
                        <span><span className="text-[#FF7A00] font-mono mr-1">{c.code}</span>{c.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                id="submit-student-modal"
                className="w-full py-3 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/10 transition-all flex items-center justify-center gap-1"
              >
                Save Student Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* B. LECTURER MODAL */}
      {showLecturerModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowLecturerModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-4">
              {editingLecturer ? 'Edit Lecturer Details' : 'Register New Lecturer'}
            </h3>

            <form onSubmit={handleSaveLecturer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Instructor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Kojo Boateng"
                  value={lecturerForm.name}
                  onChange={(e) => setLecturerForm({ ...lecturerForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none text-gray-950"
                />
              </div>

              {!editingLecturer && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. lecturer@openlabs.edu.gh"
                    value={lecturerForm.email}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none text-gray-950"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Instructor Phone</label>
                  <input
                    type="tel"
                    placeholder="+233..."
                    value={lecturerForm.phone}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none text-gray-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department Assigned</label>
                  <select
                    value={lecturerForm.department}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none text-gray-950 bg-white"
                  >
                    <option value="">Select dept</option>
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
                id="submit-lecturer-modal"
                className="w-full py-3 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/10 transition-all"
              >
                Save Lecturer Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* C. COURSE MODAL */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowCourseModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-4">
              {editingCourse ? 'Revise Course Curriculum' : 'Index New Course'}
            </h3>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    placeholder="OL-SD304"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none text-gray-950 font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Advanced React Development"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none text-gray-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Credit Hours</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={6}
                    value={courseForm.creditHours}
                    onChange={(e) => setCourseForm({ ...courseForm, creditHours: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none text-gray-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                  <select
                    value={courseForm.department}
                    onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none text-gray-950 bg-white"
                  >
                    <option value="">Select dept</option>
                    <option value="Software Development">Software Development</option>
                    <option value="Network Engineering">Network Engineering</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Multimedia & Design">Multimedia & Design</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Assign Lecturer / Instructor</label>
                <select
                  value={courseForm.lecturerId}
                  onChange={(e) => setCourseForm({ ...courseForm, lecturerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none text-gray-950 bg-white"
                >
                  <option value="unassigned">Keep Unassigned</option>
                  {lecturers.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Course Description</label>
                <textarea
                  placeholder="Describe the topics covered and final projects..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none text-gray-950 h-24 resize-none"
                />
              </div>

              <button
                type="submit"
                id="submit-course-modal"
                className="w-full py-3 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/10 transition-all"
              >
                Save Course Curriculum
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
