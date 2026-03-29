import prisma from '../lib/prisma.js'

// GET /api/courses  — optionally filter by level & department
export async function listCourses(req, res) {
  try {
    const { level, department } = req.query
    const where = { isActive: true }
    if (level)      where.level      = level
    if (department) where.department = { in: [department, 'General'] }

    const courses = await prisma.course.findMany({ where, orderBy: { code: 'asc' } })
    res.json({ courses })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

// POST /api/courses  — admin only
export async function createCourse(req, res) {
  try {
    const { code, title, units, level, department, semester } = req.body
    if (!code || !title || !units || !level || !department || !semester) {
      return res.status(400).json({ error: 'All fields required' })
    }
    const course = await prisma.course.create({ data: { code, title, units: parseInt(units), level, department, semester } })
    res.status(201).json({ course })
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Course code already exists' })
    res.status(500).json({ error: 'Server error' })
  }
}

// PATCH /api/courses/:id  — admin only
export async function updateCourse(req, res) {
  try {
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: req.body,
    })
    res.json({ course })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}
