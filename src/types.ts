export interface User {
  id: string;
  email: string;
  password?: string; // Optional so we don't send to frontend unnecessarily
  name: string;
  role: 'admin' | 'lecturer' | 'student';
  profileImage?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Student {
  id: string; // Internal internal DB ID
  userId: string; // Ref to User.id
  studentId: string; // e.g. OL-2026-004
  name: string;
  email: string;
  department: string;
  phone: string;
  registeredCourses: string[]; // Course IDs
  attendanceStats: {
    total: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
  };
}

export interface Lecturer {
  id: string;
  userId: string;
  name: string;
  email: string;
  department: string;
  phone: string;
  assignedCourses: string[]; // Course IDs
}

export interface Course {
  id: string;
  code: string; // e.g., OL-SD304
  title: string;
  description: string;
  creditHours: number;
  department: string;
  lecturerId: string; // Ref to Lecturer.id or "unassigned"
}

export interface QRSession {
  id: string;
  courseId: string;
  lecturerId: string;
  code: string; // The session unique code
  expirationMinutes: number;
  createdAt: string; // ISO date
  expiresAt: string; // ISO date
  active: boolean;
}

export interface Attendance {
  id: string;
  studentId: string; // Ref to Student.id
  studentName: string;
  studentOLId: string; // Ref OL studentId
  courseId: string;
  courseCode: string;
  courseTitle: string;
  lecturerId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  status: 'present' | 'late' | 'absent' | 'excused';
  markedBy: 'qr' | 'lecturer' | 'admin';
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalLecturers: number;
  totalCourses: number;
  attendanceToday: number;
  attendancePercentage: number;
  recentAttendance: Attendance[];
}
