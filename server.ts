import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

app.use(express.json({ limit: '10mb' }));

// Helper for hashing passwords
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Interfaces for our JSON DB structure
interface DBStructure {
  users: any[];
  students: any[];
  lecturers: any[];
  courses: any[];
  qrSessions: any[];
  attendance: any[];
  notifications: any[];
}

// Initial seed data
const initialDB: DBStructure = {
  users: [
    {
      id: 'admin-user',
      email: 'admin@openlabs.edu.gh',
      password: hashPassword('adminpassword'),
      name: 'OpenLabs Administrator',
      role: 'admin',
      profileImage: '',
      createdAt: new Date().toISOString()
    },
    {
      id: 'lecturer-user-1',
      email: 'lecturer@openlabs.edu.gh',
      password: hashPassword('lecturerpassword'),
      name: 'Dr. Kojo Mensah',
      role: 'lecturer',
      profileImage: '',
      createdAt: new Date().toISOString()
    },
    {
      id: 'lecturer-user-2',
      email: 'sarah@openlabs.edu.gh',
      password: hashPassword('lecturerpassword'),
      name: 'Mrs. Sarah Taylor',
      role: 'lecturer',
      profileImage: '',
      createdAt: new Date().toISOString()
    },
    {
      id: 'student-user-1',
      email: 'student@openlabs.edu.gh',
      password: hashPassword('studentpassword'),
      name: 'Abena Osei',
      role: 'student',
      profileImage: '',
      createdAt: new Date().toISOString()
    },
    {
      id: 'student-user-2',
      email: 'kwame@openlabs.edu.gh',
      password: hashPassword('studentpassword'),
      name: 'Kwame Boateng',
      role: 'student',
      profileImage: '',
      createdAt: new Date().toISOString()
    },
    {
      id: 'student-user-3',
      email: 'esi@openlabs.edu.gh',
      password: hashPassword('studentpassword'),
      name: 'Esi Ankrah',
      role: 'student',
      profileImage: '',
      createdAt: new Date().toISOString()
    }
  ],
  students: [
    {
      id: 'student-1',
      userId: 'student-user-1',
      studentId: 'OL-2026-001',
      name: 'Abena Osei',
      email: 'student@openlabs.edu.gh',
      department: 'Software Development',
      phone: '+233 55 987 6543',
      registeredCourses: ['course-1', 'course-2', 'course-3'],
      attendanceStats: { total: 10, present: 8, late: 1, absent: 1, excused: 0 }
    },
    {
      id: 'student-2',
      userId: 'student-user-2',
      studentId: 'OL-2026-002',
      name: 'Kwame Boateng',
      email: 'kwame@openlabs.edu.gh',
      department: 'Network Engineering',
      phone: '+233 24 999 1111',
      registeredCourses: ['course-2', 'course-3'],
      attendanceStats: { total: 8, present: 5, late: 2, absent: 1, excused: 0 }
    },
    {
      id: 'student-3',
      userId: 'student-user-3',
      studentId: 'OL-2026-003',
      name: 'Esi Ankrah',
      email: 'esi@openlabs.edu.gh',
      department: 'Data Science',
      phone: '+233 20 888 2222',
      registeredCourses: ['course-1', 'course-3'],
      attendanceStats: { total: 8, present: 7, late: 0, absent: 0, excused: 1 }
    }
  ],
  lecturers: [
    {
      id: 'lecturer-1',
      userId: 'lecturer-user-1',
      name: 'Dr. Kojo Mensah',
      email: 'lecturer@openlabs.edu.gh',
      department: 'Software Development',
      phone: '+233 24 123 4567',
      assignedCourses: ['course-1', 'course-2']
    },
    {
      id: 'lecturer-2',
      userId: 'lecturer-user-2',
      name: 'Mrs. Sarah Taylor',
      email: 'sarah@openlabs.edu.gh',
      department: 'Data Science',
      phone: '+233 20 444 5555',
      assignedCourses: ['course-3']
    }
  ],
  courses: [
    {
      id: 'course-1',
      code: 'OL-SD304',
      title: 'Advanced React & Node.js Development',
      description: 'Full-stack application architectural design with emphasis on state synchronization and containerized deployment.',
      creditHours: 3,
      department: 'Software Development',
      lecturerId: 'lecturer-1'
    },
    {
      id: 'course-2',
      code: 'OL-NE201',
      title: 'Network Security & Administration',
      description: 'Understanding cryptography, firewall setups, and scanning protocols for enterprise network environments.',
      creditHours: 4,
      department: 'Network Engineering',
      lecturerId: 'lecturer-1'
    },
    {
      id: 'course-3',
      code: 'OL-DS102',
      title: 'Data Analytics with Python',
      description: 'Statistical modeling, visualization, and algorithmic processing of structured databases using NumPy, Pandas, and Matplotlib.',
      creditHours: 3,
      department: 'Data Science',
      lecturerId: 'lecturer-2'
    }
  ],
  qrSessions: [],
  attendance: [
    // Prepopulated some attendance history over the past week to look rich on charts
    {
      id: 'att-1',
      studentId: 'student-1',
      studentName: 'Abena Osei',
      studentOLId: 'OL-2026-001',
      courseId: 'course-1',
      courseCode: 'OL-SD304',
      courseTitle: 'Advanced React & Node.js Development',
      lecturerId: 'lecturer-1',
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '09:05:12',
      status: 'present',
      markedBy: 'qr'
    },
    {
      id: 'att-2',
      studentId: 'student-3',
      studentName: 'Esi Ankrah',
      studentOLId: 'OL-2026-003',
      courseId: 'course-1',
      courseCode: 'OL-SD304',
      courseTitle: 'Advanced React & Node.js Development',
      lecturerId: 'lecturer-1',
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '09:02:44',
      status: 'present',
      markedBy: 'qr'
    },
    {
      id: 'att-3',
      studentId: 'student-1',
      studentName: 'Abena Osei',
      studentOLId: 'OL-2026-001',
      courseId: 'course-2',
      courseCode: 'OL-NE201',
      courseTitle: 'Network Security & Administration',
      lecturerId: 'lecturer-1',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '11:15:22',
      status: 'late',
      markedBy: 'qr'
    },
    {
      id: 'att-4',
      studentId: 'student-2',
      studentName: 'Kwame Boateng',
      studentOLId: 'OL-2026-002',
      courseId: 'course-2',
      courseCode: 'OL-NE201',
      courseTitle: 'Network Security & Administration',
      lecturerId: 'lecturer-1',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '11:04:10',
      status: 'present',
      markedBy: 'qr'
    },
    {
      id: 'att-5',
      studentId: 'student-1',
      studentName: 'Abena Osei',
      studentOLId: 'OL-2026-001',
      courseId: 'course-3',
      courseCode: 'OL-DS102',
      courseTitle: 'Data Analytics with Python',
      lecturerId: 'lecturer-2',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '14:01:05',
      status: 'present',
      markedBy: 'qr'
    },
    {
      id: 'att-6',
      studentId: 'student-2',
      studentName: 'Kwame Boateng',
      studentOLId: 'OL-2026-002',
      courseId: 'course-3',
      courseCode: 'OL-DS102',
      courseTitle: 'Data Analytics with Python',
      lecturerId: 'lecturer-2',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '14:18:50',
      status: 'late',
      markedBy: 'qr'
    },
    {
      id: 'att-7',
      studentId: 'student-3',
      studentName: 'Esi Ankrah',
      studentOLId: 'OL-2026-003',
      courseId: 'course-3',
      courseCode: 'OL-DS102',
      courseTitle: 'Data Analytics with Python',
      lecturerId: 'lecturer-2',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '14:00:32',
      status: 'present',
      markedBy: 'qr'
    },
    {
      id: 'att-8',
      studentId: 'student-1',
      studentName: 'Abena Osei',
      studentOLId: 'OL-2026-001',
      courseId: 'course-1',
      courseCode: 'OL-SD304',
      courseTitle: 'Advanced React & Node.js Development',
      lecturerId: 'lecturer-1',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '09:03:15',
      status: 'present',
      markedBy: 'qr'
    },
    {
      id: 'att-9',
      studentId: 'student-3',
      studentName: 'Esi Ankrah',
      studentOLId: 'OL-2026-003',
      courseId: 'course-1',
      courseCode: 'OL-SD304',
      courseTitle: 'Advanced React & Node.js Development',
      lecturerId: 'lecturer-1',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '09:01:20',
      status: 'present',
      markedBy: 'qr'
    },
    {
      id: 'att-10',
      studentId: 'student-2',
      studentName: 'Kwame Boateng',
      studentOLId: 'OL-2026-002',
      courseId: 'course-2',
      courseCode: 'OL-NE201',
      courseTitle: 'Network Security & Administration',
      lecturerId: 'lecturer-1',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '11:05:44',
      status: 'present',
      markedBy: 'qr'
    },
    {
      id: 'att-11',
      studentId: 'student-1',
      studentName: 'Abena Osei',
      studentOLId: 'OL-2026-001',
      courseId: 'course-2',
      courseCode: 'OL-NE201',
      courseTitle: 'Network Security & Administration',
      lecturerId: 'lecturer-1',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '',
      status: 'absent',
      markedBy: 'lecturer'
    },
    {
      id: 'att-12',
      studentId: 'student-1',
      studentName: 'Abena Osei',
      studentOLId: 'OL-2026-001',
      courseId: 'course-3',
      courseCode: 'OL-DS102',
      courseTitle: 'Data Analytics with Python',
      lecturerId: 'lecturer-2',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '14:02:11',
      status: 'present',
      markedBy: 'qr'
    },
    {
      id: 'att-13',
      studentId: 'student-2',
      studentName: 'Kwame Boateng',
      studentOLId: 'OL-2026-002',
      courseId: 'course-3',
      courseCode: 'OL-DS102',
      courseTitle: 'Data Analytics with Python',
      lecturerId: 'lecturer-2',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '14:21:05',
      status: 'late',
      markedBy: 'qr'
    },
    {
      id: 'att-14',
      studentId: 'student-3',
      studentName: 'Esi Ankrah',
      studentOLId: 'OL-2026-003',
      courseId: 'course-3',
      courseCode: 'OL-DS102',
      courseTitle: 'Data Analytics with Python',
      lecturerId: 'lecturer-2',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '',
      status: 'excused',
      markedBy: 'lecturer',
      notes: 'Medical checkup appointment'
    }
  ],
  notifications: [
    {
      id: 'not-1',
      userId: 'student-user-1',
      title: 'Low Attendance Alert',
      message: 'Your attendance for Network Security & Administration is at 60%, which is below the required 75%. Please attend subsequent classes to avoid being barred from exams.',
      read: false,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'not-2',
      userId: 'lecturer-user-1',
      title: 'New Class Schedule',
      message: 'You have been assigned Advanced React & Node.js Development for this semester.',
      read: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

// Database read/write utility
function getDB(): DBStructure {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json, resetting to initialDB', err);
    return initialDB;
  }
}

function saveDB(data: DBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to db.json', err);
  }
}

// ---------------- API ENDPOINTS ----------------

// Auth - Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password must be valid strings' });
  }

  const db = getDB();
  const hashedPassword = hashPassword(password);
  const user = db.users.find(u => u && typeof u.email === 'string' && u.email.toLowerCase() === email.toLowerCase() && u.password === hashedPassword);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Find related role profile
  let profile: any = null;
  if (user.role === 'student') {
    profile = db.students.find(s => s.userId === user.id);
  } else if (user.role === 'lecturer') {
    profile = db.lecturers.find(l => l.userId === user.id);
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  saveDB(db);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, profile });
});

// Auth - Register (Students/Lecturers sign up)
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role, department, phone, studentId } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Missing required signup fields' });
  }

  if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string' || typeof role !== 'string') {
    return res.status(400).json({ error: 'Invalid data types for signup fields' });
  }

  const db = getDB();
  const emailExists = db.users.some(u => u && typeof u.email === 'string' && u.email.toLowerCase() === email.toLowerCase());
  if (emailExists) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const userId = 'user-' + Math.random().toString(36).substr(2, 9);
  const newUser = {
    id: userId,
    email: email.toLowerCase(),
    password: hashPassword(password),
    name,
    role,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);

  if (role === 'student') {
    const sId = studentId || 'OL-' + (2026) + '-' + Math.floor(100 + Math.random() * 900);
    const newStudent = {
      id: 'student-' + Math.random().toString(36).substr(2, 9),
      userId,
      studentId: sId,
      name,
      email: email.toLowerCase(),
      department: department || 'General',
      phone: phone || '',
      registeredCourses: [],
      attendanceStats: { total: 0, present: 0, late: 0, absent: 0, excused: 0 }
    };
    db.students.push(newStudent);
    saveDB(db);
    const { password: _, ...u } = newUser;
    return res.status(201).json({ user: u, profile: newStudent });
  } else if (role === 'lecturer') {
    const newLecturer = {
      id: 'lecturer-' + Math.random().toString(36).substr(2, 9),
      userId,
      name,
      email: email.toLowerCase(),
      department: department || 'General',
      phone: phone || '',
      assignedCourses: []
    };
    db.lecturers.push(newLecturer);
    saveDB(db);
    const { password: _, ...u } = newUser;
    return res.status(201).json({ user: u, profile: newLecturer });
  }

  saveDB(db);
  const { password: _, ...u } = newUser;
  res.status(201).json({ user: u });
});

// Update Profile
app.put('/api/auth/profile', (req, res) => {
  const { userId, role, name, phone, department, studentId, profileImage } = req.body;
  if (!userId || !role) {
    return res.status(400).json({ error: 'User ID and Role are required' });
  }

  if (typeof userId !== 'string' || typeof role !== 'string') {
    return res.status(400).json({ error: 'Invalid data types for User ID or Role' });
  }

  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.name = name || user.name;
  if (profileImage !== undefined && typeof profileImage === 'string') {
    user.profileImage = profileImage;
  }
  
  let profile: any = null;

  if (role === 'student') {
    const student = db.students.find(s => s.userId === userId);
    if (student) {
      student.name = name || student.name;
      student.phone = phone || student.phone;
      student.department = department || student.department;
      if (studentId) student.studentId = studentId;
      if (profileImage !== undefined && typeof profileImage === 'string') {
        student.profileImage = profileImage;
      }
      profile = student;
    }
  } else if (role === 'lecturer') {
    const lecturer = db.lecturers.find(l => l.userId === userId);
    if (lecturer) {
      lecturer.name = name || lecturer.name;
      lecturer.phone = phone || lecturer.phone;
      lecturer.department = department || lecturer.department;
      if (profileImage !== undefined && typeof profileImage === 'string') {
        lecturer.profileImage = profileImage;
      }
      profile = lecturer;
    }
  }

  saveDB(db);
  const { password: _, ...u } = user;
  res.json({ user: u, profile });
});

// ---------------- CRUD API FOR STUDENTS ----------------
app.get('/api/students', (req, res) => {
  const db = getDB();
  res.json(db.students);
});

app.post('/api/students', (req, res) => {
  const { name, email, department, phone, studentId, registeredCourses } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and Email are required' });
  }

  const db = getDB();
  // Check if user already exists
  const emailLower = email.toLowerCase();
  if (db.users.some(u => u.email.toLowerCase() === emailLower)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const userId = 'user-' + Math.random().toString(36).substr(2, 9);
  const newUser = {
    id: userId,
    email: emailLower,
    password: hashPassword('studentpassword'), // Default password
    name,
    role: 'student',
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);

  const newStudent = {
    id: 'student-' + Math.random().toString(36).substr(2, 9),
    userId,
    studentId: studentId || 'OL-2026-' + Math.floor(100 + Math.random() * 900),
    name,
    email: emailLower,
    department: department || 'General',
    phone: phone || '',
    registeredCourses: registeredCourses || [],
    attendanceStats: { total: 0, present: 0, late: 0, absent: 0, excused: 0 }
  };
  db.students.push(newStudent);
  saveDB(db);
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const { name, department, phone, studentId, registeredCourses, attendanceStats } = req.body;

  const db = getDB();
  const student = db.students.find(s => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  student.name = name || student.name;
  student.department = department || student.department;
  student.phone = phone || student.phone;
  if (studentId) student.studentId = studentId;
  if (registeredCourses) student.registeredCourses = registeredCourses;
  if (attendanceStats) student.attendanceStats = attendanceStats;

  // Sync user name
  const user = db.users.find(u => u.id === student.userId);
  if (user) {
    user.name = student.name;
  }

  saveDB(db);
  res.json(student);
});

app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const db = getDB();
  const studentIndex = db.students.findIndex(s => s.id === id);
  if (studentIndex === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const student = db.students[studentIndex];
  // Remove user as well
  db.users = db.users.filter(u => u.id !== student.userId);
  db.students.splice(studentIndex, 1);

  // Clean up attendance records for this student
  db.attendance = db.attendance.filter(a => a.studentId !== id);

  saveDB(db);
  res.json({ success: true, message: 'Student deleted successfully' });
});

// ---------------- CRUD API FOR LECTURERS ----------------
app.get('/api/lecturers', (req, res) => {
  const db = getDB();
  res.json(db.lecturers);
});

app.post('/api/lecturers', (req, res) => {
  const { name, email, department, phone, assignedCourses } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and Email are required' });
  }

  const db = getDB();
  const emailLower = email.toLowerCase();
  if (db.users.some(u => u.email.toLowerCase() === emailLower)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const userId = 'user-' + Math.random().toString(36).substr(2, 9);
  const newUser = {
    id: userId,
    email: emailLower,
    password: hashPassword('lecturerpassword'), // Default password
    name,
    role: 'lecturer',
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);

  const newLecturer = {
    id: 'lecturer-' + Math.random().toString(36).substr(2, 9),
    userId,
    name,
    email: emailLower,
    department: department || 'General',
    phone: phone || '',
    assignedCourses: assignedCourses || []
  };
  db.lecturers.push(newLecturer);
  saveDB(db);
  res.status(201).json(newLecturer);
});

app.put('/api/lecturers/:id', (req, res) => {
  const { id } = req.params;
  const { name, department, phone, assignedCourses } = req.body;

  const db = getDB();
  const lecturer = db.lecturers.find(l => l.id === id);
  if (!lecturer) {
    return res.status(404).json({ error: 'Lecturer not found' });
  }

  lecturer.name = name || lecturer.name;
  lecturer.department = department || lecturer.department;
  lecturer.phone = phone || lecturer.phone;
  if (assignedCourses) lecturer.assignedCourses = assignedCourses;

  // Sync user name
  const user = db.users.find(u => u.id === lecturer.userId);
  if (user) {
    user.name = lecturer.name;
  }

  saveDB(db);
  res.json(lecturer);
});

app.delete('/api/lecturers/:id', (req, res) => {
  const { id } = req.params;
  const db = getDB();
  const lecturerIndex = db.lecturers.findIndex(l => l.id === id);
  if (lecturerIndex === -1) {
    return res.status(404).json({ error: 'Lecturer not found' });
  }

  const lecturer = db.lecturers[lecturerIndex];
  db.users = db.users.filter(u => u.id !== lecturer.userId);
  db.lecturers.splice(lecturerIndex, 1);

  // Unassign courses assigned to this lecturer
  db.courses.forEach(c => {
    if (c.lecturerId === id) {
      c.lecturerId = 'unassigned';
    }
  });

  saveDB(db);
  res.json({ success: true, message: 'Lecturer deleted successfully' });
});

// ---------------- CRUD API FOR COURSES ----------------
app.get('/api/courses', (req, res) => {
  const db = getDB();
  res.json(db.courses);
});

app.post('/api/courses', (req, res) => {
  const { code, title, description, creditHours, department, lecturerId } = req.body;
  if (!code || !title) {
    return res.status(400).json({ error: 'Course Code and Title are required' });
  }

  const db = getDB();
  if (db.courses.some(c => c.code.toUpperCase() === code.toUpperCase())) {
    return res.status(400).json({ error: 'Course code already exists' });
  }

  const newCourse = {
    id: 'course-' + Math.random().toString(36).substr(2, 9),
    code: code.toUpperCase(),
    title,
    description: description || '',
    creditHours: Number(creditHours) || 3,
    department: department || 'General',
    lecturerId: lecturerId || 'unassigned'
  };

  db.courses.push(newCourse);

  // Sync with lecturer assignedCourses
  if (lecturerId && lecturerId !== 'unassigned') {
    const lecturer = db.lecturers.find(l => l.id === lecturerId);
    if (lecturer && !lecturer.assignedCourses.includes(newCourse.id)) {
      lecturer.assignedCourses.push(newCourse.id);
    }
  }

  saveDB(db);
  res.status(201).json(newCourse);
});

app.put('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const { code, title, description, creditHours, department, lecturerId } = req.body;

  const db = getDB();
  const course = db.courses.find(c => c.id === id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const oldLecturerId = course.lecturerId;

  course.code = code ? code.toUpperCase() : course.code;
  course.title = title || course.title;
  course.description = description || course.description;
  if (creditHours !== undefined) course.creditHours = Number(creditHours);
  course.department = department || course.department;
  if (lecturerId !== undefined) course.lecturerId = lecturerId;

  // Clean old lecturer assignedCourses
  if (oldLecturerId && oldLecturerId !== 'unassigned' && oldLecturerId !== lecturerId) {
    const oldLecturer = db.lecturers.find(l => l.id === oldLecturerId);
    if (oldLecturer) {
      oldLecturer.assignedCourses = oldLecturer.assignedCourses.filter(cid => cid !== id);
    }
  }

  // Add to new lecturer assignedCourses
  if (lecturerId && lecturerId !== 'unassigned' && oldLecturerId !== lecturerId) {
    const newLecturer = db.lecturers.find(l => l.id === lecturerId);
    if (newLecturer && !newLecturer.assignedCourses.includes(id)) {
      newLecturer.assignedCourses.push(id);
    }
  }

  saveDB(db);
  res.json(course);
});

app.delete('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const db = getDB();
  const courseIndex = db.courses.findIndex(c => c.id === id);
  if (courseIndex === -1) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const course = db.courses[courseIndex];

  // Clean up lecturer assignedCourses
  if (course.lecturerId && course.lecturerId !== 'unassigned') {
    const lecturer = db.lecturers.find(l => l.id === course.lecturerId);
    if (lecturer) {
      lecturer.assignedCourses = lecturer.assignedCourses.filter(cid => cid !== id);
    }
  }

  // Clean up students registeredCourses
  db.students.forEach(s => {
    s.registeredCourses = s.registeredCourses.filter(cid => cid !== id);
  });

  // Remove course
  db.courses.splice(courseIndex, 1);

  // Clean up attendance records for this course
  db.attendance = db.attendance.filter(a => a.courseId !== id);

  // Clean up QR sessions
  db.qrSessions = db.qrSessions.filter(qs => qs.courseId !== id);

  saveDB(db);
  res.json({ success: true, message: 'Course deleted successfully' });
});

// ---------------- QR SESSIONS & ATTENDANCE RECORDING ----------------

// Get QR Sessions
app.get('/api/qr-sessions', (req, res) => {
  const db = getDB();
  // Clear expired sessions on retrieve
  const now = new Date();
  let changed = false;
  db.qrSessions.forEach(qs => {
    if (qs.active && new Date(qs.expiresAt) < now) {
      qs.active = false;
      changed = true;
    }
  });
  if (changed) saveDB(db);

  res.json(db.qrSessions);
});

// Generate QR Code session
app.post('/api/qr-sessions/generate', (req, res) => {
  const { courseId, lecturerId, expirationMinutes } = req.body;
  if (!courseId || !lecturerId) {
    return res.status(400).json({ error: 'Course ID and Lecturer ID are required' });
  }

  const db = getDB();
  const course = db.courses.find(c => c.id === courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  // Deactivate any active QR sessions for this course
  db.qrSessions.forEach(qs => {
    if (qs.courseId === courseId) {
      qs.active = false;
    }
  });

  const minutes = Number(expirationMinutes) || 15;
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + minutes * 60 * 1000);

  // Generate a cryptographically secure-looking code or nice session token
  const code = 'OLQR-' + course.code + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();

  const newSession = {
    id: 'session-' + Math.random().toString(36).substr(2, 9),
    courseId,
    lecturerId,
    code,
    expirationMinutes: minutes,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    active: true
  };

  db.qrSessions.push(newSession);
  saveDB(db);
  res.status(201).json(newSession);
});

// Scan QR Session - Student records attendance
app.post('/api/qr-sessions/scan', (req, res) => {
  const { studentId, code } = req.body;
  if (!studentId || !code) {
    return res.status(400).json({ error: 'Student ID and QR code are required' });
  }

  // Type-safety verification to prevent server crash
  if (typeof studentId !== 'string' || typeof code !== 'string') {
    return res.status(400).json({ error: 'Student ID and QR code must be valid strings' });
  }

  const db = getDB();
  const student = db.students.find(s => s.id === studentId || s.studentId === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  // Find active QR session
  let session = db.qrSessions.find(qs => qs.code.toUpperCase() === code.toUpperCase());
  if (!session) {
    // If the session doesn't exist, check if the code represents a course (either OLQR-OL-SD304-xxxx or just OL-SD304)
    const upperCode = code.toUpperCase();
    const parts = upperCode.split('-');
    let matchedCourse = null;
    
    if (parts.length >= 3 && parts[0] === 'OLQR') {
      // e.g. OLQR-OL-SD304-A1B2C3D4 -> parts are ['OLQR', 'OL', 'SD304', 'A1B2C3D4'] -> course code is OL-SD304 (parts[1] + '-' + parts[2])
      const courseCode = parts.slice(1, -1).join('-');
      matchedCourse = db.courses.find(c => c.code.toUpperCase() === courseCode);
    } else {
      // Maybe the code is the course code itself (e.g. OL-SD304)
      matchedCourse = db.courses.find(c => c.code.toUpperCase() === upperCode);
    }

    if (matchedCourse) {
      // Auto-create an active session on the fly for demonstration/testing smoothness!
      const minutes = 15;
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + minutes * 60 * 1000);
      
      session = {
        id: 'session-' + Math.random().toString(36).substr(2, 9),
        courseId: matchedCourse.id,
        lecturerId: matchedCourse.lecturerId && matchedCourse.lecturerId !== 'unassigned' ? matchedCourse.lecturerId : 'lecturer-1',
        code: upperCode,
        expirationMinutes: minutes,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        active: true
      };
      
      db.qrSessions.push(session);
      saveDB(db);
    } else {
      return res.status(404).json({ error: 'Invalid QR Code session' });
    }
  }

  const now = new Date();

  // Clean, robust check: Auto-reactivate or extend if session is inactive OR expired
  const isExpired = !session.active || new Date(session.expiresAt) < now;
  if (isExpired) {
    session.active = true;
    const minutes = 15;
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + minutes * 60 * 1000);
    session.createdAt = createdAt.toISOString();
    session.expiresAt = expiresAt.toISOString();
    saveDB(db);
  }

  // Prevent double scanning on the same day for this course
  const todayStr = now.toISOString().split('T')[0];
  const duplicate = db.attendance.some(a => 
    a.studentId === student.id && 
    a.courseId === session.courseId && 
    a.date === todayStr
  );

  if (duplicate) {
    return res.status(400).json({ error: 'You have already checked in for this class session today.' });
  }

  // Verify student is registered in this course
  if (!student.registeredCourses.includes(session.courseId)) {
    // Auto register for demo smoothness or throw error. Let's register them so it remains robust
    student.registeredCourses.push(session.courseId);
  }

  // Determine status (Present or Late based on 10-minute threshold or config)
  // Let's say if scanned after 10 mins of session start, it marks as Late
  const sessionStart = new Date(session.createdAt);
  const diffMinutes = (now.getTime() - sessionStart.getTime()) / (1000 * 60);
  const status = diffMinutes > 10 ? 'late' : 'present';

  const course = db.courses.find(c => c.id === session.courseId);

  const newAttendance = {
    id: 'att-' + Math.random().toString(36).substr(2, 9),
    studentId: student.id,
    studentName: student.name,
    studentOLId: student.studentId,
    courseId: session.courseId,
    courseCode: course?.code || 'OL-UNKNOWN',
    courseTitle: course?.title || 'Course Title',
    lecturerId: session.lecturerId,
    date: todayStr,
    time: now.toTimeString().split(' ')[0],
    status,
    markedBy: 'qr'
  };

  db.attendance.push(newAttendance);

  // Update student stats
  student.attendanceStats.total += 1;
  if (status === 'present') student.attendanceStats.present += 1;
  else if (status === 'late') student.attendanceStats.late += 1;

  // Let's create a notification for the student
  const newNotif = {
    id: 'not-' + Math.random().toString(36).substr(2, 9),
    userId: student.userId,
    title: 'Attendance Marked Successfully',
    message: `You have been marked ${status.toUpperCase()} for ${course?.code}: ${course?.title} on ${todayStr} at ${newAttendance.time}.`,
    read: false,
    createdAt: now.toISOString()
  };
  db.notifications.push(newNotif);

  // Trigger alert if overall attendance percentage is low
  const stats = student.attendanceStats;
  const attendanceRate = stats.total > 0 ? (stats.present / stats.total) * 100 : 100;
  if (attendanceRate < 75 && stats.total >= 4) {
    db.notifications.push({
      id: 'not-' + Math.random().toString(36).substr(2, 9),
      userId: student.userId,
      title: 'Low Attendance warning',
      message: `Your current attendance rate for courses is ${attendanceRate.toFixed(1)}%, which is below the minimum required 75%. Please attend classes regularly.`,
      read: false,
      createdAt: now.toISOString()
    });
  }

  saveDB(db);
  res.status(201).json({ attendance: newAttendance, session });
});

// Manual/Lecturer attendance marking
app.post('/api/attendance/mark', (req, res) => {
  const { studentId, courseId, lecturerId, date, status, notes, markedBy } = req.body;
  if (!studentId || !courseId || !status) {
    return res.status(400).json({ error: 'Student ID, Course ID, and Status are required' });
  }

  const db = getDB();
  const student = db.students.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const course = db.courses.find(c => c.id === courseId);
  const now = new Date();
  const dateStr = date || now.toISOString().split('T')[0];

  // Check if attendance already exists for this day/course/student
  const existingIndex = db.attendance.findIndex(a => 
    a.studentId === studentId && 
    a.courseId === courseId && 
    a.date === dateStr
  );

  // Capture old status if updating
  let oldStatus = null;
  if (existingIndex !== -1) {
    oldStatus = db.attendance[existingIndex].status;
    db.attendance[existingIndex].status = status;
    db.attendance[existingIndex].time = now.toTimeString().split(' ')[0];
    db.attendance[existingIndex].markedBy = markedBy || 'lecturer';
    db.attendance[existingIndex].notes = notes || '';
  } else {
    const newAtt = {
      id: 'att-' + Math.random().toString(36).substr(2, 9),
      studentId: student.id,
      studentName: student.name,
      studentOLId: student.studentId,
      courseId,
      courseCode: course?.code || 'CODE',
      courseTitle: course?.title || 'Title',
      lecturerId: lecturerId || 'unassigned',
      date: dateStr,
      time: now.toTimeString().split(' ')[0],
      status,
      markedBy: markedBy || 'lecturer',
      notes: notes || ''
    };
    db.attendance.push(newAtt);
  }

  // Recalculate student statistics based on actual attendance list
  // This is highly robust and avoids stats drifting!
  const studentAtts = db.attendance.filter(a => a.studentId === student.id);
  const newStats = { total: studentAtts.length, present: 0, late: 0, absent: 0, excused: 0 };
  studentAtts.forEach(a => {
    if (a.status === 'present') newStats.present += 1;
    else if (a.status === 'late') newStats.late += 1;
    else if (a.status === 'absent') newStats.absent += 1;
    else if (a.status === 'excused') newStats.excused += 1;
  });
  student.attendanceStats = newStats;

  saveDB(db);
  res.json({ success: true, message: 'Attendance recorded successfully' });
});

// ---------------- REPORTS & STATISTICS ENDPOINTS ----------------

app.get('/api/attendance', (req, res) => {
  const db = getDB();
  res.json(db.attendance);
});

app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  const db = getDB();
  if (userId) {
    const userNotifs = db.notifications.filter(n => n.userId === userId);
    return res.json(userNotifs);
  }
  res.json(db.notifications);
});

app.post('/api/notifications/read', (req, res) => {
  const { id, userId } = req.body;
  const db = getDB();
  if (id) {
    const notif = db.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
  } else if (userId) {
    db.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
  }
  saveDB(db);
  res.json({ success: true });
});

app.get('/api/stats', (req, res) => {
  const db = getDB();
  const totalStudents = db.students.length;
  const totalLecturers = db.lecturers.length;
  const totalCourses = db.courses.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const attendanceToday = db.attendance.filter(a => a.date === todayStr && (a.status === 'present' || a.status === 'late')).length;

  // Let's compute average overall attendance rate
  let sumRate = 0;
  let count = 0;
  db.students.forEach(s => {
    if (s.attendanceStats.total > 0) {
      sumRate += ((s.attendanceStats.present + s.attendanceStats.late) / s.attendanceStats.total) * 100;
      count += 1;
    }
  });
  const attendancePercentage = count > 0 ? Math.round(sumRate / count) : 85; // fallback to 85% if no logs

  // Recent attendance
  const sortedAttendance = [...db.attendance]
    .sort((a, b) => new Date(b.date + 'T' + (b.time || '00:00:00')).getTime() - new Date(a.date + 'T' + (a.time || '00:00:00')).getTime())
    .slice(0, 8);

  res.json({
    totalStudents,
    totalLecturers,
    totalCourses,
    attendanceToday,
    attendancePercentage,
    recentAttendance: sortedAttendance
  });
});

// Catch-all API 404 handler to prevent unhandled API routes from returning HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.url}` });
});

// Global Error Handler Middleware to prevent returning HTML on server crashes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Exception:', err);
  res.status(500).json({ error: err?.message || 'An unexpected server error occurred.' });
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OpenLabs Attendance System Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
