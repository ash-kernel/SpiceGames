import logoSvg from '../logo.svg'
import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'

const ICONS = {
  discover:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  library:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  itch:        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="14" rx="3"/><line x1="8" y1="6" x2="8" y2="3"/><line x1="16" y1="6" x2="16" y2="3"/><line x1="9" y1="13" x2="11" y2="13"/><line x1="13" y1="13" x2="15" y2="13"/><line x1="10" y1="11" x2="10" y2="15"/></svg>,
  deals:       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  news:        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><line x1="18" y1="14" x2="12" y2="14"/><line x1="15" y1="18" x2="12" y2="18"/><rect x="12" y="6" width="6" height="4"/></svg>,
  controller:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15.5" cy="11.5" r="1" fill="currentColor"/><circle cx="17.5" cy="13.5" r="1" fill="currentColor"/></svg>,
  screenshots: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  stats:       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  settings:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
}

const NAV = [
  { path:'/library',     label:'Library',     iconKey:'library'     },
  { path:'/discover',    label:'Discover',    iconKey:'discover'    },
  { path:'/itch',        label:'itch.io',      iconKey:'itch'        },
  { path:'/deals',       label:'Deals',        iconKey:'deals'       },
  { path:'/news',        label:'News',         iconKey:'news'        },
  { path:'/controller',  label:'Controller',   iconKey:'controller'  },
  { path:'/screenshots', label:'Screenshots',  iconKey:'screenshots' },
  { path:'/stats',       label:'Stats',        iconKey:'stats'       },
]

function NavBtn({ label, iconKey, active, expanded, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} title={!expanded ? label : undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width:'100%', height:44, border:'none',
        borderRight: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
        background: active ? `rgba(var(--accent-rgb),.14)` : hov ? 'rgba(255,255,255,.05)' : 'transparent',
        color: active ? 'var(--accent)' : hov ? '#e2e2ff' : 'rgba(255,255,255,.45)',
        cursor:'pointer', display:'flex', alignItems:'center',
        paddingLeft:18, gap:12, overflow:'hidden',
        transition:'all .15s', flexShrink:0,
      }}>
      <span style={{ flexShrink:0, display:'flex', alignItems:'center' }}>{ICONS[iconKey]}</span>
      <span style={{ fontSize:13, fontWeight: active?600:400, whiteSpace:'nowrap', opacity: expanded?1:0, transition:'opacity .15s' }}>
        {label}
      </span>
    </button>
  )
}

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false)
  const navigate        = useNavigate()
  const location        = useLocation()
  const games           = useStore(s => s.games)
  const settings        = useStore(s => s.settings) || {}
  const setAddOpen      = useStore(s => s.setAddGameOpen)
  const setSelectedGame = useStore(s => s.setSelectedGame)

  const visibleNav = NAV.filter(n => {
    if (n.path === '/itch'  && settings.showItch  === false) return false
    if (n.path === '/news'  && settings.showNews  === false) return false
    if (n.path === '/deals' && settings.showDeals === false) return false
    return true
  })

  const go = (path) => {
    setExpanded(false)
    if (path !== '/library') setSelectedGame(null)
    navigate(path)
  }

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        width: expanded ? 200 : 56,
        minWidth: 56,
        transition: 'width .22s cubic-bezier(.4,0,.2,1)',
        background:'var(--bg2)', borderRight:'1px solid var(--border)',
        display:'flex', flexDirection:'column',
        overflow:'hidden', flexShrink:0, zIndex:50,
      }}>

      <div style={{ height:52, display:'flex', alignItems:'center', gap:10, paddingLeft:13, flexShrink:0 }}>
        <img src={logoSvg} alt="" style={{ width:30, height:30, minWidth:30, borderRadius:8, flexShrink:0 }} />
        <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:14, color:'var(--text)', whiteSpace:'nowrap', opacity:expanded?1:0, transition:'opacity .15s' }}>
          SpiceDeck
        </span>
      </div>

      <div style={{ padding:'0 9px', marginBottom:6, flexShrink:0 }}>
        <button onClick={() => setAddOpen(true)} title={!expanded ? 'Add Game' : undefined}
          style={{ width:'100%', height:32, borderRadius:8, border:'1px dashed rgba(var(--accent-rgb),.45)', background:'transparent', color:'var(--accent)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent: expanded ? 'flex-start' : 'center', paddingLeft: expanded ? 9 : 0, gap:8, overflow:'hidden', transition:'all .15s' }}
          onMouseEnter={e=>{e.currentTarget.style.background=`rgba(var(--accent-rgb),.1)`;e.currentTarget.style.borderStyle='solid'}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderStyle='dashed'}}>
          {expanded ? (
            <span style={{ fontSize:13, fontWeight:600, whiteSpace:'nowrap' }}>+ Add Game</span>
          ) : (
            <span style={{ fontSize:20, lineHeight:1, fontWeight:300 }}>+</span>
          )}
        </button>
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto', overflowX:'hidden' }}>
        {visibleNav.map(n => (
          <NavBtn key={n.path} {...n} active={location.pathname===n.path} expanded={expanded} onClick={() => go(n.path)} />
        ))}
      </div>

      <NavBtn label="Settings" iconKey="settings" active={location.pathname==='/settings'} expanded={expanded} onClick={() => go('/settings')} />
    </div>
  )
}