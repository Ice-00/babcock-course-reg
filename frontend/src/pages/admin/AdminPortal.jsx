import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, validateMatric } from '../../context/AppContext'
import { COURSES, STATUS_META, ROLE_META, WORKFLOW_STAGES } from '../../data/mockData'
import { fmt } from '../../hooks/utils'
import { SidebarLayout, PageHeader, Card, StatCard, Badge, Empty, Table, Btn } from '../../components/UI'

const ACCENT  = '#E05454'
const ROLES   = ['student','adviser','hod','schoolofficer','academicplanning','registry','admin']
const LEVELS  = ['100','200','300','400','500']

// ── Shared form input ─────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:10, fontWeight:700, color:'var(--muted)', marginBottom:5, textTransform:'uppercase', letterSpacing:1 }}>{label}</label>
      {children}
      {error && <div style={{ fontSize:11, color:'var(--red)', marginTop:4 }}>{error}</div>}
    </div>
  )
}

function FInput({ value, onChange, placeholder, type='text', disabled }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} style={{
      width:'100%', background: disabled ? 'var(--bg)' : 'var(--surface2)', border:'1px solid var(--border)', borderRadius:8,
      padding:'9px 13px', color: disabled ? 'var(--muted)' : 'var(--text)', fontSize:13,
      fontFamily:"'Jost',sans-serif", outline:'none', transition:'border .2s',
    }}
      onFocus={e => { if (!disabled) e.target.style.borderColor='var(--gold)' }}
      onBlur={e  => { e.target.style.borderColor='var(--border)' }}
    />
  )
}

function FSelect({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange} style={{ width:'100%', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, padding:'9px 13px', color:'var(--text)', fontSize:13, fontFamily:"'Jost',sans-serif", outline:'none', cursor:'pointer' }}>
      {children}
    </select>
  )
}

function RoleBadge({ role }) {
  const meta = ROLE_META[role] || { label: role, color: '#607A96' }
  return <span style={{ padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, background:meta.color+'22', color:meta.color, border:`1px solid ${meta.color}44`, whiteSpace:'nowrap' }}>{meta.label}</span>
}

// ── CREATE / EDIT USER MODAL ──────────────────────────────────────────────────
function UserModal({ existing, onClose }) {
  const { adminCreateAccount, adminEditAccount } = useApp()
  const isEdit = !!existing

  const [form, setForm] = useState({
    name:       existing?.name       || '',
    username:   existing?.username   || '',
    role:       existing?.role       || 'student',
    matric:     existing?.matric     || '',
    department: existing?.department || '',
    faculty:    existing?.faculty    || '',
    level:      existing?.level      || '300',
    phone:      existing?.phone      || '',
  })
  const [errors, setErrors] = useState({})
  const [globalErr, setGlobalErr] = useState('')

  function setF(k, v) { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })) }

  function validate() {
    const e = {}
    if (!form.name.trim())     e.name     = 'Full name is required.'
    if (!form.username.trim()) e.username = 'Username is required.'
    if (form.role === 'student') {
      const me = validateMatric(form.matric)
      if (me) e.matric = me
      if (!form.department.trim()) e.department = 'Department is required.'
      if (!form.faculty.trim())    e.faculty    = 'Faculty is required.'
    }
    return e
  }

  function submit() {
    setGlobalErr('')
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    if (isEdit) {
      const result = adminEditAccount(existing.id, {
        name: form.name, department: form.department,
        faculty: form.faculty, level: form.level,
        matric: form.role === 'student' ? form.matric : null,
        phone: form.phone,
      })
      if (!result.ok) { setGlobalErr(result.error); return }
    } else {
      const result = adminCreateAccount(form)
      if (!result.ok) { setGlobalErr(result.error); return }
    }
    onClose()
  }

  const isStudent = form.role === 'student'

  return (
    <div style={{ position:'fixed', inset:0, background:'#000000CC', zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:32, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:ACCENT }}>{isEdit ? 'Edit Account' : 'Create New Account'}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:20, cursor:'pointer', lineHeight:1 }}>✕</button>
        </div>

        {globalErr && <div style={{ background:'#E0545415', border:'1px solid #E0545440', borderRadius:8, padding:'10px 14px', color:'var(--red)', fontSize:12, marginBottom:16 }}>{globalErr}</div>}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
          <div style={{ gridColumn:'1/-1' }}>
            <Field label="Full Name *" error={errors.name}>
              <FInput value={form.name} onChange={e => setF('name', e.target.value)} placeholder="e.g. Adebayo Tunde" />
            </Field>
          </div>

          <Field label="Username *" error={errors.username}>
            <FInput value={form.username} onChange={e => setF('username', e.target.value)} placeholder="e.g. adebayo22" disabled={isEdit} />
          </Field>

          <Field label="Role *">
            <FSelect value={form.role} onChange={e => setF('role', e.target.value)}>
              {ROLES.map(r => <option key={r} value={r}>{ROLE_META[r]?.label || r}</option>)}
            </FSelect>
          </Field>

          {isStudent && (
            <>
              <Field label="Matric Number *" error={errors.matric}>
                <FInput value={form.matric} onChange={e => setF('matric', e.target.value)} placeholder="e.g. 22/0123" disabled={isEdit} />
              </Field>
              <Field label="Level">
                <FSelect value={form.level} onChange={e => setF('level', e.target.value)}>
                  {LEVELS.map(l => <option key={l} value={l}>{l} Level</option>)}
                </FSelect>
              </Field>
              <div style={{ gridColumn:'1/-1' }}>
                <Field label="Department *" error={errors.department}>
                  <FInput value={form.department} onChange={e => setF('department', e.target.value)} placeholder="e.g. Computer Science" />
                </Field>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <Field label="Faculty *" error={errors.faculty}>
                  <FInput value={form.faculty} onChange={e => setF('faculty', e.target.value)} placeholder="e.g. Computing & Applied Sciences" />
                </Field>
              </div>
            </>
          )}

          {!isStudent && (
            <>
              <Field label="Department">
                <FInput value={form.department} onChange={e => setF('department', e.target.value)} placeholder="Optional" />
              </Field>
              <Field label="Faculty">
                <FInput value={form.faculty} onChange={e => setF('faculty', e.target.value)} placeholder="Optional" />
              </Field>
            </>
          )}

          <div style={{ gridColumn:'1/-1' }}>
            <Field label="Phone Number">
              <FInput value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="Optional" />
            </Field>
          </div>
        </div>

        {!isEdit && (
          <div style={{ padding:'10px 14px', background:'#3DB87A10', border:'1px solid #3DB87A30', borderRadius:8, fontSize:12, color:'#3DB87A', marginBottom:20 }}>
            🔑 Default password for students will be their matric number. For staff it will be their username. They will be required to change it on first login.
          </div>
        )}

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant={isEdit ? 'secondary' : 'primary'} onClick={submit}>{isEdit ? 'Save Changes' : 'Create Account'}</Btn>
        </div>
      </div>
    </div>
  )
}

// ── MANAGE USERS PAGE ─────────────────────────────────────────────────────────
function ManageUsers() {
  const { getAllUsers, adminToggleActive, adminResetPassword } = useApp()
  const users = getAllUsers()
  const [modal, setModal]     = useState(null)   // null | 'create' | {user}
  const [search, setSearch]   = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [toast, setToast]     = useState('')

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3500) }

  function handleReset(u) {
    adminResetPassword(u.id)
    showToast(`✓ Password reset to ${u.role === 'student' ? 'matric number' : 'username'} for ${u.name}`)
  }

  function handleToggle(u) {
    adminToggleActive(u.id)
    showToast(`${u.isActive === false ? '✓ Account reactivated' : '⊘ Account deactivated'}: ${u.name}`)
  }

  const filtered = users.filter(u => {
    const matchRole   = roleFilter === 'all' || u.role === roleFilter
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase()) || (u.matric || '').includes(search)
    return matchRole && matchSearch
  })

  return (
    <div className="fade-up">
      <PageHeader
        title="Manage Users"
        subtitle="All registered system users — admin-controlled account creation"
        accentColor={ACCENT}
        action={<Btn onClick={() => setModal('create')} size="sm">+ Create Account</Btn>}
      />

      {toast && <div style={{ background:'#3DB87A15', border:'1px solid #3DB87A40', borderRadius:8, padding:'10px 16px', color:'var(--green)', fontSize:13, marginBottom:16 }}>{toast}</div>}

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name, username, matric..."
          style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 14px', color:'var(--text)', fontSize:13, fontFamily:"'Jost',sans-serif", outline:'none', width:260 }}
        />
        <div style={{ display:'flex', gap:6 }}>
          {['all',...ROLES].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} style={{ padding:'6px 12px', borderRadius:20, fontSize:11, cursor:'pointer', fontFamily:"'Jost',sans-serif", border:`1px solid ${roleFilter===r ? ACCENT+'50' : 'var(--border)'}`, background:roleFilter===r ? ACCENT+'20' : 'transparent', color:roleFilter===r ? ACCENT : 'var(--muted)' }}>
              {r === 'all' ? 'All' : ROLE_META[r]?.label || r}
            </button>
          ))}
        </div>
      </div>

      <Card style={{ padding:0, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'var(--surface2)' }}>
              {['Name & Username','Role','Matric / Dept','Status','Actions'].map(h => (
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:10, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, borderBottom:'1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ padding:'32px', textAlign:'center', color:'var(--muted)' }}>No users found</td></tr>
            )}
            {filtered.map((u, i) => (
              <tr key={u.id || u.username} style={{ borderBottom:'1px solid var(--border)', background: u.isActive===false ? '#E0545408' : i%2===0 ? 'var(--surface)' : 'var(--surface2)', opacity: u.isActive===false ? 0.65 : 1 }}>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ fontWeight:700 }}>{u.name}</div>
                  <div style={{ fontSize:11, color:'var(--muted)', marginTop:2, fontFamily:'monospace' }}>{u.username}</div>
                  {u.mustChangePassword && <div style={{ fontSize:9, color:'#E8C06A', marginTop:3, fontWeight:700 }}>⚠ Must change password</div>}
                  {u.createdAt && <div style={{ fontSize:9, color:'var(--muted)', marginTop:2 }}>Created {fmt(u.createdAt)}</div>}
                </td>
                <td style={{ padding:'12px 16px' }}><RoleBadge role={u.role} /></td>
                <td style={{ padding:'12px 16px' }}>
                  {u.matric && <div style={{ fontWeight:700, color:'var(--gold)', fontFamily:'monospace', fontSize:13 }}>{u.matric}</div>}
                  {u.department && <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{u.department}</div>}
                  {u.faculty && <div style={{ fontSize:11, color:'var(--muted)' }}>{u.faculty}</div>}
                  {u.level && <div style={{ fontSize:11, color:'var(--muted)' }}>{u.level} Level</div>}
                  {!u.matric && !u.department && <span style={{ color:'var(--muted)', fontSize:12 }}>—</span>}
                </td>
                <td style={{ padding:'12px 16px' }}>
                  <span style={{ fontSize:11, fontWeight:700, color: u.isActive===false ? 'var(--red)' : 'var(--green)' }}>
                    {u.isActive===false ? '⊘ Inactive' : '● Active'}
                  </span>
                </td>
                <td style={{ padding:'12px 16px' }}>
                  {/* Only admin-created accounts (have createdAt) can be edited/managed */}
                  {u.createdAt ? (
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      <button onClick={() => setModal(u)} style={{ padding:'5px 10px', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:6, cursor:'pointer', fontSize:11, color:'var(--text)', fontFamily:"'Jost',sans-serif" }}>✏ Edit</button>
                      <button onClick={() => handleReset(u)} style={{ padding:'5px 10px', background:'transparent', border:'1px solid #E8C06A40', borderRadius:6, cursor:'pointer', fontSize:11, color:'#E8C06A', fontFamily:"'Jost',sans-serif" }}>↺ Reset PW</button>
                      <button onClick={() => handleToggle(u)} style={{ padding:'5px 10px', background:'transparent', border:`1px solid ${u.isActive===false ? '#3DB87A40' : '#E0545440'}`, borderRadius:6, cursor:'pointer', fontSize:11, color: u.isActive===false ? 'var(--green)' : 'var(--red)', fontFamily:"'Jost',sans-serif" }}>
                        {u.isActive===false ? '✓ Activate' : '⊘ Deactivate'}
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize:11, color:'var(--muted)', fontStyle:'italic' }}>Seed account</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Matric format note */}
      <div style={{ marginTop:16, padding:'10px 16px', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, fontSize:12, color:'var(--muted)' }}>
        📋 Matric number format: <strong style={{ color:'var(--gold)', fontFamily:'monospace' }}>YY/NNNN</strong> — e.g. <code style={{ color:'var(--gold)' }}>22/0123</code>, <code style={{ color:'var(--gold)' }}>23/0456</code>
      </div>

      {modal && (
        <UserModal
          existing={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

// ── MANAGE COURSES ────────────────────────────────────────────────────────────
function ManageCourses() {
  const { getCourseStats } = useApp()
  const courseStats = getCourseStats()
  return (
    <div className="fade-up">
      <PageHeader title="Manage Courses" subtitle="Course catalog with live student enrollment counts" accentColor={ACCENT} />
      <Card>
        <Table
          headers={['#','Code','Course Title','Dept','Level','Units','Students Enrolled']}
          rows={courseStats.map((c, i) => [
            <span style={{ color:'var(--muted)' }}>{i+1}</span>,
            <span style={{ fontWeight:700, color:'var(--gold)' }}>{c.code}</span>,
            c.title,
            <span style={{ color:'var(--muted)' }}>{c.department}</span>,
            c.level,
            <span style={{ fontWeight:700 }}>{c.units}</span>,
            <span style={{ fontWeight:700, color:c.studentCount>0?'#3DB87A':'var(--muted)', background:c.studentCount>0?'#3DB87A15':'transparent', padding:'3px 10px', borderRadius:20, fontSize:12 }}>
              {c.studentCount} student{c.studentCount!==1?'s':''}
            </span>,
          ])}
        />
      </Card>
    </div>
  )
}

// ── ALL REGISTRATIONS ─────────────────────────────────────────────────────────
function AllRegistrations({ registrations }) {
  const [filter, setFilter] = useState('all')
  const labels = { all:'All', submitted:'Pending Adviser', adviser_approved:'Pending HOD', hod_approved:'Temp Approved', officer_approved:'Pending Academic', academic_approved:'Pending Registry', approved:'Permanently Approved', rejected:'Rejected' }
  const filtered = filter==='all' ? registrations : registrations.filter(r=>r.status===filter)
  return (
    <div className="fade-up">
      <PageHeader title="All Registrations" subtitle="Complete registration history" accentColor={ACCENT} />
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
        {Object.entries(labels).map(([s,l]) => (
          <button key={s} onClick={()=>setFilter(s)} style={{ padding:'6px 14px', borderRadius:20, fontSize:11, cursor:'pointer', background:filter===s?ACCENT+'20':'transparent', color:filter===s?ACCENT:'var(--muted)', border:`1px solid ${filter===s?ACCENT+'50':'var(--border)'}`, fontFamily:"'Jost',sans-serif" }}>{l}</button>
        ))}
      </div>
      <Card>
        <Table
          headers={['Reg ID','Student','Matric','Dept','Units','Submitted','Status']}
          rows={filtered.map(r=>[
            <span style={{ color:ACCENT, fontWeight:700 }}>{r.id}</span>,
            <span style={{ fontWeight:600 }}>{r.studentName}</span>,
            <span style={{ color:'var(--muted)', fontFamily:'monospace' }}>{r.matric}</span>,
            r.department,
            <span style={{ fontWeight:700 }}>{r.totalUnits}</span>,
            <span style={{ color:'var(--muted)', fontSize:11 }}>{fmt(r.submittedAt)}</span>,
            <Badge status={r.status} />,
          ])}
        />
      </Card>
    </div>
  )
}

// ── REPORTS ───────────────────────────────────────────────────────────────────
function Reports({ registrations }) {
  const { getRegistrationStats, getCourseStats } = useApp()
  const stats      = getRegistrationStats()
  const courseStats = getCourseStats()
  const total      = Math.max(registrations.length, 1)
  const topCourses = [...courseStats].sort((a,b)=>b.studentCount-a.studentCount).slice(0,5)

  return (
    <div className="fade-up">
      <PageHeader title="Reports & Analytics" subtitle="Live registration statistics" accentColor={ACCENT} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        <StatCard icon="👥" value={stats.uniqueStudents} label="Students Registered"    color="var(--blue)"  />
        <StatCard icon="✅" value={stats.permanent}      label="Permanently Approved"   color="var(--green)" sub="🖨 Can print" />
        <StatCard icon="◐"  value={stats.temporary}      label="Temporarily Approved"   color="#E8C06A"       sub="Awaiting final stages" />
        <StatCard icon="⏳" value={stats.pending}        label="Pending (Early Stages)" color="var(--gold)"  />
        <StatCard icon="✗"  value={stats.rejected}       label="Rejected"               color="var(--red)"   />
        <StatCard icon="📋" value={stats.total}          label="Total Registrations"    color={ACCENT}       />
      </div>

      <Card style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:18 }}>Status Breakdown</div>
        {Object.entries(STATUS_META).map(([s,m]) => {
          const count = registrations.filter(r=>r.status===s).length
          return (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div style={{ width:160, fontSize:11, color:'var(--muted)', textAlign:'right', flexShrink:0 }}>{m.label}</div>
              <div style={{ flex:1, background:'var(--surface2)', borderRadius:20, height:8, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${(count/total)*100}%`, background:m.color, borderRadius:20, transition:'width .6s ease', minWidth:count>0?8:0 }} />
              </div>
              <div style={{ width:28, fontSize:13, fontWeight:700, color:m.color, flexShrink:0 }}>{count}</div>
            </div>
          )
        })}
      </Card>

      <Card>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:16 }}>Most Enrolled Courses</div>
        {topCourses.every(c=>c.studentCount===0)
          ? <div style={{ color:'var(--muted)', fontSize:13 }}>No registrations yet</div>
          : topCourses.map((c,i) => (
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div style={{ width:24, fontWeight:700, color:'var(--muted)', fontSize:12 }}>#{i+1}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{c.title}</div>
                <div style={{ fontSize:11, color:'var(--muted)' }}>{c.code} · {c.units} units</div>
              </div>
              <div style={{ background:'#3DB87A20', color:'#3DB87A', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700 }}>
                {c.studentCount} student{c.studentCount!==1?'s':''}
              </div>
            </div>
          ))
        }
      </Card>
    </div>
  )
}

// ── WORKFLOW STATUS ───────────────────────────────────────────────────────────
function WorkflowStatus({ registrations }) {
  const pipeline = [
    { label:'Submitted by Student',          filter:r=>r.status==='submitted',         color:'#4A9EE0', icon:'📝' },
    { label:'Approved by Course Adviser',    filter:r=>r.status==='adviser_approved',   color:'#3DB87A', icon:'📚' },
    { label:'Temp Approved by HOD',          filter:r=>r.status==='hod_approved',       color:'#8B5CF6', icon:'◐'  },
    { label:'Approved by School Officer',    filter:r=>r.status==='officer_approved',   color:'#4A9EE0', icon:'👮' },
    { label:'Approved by Academic Planning', filter:r=>r.status==='academic_approved',  color:'#E8A030', icon:'📊' },
    { label:'Permanently Approved (Registry)',filter:r=>r.status==='approved',          color:'#3DB87A', icon:'🏛' },
    { label:'Rejected',                      filter:r=>r.status==='rejected',           color:'#E05454', icon:'✗'  },
  ]
  return (
    <div className="fade-up">
      <PageHeader title="Workflow Status" subtitle="Live approval pipeline view" accentColor={ACCENT} />
      {pipeline.map((s,i) => {
        const items = registrations.filter(s.filter)
        return (
          <Card key={i} style={{ marginBottom:14, borderColor:s.color+'30' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:items.length?14:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:s.color+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{s.icon}</div>
                <div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{s.label}</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>Stage {i+1}</div>
                </div>
              </div>
              <div style={{ fontSize:26, fontWeight:700, color:s.color }}>{items.length}</div>
            </div>
            {items.length>0 && (
              <Table
                headers={['Student','Matric','Units','Submitted']}
                rows={items.map(r=>[
                  <span style={{ fontWeight:600 }}>{r.studentName}</span>,
                  <span style={{ color:'var(--muted)', fontFamily:'monospace' }}>{r.matric}</span>,
                  <span style={{ fontWeight:700 }}>{r.totalUnits}</span>,
                  <span style={{ color:'var(--muted)', fontSize:11 }}>{fmt(r.submittedAt)}</span>,
                ])}
              />
            )}
          </Card>
        )
      })}
    </div>
  )
}

// ── ADMIN PORTAL ──────────────────────────────────────────────────────────────
export default function AdminPortal() {
  const { user, logout, registrations, getRegistrationStats, getAllUsers } = useApp()
  const navigate = useNavigate()
  const [page, setPage] = useState('dashboard')

  if (!user || user.role !== 'admin') { navigate('/'); return null }

  const stats     = getRegistrationStats()
  const allUsers  = getAllUsers()
  const totalAccounts = allUsers.length
  const newAccounts   = allUsers.filter(u => u.mustChangePassword).length

  const navItems = [
    { id:'dashboard',     icon:'⊞', label:'Dashboard' },
    { id:'users',         icon:'👥', label:'Manage Users',       badge: newAccounts },
    { id:'courses',       icon:'📚', label:'Manage Courses' },
    { id:'registrations', icon:'📋', label:'All Registrations' },
    { id:'reports',       icon:'📊', label:'Reports & Analytics' },
    { id:'workflow',      icon:'🔁', label:'Workflow Status' },
  ]

  const pages = {
    dashboard: (
      <div className="fade-up">
        <PageHeader title="Admin Dashboard" subtitle="Babcock University — Paperless Course Registration System" accentColor={ACCENT} />

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
          <StatCard icon="👥" value={totalAccounts}     label="Total Users"           color="var(--blue)"   />
          <StatCard icon="📚" value={COURSES.length}    label="Total Courses"         color="var(--purple)" />
          <StatCard icon="✅" value={stats.permanent}   label="Permanently Approved"  color="var(--green)"  />
          <StatCard icon="◐"  value={stats.temporary}   label="Temporarily Approved"  color="#E8C06A"        />
        </div>

        {newAccounts > 0 && (
          <Card onClick={() => setPage('users')} style={{ borderColor:'#E8C06A40', cursor:'pointer', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ fontSize:26 }}>⚠️</div>
              <div>
                <div style={{ fontWeight:600 }}>{newAccounts} account{newAccounts!==1?'s':''} waiting for first login (default password still active)</div>
                <div style={{ fontSize:12, color:'#E8C06A', marginTop:3 }}>Click to view users →</div>
              </div>
            </div>
          </Card>
        )}

        <div style={{ fontSize:12, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>Live Pipeline</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:24 }}>
          {[
            { label:'Pending Adviser',   count:registrations.filter(r=>r.status==='submitted').length,        color:'#3DB87A' },
            { label:'Pending HOD',       count:registrations.filter(r=>r.status==='adviser_approved').length,  color:'#8B5CF6' },
            { label:'Temp (HOD done)',   count:registrations.filter(r=>r.status==='hod_approved').length,      color:'#E8C06A' },
            { label:'Pending Academic',  count:registrations.filter(r=>r.status==='officer_approved').length,  color:'#E8A030' },
            { label:'Pending Registry',  count:registrations.filter(r=>r.status==='academic_approved').length, color:'#4A9EE0' },
          ].map(x => (
            <Card key={x.label} style={{ padding:16 }}>
              <div style={{ fontSize:22, fontWeight:700, color:x.color }}>{x.count}</div>
              <div style={{ fontSize:10, color:'var(--muted)', marginTop:4 }}>{x.label}</div>
            </Card>
          ))}
        </div>

        <Card>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Account Management</div>
          <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.8 }}>
            All user accounts — students and staff — are created here by the administrator. Students receive their matric number as the default password and are required to change it on first login. Staff receive their username as the default password.
          </div>
          <div style={{ marginTop:14 }}>
            <Btn size="sm" onClick={() => setPage('users')}>Go to Manage Users →</Btn>
          </div>
        </Card>
      </div>
    ),
    users:         <ManageUsers />,
    courses:       <ManageCourses />,
    registrations: <AllRegistrations registrations={registrations} />,
    reports:       <Reports registrations={registrations} />,
    workflow:      <WorkflowStatus registrations={registrations} />,
  }

  return (
    <SidebarLayout
      accentColor={ACCENT} portalLabel="Admin Portal"
      navItems={navItems} user={user}
      onLogout={() => { logout(); navigate('/') }}
      activePage={page} setPage={setPage}
    >
      {pages[page]}
    </SidebarLayout>
  )
}
