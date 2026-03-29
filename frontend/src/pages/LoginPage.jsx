import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ROLE_META } from '../data/mockData'

const BABCOCK_LOGO = 'https://babcock.edu.ng/curator/media/6981e3ee-aac8-48e8-882e-57bc104e7a8b.png?h=50&w=150&s=0341f68fd37c03d968cc0ace7cfe86d5'

const DEMOS = [
  { label: 'Student',           username: 'student1',  password: 'pass',  color: '#4A9EE0' },
  { label: 'Course Adviser',    username: 'adviser1',  password: 'pass',  color: '#3DB87A' },
  { label: 'HOD',               username: 'hod1',      password: 'pass',  color: '#8B5CF6' },
  { label: 'School Officer',    username: 'officer1',  password: 'pass',  color: '#4A9EE0' },
  { label: 'Academic Planning', username: 'academic1', password: 'pass',  color: '#E8A030' },
  { label: 'Registry',          username: 'registry1', password: 'pass',  color: '#3DB87A' },
  { label: 'Administrator',     username: 'admin',     password: 'admin', color: '#E05454' },
]

const FEATURES = [
  { icon: '📋', title: 'Digital Registration',   desc: 'Register courses entirely online — no queues, no paper' },
  { icon: '🔁', title: 'Multi-Stage Approval',   desc: '5-stage workflow from Adviser to Registry, fully tracked' },
  { icon: '📊', title: 'Live Progress Tracking', desc: 'Students see exactly where their form is at all times' },
  { icon: '🖨', title: 'Printable Course Form',  desc: 'Official form unlocked only after Registry permanent approval' },
]

// ── Shared dark input ─────────────────────────────────────────────────────────
function DarkInput({ label, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#3A5060', marginBottom:5, textTransform:'uppercase', letterSpacing:1 }}>{label}</label>}
      <input
        {...props}
        style={{
          width:'100%', background:'#0A1420', border:'1px solid #1E2D42',
          borderRadius:7, padding:'10px 14px', color:'#C8D8E8', fontSize:13,
          fontFamily:"'Jost',sans-serif", outline:'none', transition:'border .2s, box-shadow .2s',
        }}
        onFocus={e => { e.target.style.borderColor='#3DB87A'; e.target.style.boxShadow='0 0 0 3px #3DB87A12' }}
        onBlur={e  => { e.target.style.borderColor='#1E2D42'; e.target.style.boxShadow='none' }}
      />
    </div>
  )
}

function GreenBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:'100%', padding:'12px', borderRadius:8, border:'none', cursor: disabled ? 'not-allowed' : 'pointer',
      background:'linear-gradient(135deg,#3DB87A,#1A6C40)', color:'#fff',
      fontFamily:"'Jost',sans-serif", fontSize:14, fontWeight:700, letterSpacing:0.5,
      opacity: disabled ? 0.6 : 1, transition:'opacity .2s',
    }}>{children}</button>
  )
}

// ── Force-change password modal ───────────────────────────────────────────────
function ChangePasswordModal({ user, onDone }) {
  const { changePassword } = useApp()
  const [pw1, setPw1]   = useState('')
  const [pw2, setPw2]   = useState('')
  const [err, setErr]   = useState('')

  function submit() {
    setErr('')
    if (pw1.length < 6)      return setErr('Password must be at least 6 characters.')
    if (pw1 !== pw2)          return setErr('Passwords do not match.')
    if (pw1 === user.matric)  return setErr('New password cannot be the same as your matric number.')
    changePassword(user.id, pw1)
    onDone()
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'#000000CC', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#0F1620', border:'1px solid #1E2D42', borderRadius:16, padding:36, width:400, boxShadow:'0 24px 64px #00000080' }}>
        <div style={{ fontSize:28, marginBottom:12, textAlign:'center' }}>🔑</div>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:'#E8D5A0', textAlign:'center', marginBottom:6 }}>
          Set Your Password
        </h2>
        <p style={{ fontSize:12, color:'#607A96', textAlign:'center', marginBottom:24, lineHeight:1.6 }}>
          This is your first login. Your default password was your matric number.<br/>
          Please set a new secure password to continue.
        </p>

        {err && <div style={{ background:'#E0545415', border:'1px solid #E0545440', borderRadius:8, padding:'10px 14px', color:'#E05454', fontSize:12, marginBottom:16 }}>{err}</div>}

        <DarkInput label="New Password" type="password" value={pw1} onChange={e => setPw1(e.target.value)} placeholder="At least 6 characters" />
        <DarkInput label="Confirm New Password" type="password" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Repeat your new password" onKeyDown={e => e.key === 'Enter' && submit()} />
        <GreenBtn onClick={submit}>Save Password & Continue →</GreenBtn>

        <p style={{ fontSize:11, color:'#2A3A4A', textAlign:'center', marginTop:14 }}>
          You cannot skip this step. Contact the administrator if you have trouble.
        </p>
      </div>
    </div>
  )
}

// ── Main Login Page ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login }   = useApp()
  const navigate    = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [logoError, setLogoError] = useState(false)
  const [pendingUser, setPendingUser] = useState(null)  // triggers change-password modal

  function handleLogin() {
    setError('')
    const result = login(username, password)
    if (!result.ok) { setError(result.error); return }
    if (result.mustChangePassword) {
      setPendingUser(result.user)   // show modal before navigating
    } else {
      navigate(ROLE_META[result.user.role].portal, { replace: true })
    }
  }

  function handlePasswordChanged() {
    setPendingUser(null)
    navigate(ROLE_META[pendingUser.role].portal, { replace: true })
  }

  function fillDemo(u, p) { setUsername(u); setPassword(p); setError('') }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', position:'relative', overflow:'hidden' }}>

      {/* Password change modal */}
      {pendingUser && <ChangePasswordModal user={pendingUser} onDone={handlePasswordChanged} />}

      {/* Background */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 100% 70% at 0% 0%, #1A3A1A18 0%, transparent 55%), radial-gradient(ellipse 80% 60% at 100% 100%, #1A1A4A18 0%, transparent 55%)' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(#1E2D4210 1px, transparent 1px), linear-gradient(90deg, #1E2D4210 1px, transparent 1px)', backgroundSize:'56px 56px' }} />
        <div style={{ position:'absolute', top:'15%', left:'8%', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, #2D6A2D18 0%, transparent 70%)', filter:'blur(40px)' }} />
        <div style={{ position:'absolute', bottom:'20%', right:'10%', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle, #C9993A12 0%, transparent 70%)', filter:'blur(40px)' }} />
      </div>

      <div style={{ position:'relative', zIndex:1, display:'flex', minHeight:'100vh' }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 64px', borderRight:'1px solid #1E2D4240' }}>
          <div className="fade-up" style={{ marginBottom:48 }}>
            {/* Logo badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:18, marginBottom:32, padding:'14px 20px', background:'#ffffff08', border:'1px solid #ffffff14', borderRadius:14 }}>
              {!logoError
                ? <img src={BABCOCK_LOGO} alt="Babcock University" onError={() => setLogoError(true)} style={{ height:44, objectFit:'contain', filter:'brightness(1.1)' }} />
                : <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#2D6A2D,#C9993A)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🎓</div>
              }
              <div style={{ width:1, height:36, background:'#ffffff20' }} />
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:'#E8D5A0', fontWeight:600 }}>Babcock University</div>
                <div style={{ fontSize:9, color:'#607A96', letterSpacing:2, textTransform:'uppercase', marginTop:2 }}>Ilishan-Remo, Ogun State</div>
              </div>
            </div>

            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:52, fontWeight:700, lineHeight:1.1, color:'#E8D5A0', letterSpacing:-0.5, marginBottom:16 }}>
              Paperless<br />
              <span style={{ color:'#3DB87A' }}>Course</span> Registration<br />
              Platform
            </h1>
            <p style={{ fontSize:15, color:'#607A96', lineHeight:1.7, maxWidth:400 }}>
              A fully digital workflow replacing paper forms. Register, track, and receive your official course form — entirely online.
            </p>
          </div>

          {/* Feature cards */}
          <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:32 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ padding:'16px 18px', background:'#ffffff05', border:'1px solid #1E2D4260', borderRadius:10, transition:'border-color .2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#3DB87A40'}
                onMouseLeave={e => e.currentTarget.style.borderColor='#1E2D4260'}
              >
                <div style={{ fontSize:22, marginBottom:8 }}>{f.icon}</div>
                <div style={{ fontSize:12, fontWeight:700, color:'#C8D8E8', marginBottom:4 }}>{f.title}</div>
                <div style={{ fontSize:11, color:'#4A6080', lineHeight:1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Workflow strip */}
          <div className="fade-up" style={{ display:'flex', alignItems:'center', overflowX:'auto', paddingBottom:4 }}>
            {[
              { label:'Student',  color:'#4A9EE0' }, { label:'Adviser',  color:'#3DB87A' },
              { label:'HOD',      color:'#8B5CF6' }, { label:'Officer',  color:'#4A9EE0' },
              { label:'Academic', color:'#E8A030' }, { label:'Registry', color:'#3DB87A' },
              { label:'🖨 Print', color:'#3DB87A' },
            ].map((s, i, arr) => (
              <div key={i} style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
                <div style={{ padding:'5px 12px', background:s.color+'18', border:`1px solid ${s.color}40`, borderRadius:20, fontSize:10, fontWeight:700, color:s.color, whiteSpace:'nowrap' }}>{s.label}</div>
                {i < arr.length-1 && <div style={{ width:16, height:1, background:'#1E2D42', flexShrink:0 }} />}
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ width:420, flexShrink:0, display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 36px', background:'linear-gradient(160deg,#0F1620 0%,#080C10 100%)', borderLeft:'1px solid #1E2D42' }}>

          <div className="fade-up" style={{ marginBottom:28 }}>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, color:'#E8D5A0', marginBottom:6 }}>Sign In</h2>
            <p style={{ fontSize:12, color:'#607A96' }}>Access your role-specific portal</p>
          </div>

          {/* Info note */}
          <div style={{ padding:'10px 14px', background:'#4A9EE010', border:'1px solid #4A9EE025', borderRadius:8, fontSize:11, color:'#4A7A9B', marginBottom:20, lineHeight:1.6 }}>
            ℹ Accounts are created by the Administrator. Your default password is your matric number — you will be asked to change it on first login.
          </div>

          {error && (
            <div style={{ background:'#E0545415', border:'1px solid #E0545440', borderRadius:8, padding:'10px 14px', color:'#E05454', fontSize:12, marginBottom:16 }}>{error}</div>
          )}

          <DarkInput label="Username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" autoComplete="username" />
          <DarkInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" onKeyDown={e => e.key === 'Enter' && handleLogin()} />

          <GreenBtn onClick={handleLogin}>Access Portal →</GreenBtn>

          {/* Divider */}
          <div style={{ position:'relative', textAlign:'center', margin:'24px 0 14px' }}>
            <div style={{ position:'absolute', top:'50%', left:0, right:0, height:1, background:'#1E2D42' }} />
            <span style={{ position:'relative', background:'#080C10', padding:'0 12px', fontSize:10, color:'#2A3A4A', textTransform:'uppercase', letterSpacing:1.5, fontWeight:600 }}>Demo Accounts</span>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {DEMOS.map(d => (
              <button key={d.username} onClick={() => fillDemo(d.username, d.password)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'#0A1420', border:'1px solid #1E2D42', borderRadius:7, cursor:'pointer', transition:'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=d.color; e.currentTarget.style.background=d.color+'0A' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#1E2D42'; e.currentTarget.style.background='#0A1420' }}
              >
                <span style={{ fontSize:11, color:d.color, fontWeight:700 }}>{d.label}</span>
                <span style={{ fontSize:10, color:'#2A3A4A', fontFamily:'monospace' }}>{d.username} / {d.password}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop:28, paddingTop:20, borderTop:'1px solid #1E2D42', textAlign:'center' }}>
            <div style={{ fontSize:10, color:'#1E2D42', letterSpacing:1 }}>
              © {new Date().getFullYear()} Babcock University · Paperless Course Registration
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
