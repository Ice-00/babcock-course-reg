import { useState } from 'react'
import { STATUS_META, WORKFLOW_STAGES } from '../data/mockData'

export function Badge({ status }) {
  const meta = STATUS_META[status] || { label: status, color: '#607A96' }
  return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, letterSpacing:0.5, background:meta.color+'22', color:meta.color, border:`1px solid ${meta.color}44` }}>{meta.label}</span>
}

export function Card({ children, style={}, onClick }) {
  return (
    <div onClick={onClick} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:24, transition:'border-color .2s', cursor:onClick?'pointer':undefined, ...style }}
      onMouseEnter={onClick?e=>{e.currentTarget.style.borderColor='var(--muted)'}:undefined}
      onMouseLeave={onClick?e=>{e.currentTarget.style.borderColor=(style.borderColor||'var(--border)')}:undefined}
    >{children}</div>
  )
}

const BTN_VARIANTS = {
  primary:   { background:'linear-gradient(135deg, var(--gold), #8A6420)', color:'#0A0E14', border:'none' },
  success:   { background:'linear-gradient(135deg, #3DB87A, #1A6C40)',     color:'#fff',    border:'none' },
  danger:    { background:'transparent', color:'#E05454', border:'1px solid #E0545460' },
  ghost:     { background:'transparent', color:'var(--muted)', border:'1px solid var(--border)' },
  secondary: { background:'var(--surface2)', color:'var(--text)', border:'1px solid var(--border)' },
  print:     { background:'linear-gradient(135deg, #3DB87A, #1A6C40)', color:'#fff', border:'none' },
}
const BTN_SIZES = {
  sm:{ padding:'6px 14px', fontSize:11 },
  md:{ padding:'10px 20px', fontSize:13 },
  lg:{ padding:'13px 28px', fontSize:14 },
}

export function Btn({ children, onClick, variant='primary', size='md', disabled=false, style={}, type='button' }) {
  return <button type={type} onClick={onClick} disabled={disabled} style={{ borderRadius:8, fontFamily:"'Jost',sans-serif", fontWeight:700, cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.45:1, transition:'all .2s', letterSpacing:0.5, ...BTN_SIZES[size], ...BTN_VARIANTS[variant], ...style }}>{children}</button>
}

export function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom:18 }}>
      {label && <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>{label}</label>}
      <input {...props} style={{ width:'100%', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, padding:'11px 16px', color:'var(--text)', fontSize:14, fontFamily:"'Jost',sans-serif", outline:'none', transition:'border .2s, box-shadow .2s', ...(props.style||{}) }}
        onFocus={e=>{e.target.style.borderColor='var(--gold)';e.target.style.boxShadow='0 0 0 3px #C9993A18'}}
        onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none'}}
      />
    </div>
  )
}

export function StatCard({ icon, value, label, color, sub }) {
  return (
    <Card style={{ display:'flex', alignItems:'center', gap:16 }}>
      <div style={{ width:48, height:48, borderRadius:12, flexShrink:0, background:color+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{icon}</div>
      <div>
        <div style={{ fontSize:30, fontWeight:700, color, lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>{label}</div>
        {sub && <div style={{ fontSize:10, color, marginTop:2, fontWeight:600 }}>{sub}</div>}
      </div>
    </Card>
  )
}

// ─── 5-STAGE APPROVAL TIMELINE ────────────────────────────────────────────────
export function ApprovalTimeline({ approvals }) {
  const colors = { approved:'#3DB87A', rejected:'#E05454', pending:'#1E2D42' }
  const icons  = { approved:'✓', rejected:'✗', pending:'○' }
  return (
    <div style={{ overflowX:'auto' }}>
      <div style={{ display:'flex', alignItems:'flex-start', minWidth:500 }}>
        {WORKFLOW_STAGES.map((s, i) => {
          const st    = approvals?.[s.key]?.status || 'pending'
          const prevSt = i > 0 ? (approvals?.[WORKFLOW_STAGES[i-1].key]?.status||'pending') : null
          const c     = colors[st]
          const isHOD = s.key === 'hod'
          return (
            <div key={s.key} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', width:'100%' }}>
                {i > 0 && <div style={{ flex:1, height:2, background:colors[prevSt] }} />}
                <div style={{ position:'relative' }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', flexShrink:0, background:c+'22', border:`2px solid ${c}`, display:'flex', alignItems:'center', justifyContent:'center', color:c, fontWeight:700, fontSize:12 }}>{icons[st]}</div>
                  {isHOD && st==='approved' && <div style={{ position:'absolute', top:-8, right:-14, background:'#E8C06A', color:'#0A0E14', fontSize:7, fontWeight:700, padding:'2px 4px', borderRadius:4, whiteSpace:'nowrap' }}>TEMP</div>}
                </div>
                {i < WORKFLOW_STAGES.length-1 && <div style={{ flex:1, height:2, background:st==='approved'?c:'#1E2D42' }} />}
              </div>
              <div style={{ marginTop:6, textAlign:'center' }}>
                <div style={{ fontSize:8, fontWeight:600, color:c, whiteSpace:'nowrap' }}>{s.label}{isHOD?' (Temp)':''}</div>
                <div style={{ fontSize:7, color:'var(--muted)', marginTop:1 }}>{st==='pending'?'Pending':(approvals?.[s.key]?.by||'—')}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SidebarLayout({ accentColor, portalLabel, navItems, user, onLogout, children, activePage, setPage }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <aside style={{ width:240, background:'var(--surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0, position:'sticky', top:0, height:'100vh' }}>
        <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", color:accentColor, fontSize:14, lineHeight:1.3, fontWeight:600 }}>Babcock University</div>
          <div style={{ fontSize:9, color:'var(--muted)', letterSpacing:1.5, textTransform:'uppercase', marginTop:2 }}>{portalLabel}</div>
        </div>
        <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={()=>setPage(item.id)} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', borderRadius:8, border:'none', marginBottom:2, textAlign:'left', fontSize:12, fontWeight:500, fontFamily:"'Jost',sans-serif", cursor:'pointer', background:activePage===item.id?accentColor+'14':'transparent', color:activePage===item.id?accentColor:'var(--muted)', borderLeft:`3px solid ${activePage===item.id?accentColor:'transparent'}`, transition:'all .15s' }}>
              <span style={{ fontSize:15, width:20, textAlign:'center' }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.badge>0 && <span style={{ background:accentColor+'30', color:accentColor, borderRadius:10, padding:'1px 7px', fontSize:10, fontWeight:700 }}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding:14, borderTop:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0, background:`linear-gradient(135deg,${accentColor},${accentColor}88)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#0A0E14' }}>{user?.name?.[0]||'?'}</div>
            <div style={{ overflow:'hidden' }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize:9, color:accentColor, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>{portalLabel}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ width:'100%', padding:8, background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', fontSize:11, fontFamily:"'Jost',sans-serif", cursor:'pointer' }}>Sign Out</button>
        </div>
      </aside>
      <main style={{ flex:1, padding:32, overflowY:'auto' }}>{children}</main>
    </div>
  )
}

export function PageHeader({ title, subtitle, accentColor, action }) {
  return (
    <div style={{ marginBottom:28, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
      <div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:accentColor||'var(--gold2)', lineHeight:1.2 }}>{title}</h1>
        {subtitle && <p style={{ color:'var(--muted)', fontSize:13, marginTop:5 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Empty({ icon='📋', message='Nothing here yet', children }) {
  return (
    <Card style={{ textAlign:'center', padding:'48px 24px' }}>
      <div style={{ fontSize:48, marginBottom:12 }}>{icon}</div>
      <div style={{ color:'var(--muted)', fontSize:13 }}>{message}</div>
      {children}
    </Card>
  )
}

export function Table({ headers, rows }) {
  return (
    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
      <thead>
        <tr>{headers.map(h=><th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:10, color:'var(--muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, borderBottom:'1px solid var(--border)' }}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row,i)=>(
          <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
            {row.map((cell,j)=><td key={j} style={{ padding:'12px 14px', verticalAlign:'middle' }}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
}

export function DigitalForm({ reg, courses }) {
  const isPermanent    = reg.status === 'approved'
  const isTempApproved = ['hod_approved','officer_approved','academic_approved'].includes(reg.status)
  const [downloading, setDownloading] = useState(false)

  function handlePrint() {
    const style = document.createElement('style')
    style.id = 'print-override'
    style.innerHTML = `@media print{body>*{display:none!important}#printable-form{display:block!important;position:fixed;top:0;left:0;width:100%;z-index:9999;background:white}#printable-form *{color:#000!important;background:white!important;border-color:#ccc!important}.no-print{display:none!important}}`
    document.head.appendChild(style)
    window.print()
    setTimeout(()=>document.getElementById('print-override')?.remove(), 1000)
  }

  function handleDownloadPDF() {
    setDownloading(true)
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Course Reg — ${reg.studentName} — ${reg.id}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=Jost:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Jost',sans-serif;background:#fff;color:#111;padding:24px}
.header{background:#1A5C2A;color:white;padding:18px 24px;display:flex;align-items:center;gap:14px;margin-bottom:22px;border-radius:8px}
.header h1{font-family:'Cormorant Garamond',serif;font-size:19px;line-height:1.3}.header p{font-size:10px;opacity:.8;letter-spacing:1px;text-transform:uppercase;margin-top:3px}
.grid{display:grid;grid-template-columns:1fr 1fr;border:1px solid #ddd;border-radius:6px;overflow:hidden;margin-bottom:20px}
.gi{padding:9px 12px;border-bottom:1px solid #eee}.gi:nth-child(odd){border-right:1px solid #eee}
.gi label{display:block;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px}.gi span{font-weight:700;font-size:13px;margin-top:2px;display:block}
table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px}th,td{padding:8px 10px;text-align:left;border:1px solid #ddd}th{background:#f5f5f5;font-weight:700;font-size:10px}
.stamp{padding:14px 18px;border:2px solid #1A5C2A;border-radius:8px;background:#f0fff6}.stamp h3{color:#1A5C2A;font-size:14px}.stamp p{color:#555;font-size:11px;margin-top:4px}
</style></head><body>
<div class="header"><div style="font-size:36px">🎓</div><div><h1>BABCOCK UNIVERSITY — OFFICIAL COURSE REGISTRATION FORM</h1><p>Paperless Registration System · ${reg.session} · ${reg.semester} Semester</p></div></div>
<div class="grid">${[['Student Name',reg.studentName],['Matric Number',reg.matric],['Department',reg.department],['Level',reg.level+' Level'],['Faculty',reg.faculty||'Computing & Applied Sciences'],['Session',reg.session],['Semester',reg.semester+' Semester'],['Registration ID',reg.id]].map(([k,v])=>`<div class="gi"><label>${k}</label><span>${v}</span></div>`).join('')}</div>
<p style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Registered Courses</p>
<table><thead><tr><th>S/N</th><th>Code</th><th>Course Title</th><th>Units</th></tr></thead><tbody>
${courses.map((c,i)=>`<tr><td>${i+1}</td><td><strong>${c.code}</strong></td><td>${c.title}</td><td><strong>${c.units}</strong></td></tr>`).join('')}
<tr style="background:#f5f5f5"><td colspan="3" style="text-align:right;font-weight:700">TOTAL UNITS</td><td style="font-weight:700;font-size:16px">${reg.totalUnits}</td></tr></tbody></table>
<p style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Approval Trail</p>
<table><thead><tr><th>Stage</th><th>Signatory</th><th>Date & Time</th><th>Status</th><th>Remark</th></tr></thead><tbody>
${WORKFLOW_STAGES.map(s=>{const a=reg.approvals?.[s.key];const st=a?.status||'pending';const color=st==='approved'?'#1A5C2A':st==='rejected'?'#c0392b':'#888';return`<tr><td><strong>${s.label}${s.key==='hod'?' (Temp)':''}</strong></td><td>${a?.by||'—'}</td><td>${a?.at?new Date(a.at).toLocaleString('en-GB'):'—'}</td><td style="color:${color};font-weight:700;text-transform:capitalize">${st}</td><td style="font-style:italic;color:#777">${a?.comment||'—'}</td></tr>`}).join('')}
</tbody></table>
<div class="stamp"><h3>✅ PERMANENTLY APPROVED — OFFICIAL DOCUMENT</h3><p>This document has been fully approved by all required authorities and constitutes the official course registration record for ${reg.studentName}, ${reg.session}.</p><p style="margin-top:6px;color:#1A5C2A;font-weight:600">Registry: ${reg.approvals?.registry?.by||'—'} · ${reg.approvals?.registry?.at?new Date(reg.approvals.registry.at).toLocaleString('en-GB'):'—'}</p></div>
</body></html>`
    const blob = new Blob([html], { type:'text/html' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `CourseReg_${reg.matric?.replace(/\//g,'-')}_${reg.id}.html`
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    const pw = window.open('','_blank')
    pw.document.write(html); pw.document.close(); pw.focus()
    setTimeout(()=>{ pw.print() }, 800)
    setDownloading(false)
  }

  return (
    <div>
      <div className="no-print" style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
        {isPermanent && (
          <>
            <Btn variant="secondary" size="md" onClick={handlePrint}>🖨 Print</Btn>
            <Btn variant="print" size="md" onClick={handleDownloadPDF} disabled={downloading}>{downloading?'⏳ Preparing...':'⬇ Save as PDF'}</Btn>
          </>
        )}
        {isTempApproved && <div style={{ padding:'10px 16px', background:'#E8C06A20', border:'1px solid #E8C06A50', borderRadius:8, fontSize:12, color:'#E8C06A', fontWeight:600 }}>⏳ Temporarily Approved — printing available after Registry permanent approval</div>}
        {!isPermanent && !isTempApproved && <div style={{ padding:'10px 16px', background:'#1E2D42', border:'1px solid var(--border)', borderRadius:8, fontSize:12, color:'var(--muted)' }}>🔒 Print available only after permanent Registry approval</div>}
      </div>

      <div id="printable-form" style={{ border:`2px solid ${isPermanent?'#3DB87A':'#E8C06A'}`, borderRadius:12, overflow:'hidden', background:'var(--surface)' }}>
        <div style={{ background:isPermanent?'linear-gradient(135deg,#3DB87A,#1A6C40)':'linear-gradient(135deg,#E8C06A,#8A6420)', padding:'20px 28px', display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ fontSize:36 }}>🎓</div>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:19, color:'#0A0E14', fontWeight:700 }}>BABCOCK UNIVERSITY — OFFICIAL COURSE REGISTRATION FORM</div>
            <div style={{ fontSize:9, color:'#1A3300', letterSpacing:2, textTransform:'uppercase', marginTop:3 }}>Paperless Registration System · {reg.session} · {reg.semester} Semester</div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
            <Badge status={reg.status} />
            {isPermanent && <span style={{ fontSize:9, fontWeight:700, color:'#3DB87A', letterSpacing:1 }}>● PERMANENTLY APPROVED</span>}
            {isTempApproved && <span style={{ fontSize:9, fontWeight:700, color:'#E8C06A', letterSpacing:1 }}>◐ TEMPORARILY APPROVED</span>}
          </div>
        </div>

        <div style={{ padding:28 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, marginBottom:22, border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
            {[['Student Name',reg.studentName],['Matric Number',reg.matric],['Department',reg.department],['Level',reg.level+' Level'],['Faculty',reg.faculty||'Computing & Applied Sciences'],['Session',reg.session],['Semester',reg.semester+' Semester'],['Reg. ID',reg.id]].map(([k,v],i)=>(
              <div key={k} style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', borderRight:i%2===0?'1px solid var(--border)':'none', background:i%4<2?'var(--surface)':'var(--surface2)' }}>
                <div style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1 }}>{k}</div>
                <div style={{ fontSize:13, fontWeight:600, marginTop:3 }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize:10, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Registered Courses</div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, marginBottom:22, border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
            <thead><tr style={{ background:'var(--surface2)' }}>{['S/N','Code','Course Title','Units'].map(h=><th key={h} style={{ padding:'9px 12px', textAlign:'left', fontSize:10, color:'var(--muted)', fontWeight:700, borderBottom:'1px solid var(--border)' }}>{h}</th>)}</tr></thead>
            <tbody>
              {courses.map((c,i)=>(
                <tr key={c.id} style={{ borderBottom:'1px solid var(--border)', background:i%2===0?'var(--surface)':'var(--surface2)' }}>
                  <td style={{ padding:'9px 12px', color:'var(--muted)' }}>{i+1}</td>
                  <td style={{ padding:'9px 12px', fontWeight:700, color:'var(--gold)' }}>{c.code}</td>
                  <td style={{ padding:'9px 12px' }}>{c.title}</td>
                  <td style={{ padding:'9px 12px', fontWeight:700 }}>{c.units}</td>
                </tr>
              ))}
              <tr style={{ background:isPermanent?'#3DB87A20':'var(--surface2)' }}>
                <td colSpan={3} style={{ padding:'10px 12px', textAlign:'right', fontWeight:700 }}>TOTAL UNITS</td>
                <td style={{ padding:'10px 12px', fontWeight:700, color:isPermanent?'#3DB87A':'var(--gold)', fontSize:18 }}>{reg.totalUnits}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ fontSize:10, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Approval Trail</div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, marginBottom:20, border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
            <thead><tr style={{ background:'var(--surface2)' }}>{['Stage','Signatory','Date & Time','Status','Remark'].map(h=><th key={h} style={{ padding:'9px 12px', textAlign:'left', fontSize:10, color:'var(--muted)', fontWeight:700, borderBottom:'1px solid var(--border)' }}>{h}</th>)}</tr></thead>
            <tbody>
              {WORKFLOW_STAGES.map((s,i)=>{
                const a=reg.approvals?.[s.key]; const st=a?.status||'pending'
                const stColor=st==='approved'?'var(--green)':st==='rejected'?'var(--red)':'var(--muted)'
                return(
                  <tr key={s.key} style={{ borderBottom:'1px solid var(--border)', background:i%2===0?'var(--surface)':'var(--surface2)' }}>
                    <td style={{ padding:'9px 12px', fontWeight:600 }}>{s.label}{s.key==='hod'?<span style={{ marginLeft:6, fontSize:9, background:'#E8C06A20', color:'#E8C06A', padding:'2px 5px', borderRadius:4, fontWeight:700 }}>TEMP</span>:null}</td>
                    <td style={{ padding:'9px 12px' }}>{a?.by||'—'}</td>
                    <td style={{ padding:'9px 12px', color:'var(--muted)', fontSize:11 }}>{fmtDate(a?.at)}</td>
                    <td style={{ padding:'9px 12px', fontWeight:700, color:stColor, textTransform:'capitalize' }}>{st}</td>
                    <td style={{ padding:'9px 12px', color:'var(--muted)', fontStyle:a?.comment?'italic':'normal', fontSize:11 }}>{a?.comment||'—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div style={{ marginBottom:20 }}><ApprovalTimeline approvals={reg.approvals} /></div>

          {isPermanent && (
            <div style={{ padding:'16px 20px', borderRadius:10, background:'#3DB87A15', border:'2px solid #3DB87A40', display:'flex', alignItems:'center', gap:14 }}>
              <span style={{ fontSize:36 }}>✅</span>
              <div>
                <div style={{ fontWeight:700, color:'var(--green)', fontSize:15, fontFamily:"'Cormorant Garamond',serif" }}>PERMANENTLY APPROVED — OFFICIAL FORM</div>
                <div style={{ fontSize:12, color:'var(--muted)', marginTop:3 }}>All required authorities have approved this registration for {reg.studentName} — {reg.session}.</div>
                <div style={{ fontSize:11, color:'var(--green)', marginTop:5, fontWeight:600 }}>Registry: {reg.approvals?.registry?.by} · {fmtDate(reg.approvals?.registry?.at)}</div>
              </div>
            </div>
          )}
          {isTempApproved && (
            <div style={{ padding:'13px 18px', borderRadius:10, background:'#E8C06A15', border:'2px solid #E8C06A40', display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:28 }}>⏳</span>
              <div>
                <div style={{ fontWeight:700, color:'#E8C06A', fontSize:13 }}>TEMPORARILY APPROVED</div>
                <div style={{ fontSize:12, color:'var(--muted)', marginTop:3 }}>HOD has granted temporary approval. Form is still in processing. Print available after Registry permanent approval.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
