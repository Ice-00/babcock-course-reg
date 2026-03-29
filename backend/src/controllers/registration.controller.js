import prisma from '../lib/prisma.js'

// New workflow order: adviser → hod → schoolofficer → academicplanning → registry
const WORKFLOW = [
  { stage: 'adviser',          statusAfter: 'adviser_approved'  },
  { stage: 'hod',              statusAfter: 'hod_approved'      },
  { stage: 'schoolofficer',    statusAfter: 'officer_approved'  },
  { stage: 'academicplanning', statusAfter: 'academic_approved' },
  { stage: 'registry',         statusAfter: 'approved'          },
]

const STAGE_REQUIRED_STATUS = {
  adviser:          'submitted',
  hod:              'adviser_approved',
  schoolofficer:    'hod_approved',
  academicplanning: 'officer_approved',
  registry:         'academic_approved',
}

function buildInclude() {
  return {
    student: { select: { id:true, name:true, email:true, matric:true, department:true, faculty:true, level:true } },
    courses: { include: { course: true } },
    approvals: { orderBy: { createdAt: 'asc' } },
  }
}

export async function submitRegistration(req, res) {
  try {
    const { courseIds, semester = 'First', session = '2024/2025' } = req.body
    const student = req.user
    if (!student.matric) return res.status(400).json({ error: 'Profile missing matric number. Contact admin.' })
    if (!courseIds?.length) return res.status(400).json({ error: 'Select at least one course' })
    const courses = await prisma.course.findMany({ where: { id: { in: courseIds }, isActive: true } })
    if (courses.length !== courseIds.length) return res.status(400).json({ error: 'One or more courses not found' })
    const totalUnits = courses.reduce((a, c) => a + c.units, 0)
    if (totalUnits < 15) return res.status(400).json({ error: `Total units (${totalUnits}) below minimum of 15` })
    if (totalUnits > 24) return res.status(400).json({ error: `Total units (${totalUnits}) above maximum of 24` })
    await prisma.registration.updateMany({ where: { studentId: student.id, status: { notIn: ['approved','rejected'] } }, data: { status: 'rejected' } })
    const reg = await prisma.$transaction(async (tx) => {
      return tx.registration.create({
        data: {
          studentId: student.id, semester, session, totalUnits, status: 'submitted',
          courses: { create: courseIds.map(id => ({ courseId: id })) },
          approvals: { create: WORKFLOW.map(w => ({ stage: w.stage, status: 'pending' })) },
        },
        include: buildInclude(),
      })
    })
    res.status(201).json({ registration: reg })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
}

export async function listRegistrations(req, res) {
  try {
    const { user } = req
    const { status } = req.query
    let where = {}
    if (user.role === 'student')          where.studentId = user.id
    else if (user.role === 'adviser')     where.status = 'submitted'
    else if (user.role === 'hod')         where.status = 'adviser_approved'
    else if (user.role === 'schoolofficer')    where.status = 'hod_approved'
    else if (user.role === 'academicplanning') where.status = 'officer_approved'
    else if (user.role === 'registry')    where.status = 'academic_approved'
    if (user.role === 'admin' && status)  where.status = status
    const regs = await prisma.registration.findMany({ where, include: buildInclude(), orderBy: { submittedAt: 'desc' } })
    res.json({ registrations: regs })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
}

export async function getRegistration(req, res) {
  try {
    const reg = await prisma.registration.findUnique({ where: { id: req.params.id }, include: buildInclude() })
    if (!reg) return res.status(404).json({ error: 'Not found' })
    if (req.user.role === 'student' && reg.studentId !== req.user.id) return res.status(403).json({ error: 'Access denied' })
    res.json({ registration: reg })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
}

export async function approveRegistration(req, res) {
  try {
    const { comment } = req.body
    const approver = req.user
    const stage    = approver.role
    const reg = await prisma.registration.findUnique({ where: { id: req.params.id }, include: { approvals: true } })
    if (!reg) return res.status(404).json({ error: 'Not found' })
    if (reg.status !== STAGE_REQUIRED_STATUS[stage]) return res.status(400).json({ error: `Registration not at your stage (current: ${reg.status})` })
    const stageData = WORKFLOW.find(w => w.stage === stage)
    const updated = await prisma.$transaction(async (tx) => {
      await tx.approval.updateMany({ where: { registrationId: reg.id, stage }, data: { status: 'approved', approverName: approver.name, comment: comment || null, actedAt: new Date() } })
      return tx.registration.update({ where: { id: reg.id }, data: { status: stageData.statusAfter }, include: buildInclude() })
    })
    res.json({ registration: updated })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
}

export async function rejectRegistration(req, res) {
  try {
    const { comment } = req.body
    const approver = req.user
    const stage    = approver.role
    const reg = await prisma.registration.findUnique({ where: { id: req.params.id } })
    if (!reg) return res.status(404).json({ error: 'Not found' })
    if (reg.status !== STAGE_REQUIRED_STATUS[stage]) return res.status(400).json({ error: `Registration not at your stage` })
    const updated = await prisma.$transaction(async (tx) => {
      await tx.approval.updateMany({ where: { registrationId: reg.id, stage }, data: { status: 'rejected', approverName: approver.name, comment: comment || null, actedAt: new Date() } })
      return tx.registration.update({ where: { id: reg.id }, data: { status: 'rejected' }, include: buildInclude() })
    })
    res.json({ registration: updated })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
}

export async function getStats(req, res) {
  try {
    const [total, approved, tempApproved, rejected, pending, courseEnrollments] = await Promise.all([
      prisma.registration.count(),
      prisma.registration.count({ where: { status: 'approved' } }),
      prisma.registration.count({ where: { status: { in: ['hod_approved','officer_approved','academic_approved'] } } }),
      prisma.registration.count({ where: { status: 'rejected' } }),
      prisma.registration.count({ where: { status: { notIn: ['approved','rejected'] } } }),
      prisma.registrationCourse.groupBy({ by: ['courseId'], _count: { courseId: true }, where: { registration: { status: { not: 'rejected' } } }, orderBy: { _count: { courseId: 'desc' } } }),
    ])
    res.json({ total, approved, tempApproved, rejected, pending, courseEnrollments })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
}
