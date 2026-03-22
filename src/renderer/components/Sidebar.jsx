import logoSvg from '../logo.svg'
import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'

const NAV = [
  { path:'/library',     label:'Library',     icon:'▦' },
  { path:'/store',       label:'Discover',    icon:'◈' },
  { path:'/itch',        label:'itch.io',     icon:'🎮' },
  { path:'/deals',       label:'Deals',       icon:'💸' },
  { path:'/screenshots', label:'Screenshots', icon:'📸' },
  { path:'/stats',       label:'Stats',       icon:'◉' },
]

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false)
  const navigate        = useNavigate()
  const location        = useLocation()
  const games           = useStore(s => s.games)
  const setAddOpen      = useStore(s => s.setAddGameOpen)
  const setSelectedGame = useStore(s => s.setSelectedGame)

  const go = (path) => {
    setExpanded(false)
    if (path !== '/library') setSelectedGame(null)
    navigate(path)
  }

  return (
    <>
      {/* Invisible 56px spacer so content never shifts */}
      <div style={{ width:56, minWidth:56, flexShrink:0 }} />

      {/* Actual sidebar - position absolute so it overlays on expand */}
      <div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{
          position: 'absolute', top:0, left:0, bottom:0,
          width: expanded ? 210 : 56,
          transition: 'width .22s cubic-bezier(.4,0,.2,1)',
          background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', zIndex: 100,
          boxShadow: expanded ? '4px 0 24px rgba(0,0,0,.4)' : 'none',
        }}
      >
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, height:52, paddingLeft:11, flexShrink:0 }}>
          <img src={logoSvg} alt="" style={{ width:34, height:34, minWidth:34, borderRadius:9, flexShrink:0 }} />
          <div style={{ opacity:expanded?1:0, transition:'opacity .15s', overflow:'hidden', whiteSpace:'nowrap' }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:14, color:'var(--text)' }}>SpiceDeck</div>
            <div style={{ fontSize:10, color:'var(--text3)' }}>{games.length} game{games.length!==1?'s':''}</div>
          </div>
        </div>

        {/* Add Game */}
        <div style={{ padding:'0 7px', marginBottom:6, flexShrink:0 }}>
          <button onClick={() => { setExpanded(false); setAddOpen(true) }}
            title={!expanded ? 'Add Game' : undefined}
            style={{
              width:'100%', height:30, borderRadius:7,
              border:'1px dashed var(--border2)', background:'transparent',
              color:'var(--accent)', cursor:'pointer',
              display:'flex', alignItems:'center',
              justifyContent: expanded ? 'flex-start' : 'center',
              paddingLeft: expanded ? 9 : 0,
              gap:7, overflow:'hidden', fontFamily:'var(--font-body)',
              fontSize: expanded ? 13 : 18, fontWeight:600,
              transition:'background .15s, border-color .15s',
            }}
            onMouseEnter={e=>{e.currentTarget.style.background=`rgba(var(--accent-rgb),.1)`;e.currentTarget.style.borderStyle='solid'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderStyle='dashed'}}>
            {expanded ? '+ Add Game' : '+'}
          </button>
        </div>

        {/* Nav items */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto', overflowX:'hidden' }}>
          {NAV.map(n => {
            const active = location.pathname === n.path
            return (
              <button key={n.path} onClick={() => go(n.path)}
                title={!expanded ? n.label : undefined}
                style={{
                  width:'100%', height:40, border:'none',
                  borderRight: active ? '2px solid var(--accent)' : '2px solid transparent',
                  background: active ? `rgba(var(--accent-rgb),.12)` : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text2)',
                  cursor:'pointer', display:'flex', alignItems:'center',
                  gap:12, paddingLeft:18, overflow:'hidden',
                  transition:'background .15s, color .15s',
                  fontFamily:'var(--font-body)', flexShrink:0,
                }}
                onMouseEnter={e=>{if(!active){e.currentTarget.style.background='var(--bg3)';e.currentTarget.style.color='var(--text)'}}}
                onMouseLeave={e=>{if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text2)'}}}>
                <span style={{ fontSize:17, width:20, textAlign:'center', lineHeight:1, flexShrink:0 }}>{n.icon}</span>
                <span style={{ fontSize:13, fontWeight:active?600:400, whiteSpace:'nowrap',
                  opacity:expanded?1:0, transition:'opacity .12s' }}>{n.label}</span>
              </button>
            )
          })}
        </div>

        {/* Settings */}
        {(() => {
          const active = location.pathname === '/settings'
          return (
            <button onClick={() => go('/settings')}
              title={!expanded ? 'Settings' : undefined}
              style={{
                width:'100%', height:40, border:'none',
                borderRight: active ? '2px solid var(--accent)' : '2px solid transparent',
                background: active ? `rgba(var(--accent-rgb),.12)` : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text2)',
                cursor:'pointer', display:'flex', alignItems:'center',
                gap:12, paddingLeft:18, overflow:'hidden',
                transition:'background .15s, color .15s',
                fontFamily:'var(--font-body)', flexShrink:0,
              }}
              onMouseEnter={e=>{if(!active){e.currentTarget.style.background='var(--bg3)';e.currentTarget.style.color='var(--text)'}}}
              onMouseLeave={e=>{if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text2)'}}}>
              <span style={{ fontSize:17, width:20, textAlign:'center', lineHeight:1, flexShrink:0 }}>⊙</span>
              <span style={{ fontSize:13, fontWeight:active?600:400, whiteSpace:'nowrap',
                opacity:expanded?1:0, transition:'opacity .12s' }}>Settings</span>
            </button>
          )
        })()}
      </div>
    </>
  )
}