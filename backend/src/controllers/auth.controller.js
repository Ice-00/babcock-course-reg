import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

// POST /api/auth/register
// Students self-register. Role defaults to 'student'. Admin later assigns other roles.
export async function register(req, res) {
  try {
    const { name, email, password, matric, department, faculty, level } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ error: 'Email already registered' })

    if (matric) {
      const matricExists = await prisma.user.findUnique({ where: { matric } })
      if (matricExists) return res.status(409).json({ error: 'Matric number already registered' })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        name, email, password: hashed,
        role: 'student',
        matric:     matric     || null,
        department: department || null,
        faculty:    faculty    || null,
        level:      level      || null,
      },
      select: { id: true, name: true, email: true, role: true, matric: true, department: true, faculty: true, level: true },
    })

    const token = signToken(user.id)
    res.status(201).json({ token, user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = signToken(user.id)
    const { password: _, ...safeUser } = user
    res.json({ token, user: safeUser })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

// GET /api/auth/me
export async function me(req, res) {
  res.json({ user: req.user })
}
