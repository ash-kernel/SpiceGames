import logoSvg from '../logo.svg'
import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'

const NAV = [
  { path:'/library',  label:'Library',  icon:'▦' },
  { path:'/store',    label:'Discover', icon:'◈' },
  { path:'/stats',    label:'Stats',    icon:'◉' },
]
const BOTTOM = [
  { path:'/settings', label:'Settings', icon:'⊙' },
]

function NavBtn({ path, label, icon, expanded, active, badge, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      title={!expanded ? label : undefined}
      style={{
        display:'flex', alignItems:'center', gap:12, width:'100%',
        padding:'11px 18px', border:'none',
        background: active ? `rgba(var(--accent-rgb),.12)` : hov ? 'var(--bg3)' : 'transparent',
        color: active ? 'var(--accent)' : hov ? 'var(--text)' : 'var(--text2)',
        cursor:'pointer', transition:'all .18s',
        borderRight: active ? '2px solid var(--accent)' : '2px solid transparent',
        borderRadius:'0', fontFamily:'var(--font-body)',
      }}>
      <span style={{ fontSize:18, minWidth:20, textAlign:'center', lineHeight:1 }}>{icon}</span>
      <span style={{ fontSize:14, fontWeight:active?600:400, opacity:expanded?1:0, transition:'opacity .15s', whiteSpace:'nowrap', flex:1, textAlign:'left' }}>{label}</span>
      {badge > 0 && expanded && (
        <span style={{ background:'var(--accent)', color:'#fff', fontSize:11, fontWeight:700, padding:'2px 7px', borderRadius:20 }}>{badge}</span>
      )}
    </button>
  )
}

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()
  const games     = useStore(s => s.games)
  const setAddOpen = useStore(s => s.setAddGameOpen)

  return (
    <div
      onMouseEnter={()=>setExpanded(true)}
      onMouseLeave={()=>setExpanded(false)}
      style={{
        width: expanded ? 'var(--sidebar-exp)' : 'var(--sidebar-w)',
        transition:'width .28s cubic-bezier(.4,0,.2,1)',
        background:'var(--bg2)', borderRight:'1px solid var(--border)',
        display:'flex', flexDirection:'column', padding:'12px 0',
        overflow:'hidden', flexShrink:0, zIndex:50,
      }}>

      {}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 18px', marginBottom:16, minWidth:'var(--sidebar-exp)' }}>
        <img src={logoSvg} alt="SpiceGames" style={{ width:36, height:36, minWidth:36, borderRadius:10, boxShadow:'var(--shadow-glow)' }} />
        <div style={{ opacity:expanded?1:0, transition:'opacity .15s' }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:16, color:'var(--text)', lineHeight:1 }}>SpiceGames</div>
          <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{games.length} games</div>
        </div>
      </div>

      {}
      <button onClick={() => setAddOpen(true)}
        style={{ margin:'0 10px 16px', padding:'9px 0', borderRadius:'var(--radius-sm)', border:'1px dashed var(--border2)', background:'transparent', color:'var(--accent)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)', display:'flex', alignItems:'center', justifyContent:expanded?'flex-start':'center', gap:8, paddingLeft:expanded?14:0, transition:'all .18s', overflow:'hidden' }}
        onMouseEnter={e=>{e.currentTarget.style.background=`rgba(var(--accent-rgb),.08)`;e.currentTarget.style.borderStyle='solid'}}
        onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderStyle='dashed'}}>
        <span style={{ fontSize:20, lineHeight:1 }}>+</span>
        <span style={{ opacity:expanded?1:0, transition:'opacity .15s', whiteSpace:'nowrap' }}>Add Game</span>
      </button>

      {}
      {NAV.map(n => (
        <NavBtn key={n.path} {...n} active={location.pathname===n.path} expanded={expanded}
          badge={n.path==='/library'?games.length||null:null}
          onClick={()=>navigate(n.path)} />
      ))}

      <div style={{ flex:1 }} />

      {BOTTOM.map(n => (
        <NavBtn key={n.path} {...n} active={location.pathname===n.path} expanded={expanded} onClick={()=>navigate(n.path)} />
      ))}
    </div>
  )
}