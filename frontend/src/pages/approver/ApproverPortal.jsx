import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { COURSES, WORKFLOW_STAGES } from '../../data/mockData'
import { fmt } from '../../hooks/utils'
import { SidebarLayout, PageHeader, Card, StatCard, Badge, ApprovalTimeline, Empty, Table, Btn } from '../../components/UI'

function PendingApprovals({ stage, user, accentColor }) {
  const { getPendingForStage, approveRegistration, rejectRegistration } = useApp()
  const pending  = getPendingForStage(stage)
  const [activeId, setActiveId] = useState(null)
  const [comment, setComment]   = useState('')
  const [toast, setToast]       = useState(null)

  const isHOD     = stage === 'hod'
  const isRegistry = stage === 'registry'
  const prevStages = WORKFLOW_STAGES.slice(0, WORKFLOW_STAGES.findIndex(s => s.key === stage))

  function act(regId, action) {
    const payload = { regId, stage, approverName: user.name, comment }
    action === 'approve' ? approveRegistration(payload) : rejectRegistration(payload)
    setActiveId(null); setComment('')
    setToast({ msg: action === 'approve' ? `✓ Approved ${regId}${isHOD?' (Temporary)':isRegistry?' — PERMANENTLY':''}` : `✗ Rejected ${regId}`, type: action })
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div className="fade-up">
      <PageHeader
        title={isRegistry ? 'Final Permanent Approvals' : isHOD ? 'Pending Approvals (Temp)' : 'Pending Approvals'}
        subtitle={isHOD ? 'Your approval grants TEMPORARY status — form continues to School Officer, Academic Planning & Registry' : isRegistry ? 'Your approval is FINAL and grants permanent status. Student can immediately print.' : 'Registrations awaiting your review'}
        accentColor={accentColor}
      />
      {isHOD && <div style={{ padding:'12px 16px', background:'#E8C06A15', border:'1px solid #E8C06A40', borderRadius:8, fontSize:13, color:'#E8C06A', marginBottom:20 }}>⚠ <strong>Temporary Approval:</strong> Approval here grants temporary status only. Registry gives final permanent approval.</div>}
      {isRegistry && <div style={{ padding:'12px 16px', background:'#3DB87A15', border:'1px solid #3DB87A40', borderRadius:8, fontSize:13, color:'#3DB87A', marginBottom:20 }}>🏛 <strong>Permanent Approval:</strong> Your approval is the final step. Student can immediately print their official form.</div>}

      {toast && <div style={{ background:toast.type==='approve'?'#3DB87A15':'#E0545415', border:`1px solid ${toast.type==='approve'?'#3DB87A40':'#E0545440'}`, borderRadius:8, padding:'12px 16px', fontSize:13, marginBottom:20, color:toast.type==='approve'?'var(--green)':'var(--red)' }}>{toast.msg}</div>}

      {pending.length === 0
        ? <Empty icon="✅" message="No pending approvals at this time" />
        : pending.map(r => {
          const regCourses = r.courses.map(id => COURSES.find(c => c.id === id)).filter(Boolean)
          const isActive   = activeId === r.id
          return (
            <Card key={r.id} style={{ marginBottom:16, borderColor:accentColor+'30' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{r.studentName}</div>
                  <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{r.matric} · {r.department} · {r.level} Level</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>Reg: {r.id} · Submitted: {fmt(r.submittedAt)}</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  {isActive
                    ? <Btn variant="ghost" size="sm" onClick={()=>{setActiveId(null);setComment('')}}>Cancel</Btn>
                    : <Btn size="sm" onClick={()=>setActiveId(r.id)} style={{ background:`linear-gradient(135deg,${accentColor},${accentColor}88)`, color:'#fff', border:'none' }}>{isRegistry?'Final Review →':'Review →'}</Btn>
                  }
                </div>
              </div>

              {prevStages.map(ps => {
                const pa = r.approvals?.[ps.key]
                if (!pa || pa.status !== 'approved') return null
                return <div key={ps.key} style={{ padding:'7px 12px', background:'#3DB87A10', border:'1px solid #3DB87A30', borderRadius:6, fontSize:11, color:'var(--muted)', marginBottom:6 }}>✓ <strong style={{ color:'var(--green)' }}>{ps.label}{ps.key==='hod'?' (Temp)':''}:</strong> {pa.by} — {fmt(pa.at)}{pa.comment?` · "${pa.comment}"`:''}</div>
              })}

              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, margin:'10px 0' }}>
                <thead><tr style={{ background:'var(--surface2)' }}>{['Code','Course Title','Units'].map(h=><th key={h} style={{ padding:'6px 10px', textAlign:'left', fontSize:10, color:'var(--muted)', fontWeight:600 }}>{h}</th>)}</tr></thead>
                <tbody>
                  {regCourses.map(c=><tr key={c.id} style={{ borderBottom:'1px solid var(--border)' }}><td style={{ padding:'7px 10px', fontWeight:700, color:accentColor }}>{c.code}</td><td style={{ padding:'7px 10px' }}>{c.title}</td><td style={{ padding:'7px 10px', fontWeight:700 }}>{c.units}</td></tr>)}
                  <tr style={{ background:'var(--surface2)' }}><td colSpan={2} style={{ padding:'7px 10px', textAlign:'right', fontWeight:700 }}>Total</td><td style={{ padding:'7px 10px', fontWeight:700, color:'var(--gold)' }}>{r.totalUnits}u</td></tr>
                </tbody>
              </table>

              <div style={{ margin:'12px 0' }}><ApprovalTimeline approvals={r.approvals} /></div>

              {isActive && (
                <div style={{ padding:16, background:'var(--surface2)', borderRadius:10, borderTop:`2px solid ${accentColor}40`, marginTop:8 }}>
                  {isHOD && <div style={{ fontSize:12, color:'#E8C06A', fontWeight:600, marginBottom:10 }}>⚠ This grants TEMPORARY approval only.</div>}
                  {isRegistry && <div style={{ fontSize:12, color:'var(--green)', fontWeight:600, marginBottom:10 }}>🏛 This grants PERMANENT approval. Student can immediately print.</div>}
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--muted)', letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>Comment (optional)</div>
                  <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a comment..." rows={2} style={{ width:'100%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'9px 12px', color:'var(--text)', fontSize:13, fontFamily:"'Jost',sans-serif", resize:'vertical', outline:'none' }} />
                  <div style={{ display:'flex', gap:10, marginTop:12 }}>
                    <Btn variant="success" onClick={()=>act(r.id,'approve')}>{isHOD?'◐ Grant Temp Approval':isRegistry?'✅ Grant Permanent Approval':'✓ Approve'}</Btn>
                    <Btn variant="danger" onClick={()=>act(r.id,'reject')}>✗ Reject</Btn>
                  </div>
                </div>
              )}
            </Card>
          )
        })
      }
    </div>
  )
}

function AllRegistrations({ registrations, accentColor }) {
  const [filter, setFilter] = useState('all')
  const statuses = ['all','submitted','adviser_approved','hod_approved','officer_approved','academic_approved','approved','rejected']
  const labels   = { all:'All', submitted:'Pending Adviser', adviser_approved:'Pending HOD', hod_approved:'Temp Approved', officer_approved:'Pending Academic', academic_approved:'Pending Registry', approved:'Permanently Approved', rejected:'Rejected' }
  const filtered = filter==='all' ? registrations : registrations.filter(r=>r.status===filter)
  return (
    <div className="fade-up">
      <PageHeader title="All Registrations" accentColor={accentColor} />
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
        {statuses.map(s=><button key={s} onClick={()=>setFilter(s)} style={{ padding:'6px 14px', borderRadius:20, fontSize:11, cursor:'pointer', background:filter===s?accentColor+'20':'transparent', color:filter===s?accentColor:'var(--muted)', border:`1px solid ${filter===s?accentColor+'50':'var(--border)'}`, fontFamily:"'Jost',sans-serif" }}>{labels[s]}</button>)}
      </div>
      <Card><Table headers={['Reg ID','Student','Matric','Units','Submitted','Status']} rows={filtered.map(r=>[<span style={{ color:accentColor, fontWeight:700 }}>{r.id}</span>,<span style={{ fontWeight:600 }}>{r.studentName}</span>,<span style={{ color:'var(--muted)' }}>{r.matric}</span>,<span style={{ fontWeight:700 }}>{r.totalUnits}</span>,<span style={{ color:'var(--muted)', fontSize:11 }}>{fmt(r.submittedAt)}</span>,<Badge status={r.status} />])} /></Card>
    </div>
  )
}

function ActionHistory({ stage, registrations, accentColor }) {
  const isHOD = stage === 'hod'
  const acted  = registrations.filter(r => r.approvals[stage]?.status === 'approved' || r.approvals[stage]?.status === 'rejected')
  return (
    <div className="fade-up">
      <PageHeader title="My Actions" accentColor={accentColor} />
      {acted.length===0 ? <Empty icon="🕒" message="No actions yet" /> : acted.map(r=>(
        <Card key={r.id} style={{ marginBottom:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontWeight:700 }}>{r.studentName} <span style={{ color:'var(--muted)', fontWeight:400, fontSize:12 }}>{r.matric}</span></div>
              <div style={{ fontSize:12, color:'var(--muted)', marginTop:3 }}>{r.id} · {r.totalUnits} units · {fmt(r.approvals[stage]?.at)}</div>
              {r.approvals[stage]?.comment && <div style={{ fontSize:12, color:'var(--muted)', marginTop:4, fontStyle:'italic' }}>"{r.approvals[stage].comment}"</div>}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'flex-end' }}>
              <span style={{ fontWeight:700, color:r.approvals[stage]?.status==='approved'?'var(--green)':'var(--red)', fontSize:12 }}>
                {r.approvals[stage]?.status==='approved'?(isHOD?'◐ Temp Approved':'✓ Approved'):'✗ Rejected'}
              </span>
              <Badge status={r.status} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export function ApproverPortal({ role, accentColor, portalLabel, stage }) {
  const { user, logout, registrations, getPendingForStage } = useApp()
  const navigate = useNavigate()
  const [page, setPage] = useState('dashboard')

  if (!user || user.role !== role) { navigate('/'); return null }

  const pending    = getPendingForStage(stage)
  const isHOD      = stage === 'hod'
  const isRegistry = stage === 'registry'

  const myApproved = registrations.filter(r => r.approvals[stage]?.status === 'approved').length
  const myRejected = registrations.filter(r => r.approvals[stage]?.status === 'rejected').length

  const navItems = [
    { id:'dashboard', icon:'⊞', label:'Dashboard' },
    { id:'approvals', icon:isRegistry?'🏛':isHOD?'◐':'✅', label:isRegistry?'Final Approvals':isHOD?'Temp Approvals':'Pending Approvals', badge:pending.length },
    { id:'all_regs',  icon:'📋', label:'All Registrations' },
    { id:'history',   icon:'🕒', label:'My Actions' },
  ]

  const pages = {
    dashboard: (
      <div className="fade-up">
        <PageHeader title={`${portalLabel} Dashboard`} subtitle={`${user.department||user.faculty||''} — 2024/2025`} accentColor={accentColor} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
          <StatCard icon="⏳" value={pending.length} label="Awaiting My Review" color="#E8A030" />
          <StatCard icon="✅" value={myApproved} label={isHOD?'Temp Approved by Me':'Approved by Me'} color="var(--green)" />
          <StatCard icon="✗"  value={myRejected} label="Rejected by Me" color="var(--red)" />
        </div>
        {pending.length > 0 && <Card onClick={()=>setPage('approvals')} style={{ borderColor:accentColor+'40', cursor:'pointer', marginBottom:16 }}><div style={{ display:'flex', alignItems:'center', gap:12 }}><div style={{ fontSize:26 }}>{isRegistry?'🏛':isHOD?'⏳':'⚠️'}</div><div><div style={{ fontWeight:600 }}>{pending.length} registration(s) awaiting your {isHOD?'temporary':isRegistry?'permanent':''} approval</div><div style={{ fontSize:12, color:accentColor, marginTop:3 }}>Click to review →</div></div></div></Card>}
        <Card><div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Your Role</div><div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.8 }}>
          {stage==='adviser'&&'You are the FIRST approver. Students submit directly to you.'}
          {stage==='hod'&&'You review after the Course Adviser. Your approval is TEMPORARY — the form continues to School Officer, Academic Planning and Registry.'}
          {stage==='schoolofficer'&&'You review after HOD temporary approval. Ensure institutional requirements are met.'}
          {stage==='academicplanning'&&'You review after the School Officer. Ensure academic requirements are met before passing to Registry.'}
          {stage==='registry'&&'You are the FINAL approver. Your approval makes the registration permanent and allows the student to print their official form.'}
        </div></Card>
      </div>
    ),
    approvals: <PendingApprovals stage={stage} user={user} accentColor={accentColor} />,
    all_regs:  <AllRegistrations registrations={registrations} accentColor={accentColor} />,
    history:   <ActionHistory stage={stage} registrations={registrations} accentColor={accentColor} />,
  }

  return (
    <SidebarLayout accentColor={accentColor} portalLabel={portalLabel} navItems={navItems} user={user} onLogout={()=>{logout();navigate('/')}} activePage={page} setPage={setPage}>
      {pages[page]}
    </SidebarLayout>
  )
}
