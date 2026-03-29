import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Courses ──────────────────────────────────────────────────────────────────
  const courses = [
    { code: 'CSC301', title: 'Data Structures & Algorithms',  units: 3, level: '300', department: 'Computer Science', semester: 'First' },
    { code: 'CSC303', title: 'Operating Systems',              units: 3, level: '300', department: 'Computer Science', semester: 'First' },
    { code: 'CSC305', title: 'Computer Networks',              units: 3, level: '300', department: 'Computer Science', semester: 'First' },
    { code: 'CSC307', title: 'Database Management Systems',   units: 3, level: '300', department: 'Computer Science', semester: 'First' },
    { code: 'CSC309', title: 'Software Engineering',           units: 2, level: '300', department: 'Computer Science', semester: 'First' },
    { code: 'CSC311', title: 'Artificial Intelligence',        units: 2, level: '300', department: 'Computer Science', semester: 'First' },
    { code: 'GST301', title: 'Entrepreneurship Studies',       units: 2, level: '300', department: 'General',          semester: 'First' },
    { code: 'MTH301', title: 'Numerical Methods',              units: 3, level: '300', department: 'General',          semester: 'First' },
  ]

  for (const c of courses) {
    await prisma.course.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    })
  }
  console.log(`✅ ${courses.length} courses seeded`)

  // ── Demo Users ────────────────────────────────────────────────────────────────
  const hash = (p) => bcrypt.hashSync(p, 10)

  const users = [
    {
      name: 'Adebayo Tunde', email: 'student1@uni.edu', password: hash('pass'),
      role: 'student', matric: 'UL/20/CSC/001',
      department: 'Computer Science', faculty: 'Faculty of Science', level: '300',
    },
    {
      name: 'Chioma Okafor', email: 'student2@uni.edu', password: hash('pass'),
      role: 'student', matric: 'UL/20/CSC/002',
      department: 'Computer Science', faculty: 'Faculty of Science', level: '300',
    },
    {
      name: 'Mr. Femi Oladele', email: 'officer1@uni.edu', password: hash('pass'),
      role: 'schoolofficer', department: 'Computer Science', faculty: 'Faculty of Science',
    },
    {
      name: 'Prof. Grace Okonkwo', email: 'hod1@uni.edu', password: hash('pass'),
      role: 'hod', department: 'Computer Science', faculty: 'Faculty of Science',
    },
    {
      name: 'Mrs. Bunmi Adebayo', email: 'academic1@uni.edu', password: hash('pass'),
      role: 'academicplanning', faculty: 'Faculty of Science',
    },
    {
      name: 'Mr. Segun Fashola', email: 'registry1@uni.edu', password: hash('pass'),
      role: 'registry', faculty: 'Faculty of Science',
    },
    {
      name: 'System Administrator', email: 'admin@uni.edu', password: hash('admin123'),
      role: 'admin',
    },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    })
  }
  console.log(`✅ ${users.length} users seeded`)
  console.log('\n📋 Demo login credentials:')
  console.log('  student1@uni.edu   / pass')
  console.log('  student2@uni.edu   / pass')
  console.log('  officer1@uni.edu   / pass')
  console.log('  hod1@uni.edu       / pass')
  console.log('  academic1@uni.edu  / pass')
  console.log('  registry1@uni.edu  / pass')
  console.log('  admin@uni.edu      / admin123')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
