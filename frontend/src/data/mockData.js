// ─── WORKFLOW STAGES (correct order) ─────────────────────────────────────────
// submitted → adviser_approved → hod_approved → officer_approved → academic_approved → approved
export const WORKFLOW_STAGES = [
  { key: 'adviser',          label: 'Course Adviser',    statusAfter: 'adviser_approved',   color: '#3DB87A' },
  { key: 'hod',              label: 'HOD',               statusAfter: 'hod_approved',        color: '#8B5CF6' },
  { key: 'schoolofficer',    label: 'School Officer',    statusAfter: 'officer_approved',    color: '#4A9EE0' },
  { key: 'academicplanning', label: 'Academic Planning', statusAfter: 'academic_approved',   color: '#E8A030' },
  { key: 'registry',         label: 'Registry',          statusAfter: 'approved',            color: '#3DB87A' },
]

// ─── STATUS METADATA ──────────────────────────────────────────────────────────
export const STATUS_META = {
  submitted:         { label: 'Pending Course Adviser',  color: '#3DB87A'  },
  adviser_approved:  { label: 'Pending HOD',             color: '#8B5CF6'  },
  hod_approved:      { label: 'Temp Approved — Pending School Officer', color: '#E8C06A' },
  officer_approved:  { label: 'Pending Academic Planning', color: '#4A9EE0' },
  academic_approved: { label: 'Pending Registry',        color: '#E8A030'  },
  approved:          { label: 'Permanently Approved',    color: '#3DB87A'  },
  rejected:          { label: 'Rejected',                color: '#E05454'  },
}

// ─── ROLE METADATA ────────────────────────────────────────────────────────────
export const ROLE_META = {
  student:          { label: 'Student',           color: '#4A9EE0', portal: '/student'          },
  adviser:          { label: 'Course Adviser',    color: '#3DB87A', portal: '/adviser'           },
  hod:              { label: 'Head of Department',color: '#8B5CF6', portal: '/hod'               },
  schoolofficer:    { label: 'School Officer',    color: '#4A9EE0', portal: '/schoolofficer'     },
  academicplanning: { label: 'Academic Planning', color: '#E8A030', portal: '/academicplanning'  },
  registry:         { label: 'Registry',          color: '#3DB87A', portal: '/registry'          },
  admin:            { label: 'Administrator',     color: '#E05454', portal: '/admin'             },
}

// ─── USERS (demo / seed) ──────────────────────────────────────────────────────
export const USERS = [
  { id: 1, role: 'student',          username: 'student1',  password: 'pass',  name: 'Adebayo Tunde',        matric: 'BU/20C/001', department: 'Computer Science', level: '300', faculty: 'Computing & Applied Sciences' },
  { id: 2, role: 'student',          username: 'student2',  password: 'pass',  name: 'Chioma Okafor',        matric: 'BU/20C/002', department: 'Computer Science', level: '300', faculty: 'Computing & Applied Sciences' },
  { id: 3, role: 'adviser',          username: 'adviser1',  password: 'pass',  name: 'Dr. Emmanuel Adeyemi', department: 'Computer Science', faculty: 'Computing & Applied Sciences' },
  { id: 4, role: 'hod',              username: 'hod1',      password: 'pass',  name: 'Prof. Grace Okonkwo',  department: 'Computer Science', faculty: 'Computing & Applied Sciences' },
  { id: 5, role: 'schoolofficer',    username: 'officer1',  password: 'pass',  name: 'Mr. Femi Oladele',     department: 'Computer Science', faculty: 'Computing & Applied Sciences' },
  { id: 6, role: 'academicplanning', username: 'academic1', password: 'pass',  name: 'Mrs. Bunmi Adebayo',   faculty: 'Computing & Applied Sciences' },
  { id: 7, role: 'registry',         username: 'registry1', password: 'pass',  name: 'Mr. Segun Fashola',    faculty: 'Computing & Applied Sciences' },
  { id: 8, role: 'admin',            username: 'admin',     password: 'admin', name: 'System Administrator' },
]

// ─── COURSES ──────────────────────────────────────────────────────────────────
export const COURSES = [
  { id: 'CSC301', code: 'CSC301', title: 'Data Structures & Algorithms',  units: 3, level: '300', department: 'Computer Science', semester: 'First' },
  { id: 'CSC303', code: 'CSC303', title: 'Operating Systems',              units: 3, level: '300', department: 'Computer Science', semester: 'First' },
  { id: 'CSC305', code: 'CSC305', title: 'Computer Networks',              units: 3, level: '300', department: 'Computer Science', semester: 'First' },
  { id: 'CSC307', code: 'CSC307', title: 'Database Management Systems',   units: 3, level: '300', department: 'Computer Science', semester: 'First' },
  { id: 'CSC309', code: 'CSC309', title: 'Software Engineering',           units: 2, level: '300', department: 'Computer Science', semester: 'First' },
  { id: 'CSC311', code: 'CSC311', title: 'Artificial Intelligence',        units: 2, level: '300', department: 'Computer Science', semester: 'First' },
  { id: 'GST301', code: 'GST301', title: 'Entrepreneurship Studies',       units: 2, level: '300', department: 'General',          semester: 'First' },
  { id: 'MTH301', code: 'MTH301', title: 'Numerical Methods',              units: 3, level: '300', department: 'General',          semester: 'First' },
]

// ─── SEED REGISTRATIONS ───────────────────────────────────────────────────────
export const SEED_REGISTRATIONS = [
  {
    id: 'REG-2024-001',
    studentId: 2, studentName: 'Chioma Okafor', matric: 'BU/20C/002',
    department: 'Computer Science', level: '300', semester: 'First', session: '2024/2025',
    courses: ['CSC301', 'CSC303', 'CSC305', 'CSC307', 'GST301'], totalUnits: 14,
    submittedAt: '2024-09-10T09:00:00', status: 'submitted',
    approvals: {
      adviser:          { status: 'pending', by: null, at: null, comment: null },
      hod:              { status: 'pending', by: null, at: null, comment: null },
      schoolofficer:    { status: 'pending', by: null, at: null, comment: null },
      academicplanning: { status: 'pending', by: null, at: null, comment: null },
      registry:         { status: 'pending', by: null, at: null, comment: null },
    },
  },
]
