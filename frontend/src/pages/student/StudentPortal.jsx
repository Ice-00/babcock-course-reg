import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { COURSES } from '../../data/mockData'
import { fmt } from '../../hooks/utils'
import {
  SidebarLayout, PageHeader, Card, StatCard, Btn,
  Badge, ApprovalTimeline, DigitalForm, Empty,
} from '../../components/UI'

const ACCENT = '#4A9EE0'

function Dashboard({ user, setPage }) {
  const { getStudentRegs } = useApp()
  const regs   = getStudentRegs(user.id)
  const latest = regs[regs.length - 1]

  return (
    <div className="fade-up">
      <PageHeader
        title={`Welcome, ${user.name.split(' ')[0]}`}
        subtitle={`${user.department} · ${user.level} Level`}
        accentColor={ACCENT}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon="📋" value={regs.length}                                                                   label="Total Registrations"  color={ACCENT} />
        <StatCard icon="✅" value={regs.filter(r => r.status === 'approved').length}                              label="Permanently Approved"  color="#3DB87A" />
        <StatCard icon="⏳" value={regs.filter(r => !['approved','rejected'].includes(r.status)).length}          label="In Progress"           color="var(--gold)" />
      </div>

      {/* Workflow steps */}
      <Card style={{ marginBottom: 20, borderColor: ACCENT + '30' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
          Approval Workflow
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
          {[
            { icon: '📝', label: 'You Submit',       color: ACCENT   },
            { icon: '📚', label: 'Course Adviser',   color: '#3DB87A' },
            { icon: '🏢', label: 'HOD (Temp)',       color: '#8B5CF6' },
            { icon: '👮', label: 'School Officer',   color: ACCENT    },
            { icon: '📊', label: 'Academic Planning',color: '#E8A030' },
            { icon: '🏛', label: 'Registry (Final)', color: '#3DB87A' },
            { icon: '🖨', label: 'Print Form',       color: '#3DB87A' },
          ].map((s, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 9, color: s.color, textAlign: 'center', maxWidth: 60, fontWeight: 600 }}>{s.label}</div>
              </div>
              {i < arr.length - 1 && <div style={{ width: 18, height: 1, background: 'var(--border)', margin: '0 3px', flexShrink: 0, marginBottom: 12 }} />}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12 }}>
          🖨 Printing is only available after <strong style={{ color: '#3DB87A' }}>Registry grants permanent approval</strong>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>My Profile</div>
          {[
            ['Full Name',  user.name],
            ['Matric No.', user.matric],
            ['Department', user.department],
            ['Level',      user.level + ' Level'],
            ['Faculty',    user.faculty],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>{k}</span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Latest Registration</div>
          {latest ? (
            <>
              <div style={{ marginBottom: 10 }}><Badge status={latest.status} /></div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                Units: <strong style={{ color: 'var(--text)' }}>{latest.totalUnits}</strong>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
                Submitted: <strong style={{ color: 'var(--text)' }}>{fmt(latest.submittedAt)}</strong>
              </div>
              <ApprovalTimeline approvals={latest.approvals} />
              {latest.status === 'approved' && (
                <div style={{ marginTop: 14, padding: '10px 14px', background: '#3DB87A15', border: '1px solid #3DB87A40', borderRadius: 8, fontSize: 12, color: '#3DB87A', fontWeight: 600 }}>
                  🖨 Your form is ready to print!
                </div>
              )}
              <Btn size="sm" variant="ghost" style={{ marginTop: 14 }} onClick={() => setPage('my_regs')}>View All →</Btn>
            </>
          ) : (
            <Empty icon="📝" message="No registration yet">
              <Btn size="sm" style={{ marginTop: 14 }} onClick={() => setPage('register')}>Register Courses</Btn>
            </Empty>
          )}
        </Card>
      </div>
    </div>
  )
}

function RegisterCourses({ user }) {
  const { getStudentRegs, submitRegistration } = useApp()
  const existing = getStudentRegs(user.id).find(r => !['approved', 'rejected'].includes(r.status))
  const [selected, setSelected] = useState(existing ? existing.courses : [])
  const [done, setDone] = useState(false)

  const available = COURSES.filter(c =>
    c.level === user.level && (c.department === user.department || c.department === 'General')
  )
  const units = selected.reduce((a, id) => {
    const c = COURSES.find(x => x.id === id); return a + (c?.units || 0)
  }, 0)

  function toggle(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function submit() {
    submitRegistration({
      studentId: user.id, studentName: user.name, matric: user.matric,
      department: user.department, level: user.level,
      courses: selected, totalUnits: units,
    })
    setDone(true)
  }

  if (done) return (
    <div className="fade-up" style={{ maxWidth: 460, margin: '80px auto', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: '#3DB87A', marginBottom: 10 }}>Submitted!</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 8 }}>Your registration is now with the Course Adviser for review.</p>
      <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 28 }}>
        Workflow: Course Adviser → HOD (Temp) → School Officer → Academic Planning → Registry (Permanent) → Print
      </p>
      <Btn variant="ghost" onClick={() => setDone(false)}>Register Again</Btn>
    </div>
  )

  return (
    <div className="fade-up">
      <PageHeader title="Register Courses" subtitle={`${user.level} Level · ${user.department} · First Semester 2024/2025`} accentColor={ACCENT} />

      {existing && (
        <div style={{ background: '#C9993A15', border: '1px solid #C9993A40', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: 'var(--gold)', marginBottom: 20 }}>
          ⚠ You have a pending registration. Resubmitting will update and restart the approval process from the beginning.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Available Courses</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {available.map(c => {
              const active = selected.includes(c.id)
              return (
                <div key={c.id} onClick={() => toggle(c.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  borderRadius: 10, cursor: 'pointer', transition: 'all .15s',
                  border: `1px solid ${active ? ACCENT : 'var(--border)'}`,
                  background: active ? ACCENT + '10' : 'var(--surface2)',
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `2px solid ${active ? ACCENT : 'var(--border)'}`, background: active ? ACCENT : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
                    {active && <span style={{ color: '#0A0E14', fontSize: 13, fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{c.code} · {c.department}</div>
                  </div>
                  <div style={{ background: ACCENT + '20', color: ACCENT, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{c.units}u</div>
                </div>
              )
            })}
          </div>
        </Card>

        <div style={{ position: 'sticky', top: 0 }}>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Summary</div>
            <div style={{ minHeight: 80, marginBottom: 14 }}>
              {selected.length === 0
                ? <span style={{ color: 'var(--muted)', fontSize: 13 }}>No courses selected</span>
                : selected.map(id => {
                    const c = COURSES.find(x => x.id === id)
                    return c ? (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                        <span>{c.code}</span><span style={{ color: 'var(--muted)' }}>{c.units}u</span>
                      </div>
                    ) : null
                  })
              }
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid var(--border)', fontWeight: 700, marginBottom: 6 }}>
              <span>Total Units</span>
              <span style={{ color: units >= 15 && units <= 24 ? 'var(--green)' : 'var(--red)' }}>{units}</span>
            </div>
            {units > 0 && units < 15 && <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 12 }}>⚠ Minimum 15 units required</div>}
            {units > 24              && <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 12 }}>⚠ Maximum 24 units allowed</div>}
            <Btn onClick={submit} disabled={!selected.length || units < 15 || units > 24} style={{ width: '100%' }} size="lg">
              Submit Registration
            </Btn>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MyRegistrations({ user }) {
  const { getStudentRegs } = useApp()
  const regs    = getStudentRegs(user.id)
  const [viewing, setViewing] = useState(null)

  if (viewing) {
    const reg     = regs.find(r => r.id === viewing)
    const courses = reg.courses.map(id => COURSES.find(c => c.id === id)).filter(Boolean)
    return (
      <div className="fade-up">
        <button onClick={() => setViewing(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', marginBottom: 20 }}>← Back</button>
        <DigitalForm reg={reg} courses={courses} />
      </div>
    )
  }

  return (
    <div className="fade-up">
      <PageHeader title="My Registrations" subtitle="Track your registration through the approval pipeline" accentColor={ACCENT} />
      {regs.length === 0
        ? <Empty icon="📋" message="No registrations yet." />
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {regs.map(r => (
              <Card key={r.id} onClick={() => setViewing(r.id)} style={{ borderColor: r.status === 'approved' ? '#3DB87A50' : 'var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{r.id}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
                      {r.session} · {r.semester} Semester · {r.courses.length} courses ({r.totalUnits} units)
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>Submitted: {fmt(r.submittedAt)}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <Badge status={r.status} />
                    {r.status === 'approved' && <span style={{ fontSize: 11, fontWeight: 700, color: '#3DB87A' }}>🖨 Ready to Print</span>}
                    {['hod_approved','officer_approved','academic_approved'].includes(r.status) && <span style={{ fontSize: 10, color: '#E8C06A' }}>◐ Temporarily Approved</span>}
                    <span style={{ fontSize: 11, color: ACCENT }}>View Details →</span>
                  </div>
                </div>
                <ApprovalTimeline approvals={r.approvals} />
              </Card>
            ))}
          </div>
        )
      }
    </div>
  )
}

// ── MY PROFILE ────────────────────────────────────────────────────────────────
function MyProfile({ user }) {
  const { updateProfile } = useApp()
  const [phone, setPhone]     = useState(user.phone || '')
  const [pw,    setPw]        = useState('')
  const [pw2,   setPw2]       = useState('')
  const [saved, setSaved]     = useState('')
  const [err,   setErr]       = useState('')

  function savePhone() {
    setErr(''); setSaved('')
    updateProfile(user.id, { phone })
    setSaved('Phone number updated.')
    setTimeout(() => setSaved(''), 3000)
  }

  function savePassword() {
    setErr(''); setSaved('')
    if (pw.length < 6)  return setErr('Password must be at least 6 characters.')
    if (pw !== pw2)      return setErr('Passwords do not match.')
    updateProfile(user.id, { password: pw })
    setPw(''); setPw2('')
    setSaved('Password changed successfully.')
    setTimeout(() => setSaved(''), 3000)
  }

  const inputStyle = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 13,
    fontFamily: "'Jost',sans-serif", outline: 'none',
  }

  return (
    <div className="fade-up">
      <PageHeader title="My Profile" subtitle="View your details and update your contact info or password" accentColor={ACCENT} />

      {saved && <div style={{ background:'#3DB87A15', border:'1px solid #3DB87A40', borderRadius:8, padding:'10px 14px', color:'var(--green)', fontSize:13, marginBottom:16 }}>✓ {saved}</div>}
      {err   && <div style={{ background:'#E0545415', border:'1px solid #E0545440', borderRadius:8, padding:'10px 14px', color:'var(--red)',   fontSize:13, marginBottom:16 }}>{err}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Read-only info */}
        <Card>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:16 }}>Academic Information</div>
          <div style={{ fontSize:11, color:'var(--muted)', marginBottom:12, padding:'8px 12px', background:'var(--surface2)', borderRadius:6 }}>
            🔒 These details are set by the administrator and cannot be changed here.
          </div>
          {[
            ['Full Name',   user.name],
            ['Username',    user.username],
            ['Matric No.',  user.matric],
            ['Department',  user.department || '—'],
            ['Faculty',     user.faculty    || '—'],
            ['Level',       user.level ? user.level + ' Level' : '—'],
          ].map(([k, v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
              <span style={{ color:'var(--muted)' }}>{k}</span>
              <span style={{ fontWeight:600, color: k === 'Matric No.' ? 'var(--gold)' : 'var(--text)', fontFamily: k === 'Matric No.' || k === 'Username' ? 'monospace' : 'inherit' }}>{v}</span>
            </div>
          ))}
        </Card>

        {/* Editable fields */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Phone */}
          <Card>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:14 }}>Phone Number</div>
            <input
              value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 08012345678"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = ACCENT }}
              onBlur={e  => { e.target.style.borderColor = 'var(--border)' }}
            />
            <div style={{ marginTop:10 }}>
              <Btn size="sm" variant="secondary" onClick={savePhone}>Save Phone Number</Btn>
            </div>
          </Card>

          {/* Password */}
          <Card>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:14 }}>Change Password</div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:10, fontWeight:700, color:'var(--muted)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:1 }}>New Password</label>
              <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="At least 6 characters" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = ACCENT }}
                onBlur={e  => { e.target.style.borderColor = 'var(--border)' }}
              />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:10, fontWeight:700, color:'var(--muted)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:1 }}>Confirm New Password</label>
              <input type="password" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Repeat new password" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = ACCENT }}
                onBlur={e  => { e.target.style.borderColor = 'var(--border)' }}
                onKeyDown={e => e.key === 'Enter' && savePassword()}
              />
            </div>
            <Btn size="sm" variant="secondary" onClick={savePassword}>Change Password</Btn>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function StudentPortal() {
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const [page, setPage] = useState('dashboard')

  if (!user || user.role !== 'student') { navigate('/'); return null }

  const navItems = [
    { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { id: 'register',  icon: '＋', label: 'Register Courses' },
    { id: 'my_regs',   icon: '📋', label: 'My Registrations' },
    { id: 'profile',   icon: '👤', label: 'My Profile' },
  ]

  const pages = {
    dashboard: <Dashboard user={user} setPage={setPage} />,
    register:  <RegisterCourses user={user} />,
    my_regs:   <MyRegistrations user={user} />,
    profile:   <MyProfile user={user} />,
  }

  return (
    <SidebarLayout
      accentColor={ACCENT} portalLabel="Student Portal"
      navItems={navItems} user={user}
      onLogout={() => { logout(); navigate('/') }}
      activePage={page} setPage={setPage}
    >
      {pages[page]}
    </SidebarLayout>
  )
}
