import logoSvg from '../logo.svg'
import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

const IS = typeof window !== 'undefined' && window.spicegames != null

const THEMES = [
  { id:'dark',  label:'Dark',    accent:'#6366F1', desc:'Indigo'  },
  { id:'red',   label:'Crimson', accent:'#EF4444', desc:'Red'     },
  { id:'neon',  label:'Neon',    accent:'#00FF88', desc:'Green'   },
  { id:'ember', label:'Ember',   accent:'#F97316', desc:'Orange'  },
]

const SORT_OPTS = [
  { v:'name',       l:'Name A–Z'       },
  { v:'lastPlayed', l:'Recently Played' },
  { v:'playtime',   l:'Most Played'    },
  { v:'rating',     l:'Top Rated'      },
  { v:'added',      l:'Recently Added' },
]

function Card({ title, children }) {
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
      <div style={{ padding:'10px 18px', borderBottom:'1px solid var(--border)', fontSize:10, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'1.2px' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Row({ label, desc, children, last }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:16, padding:'12px 18px', borderBottom:last?'none':'1px solid var(--border)', minHeight:50 }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, color:'var(--text)', fontWeight:500 }}>{label}</div>
        {desc && <div style={{ fontSize:11, color:'var(--text3)', marginTop:2, lineHeight:1.5 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink:0 }}>{children}</div>
    </div>
  )
}

function Toggle({ value, onChange, disabled }) {
  return (
    <div onClick={() => !disabled && onChange(!value)}
      style={{ width:42, height:23, borderRadius:12, background:value?'var(--accent)':'var(--bg5)', border:`1px solid ${value?'var(--accent)':'var(--border2)'}`, position:'relative', cursor:disabled?'not-allowed':'pointer', transition:'all .2s', opacity:disabled?.4:1, flexShrink:0 }}>
      <div style={{ position:'absolute', top:2, left:value?20:2, width:17, height:17, borderRadius:'50%', background:'#fff', transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.3)' }} />
    </div>
  )
}

function Sel({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--text)', fontFamily:'var(--font-body)', padding:'6px 24px 6px 10px', borderRadius:8, fontSize:12, outline:'none', cursor:'pointer', appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238B89A8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 8px center' }}>
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  )
}

export default function SettingsPage() {
  const settings     = useStore(s => s.settings)
  const saveSettings = useStore(s => s.saveSettings)
  const applyTheme   = useStore(s => s.applyTheme)
  const games        = useStore(s => s.games)

  const [local,          setLocal]         = useState(settings || {})
  const [version,        setVersion]       = useState('1.0.0')
  const [startupStatus,  setStartupStatus] = useState({ enabled:false, supported:false })
  const [startupLoading, setStartupLoading]= useState(false)

  useEffect(() => {
    if (settings) setLocal(settings)
    if (IS) {
      window.spicegames.getAppVersion().then(v => setVersion(v)).catch(()=>{})
      window.spicegames.getStartupStatus().then(s => setStartupStatus(s)).catch(()=>{})
    }
  }, [settings])

  const set = (k, v) => { setLocal(p => ({...p,[k]:v})); saveSettings({[k]:v}) }

  const handleTheme = id => { applyTheme(id); setLocal(p => ({...p, theme:id})) }

  const handleStartup = async enable => {
    if (!IS) return
    setStartupLoading(true)
    try {
      await window.spicegames.setRunOnStartup(enable)
      set('runOnStartup', enable)
      setStartupStatus(s => ({...s, enabled:enable}))
      toast.success(enable ? 'SpiceDeck will launch on startup' : 'Removed from startup')
    } catch { toast.error('Failed to update startup setting') }
    setStartupLoading(false)
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(games, null, 2)], { type:'application/json' })
    const url  = URL.createObjectURL(blob)
    Object.assign(document.createElement('a'), { href:url, download:'spicedeck-library.json' }).click()
    URL.revokeObjectURL(url)
    toast.success('Library exported!')
  }

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'20px 22px 80px' }}>
      <div style={{ maxWidth:620, margin:'0 auto' }}>

        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
          <img src={logoSvg} alt="" style={{ width:40, height:40, borderRadius:11, boxShadow:'0 4px 14px rgba(99,102,241,.3)' }} />
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:19, fontWeight:900, color:'var(--text)', lineHeight:1 }}>Settings</div>
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:3 }}>SpiceDeck v{version}</div>
          </div>
        </div>

        {}
        <Card title="Appearance">
          <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, marginBottom:10, textTransform:'uppercase', letterSpacing:'.5px' }}>Theme</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
              {THEMES.map(t => {
                const active = (local.theme || 'dark') === t.id
                return (
                  <button key={t.id} onClick={() => handleTheme(t.id)}
                    style={{ padding:'12px 6px', borderRadius:10, border:`2px solid ${active ? t.accent : 'var(--border2)'}`, background:active ? `${t.accent}14` : 'var(--bg3)', cursor:'pointer', transition:'all .18s', textAlign:'center' }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:t.accent, boxShadow:`0 0 8px ${t.accent}`, margin:'0 auto 8px' }} />
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:11, color:active ? t.accent : 'var(--text)', marginBottom:2 }}>{t.label}</div>
                    <div style={{ fontSize:9, color:'var(--text3)' }}>{t.desc}</div>
                    {active && <div style={{ fontSize:11, color:t.accent, marginTop:3 }}>✓</div>}
                  </button>
                )
              })}
            </div>
          </div>
          <Row label="Default library view">
            <Sel value={local.defaultView || 'grid'} onChange={v => set('defaultView', v)}
              options={[{v:'grid',l:'Grid'},{v:'list',l:'List'}]} />
          </Row>
          <Row label="Default sort order" last>
            <Sel value={local.sortBy || 'name'} onChange={v => set('sortBy', v)} options={SORT_OPTS} />
          </Row>
        </Card>

        {}
        <Card title="System">
          <Row label="Run on startup"
            desc={!IS ? 'Desktop app only' : !startupStatus.supported ? 'Available after installing the built .exe' : 'Launch SpiceDeck when Windows starts'}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {startupLoading && <div style={{ width:13, height:13, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite' }} />}
              <Toggle
                value={startupStatus.enabled || local.runOnStartup === true}
                onChange={handleStartup}
                disabled={!IS || !startupStatus.supported || startupLoading}
              />
            </div>
          </Row>
          <Row label="Minimize to tray" desc="Closing the window keeps SpiceDeck running in the system tray">
            <Toggle value={local.minimizeToTray === true} onChange={v => set('minimizeToTray', v)} />
          </Row>
          <Row label="Minimize on game launch" desc="Hide window when a game starts">
            <Toggle value={local.minimizeOnLaunch !== false} onChange={v => set('minimizeOnLaunch', v)} />
          </Row>
          <Row label="Track playtime" desc="Record how long each session lasts" last>
            <Toggle value={local.trackPlaytime !== false} onChange={v => set('trackPlaytime', v)} />
          </Row>
        </Card>

        {}
        <Card title="Library & Metadata">
          <Row label="Auto-fill metadata" desc="Search Steam automatically when you browse for a game .exe">
            <Toggle value={local.autoFill !== false} onChange={v => set('autoFill', v)} />
          </Row>
          <Row label="Games in library">
            <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, color:'var(--accent)' }}>{games.length}</span>
          </Row>
          <Row label="Export library" desc="Download your library as a JSON backup" last>
            <button onClick={handleExport}
              style={{ padding:'7px 16px', borderRadius:8, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text)', fontSize:12, cursor:'pointer', transition:'background .15s', fontFamily:'var(--font-body)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}>
              📤 Export JSON
            </button>
          </Row>
        </Card>

        {}
        <Card title="Data Sources">
          {[
            { name:'Steam Store',   dot:'#1a9fff', info:'Search · Descriptions · Pricing · Genres · Screenshots' },
            { name:'SteamSpy',      dot:'#c6d4df', info:'Owner estimates · Avg playtime · Community tags' },
            { name:'OpenCritic',    dot:'#F28C28', info:'Critic review scores from 300+ outlets' },
            { name:'Steam CDN',     dot:'#66c0f4', info:'Cover art · Headers · Hero banners' },
            { name:'CheapShark',    dot:'#10B981', info:'Game deals — Steam, GOG, Epic, Humble' },
            { name:'itch.io',       dot:'#FA6432', info:'Independent games browse & search' },
          ].map((api, i, arr) => (
            <div key={api.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 18px', borderBottom:i < arr.length-1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:api.dot, flexShrink:0, boxShadow:`0 0 5px ${api.dot}` }} />
              <div style={{ flex:1, minWidth:0 }}>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginRight:8 }}>{api.name}</span>
                <span style={{ fontSize:11, color:'var(--text3)' }}>{api.info}</span>
              </div>
              <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:20, background:'rgba(16,185,129,.1)', color:'var(--success)', border:'1px solid rgba(16,185,129,.2)', flexShrink:0 }}>FREE</span>
            </div>
          ))}
        </Card>

        {}
        <Card title="Legal & About">
          <Row label="Privacy Policy">
            <a href="https://ash-kernel.github.io/spicegames/#legal" target="_blank" rel="noreferrer"
              style={{ fontSize:12, color:'var(--accent)', textDecoration:'none', padding:'6px 12px', borderRadius:7, border:'1px solid var(--border2)', background:'var(--bg3)', display:'inline-block', transition:'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}>
              View ↗
            </a>
          </Row>
          <Row label="Terms of Service">
            <a href="https://ash-kernel.github.io/spicegames/#legal" target="_blank" rel="noreferrer"
              style={{ fontSize:12, color:'var(--accent)', textDecoration:'none', padding:'6px 12px', borderRadius:7, border:'1px solid var(--border2)', background:'var(--bg3)', display:'inline-block', transition:'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}>
              View ↗
            </a>
          </Row>
          <div style={{ padding:'14px 18px', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:14 }}>
            <img src={logoSvg} alt="" style={{ width:40, height:40, borderRadius:10, flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:14, color:'var(--text)' }}>SpiceDeck</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>v{version} · Electron 28 · React 18</div>
            </div>
            <a href="https://github.com/ash-kernel" target="_blank" rel="noreferrer"
              style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'1px solid var(--border2)', background:'var(--bg3)', textDecoration:'none', transition:'background .15s', flexShrink:0 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--text)"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.164 6.839 9.49.5.09.682-.218.682-.484 0-.236-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.337 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .269.18.579.688.481C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
              <span style={{ fontSize:12, color:'var(--text)' }}>ash-kernel ↗</span>
            </a>
          </div>
        </Card>

      </div>
    </div>
  )
}