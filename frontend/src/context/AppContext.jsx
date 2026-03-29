import { createContext, useContext, useState, useEffect } from 'react'
import { USERS, SEED_REGISTRATIONS, WORKFLOW_STAGES, COURSES } from '../data/mockData'

const AppContext = createContext(null)
const STORAGE_USER  = 'bu_user'
const STORAGE_REGS  = 'bu_registrations'
const STORAGE_ACCTS = 'bu_accounts'   // admin-created accounts

// ── Matric number validation: format  22/0123  (2-digit year / 4-digit number)
export const MATRIC_REGEX = /^\d{2}\/\d{4}$/
export function validateMatric(matric) {
  if (!matric?.trim()) return 'Matric number is required.'
  if (!MATRIC_REGEX.test(matric.trim())) return 'Matric number must be in format YY/NNNN (e.g. 22/0123).'
  return null
}

// ── Load/save helpers ─────────────────────────────────────────────────────────
function loadRegs() {
  try { const r = localStorage.getItem(STORAGE_REGS); if (r) return JSON.parse(r) } catch {}
  localStorage.setItem(STORAGE_REGS, JSON.stringify(SEED_REGISTRATIONS))
  return SEED_REGISTRATIONS
}

function loadAccounts() {
  try { const r = localStorage.getItem(STORAGE_ACCTS); if (r) return JSON.parse(r) } catch {}
  return []
}

function saveAccounts(accts) {
  localStorage.setItem(STORAGE_ACCTS, JSON.stringify(accts))
}

// ── Combine seed users + admin-created accounts ───────────────────────────────
function allUsers(accounts) {
  return [...USERS, ...accounts]
}

export function AppProvider({ children }) {
  const [user, setUser]             = useState(() => {
    try { const r = sessionStorage.getItem(STORAGE_USER); return r ? JSON.parse(r) : null } catch { return null }
  })
  const [registrations, setRegistrations] = useState(() => loadRegs())
  const [accounts, setAccounts]     = useState(() => loadAccounts())

  useEffect(() => { localStorage.setItem(STORAGE_REGS, JSON.stringify(registrations)) }, [registrations])
  useEffect(() => { saveAccounts(accounts) }, [accounts])

  // ── Auth ──────────────────────────────────────────────────────────────────
  function login(username, password) {
    const all = allUsers(accounts)
    const found = all.find(u => u.username === username && u.password === password)
    if (!found) return { ok: false, error: 'Invalid username or password.' }
    if (found.isActive === false) return { ok: false, error: 'This account has been deactivated. Contact the administrator.' }
    // Check if first-time login (password still equals matric)
    const mustChange = found.mustChangePassword === true
    const userData = { ...found, mustChangePassword: mustChange }
    sessionStorage.setItem(STORAGE_USER, JSON.stringify(userData))
    setUser(userData)
    return { ok: true, user: userData, mustChangePassword: mustChange }
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_USER)
    setUser(null)
  }

  function changePassword(userId, newPassword) {
    // Update in accounts list (not seed users)
    setAccounts(prev => prev.map(u => {
      if (u.id !== userId) return u
      return { ...u, password: newPassword, mustChangePassword: false }
    }))
    // Update session too
    const updated = { ...user, password: newPassword, mustChangePassword: false }
    sessionStorage.setItem(STORAGE_USER, JSON.stringify(updated))
    setUser(updated)
  }

  function updateProfile(userId, fields) {
    // Students can update phone and password only
    const allowed = ['phone', 'password']
    const safe = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)))
    setAccounts(prev => prev.map(u => u.id !== userId ? u : { ...u, ...safe }))
    const updated = { ...user, ...safe }
    sessionStorage.setItem(STORAGE_USER, JSON.stringify(updated))
    setUser(updated)
  }

  // ── Admin: Create Account ─────────────────────────────────────────────────
  function adminCreateAccount({ name, username, role, matric, department, faculty, level, phone }) {
    // Validate matric for students
    if (role === 'student') {
      const err = validateMatric(matric)
      if (err) return { ok: false, error: err }
    }

    const all = allUsers(accounts)

    // Username uniqueness
    if (all.find(u => u.username === username?.trim()))
      return { ok: false, error: 'Username already exists.' }

    // Matric uniqueness (students only)
    if (role === 'student' && all.find(u => u.matric === matric?.trim()))
      return { ok: false, error: 'Matric number already registered.' }

    if (!name?.trim())     return { ok: false, error: 'Full name is required.' }
    if (!username?.trim()) return { ok: false, error: 'Username is required.' }

    const newAccount = {
      id:               `ACC_${Date.now()}`,
      name:             name.trim(),
      username:         username.trim(),
      password:         role === 'student' ? matric.trim() : username.trim(), // default password
      mustChangePassword: true,
      role,
      matric:           role === 'student' ? matric.trim() : null,
      department:       department?.trim() || null,
      faculty:          faculty?.trim()    || null,
      level:            level              || null,
      phone:            phone?.trim()      || null,
      isActive:         true,
      createdAt:        new Date().toISOString(),
    }

    setAccounts(prev => [...prev, newAccount])
    return { ok: true, account: newAccount }
  }

  // Admin: Edit Account
  function adminEditAccount(id, fields) {
    // If matric is being changed, validate format
    if (fields.matric !== undefined) {
      const err = validateMatric(fields.matric)
      if (err) return { ok: false, error: err }
      // Check uniqueness (excluding self)
      const all = allUsers(accounts)
      if (all.find(u => u.matric === fields.matric?.trim() && u.id !== id))
        return { ok: false, error: 'Matric number already registered to another account.' }
    }
    setAccounts(prev => prev.map(u => u.id !== id ? u : { ...u, ...fields }))
    return { ok: true }
  }

  // Admin: Deactivate / Reactivate
  function adminToggleActive(id) {
    setAccounts(prev => prev.map(u => u.id !== id ? u : { ...u, isActive: !u.isActive }))
  }

  // Admin: Reset password back to matric (students) or username (staff)
  function adminResetPassword(id) {
    setAccounts(prev => prev.map(u => {
      if (u.id !== id) return u
      const defaultPw = u.role === 'student' ? u.matric : u.username
      return { ...u, password: defaultPw, mustChangePassword: true }
    }))
  }

  // Admin: get all accounts (seed + created)
  function getAllUsers() { return allUsers(accounts) }

  // ── Registrations ─────────────────────────────────────────────────────────
  function submitRegistration({ studentId, studentName, matric, department, level, courses, totalUnits }) {
    setRegistrations(prev => {
      const existIdx = prev.findIndex(r => r.studentId === studentId && !['approved','rejected'].includes(r.status))
      const reg = {
        id: existIdx >= 0 ? prev[existIdx].id : `REG-${Date.now()}`,
        studentId, studentName, matric, department, level,
        semester: 'First', session: '2024/2025', courses, totalUnits,
        submittedAt: new Date().toISOString(), status: 'submitted',
        approvals: {
          adviser:          { status:'pending',by:null,at:null,comment:null },
          hod:              { status:'pending',by:null,at:null,comment:null },
          schoolofficer:    { status:'pending',by:null,at:null,comment:null },
          academicplanning: { status:'pending',by:null,at:null,comment:null },
          registry:         { status:'pending',by:null,at:null,comment:null },
        },
      }
      if (existIdx >= 0) { const n = [...prev]; n[existIdx] = reg; return n }
      return [...prev, reg]
    })
  }

  function approveRegistration({ regId, stage, approverName, comment }) {
    setRegistrations(prev => prev.map(r => {
      if (r.id !== regId) return r
      const stageData = WORKFLOW_STAGES.find(s => s.key === stage)
      return { ...r, status: stageData.statusAfter, approvals: { ...r.approvals, [stage]: { status:'approved', by:approverName, at:new Date().toISOString(), comment:comment||null } } }
    }))
  }

  function rejectRegistration({ regId, stage, approverName, comment }) {
    setRegistrations(prev => prev.map(r => {
      if (r.id !== regId) return r
      return { ...r, status:'rejected', approvals: { ...r.approvals, [stage]: { status:'rejected', by:approverName, at:new Date().toISOString(), comment:comment||null } } }
    }))
  }

  function getStudentRegs(studentId) { return registrations.filter(r => r.studentId === studentId) }

  function getPendingForStage(stage) {
    const required = { adviser:'submitted', hod:'adviser_approved', schoolofficer:'hod_approved', academicplanning:'officer_approved', registry:'academic_approved' }
    return registrations.filter(r => r.status === required[stage])
  }

  function getCourseStats() {
    return COURSES.map(c => ({
      ...c,
      studentCount: registrations.filter(r => r.status !== 'rejected' && r.courses.includes(c.id)).length,
    }))
  }

  function getRegistrationStats() {
    return {
      total:          registrations.length,
      permanent:      registrations.filter(r => r.status === 'approved').length,
      temporary:      registrations.filter(r => ['hod_approved','officer_approved','academic_approved'].includes(r.status)).length,
      pending:        registrations.filter(r => ['submitted','adviser_approved'].includes(r.status)).length,
      rejected:       registrations.filter(r => r.status === 'rejected').length,
      uniqueStudents: new Set(registrations.map(r => r.studentId)).size,
    }
  }

  return (
    <AppContext.Provider value={{
      user, login, logout, changePassword, updateProfile,
      accounts, getAllUsers,
      adminCreateAccount, adminEditAccount, adminToggleActive, adminResetPassword,
      registrations, submitRegistration, approveRegistration, rejectRegistration,
      getStudentRegs, getPendingForStage, getCourseStats, getRegistrationStats,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
