import prisma from '../lib/prisma.js'
import bcrypt from 'bcryptjs'

// GET /api/users  — admin only
export async function listUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, matric: true, department: true, faculty: true, level: true, isActive: true, createdAt: true },
    })
    res.json({ users })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

// PATCH /api/users/:id/role  — admin assigns role
export async function assignRole(req, res) {
  try {
    const { role } = req.body
    const validRoles = ['student', 'schoolofficer', 'hod', 'academicplanning', 'registry', 'admin']
    if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' })

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data:  { role },
      select: { id: true, name: true, email: true, role: true },
    })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

// PATCH /api/users/:id  — admin updates user profile (matric, dept, etc.)
export async function updateUser(req, res) {
  try {
    const { name, department, faculty, level, matric, isActive } = req.body
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, department, faculty, level, matric, isActive },
      select: { id: true, name: true, email: true, role: true, matric: true, department: true, faculty: true, level: true, isActive: true },
    })
    res.json({ user })
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Matric number already taken' })
    res.status(500).json({ error: 'Server error' })
  }
}

// DELETE /api/users/:id  — admin deactivates (soft delete)
export async function deactivateUser(req, res) {
  try {
    await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } })
    res.json({ message: 'User deactivated' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

// GET /api/users/pending-role  — users registered but still role=student with no matric (unverified staff)
export async function pendingRoleAssignment(req, res) {
  try {
    // All users registered in last 30 days whose role hasn't been elevated yet
    const users = await prisma.user.findMany({
      where: { role: 'student', matric: null },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    res.json({ users })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}
