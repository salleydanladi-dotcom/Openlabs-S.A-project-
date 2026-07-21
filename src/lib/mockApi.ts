import { PRESET_AVATARS } from '../utils/avatars';

// Initial Mock Database representing db.json contents
const INITIAL_MOCK_DB = {
  "users": [
    {
      "id": "admin-user",
      "email": "admin@openlabs.edu.gh",
      "password": "749f09bade8aca755660eeb17792da880218d4fbdc4e25fbec279d7fe9f65d70", // sha256 of "adminpassword"
      "name": "OpenLabs Administrator",
      "role": "admin",
      "profileImage": "",
      "createdAt": "2026-07-21T01:12:33.631Z"
    },
    {
      "id": "lecturer-user-1",
      "email": "lecturer@openlabs.edu.gh",
      "password": "5318a3db2faef756667838ba6a39ec0ff9e6a6824a361e65e174bb0d214d43b9", // sha256 of "lecturerpassword"
      "name": "Dr. Kojo Mensah",
      "role": "lecturer",
      "profileImage": "",
      "createdAt": "2026-07-21T01:12:33.631Z"
    },
    {
      "id": "lecturer-user-2",
      "email": "sarah@openlabs.edu.gh",
      "password": "5318a3db2faef756667838ba6a39ec0ff9e6a6824a361e65e174bb0d214d43b9",
      "name": "Mrs. Sarah Taylor",
      "role": "lecturer",
      "profileImage": "",
      "createdAt": "2026-07-21T01:12:33.631Z"
    },
    {
      "id": "student-user-1",
      "email": "student@openlabs.edu.gh",
      "password": "68eaeeaef51a40035b5d3705c4e0ffd68036b6b821361765145f410b0f996e11", // sha256 of "studentpassword"
      "name": "Abena Osei",
      "role": "student",
      "profileImage": "",
      "createdAt": "2026-07-21T01:12:33.631Z"
    },
    {
      "id": "student-user-2",
      "email": "kwame@openlabs.edu.gh",
      "password": "68eaeeaef51a40035b5d3705c4e0ffd68036b6b821361765145f410b0f996e11",
      "name": "Kwame Boateng",
      "role": "student",
      "profileImage": "",
      "createdAt": "2026-07-21T01:12:33.632Z"
    },
    {
      "id": "student-user-3",
      "email": "esi@openlabs.edu.gh",
      "password": "68eaeeaef51a40035b5d3705c4e0ffd68036b6b821361765145f410b0f996e11",
      "name": "Esi Ankrah",
      "role": "student",
      "profileImage": "",
      "createdAt": "2026-07-21T01:12:33.632Z"
    }
  ],
  "students": [
    {
      "id": "student-1",
      "userId": "student-user-1",
      "studentId": "OL-2026-001",
      "name": "Abena Osei",
      "email": "student@openlabs.edu.gh",
      "department": "Software Development",
      "phone": "+233 55 987 6543",
      "registeredCourses": ["course-1", "course-2", "course-3"],
      "attendanceStats": { "total": 10, "present": 8, "late": 1, "absent": 1, "excused": 0 }
    },
    {
      "id": "student-2",
      "userId": "student-user-2",
      "studentId": "OL-2026-002",
      "name": "Kwame Boateng",
      "email": "kwame@openlabs.edu.gh",
      "department": "Network Engineering",
      "phone": "+233 24 999 1111",
      "registeredCourses": ["course-2", "course-3"],
      "attendanceStats": { "total": 8, "present": 5, "late": 2, "absent": 1, "excused": 0 }
    },
    {
      "id": "student-3",
      "userId": "student-user-3",
      "studentId": "OL-2026-003",
      "name": "Esi Ankrah",
      "email": "esi@openlabs.edu.gh",
      "department": "Data Science",
      "phone": "+233 20 888 2222",
      "registeredCourses": ["course-1", "course-3"],
      "attendanceStats": { "total": 8, "present": 7, "late": 0, "absent": 0, "excused": 1 }
    }
  ],
  "lecturers": [
    {
      "id": "lecturer-1",
      "userId": "lecturer-user-1",
      "name": "Dr. Kojo Mensah",
      "email": "lecturer@openlabs.edu.gh",
      "department": "Software Development",
      "phone": "+233 24 123 4567",
      "assignedCourses": ["course-1", "course-2"]
    },
    {
      "id": "lecturer-2",
      "userId": "lecturer-user-2",
      "name": "Mrs. Sarah Taylor",
      "email": "sarah@openlabs.edu.gh",
      "department": "Data Science",
      "phone": "+233 20 444 5555",
      "assignedCourses": ["course-3"]
    }
  ],
  "courses": [
    {
      "id": "course-1",
      "code": "OL-SD304",
      "title": "Advanced React & Node.js Development",
      "description": "Full-stack application architectural design with emphasis on state synchronization and containerized deployment.",
      "creditHours": 3,
      "department": "Software Development",
      "lecturerId": "lecturer-1"
    },
    {
      "id": "course-2",
      "code": "OL-NE201",
      "title": "Network Security & Administration",
      "description": "Understanding cryptography, firewall setups, and scanning protocols for enterprise network environments.",
      "creditHours": 4,
      "department": "Network Engineering",
      "lecturerId": "lecturer-1"
    },
    {
      "id": "course-3",
      "code": "OL-DS102",
      "title": "Data Analytics with Python",
      "description": "Statistical modeling, visualization, and algorithmic processing of structured databases using NumPy, Pandas, and Matplotlib.",
      "creditHours": 3,
      "department": "Data Science",
      "lecturerId": "lecturer-2"
    }
  ],
  "qrSessions": [] as any[],
  "attendance": [
    {
      "id": "att-1",
      "studentId": "student-1",
      "studentName": "Abena Osei",
      "studentOLId": "OL-2026-001",
      "courseId": "course-1",
      "courseCode": "OL-SD304",
      "courseTitle": "Advanced React & Node.js Development",
      "lecturerId": "lecturer-1",
      "date": "2026-07-15",
      "time": "09:05:12",
      "status": "present",
      "markedBy": "qr"
    },
    {
      "id": "att-2",
      "studentId": "student-3",
      "studentName": "Esi Ankrah",
      "studentOLId": "OL-2026-003",
      "courseId": "course-1",
      "courseCode": "OL-SD304",
      "courseTitle": "Advanced React & Node.js Development",
      "lecturerId": "lecturer-1",
      "date": "2026-07-15",
      "time": "09:02:44",
      "status": "present",
      "markedBy": "qr"
    },
    {
      "id": "att-3",
      "studentId": "student-1",
      "studentName": "Abena Osei",
      "studentOLId": "OL-2026-001",
      "courseId": "course-2",
      "courseCode": "OL-NE201",
      "courseTitle": "Network Security & Administration",
      "lecturerId": "lecturer-1",
      "date": "2026-07-16",
      "time": "11:15:22",
      "status": "late",
      "markedBy": "qr"
    },
    {
      "id": "att-4",
      "studentId": "student-2",
      "studentName": "Kwame Boateng",
      "studentOLId": "OL-2026-002",
      "courseId": "course-2",
      "courseCode": "OL-NE201",
      "courseTitle": "Network Security & Administration",
      "lecturerId": "lecturer-1",
      "date": "2026-07-16",
      "time": "11:04:10",
      "status": "present",
      "markedBy": "qr"
    },
    {
      "id": "att-5",
      "studentId": "student-1",
      "studentName": "Abena Osei",
      "studentOLId": "OL-2026-001",
      "courseId": "course-3",
      "courseCode": "OL-DS102",
      "courseTitle": "Data Analytics with Python",
      "lecturerId": "lecturer-2",
      "date": "2026-07-17",
      "time": "14:01:05",
      "status": "present",
      "markedBy": "qr"
    }
  ] as any[],
  "notifications": [
    {
      "id": "not-1",
      "userId": "student-user-1",
      "title": "Welcome to OpenLabs Registry",
      "message": "This system helps you scan QR codes to instantly mark attendance for your registered courses.",
      "read": false,
      "createdAt": "2026-07-20T13:12:33.632Z"
    }
  ] as any[]
};

// Local storage keys
const DB_LOCAL_STORAGE_KEY = 'ol_mock_database';

// Helper to load current database state
function getMockDB() {
  const data = localStorage.getItem(DB_LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(DB_LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_DB));
    return INITIAL_MOCK_DB;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    localStorage.setItem(DB_LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_DB));
    return INITIAL_MOCK_DB;
  }
}

// Helper to save database state
function saveMockDB(db: any) {
  localStorage.setItem(DB_LOCAL_STORAGE_KEY, JSON.stringify(db));
}

// Standard browser SHA-256 function
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Intercept window.fetch to provide static deployment mock database
export function setupMockApi() {
  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);

    // Only intercept requests directed to our Express backend endpoints
    if (url.startsWith('/api/')) {
      const isNetlify = window.location.hostname.includes('netlify.app') || 
                        window.location.hostname.includes('github.io') ||
                        window.location.hostname.includes('web.app') || 
                        window.location.hostname.includes('vercel.app');
      const savedMockFlag = localStorage.getItem('ol_use_mock_api') === 'true';

      if (isNetlify || savedMockFlag) {
        console.log(`[Mock API Handler] Serving route: ${url}`);
        return handleMockRequest(url, init);
      }

      // If we are not explicitly in Netlify but want to probe and fall back
      try {
        const response = await originalFetch(input, init);
        const contentType = response.headers.get('content-type');

        // Check if the server returned HTML (e.g. 404, or unhandled redirect typical of static hosts)
        if (response.status === 404 || (contentType && contentType.includes('text/html'))) {
          console.warn(`[Mock API Setup] Detected 404/HTML response for ${url}. Switching permanently to Client-side localStorage fallback database.`);
          localStorage.setItem('ol_use_mock_api', 'true');
          return handleMockRequest(url, init);
        }

        return response;
      } catch (err) {
        console.warn(`[Mock API Setup] Connection to backend failed for ${url}. Switching permanently to Client-side localStorage fallback database.`, err);
        localStorage.setItem('ol_use_mock_api', 'true');
        return handleMockRequest(url, init);
      }
    }

    return originalFetch(input, init);
  };
}

// Master Client-side mock routing switch
async function handleMockRequest(url: string, init?: RequestInit): Promise<Response> {
  // Wait a small bit to simulate network latency
  await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 200) + 100));

  const db = getMockDB();
  const method = init?.method?.toUpperCase() || 'GET';
  const parsedUrl = new URL(url, window.location.origin);
  const path = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  // Read body if exists
  let body: any = null;
  if (init?.body) {
    try {
      body = JSON.parse(init.body as string);
    } catch (e) {
      // Not JSON or could not parse
    }
  }

  const makeJSONResponse = (status: number, data: any) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  try {
    // 1. POST /api/auth/login
    if (path === '/api/auth/login' && method === 'POST') {
      const { email, password } = body || {};
      if (!email || !password) {
        return makeJSONResponse(400, { error: 'Email and password are required' });
      }

      const hashed = await sha256(password);
      const user = db.users.find((u: any) => u && u.email.toLowerCase() === email.toLowerCase() && u.password === hashed);

      if (!user) {
        return makeJSONResponse(401, { error: 'Invalid email or password' });
      }

      let profile: any = null;
      if (user.role === 'student') {
        profile = db.students.find((s: any) => s.userId === user.id);
      } else if (user.role === 'lecturer') {
        profile = db.lecturers.find((l: any) => l.userId === user.id);
      }

      user.lastLogin = new Date().toISOString();
      saveMockDB(db);

      const { password: _, ...userWithoutPassword } = user;
      return makeJSONResponse(200, { user: userWithoutPassword, profile });
    }

    // 2. POST /api/auth/register
    if (path === '/api/auth/register' && method === 'POST') {
      const { email, password, name, role, department, phone, studentId } = body || {};
      if (!email || !password || !name || !role) {
        return makeJSONResponse(400, { error: 'Missing required signup fields' });
      }

      const emailExists = db.users.some((u: any) => u && u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        return makeJSONResponse(400, { error: 'An account with this email already exists' });
      }

      const userId = 'user-' + Math.random().toString(36).substring(2, 11);
      const newUser = {
        id: userId,
        email: email.toLowerCase(),
        password: await sha256(password),
        name,
        role,
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);

      if (role === 'student') {
        const sId = studentId || 'OL-' + (2026) + '-' + Math.floor(100 + Math.random() * 900);
        const newStudent = {
          id: 'student-' + Math.random().toString(36).substring(2, 11),
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
        saveMockDB(db);
        const { password: _, ...u } = newUser;
        return makeJSONResponse(201, { user: u, profile: newStudent });
      } else if (role === 'lecturer') {
        const newLecturer = {
          id: 'lecturer-' + Math.random().toString(36).substring(2, 11),
          userId,
          name,
          email: email.toLowerCase(),
          department: department || 'General',
          phone: phone || '',
          assignedCourses: []
        };
        db.lecturers.push(newLecturer);
        saveMockDB(db);
        const { password: _, ...u } = newUser;
        return makeJSONResponse(201, { user: u, profile: newLecturer });
      }

      saveMockDB(db);
      const { password: _, ...u } = newUser;
      return makeJSONResponse(201, { user: u });
    }

    // 3. PUT /api/auth/profile
    if (path === '/api/auth/profile' && method === 'PUT') {
      const { userId, role, name, phone, department, studentId, profileImage } = body || {};
      if (!userId || !role) {
        return makeJSONResponse(400, { error: 'User ID and Role are required' });
      }

      const user = db.users.find((u: any) => u.id === userId);
      if (!user) {
        return makeJSONResponse(404, { error: 'User not found' });
      }

      user.name = name || user.name;
      if (profileImage !== undefined) {
        user.profileImage = profileImage;
      }

      let profile: any = null;
      if (role === 'student') {
        const student = db.students.find((s: any) => s.userId === userId);
        if (student) {
          student.name = name || student.name;
          student.phone = phone || student.phone;
          student.department = department || student.department;
          if (studentId) student.studentId = studentId;
          if (profileImage !== undefined) student.profileImage = profileImage;
          profile = student;
        }
      } else if (role === 'lecturer') {
        const lecturer = db.lecturers.find((l: any) => l.userId === userId);
        if (lecturer) {
          lecturer.name = name || lecturer.name;
          lecturer.phone = phone || lecturer.phone;
          lecturer.department = department || lecturer.department;
          if (profileImage !== undefined) lecturer.profileImage = profileImage;
          profile = lecturer;
        }
      }

      saveMockDB(db);
      const { password: _, ...u } = user;
      return makeJSONResponse(200, { user: u, profile });
    }

    // 4. GET & POST /api/students
    if (path === '/api/students') {
      if (method === 'GET') {
        return makeJSONResponse(200, db.students);
      }
      if (method === 'POST') {
        const { name, email, department, phone, studentId, registeredCourses } = body || {};
        if (!name || !email) {
          return makeJSONResponse(400, { error: 'Name and Email are required' });
        }

        const emailExists = db.users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
          return makeJSONResponse(400, { error: 'This email is already in use' });
        }

        const userId = 'user-' + Math.random().toString(36).substring(2, 11);
        const newUser = {
          id: userId,
          email: email.toLowerCase(),
          password: await sha256('studentpassword'),
          name,
          role: 'student',
          createdAt: new Date().toISOString()
        };
        db.users.push(newUser);

        const newStudent = {
          id: 'student-' + Math.random().toString(36).substring(2, 11),
          userId,
          studentId: studentId || 'OL-' + (2026) + '-' + Math.floor(100 + Math.random() * 900),
          name,
          email: email.toLowerCase(),
          department: department || 'General',
          phone: phone || '',
          registeredCourses: registeredCourses || [],
          attendanceStats: { total: 0, present: 0, late: 0, absent: 0, excused: 0 }
        };
        db.students.push(newStudent);
        saveMockDB(db);
        return makeJSONResponse(201, newStudent);
      }
    }

    // PUT & DELETE /api/students/:id
    if (path.startsWith('/api/students/')) {
      const id = path.split('/').pop() || '';
      if (method === 'PUT') {
        const student = db.students.find((s: any) => s.id === id);
        if (!student) {
          return makeJSONResponse(404, { error: 'Student not found' });
        }
        Object.assign(student, body);
        saveMockDB(db);
        return makeJSONResponse(200, student);
      }
      if (method === 'DELETE') {
        const studentIndex = db.students.findIndex((s: any) => s.id === id);
        if (studentIndex === -1) {
          return makeJSONResponse(404, { error: 'Student not found' });
        }
        const student = db.students[studentIndex];
        db.students.splice(studentIndex, 1);
        
        // Remove related user account
        const userIndex = db.users.findIndex((u: any) => u.id === student.userId);
        if (userIndex !== -1) db.users.splice(userIndex, 1);

        saveMockDB(db);
        return makeJSONResponse(200, { success: true });
      }
    }

    // 5. GET & POST /api/lecturers
    if (path === '/api/lecturers') {
      if (method === 'GET') {
        return makeJSONResponse(200, db.lecturers);
      }
      if (method === 'POST') {
        const { name, email, department, phone, assignedCourses } = body || {};
        if (!name || !email) {
          return makeJSONResponse(400, { error: 'Name and Email are required' });
        }

        const emailExists = db.users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
          return makeJSONResponse(400, { error: 'This email is already in use' });
        }

        const userId = 'user-' + Math.random().toString(36).substring(2, 11);
        const newUser = {
          id: userId,
          email: email.toLowerCase(),
          password: await sha256('lecturerpassword'),
          name,
          role: 'lecturer',
          createdAt: new Date().toISOString()
        };
        db.users.push(newUser);

        const newLecturer = {
          id: 'lecturer-' + Math.random().toString(36).substring(2, 11),
          userId,
          name,
          email: email.toLowerCase(),
          department: department || 'General',
          phone: phone || '',
          assignedCourses: assignedCourses || []
        };
        db.lecturers.push(newLecturer);
        saveMockDB(db);
        return makeJSONResponse(201, newLecturer);
      }
    }

    // PUT & DELETE /api/lecturers/:id
    if (path.startsWith('/api/lecturers/')) {
      const id = path.split('/').pop() || '';
      if (method === 'PUT') {
        const lecturer = db.lecturers.find((l: any) => l.id === id);
        if (!lecturer) {
          return makeJSONResponse(404, { error: 'Lecturer not found' });
        }
        Object.assign(lecturer, body);
        saveMockDB(db);
        return makeJSONResponse(200, lecturer);
      }
      if (method === 'DELETE') {
        const lecturerIndex = db.lecturers.findIndex((l: any) => l.id === id);
        if (lecturerIndex === -1) {
          return makeJSONResponse(404, { error: 'Lecturer not found' });
        }
        const lecturer = db.lecturers[lecturerIndex];
        db.lecturers.splice(lecturerIndex, 1);

        // Remove related user account
        const userIndex = db.users.findIndex((u: any) => u.id === lecturer.userId);
        if (userIndex !== -1) db.users.splice(userIndex, 1);

        saveMockDB(db);
        return makeJSONResponse(200, { success: true });
      }
    }

    // 6. GET & POST /api/courses
    if (path === '/api/courses') {
      if (method === 'GET') {
        return makeJSONResponse(200, db.courses);
      }
      if (method === 'POST') {
        const { code, title, description, creditHours, department, lecturerId } = body || {};
        if (!code || !title) {
          return makeJSONResponse(400, { error: 'Course Code and Title are required' });
        }

        const codeExists = db.courses.some((c: any) => c.code.toUpperCase() === code.toUpperCase());
        if (codeExists) {
          return makeJSONResponse(400, { error: 'A course with this code already exists' });
        }

        const newCourse = {
          id: 'course-' + Math.random().toString(36).substring(2, 11),
          code: code.toUpperCase(),
          title,
          description: description || '',
          creditHours: Number(creditHours) || 3,
          department: department || 'General',
          lecturerId: lecturerId || 'unassigned'
        };

        db.courses.push(newCourse);
        saveMockDB(db);
        return makeJSONResponse(201, newCourse);
      }
    }

    // PUT & DELETE /api/courses/:id
    if (path.startsWith('/api/courses/')) {
      const id = path.split('/').pop() || '';
      if (method === 'PUT') {
        const course = db.courses.find((c: any) => c.id === id);
        if (!course) {
          return makeJSONResponse(404, { error: 'Course not found' });
        }
        Object.assign(course, body);
        saveMockDB(db);
        return makeJSONResponse(200, course);
      }
      if (method === 'DELETE') {
        const index = db.courses.findIndex((c: any) => c.id === id);
        if (index === -1) {
          return makeJSONResponse(404, { error: 'Course not found' });
        }
        db.courses.splice(index, 1);
        saveMockDB(db);
        return makeJSONResponse(200, { success: true });
      }
    }

    // 7. GET /api/qr-sessions
    if (path === '/api/qr-sessions') {
      return makeJSONResponse(200, db.qrSessions);
    }

    // 8. POST /api/qr-sessions/generate
    if (path === '/api/qr-sessions/generate' && method === 'POST') {
      const { courseId, lecturerId, expirationMinutes } = body || {};
      if (!courseId || !lecturerId) {
        return makeJSONResponse(400, { error: 'Course ID and Lecturer ID are required' });
      }

      const course = db.courses.find((c: any) => c.id === courseId);
      if (!course) {
        return makeJSONResponse(404, { error: 'Course not found' });
      }

      db.qrSessions.forEach((qs: any) => {
        if (qs.courseId === courseId) {
          qs.active = false;
        }
      });

      const minutes = Number(expirationMinutes) || 15;
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + minutes * 60 * 1000);
      const code = 'OLQR-' + course.code + '-' + Math.random().toString(36).substring(2, 6).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

      const newSession = {
        id: 'session-' + Math.random().toString(36).substring(2, 11),
        courseId,
        lecturerId,
        code,
        expirationMinutes: minutes,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        active: true
      };

      db.qrSessions.push(newSession);
      saveMockDB(db);
      return makeJSONResponse(201, newSession);
    }

    // 9. POST /api/qr-sessions/scan
    if (path === '/api/qr-sessions/scan' && method === 'POST') {
      const { studentId, code } = body || {};
      if (!studentId || !code) {
        return makeJSONResponse(400, { error: 'Student ID and QR code are required' });
      }

      const student = db.students.find((s: any) => s.id === studentId || s.studentId === studentId);
      if (!student) {
        return makeJSONResponse(404, { error: 'Student not found' });
      }

      let session = db.qrSessions.find((qs: any) => qs.code.toUpperCase() === code.toUpperCase());
      if (!session) {
        // Fallback auto-creation matching backend
        const upperCode = code.toUpperCase();
        const parts = upperCode.split('-');
        let matchedCourse = null;

        if (parts.length >= 3 && parts[0] === 'OLQR') {
          const courseCode = parts.slice(1, -1).join('-');
          matchedCourse = db.courses.find((c: any) => c.code.toUpperCase() === courseCode);
        } else {
          matchedCourse = db.courses.find((c: any) => c.code.toUpperCase() === upperCode);
        }

        if (matchedCourse) {
          const minutes = 15;
          const createdAt = new Date();
          const expiresAt = new Date(createdAt.getTime() + minutes * 60 * 1000);

          session = {
            id: 'session-' + Math.random().toString(36).substring(2, 11),
            courseId: matchedCourse.id,
            lecturerId: matchedCourse.lecturerId && matchedCourse.lecturerId !== 'unassigned' ? matchedCourse.lecturerId : 'lecturer-1',
            code: upperCode,
            expirationMinutes: minutes,
            createdAt: createdAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
            active: true
          };

          db.qrSessions.push(session);
          saveMockDB(db);
        } else {
          return makeJSONResponse(404, { error: 'Invalid QR Code session' });
        }
      }

      const now = new Date();
      const isExpired = !session.active || new Date(session.expiresAt) < now;
      if (isExpired) {
        session.active = true;
        const minutes = 15;
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + minutes * 60 * 1000);
        session.createdAt = createdAt.toISOString();
        session.expiresAt = expiresAt.toISOString();
        saveMockDB(db);
      }

      const todayStr = now.toISOString().split('T')[0];
      const duplicate = db.attendance.some((a: any) => 
        a.studentId === student.id && 
        a.courseId === session.courseId && 
        a.date === todayStr
      );

      if (duplicate) {
        return makeJSONResponse(400, { error: 'You have already checked in for this class session today.' });
      }

      if (!student.registeredCourses.includes(session.courseId)) {
        student.registeredCourses.push(session.courseId);
      }

      const sessionStart = new Date(session.createdAt);
      const diffMinutes = (now.getTime() - sessionStart.getTime()) / (1000 * 60);
      const status = diffMinutes > 10 ? 'late' : 'present';

      const course = db.courses.find((c: any) => c.id === session.courseId);

      const newAttendance = {
        id: 'att-' + Math.random().toString(36).substring(2, 11),
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

      student.attendanceStats.total += 1;
      if (status === 'present') student.attendanceStats.present += 1;
      else if (status === 'late') student.attendanceStats.late += 1;

      const newNotif = {
        id: 'not-' + Math.random().toString(36).substring(2, 11),
        userId: student.userId,
        title: 'Attendance Marked Successfully',
        message: `You have been marked ${status.toUpperCase()} for ${course?.code}: ${course?.title} on ${todayStr} at ${newAttendance.time}.`,
        read: false,
        createdAt: now.toISOString()
      };
      db.notifications.push(newNotif);

      saveMockDB(db);
      return makeJSONResponse(201, { attendance: newAttendance, session });
    }

    // 10. POST /api/attendance/mark
    if (path === '/api/attendance/mark' && method === 'POST') {
      const { studentId, courseId, date, status, notes } = body || {};
      if (!studentId || !courseId || !status) {
        return makeJSONResponse(400, { error: 'Student ID, Course ID and Status are required' });
      }

      const student = db.students.find((s: any) => s.id === studentId);
      if (!student) {
        return makeJSONResponse(404, { error: 'Student not found' });
      }

      const course = db.courses.find((c: any) => c.id === courseId);
      if (!course) {
        return makeJSONResponse(404, { error: 'Course not found' });
      }

      const targetDate = date || new Date().toISOString().split('T')[0];
      
      // Update or create attendance
      let attRecord = db.attendance.find((a: any) => a.studentId === studentId && a.courseId === courseId && a.date === targetDate);
      
      if (attRecord) {
        const oldStatus = attRecord.status;
        attRecord.status = status;
        if (notes !== undefined) attRecord.notes = notes;

        // Recalculate stats difference
        if (oldStatus !== status) {
          if (oldStatus === 'present') student.attendanceStats.present = Math.max(0, student.attendanceStats.present - 1);
          if (oldStatus === 'late') student.attendanceStats.late = Math.max(0, student.attendanceStats.late - 1);
          if (oldStatus === 'absent') student.attendanceStats.absent = Math.max(0, student.attendanceStats.absent - 1);
          if (oldStatus === 'excused') student.attendanceStats.excused = Math.max(0, student.attendanceStats.excused - 1);

          if (status === 'present') student.attendanceStats.present += 1;
          if (status === 'late') student.attendanceStats.late += 1;
          if (status === 'absent') student.attendanceStats.absent += 1;
          if (status === 'excused') student.attendanceStats.excused += 1;
        }
      } else {
        attRecord = {
          id: 'att-' + Math.random().toString(36).substring(2, 11),
          studentId: student.id,
          studentName: student.name,
          studentOLId: student.studentId,
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          lecturerId: course.lecturerId,
          date: targetDate,
          time: new Date().toTimeString().split(' ')[0],
          status,
          markedBy: 'lecturer',
          notes: notes || ''
        };
        db.attendance.push(attRecord);

        student.attendanceStats.total += 1;
        if (status === 'present') student.attendanceStats.present += 1;
        if (status === 'late') student.attendanceStats.late += 1;
        if (status === 'absent') student.attendanceStats.absent += 1;
        if (status === 'excused') student.attendanceStats.excused += 1;
      }

      saveMockDB(db);
      return makeJSONResponse(201, attRecord);
    }

    // 11. GET /api/attendance
    if (path === '/api/attendance') {
      const studentId = searchParams.get('studentId');
      if (studentId) {
        const filtered = db.attendance.filter((a: any) => a.studentId === studentId);
        return makeJSONResponse(200, filtered);
      }
      return makeJSONResponse(200, db.attendance);
    }

    // 12. GET /api/notifications
    if (path === '/api/notifications') {
      const userId = searchParams.get('userId');
      const filtered = db.notifications.filter((n: any) => n.userId === userId);
      return makeJSONResponse(200, filtered);
    }

    // 13. POST /api/notifications/read
    if (path === '/api/notifications/read' && method === 'POST') {
      const { notificationId } = body || {};
      if (notificationId) {
        const notif = db.notifications.find((n: any) => n.id === notificationId);
        if (notif) notif.read = true;
      } else {
        const userId = searchParams.get('userId');
        db.notifications.forEach((n: any) => {
          if (n.userId === userId) n.read = true;
        });
      }
      saveMockDB(db);
      return makeJSONResponse(200, { success: true });
    }

    // 14. GET /api/stats
    if (path === '/api/stats') {
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = db.attendance.filter((a: any) => a.date === today);
      const activeStats = {
        totalStudents: db.students.length,
        totalLecturers: db.lecturers.length,
        totalCourses: db.courses.length,
        attendanceToday: todayAttendance.length,
        attendancePercentage: db.students.length > 0 ? Math.round((todayAttendance.filter((a: any) => a.status === 'present' || a.status === 'late').length / db.students.length) * 100) : 0,
        recentAttendance: db.attendance.slice(-10).reverse()
      };
      return makeJSONResponse(200, activeStats);
    }

    // Default route 404
    return makeJSONResponse(404, { error: `Endpoint mock not found: ${method} ${path}` });

  } catch (err: any) {
    console.error(`Mock request failed for ${url}:`, err);
    return makeJSONResponse(500, { error: err?.message || 'Unexpected mock server error' });
  }
}
