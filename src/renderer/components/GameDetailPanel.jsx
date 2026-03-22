import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useStore, STATUS_OPTIONS, COLLECTION_DEFAULTS } from '../store/useStore'
import toast from 'react-hot-toast'

const IS = typeof window !== 'undefined' && window.spicegames?.isElectron

const STATUS_COLORS = {
  'Not Started': '#6B7280',
  'Playing':     '#6366F1',
  'Completed':   '#10B981',
  'Dropped':     '#EF4444',
  'On Hold':     '#F59E0B',
}

function ReviewBar({ score, label }) {
  if (!score && score !== 0) return null
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
        <span style={{ fontSize:12, color:'var(--text2)' }}>{label}</span>
        <span style={{ fontSize:12, fontWeight:700, color }}>{score}%</span>
      </div>
      <div style={{ height:5, borderRadius:3, background:'var(--bg4)', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${score}%`, background:`linear-gradient(90deg,${color}88,${color})`, borderRadius:3, transition:'width .8s ease' }} />
      </div>
    </div>
  )
}

export default function GameDetailPanel() {
  const location = useLocation()
  if (location.pathname !== '/library') return null
  const game               = useStore(s => s.selectedGame)
  const setSelectedGame    = useStore(s => s.setSelectedGame)
  const launchGame         = useStore(s => s.launchGame)
  const removeGame         = useStore(s => s.removeGame)
  const updateGame         = useStore(s => s.updateGame)
  const runningGames       = useStore(s => s.runningGames)
  const collections        = useStore(s => s.collections)
  const addCollection      = useStore(s => s.addCollection)
  const toggleGameCollection = useStore(s => s.toggleGameCollection)

  useEffect(() => {
    const settings = window.__settingsCache || {}
    if (!IS || settings.hltbEnabled === false || !game.name) return
    window.spicegames.hltbSearch({ name: game.name })
      .then(res => { if (res.ok && res.results[0]) setHltb(res.results[0]) })
      .catch(() => {})
  }, [game.id])

  const setGameGoal          = useStore(s => s.setGameGoal)
  const settings             = useStore(s => s.settings)

  const [tab,         setTab]        = useState('about')
  const [confirmDel,  setConfirmDel] = useState(false)
  const [activeShot,  setActiveShot] = useState(null)
  const [notes,       setNotes]      = useState('')
  const [launchArgs,  setLaunchArgs] = useState('')
  const [preLaunch,   setPreLaunch]  = useState('')
  const [newExePath,  setNewExePath] = useState('')
  const [newExeLabel, setNewExeLabel]= useState('')
  const [newColName,  setNewColName] = useState('')
  const [goalInput,   setGoalInput]  = useState(game.goalMinutes ? String(Math.round(game.goalMinutes/60)) : '')
  const [achLoading,  setAchLoading] = useState(false)
  const [achievements,setAchs]       = useState(null)
  const [hltbData,    setHltb]       = useState(null)
  const [igdbData,    setIgdb]       = useState(null)

  const isRunning = runningGames.has(game?.id)

  useEffect(() => {
    if (!game) return
    setTab('about')
    setConfirmDel(false)
    setActiveShot(null)
    setNotes(game.notes || '')
    setLaunchArgs(game.launchArgs || '')
    setPreLaunch(game.preLaunchScript || '')
    setNewExePath('')
    setNewExeLabel('')
  }, [game?.id])

  if (!game) return null

  const handleLaunch = async (exeOverride) => {
    try { await launchGame(game, exeOverride); toast.success(`Launching ${game.name}…`) }
    catch (err) { toast.error(err.message) }
  }
  const handleReveal  = async () => { if (IS) await window.spicegames.revealInExplorer(game.exePath) }
  const handleDelete  = () => { removeGame(game.id); toast(`${game.name} removed`) }
  const saveNotes     = () => { updateGame(game.id, { notes }); toast.success('Notes saved') }
  const saveLaunchCfg = () => { updateGame(game.id, { launchArgs, preLaunchScript: preLaunch }); toast.success('Launch config saved') }

  const handleBrowsePreLaunch = async () => {
    if (!IS) return
    const r = await window.spicegames.browseExe()
    if (r) setPreLaunch(r.exePath)
  }

  const handleBrowseExe = async () => {
    if (!IS) return
    const r = await window.spicegames.browseExe()
    if (r) setNewExePath(r.exePath)
  }

  const addExe = () => {
    if (!newExePath.trim()) return
    const exeList = [...(game.exeList || []), { path: newExePath.trim(), label: newExeLabel.trim() || 'Alternate' }]
    updateGame(game.id, { exeList })
    setNewExePath(''); setNewExeLabel('')
    toast.success('Executable added')
  }

  const removeExe = (idx) => updateGame(game.id, { exeList: (game.exeList || []).filter((_,i) => i !== idx) })

  const fmt = (m) => !m ? '0m' : m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60 ? m%60+'m' : ''}`

  const headerUrl = game.header || (game.steamId ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/header.jpg` : null)
  const heroImg   = game.hero   || (game.steamId ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/library_hero.jpg` : null) || headerUrl

  const TABS = ['about','reviews','media','notes','collections','launch','exe','goals','mods']

  return (
    <div style={{ width:420, background:'var(--bg2)', borderLeft:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden', animation:'slideInRight .28s cubic-bezier(.4,0,.2,1)' }}>

      {/* Hero */}
      <div style={{ position:'relative', height:200, flexShrink:0, overflow:'hidden', background:'var(--bg4)' }}>
        {heroImg && <img src={heroImg} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}
          onError={e => { if (headerUrl && e.target.src !== headerUrl) e.target.src = headerUrl; else e.target.style.display = 'none' }} />}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(0,0,0,.1),rgba(0,0,0,.88))' }} />
        <button onClick={() => setSelectedGame(null)}
          style={{ position:'absolute', top:12, right:12, width:30, height:30, borderRadius:'50%', border:'none', background:'rgba(0,0,0,.55)', backdropFilter:'blur(8px)', color:'rgba(255,255,255,.85)', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        {isRunning && (
          <div style={{ position:'absolute', top:12, left:12, display:'flex', alignItems:'center', gap:5, background:'rgba(16,185,129,.88)', backdropFilter:'blur(8px)', borderRadius:20, padding:'4px 12px', fontSize:11, fontWeight:700, color:'#fff', animation:'runningPulse 2s infinite' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#fff' }} />RUNNING
          </div>
        )}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'12px 16px' }}>
          <div style={{ display:'flex', gap:6, marginBottom:6, flexWrap:'wrap' }}>
            {game.metacritic && <span style={{ fontSize:11, fontWeight:800, padding:'3px 9px', borderRadius:7, background:game.metacritic>=75?'rgba(16,185,129,.9)':'rgba(245,158,11,.9)', color:'#fff' }}>MC {game.metacritic}</span>}
            {game.reviewScore && <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:7, background:'rgba(99,102,241,.85)', color:'#fff' }}>👍 {game.reviewScore}%</span>}
            <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:7, background:`${STATUS_COLORS[game.status||'Not Started']}cc`, color:'#fff' }}>{game.status||'Not Started'}</span>
          </div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:900, color:'#fff', textShadow:'0 2px 8px rgba(0,0,0,.8)', lineHeight:1.2 }}>{game.name}</h2>
          {game.developer && <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', marginTop:3 }}>{game.developer}{game.released ? ` · ${game.released.slice(0,4)}` : ''}</div>}
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        {[
          { v:fmt(game.playtime),              l:'Playtime' },
          { v:fmt(game.longestSession||0),      l:'Best Session' },
          { v:game.sessions?.length||0,         l:'Sessions' },
        ].map((s,i) => (
          <div key={s.l} style={{ padding:'10px 0', textAlign:'center', borderRight:i<2?'1px solid var(--border)':'none' }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:14, color:'var(--accent)', lineHeight:1 }}>{s.v}</div>
            <div style={{ fontSize:10, color:'var(--text3)', marginTop:3, textTransform:'uppercase', letterSpacing:'.4px' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:8, padding:'10px 14px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <button onClick={() => handleLaunch()} disabled={isRunning}
          style={{ flex:1, padding:'10px', borderRadius:10, border:'none', background:isRunning?'rgba(16,185,129,.12)':`linear-gradient(135deg,var(--accent),var(--accent2))`, color:isRunning?'var(--success)':'#fff', fontSize:13, fontWeight:800, cursor:isRunning?'default':'pointer', fontFamily:'var(--font-display)', boxShadow:isRunning?'none':'var(--shadow-glow)', letterSpacing:'.4px', transition:'all .18s' }}>
          {isRunning ? '▶ RUNNING' : '▶ PLAY NOW'}
        </button>
        {[['📁', handleReveal, 'Show in Explorer'], ['🗑', ()=>setConfirmDel(true), 'Remove']].map(([icon, fn, title]) => (
          <button key={title} onClick={fn} title={title}
            style={{ width:38, height:38, borderRadius:9, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text2)', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .18s' }}
            onMouseEnter={e => { e.currentTarget.style.background = title==='Remove' ? 'rgba(239,68,68,.1)' : 'var(--bg4)'; e.currentTarget.style.color = title==='Remove' ? 'var(--danger)' : 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text2)' }}>
            {icon}
          </button>
        ))}
      </div>

      {confirmDel && (
        <div style={{ padding:'10px 14px', background:'rgba(239,68,68,.07)', borderBottom:'1px solid rgba(239,68,68,.18)', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <span style={{ fontSize:13, color:'var(--danger)', flex:1 }}>Remove "{game.name}"?</span>
          <button onClick={handleDelete} style={{ padding:'5px 12px', borderRadius:6, border:'none', background:'var(--danger)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>Remove</button>
          <button onClick={() => setConfirmDel(false)} style={{ padding:'5px 12px', borderRadius:6, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text2)', fontSize:12, cursor:'pointer' }}>Cancel</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', flexShrink:0, overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flexShrink:0, padding:'9px 10px', border:'none', background:'transparent', color:tab===t?'var(--accent)':'var(--text3)', fontSize:11, fontWeight:tab===t?700:400, cursor:'pointer', borderBottom:tab===t?'2px solid var(--accent)':'2px solid transparent', transition:'all .18s', fontFamily:'var(--font-body)', textTransform:'capitalize', whiteSpace:'nowrap' }}>
            {t === 'exe' ? 'EXE' : t === 'launch' ? 'Launch ⚙' : t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex:1, overflowY:'auto', padding:14 }}>

        {tab === 'about' && (
          <div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:8 }}>Status</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {STATUS_OPTIONS.map(s => (
                  <button key={s} onClick={() => updateGame(game.id, { status: s })}
                    style={{ padding:'5px 12px', borderRadius:20, border:`1px solid ${game.status===s ? STATUS_COLORS[s] : 'var(--border2)'}`, background:game.status===s ? `${STATUS_COLORS[s]}22` : 'transparent', color:game.status===s ? STATUS_COLORS[s] : 'var(--text3)', fontSize:12, fontWeight:game.status===s?700:400, cursor:'pointer', transition:'all .18s' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {game.description
              ? <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.85, marginBottom:14 }}>{game.description}</p>
              : <p style={{ fontSize:13, color:'var(--text3)', fontStyle:'italic', marginBottom:14 }}>No description available.</p>}
            {game.fullDesc && game.fullDesc !== game.description && (
              <details style={{ marginBottom:14 }}>
                <summary style={{ fontSize:12, color:'var(--accent)', cursor:'pointer', marginBottom:8 }}>Read full description</summary>
                <p style={{ fontSize:12, color:'var(--text3)', lineHeight:1.8, marginTop:8 }}>{game.fullDesc.slice(0,1200)}{game.fullDesc.length>1200?'…':''}</p>
              </details>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[['Developer',game.developer],['Publisher',game.publisher],['Released',game.released],['Platforms',game.platforms?.join(', ')],['Price',game.price],['Last Played',game.lastPlayed?new Date(game.lastPlayed).toLocaleDateString():null]].filter(([,v])=>v).map(([k,v]) => (
                <div key={k} style={{ display:'flex', gap:8 }}>
                  <span style={{ fontSize:11, color:'var(--text3)', fontWeight:600, minWidth:80, textAlign:'right', flexShrink:0 }}>{k}</span>
                  <span style={{ fontSize:12, color:'var(--text2)', flex:1, lineHeight:1.5 }}>{v}</span>
                </div>
              ))}
            </div>
            {game.tags?.length > 0 && (
              <div style={{ marginTop:14 }}>
                <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:7 }}>Tags</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {game.tags.slice(0,10).map(t => <span key={t} style={{ fontSize:11, padding:'3px 9px', borderRadius:20, background:'var(--bg4)', color:'var(--text3)', border:'1px solid var(--border)' }}>{t}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div>
            <div style={{ background:'var(--bg3)', borderRadius:12, padding:16, marginBottom:14, border:'1px solid var(--border)' }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:12, textTransform:'uppercase', letterSpacing:'.5px' }}>Scores</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <ReviewBar score={game.reviewScore} label="Steam User Reviews" />
                {game.metacritic && <ReviewBar score={game.metacritic} label="Metacritic" />}
                {game.openCriticScore && <ReviewBar score={game.openCriticScore} label="OpenCritic" />}
              </div>
            </div>
            {!game.reviewScore && !game.metacritic && (
              <div style={{ textAlign:'center', padding:'30px 20px', color:'var(--text3)' }}><div style={{ fontSize:32, marginBottom:8, opacity:.3 }}>📊</div><p>No review data</p></div>
            )}
          </div>
        )}

        {tab === 'media' && (
          <div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>Watch on YouTube</div>
              {[`${game.name} official trailer`, `${game.name} gameplay`, `${game.name} review`].map(q => (
                <a key={q} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`} target="_blank" rel="noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)', textDecoration:'none', transition:'all .18s', marginBottom:7 }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(239,68,68,.4)';e.currentTarget.style.background='rgba(239,68,68,.06)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg3)'}}>
                  <div style={{ width:28, height:28, borderRadius:7, background:'#FF0000', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', flexShrink:0 }}>▶</div>
                  <span style={{ fontSize:13, color:'var(--text)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{q}</span>
                  <span style={{ fontSize:11, color:'var(--text3)' }}>↗</span>
                </a>
              ))}
            </div>
            {game.screenshots?.length > 0 && (
              <div>
                <div style={{ fontSize:11, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>Screenshots</div>
                {activeShot !== null && (
                  <div style={{ marginBottom:8, borderRadius:10, overflow:'hidden', border:'1px solid var(--border)' }}>
                    <img src={game.screenshots[activeShot]} alt="" style={{ width:'100%', display:'block', aspectRatio:'16/9', objectFit:'cover' }} />
                  </div>
                )}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                  {game.screenshots.map((s,i) => (
                    <div key={i} onClick={() => setActiveShot(i===activeShot?null:i)}
                      style={{ borderRadius:7, overflow:'hidden', cursor:'pointer', border:`2px solid ${activeShot===i?'var(--accent)':'transparent'}`, transition:'border-color .18s' }}>
                      <img src={s} alt="" style={{ width:'100%', aspectRatio:'16/9', objectFit:'cover', display:'block' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'notes' && (
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:8 }}>Session Notes & Journal</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Write your thoughts, progress, tips, strategies…"
              style={{ width:'100%', minHeight:160, background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--text)', fontFamily:'var(--font-body)', fontSize:13, padding:12, borderRadius:10, outline:'none', resize:'vertical', lineHeight:1.7 }} />
            <button onClick={saveNotes}
              style={{ marginTop:10, width:'100%', padding:10, borderRadius:9, border:'none', background:`linear-gradient(135deg,var(--accent),var(--accent2))`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)', boxShadow:'var(--shadow-glow)' }}>
              Save Notes
            </button>
            {game.sessions?.length > 0 && (
              <div style={{ marginTop:18 }}>
                <div style={{ fontSize:11, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>Session History</div>
                {[...game.sessions].reverse().slice(0,10).map((s,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'var(--bg3)', borderRadius:8, border:'1px solid var(--border)', fontSize:12, marginBottom:6 }}>
                    <span style={{ color:'var(--text2)' }}>{new Date(s.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
                    <span style={{ color:'var(--accent)', fontWeight:600 }}>{fmt(s.duration)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'collections' && (
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:10 }}>Assign to Collections</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
              {collections.map(col => {
                const inCol = (game.collections || []).includes(col)
                return (
                  <button key={col} onClick={() => toggleGameCollection(game.id, col)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:9, border:`1px solid ${inCol?'var(--accent)':'var(--border)'}`, background:inCol?`rgba(var(--accent-rgb),.1)`:'var(--bg3)', cursor:'pointer', transition:'all .18s', textAlign:'left' }}>
                    <div style={{ width:18, height:18, borderRadius:5, border:`2px solid ${inCol?'var(--accent)':'var(--border2)'}`, background:inCol?'var(--accent)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', flexShrink:0 }}>{inCol?'✓':''}</div>
                    <span style={{ fontSize:13, color:inCol?'var(--accent)':'var(--text2)', fontWeight:inCol?600:400 }}>{col}</span>
                  </button>
                )
              })}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <input value={newColName} onChange={e=>setNewColName(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'&&newColName.trim()){ addCollection(newColName); setNewColName('') }}}
                placeholder="New collection name…"
                style={{ flex:1, background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--text)', fontFamily:'var(--font-body)', padding:'8px 12px', borderRadius:8, fontSize:13, outline:'none' }} />
              <button onClick={() => { if(newColName.trim()){ addCollection(newColName); setNewColName('') }}}
                style={{ padding:'8px 14px', borderRadius:8, border:'none', background:'var(--accent)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>Add</button>
            </div>
          </div>
        )}

        {tab === 'launch' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>Launch Arguments</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginBottom:8, lineHeight:1.6 }}>Flags passed to the exe, e.g. <code style={{ background:'var(--bg4)', padding:'1px 5px', borderRadius:3 }}>--dx12 -fullscreen</code></div>
              <input value={launchArgs} onChange={e=>setLaunchArgs(e.target.value)} placeholder="e.g. --dx12 -windowed"
                style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--text)', fontFamily:'monospace', padding:'9px 12px', borderRadius:8, fontSize:12, outline:'none' }} />
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>Pre-Launch Script</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginBottom:8, lineHeight:1.6 }}>Run before the game launches. Useful for starting mods, VPNs, or closing apps. Waits up to 5s.</div>
              <div style={{ display:'flex', gap:8 }}>
                <input value={preLaunch} onChange={e=>setPreLaunch(e.target.value)} placeholder="Path to script or .exe…"
                  style={{ flex:1, background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--text)', fontFamily:'monospace', padding:'9px 12px', borderRadius:8, fontSize:12, outline:'none' }} />
                <button onClick={handleBrowsePreLaunch} style={{ padding:'9px 12px', borderRadius:8, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text)', fontSize:13, cursor:'pointer' }}>📂</button>
              </div>
            </div>
            <button onClick={saveLaunchCfg}
              style={{ padding:10, borderRadius:9, border:'none', background:`linear-gradient(135deg,var(--accent),var(--accent2))`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)', boxShadow:'var(--shadow-glow)' }}>
              Save Launch Config
            </button>
          </div>
        )}

        {tab === 'goals' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {hltbData && (
              <div style={{ padding:'12px 14px', borderRadius:10, background:'rgba(245,196,24,.06)', border:'1px solid rgba(245,196,24,.2)', marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#f5c518', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                  ⏱ HowLongToBeat — {hltbData.name}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                  {[['Main Story',hltbData.mainStory],['Main + Extra',hltbData.mainExtra],['Completionist',hltbData.completionist]].filter(([,v])=>v).map(([label,hours])=>(
                    <div key={label} style={{ textAlign:'center', padding:'8px 6px', borderRadius:8, background:'var(--bg4)' }}>
                      <div style={{ fontSize:16, fontWeight:800, color:'var(--text)', fontFamily:'var(--font-display)' }}>{hours}h</div>
                      <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>Playtime Goal</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginBottom:10, lineHeight:1.6 }}>Set a target playtime in hours. Progress shows on the library card.</div>
              <div style={{ display:'flex', gap:8 }}>
                <div style={{ display:'flex', alignItems:'center', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:8, padding:'8px 12px', flex:1, gap:6 }}>
                  <input value={goalInput} onChange={e=>setGoalInput(e.target.value)} placeholder="Hours e.g. 50"
                    style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, fontFamily:'var(--font-body)', width:80 }} />
                  <span style={{ fontSize:12, color:'var(--text3)' }}>hours</span>
                </div>
                <button onClick={() => { const h=parseFloat(goalInput); if(!isNaN(h)&&h>0){ setGameGoal(game.id, Math.round(h*60)); toast.success(`Goal set: ${h}h`) } else { setGameGoal(game.id,0); setGoalInput(''); toast('Goal removed') }}}
                  style={{ padding:'8px 16px', borderRadius:8, border:'none', background:'var(--accent)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  Set
                </button>
              </div>
            </div>

            {game.goalMinutes > 0 && (
              <div style={{ padding:16, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13 }}>
                  <span style={{ color:'var(--text2)' }}>Progress</span>
                  <span style={{ color:'var(--accent)', fontWeight:700 }}>
                    {fmt(game.playtime||0)} / {fmt(game.goalMinutes)}
                  </span>
                </div>
                <div style={{ height:8, borderRadius:4, background:'var(--bg4)', overflow:'hidden', marginBottom:8 }}>
                  <div style={{ height:'100%', width:`${Math.min(100,((game.playtime||0)/game.goalMinutes)*100)}%`, background:`linear-gradient(90deg,var(--accent),var(--accent2))`, borderRadius:4, transition:'width .5s ease' }} />
                </div>
                <div style={{ fontSize:12, color:'var(--text3)', textAlign:'center' }}>
                  {Math.min(100,Math.round(((game.playtime||0)/game.goalMinutes)*100))}% complete
                  {(game.playtime||0) >= game.goalMinutes && ' · 🎉 Goal reached!'}
                </div>
              </div>
            )}

            {game.sessions?.length > 0 && game.goalMinutes > 0 && (
              <div style={{ fontSize:12, color:'var(--text3)', padding:'10px 12px', background:'var(--bg3)', borderRadius:8, border:'1px solid var(--border)' }}>
                At your average session pace of {fmt(Math.round((game.sessions.reduce((t,s)=>t+s.duration,0)/game.sessions.length)))} per session,
                you need about {Math.max(0, Math.ceil((game.goalMinutes-(game.playtime||0)) / (game.sessions.reduce((t,s)=>t+s.duration,0)/game.sessions.length||1)))} more sessions to reach your goal.
              </div>
            )}
          </div>
        )}

        {tab === 'mods' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ fontSize:12, color:'var(--text3)', marginBottom:4, lineHeight:1.6 }}>
              Search and browse mods for <strong style={{ color:'var(--text)' }}>{game.name}</strong> on Nexus Mods.
            </div>
            {[
              { label:'Browse All Mods',          icon:'🔍', q:game.name },
              { label:'Top Rated Mods',           icon:'⭐', q:`${game.name} top` },
              { label:'Gameplay Overhaul Mods',   icon:'⚔️', q:`${game.name} overhaul` },
              { label:'Graphics / Visual Mods',   icon:'✨', q:`${game.name} graphics` },
              { label:'UI / Interface Mods',      icon:'🖥', q:`${game.name} ui interface` },
            ].map(({ label, icon, q }) => (
              <a key={label}
                href={`https://www.nexusmods.com/search/?gsearch=${encodeURIComponent(q)}&gsearchtype=mods`}
                target="_blank" rel="noreferrer"
                style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:9, background:'var(--bg3)', border:'1px solid var(--border)', textDecoration:'none', transition:'all .18s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='var(--bg4)';e.currentTarget.style.borderColor='rgba(var(--accent-rgb),.3)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='var(--bg3)';e.currentTarget.style.borderColor='var(--border)'}}>
                <span style={{ fontSize:18, flexShrink:0 }}>{icon}</span>
                <span style={{ fontSize:13, color:'var(--text)', flex:1 }}>{label}</span>
                <span style={{ fontSize:11, color:'var(--text3)' }}>↗</span>
              </a>
            ))}

            {game.steamId && settings?.steamApiKey && (
              <div style={{ marginTop:8 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.5px' }}>Steam Achievements</div>
                {achLoading ? (
                  <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text3)', fontSize:13 }}>
                    <div style={{ width:14, height:14, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
                    Loading achievements…
                  </div>
                ) : achievements ? (
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13 }}>
                      <span style={{ color:'var(--text2)' }}>Unlocked</span>
                      <span style={{ color:'var(--accent)', fontWeight:700 }}>{achievements.unlocked}/{achievements.total} ({achievements.pct}%)</span>
                    </div>
                    <div style={{ height:6, borderRadius:3, background:'var(--bg4)', overflow:'hidden', marginBottom:12 }}>
                      <div style={{ height:'100%', width:`${achievements.pct}%`, background:`linear-gradient(90deg,var(--accent),var(--accent2))`, borderRadius:3 }} />
                    </div>
                    {achievements.list.slice(0,8).map((a,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0', borderBottom:'1px solid var(--border)', opacity:a.achieved?1:.4 }}>
                        {a.icon ? <img src={a.icon} alt="" style={{ width:28, height:28, borderRadius:5 }} /> : <span style={{ fontSize:20 }}>{a.achieved?'🏆':'🔒'}</span>}
                        <span style={{ fontSize:12, color:'var(--text2)', flex:1 }}>{a.displayName}</span>
                        {a.achieved && a.unlockTime && <span style={{ fontSize:10, color:'var(--text3)' }}>{new Date(a.unlockTime*1000).toLocaleDateString()}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <button onClick={async () => {
                    setAchLoading(true)
                    try {
                      const res = await window.spicegames.getAchievements({ steamKey:settings.steamApiKey, steamId:settings.steamUserId, appId:game.steamId })
                      if (res.ok) setAchs(res)
                      else toast.error('Could not load achievements')
                    } catch { toast.error('Achievement fetch failed') }
                    setAchLoading(false)
                  }}
                    style={{ padding:'9px 18px', borderRadius:8, border:'none', background:`rgba(var(--accent-rgb),.15)`, color:'var(--accent)', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                    🏆 Load Achievements
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'exe' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:12 }}>
              <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:5 }}>Primary</div>
              <div style={{ fontSize:11, color:'var(--text2)', fontFamily:'monospace', wordBreak:'break-all', lineHeight:1.7, marginBottom:8 }}>{game.exePath||'Not set'}</div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => handleLaunch()} disabled={isRunning}
                  style={{ flex:1, padding:'7px', borderRadius:7, border:'none', background:isRunning?'var(--bg5)':`rgba(var(--accent-rgb),.2)`, color:isRunning?'var(--text3)':'var(--accent)', fontSize:12, fontWeight:700, cursor:isRunning?'default':'pointer' }}>
                  {isRunning?'Running':'▶ Launch'}
                </button>
                <button onClick={handleReveal} style={{ padding:'7px 10px', borderRadius:7, border:'1px solid var(--border2)', background:'var(--bg4)', color:'var(--text2)', fontSize:12, cursor:'pointer' }}>📁</button>
              </div>
            </div>

            {(game.exeList||[]).map((exe,i) => (
              <div key={i} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:12 }}>
                <div style={{ fontSize:11, color:'var(--accent)', fontWeight:600, marginBottom:4 }}>{exe.label}</div>
                <div style={{ fontSize:11, color:'var(--text3)', fontFamily:'monospace', wordBreak:'break-all', lineHeight:1.6, marginBottom:8 }}>{exe.path}</div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => handleLaunch(exe.path)} style={{ flex:1, padding:'6px', borderRadius:7, border:'none', background:`rgba(var(--accent-rgb),.15)`, color:'var(--accent)', fontSize:12, fontWeight:700, cursor:'pointer' }}>▶ Launch</button>
                  <button onClick={() => removeExe(i)} style={{ padding:'6px 10px', borderRadius:7, border:'1px solid rgba(239,68,68,.2)', background:'rgba(239,68,68,.08)', color:'var(--danger)', fontSize:12, cursor:'pointer' }}>✕</button>
                </div>
              </div>
            ))}

            <div style={{ background:'var(--bg3)', border:'1px dashed var(--border2)', borderRadius:10, padding:12 }}>
              <div style={{ fontSize:11, color:'var(--text2)', fontWeight:600, marginBottom:8 }}>Add Alternate Executable</div>
              <input value={newExeLabel} onChange={e=>setNewExeLabel(e.target.value)} placeholder="Label (e.g. DX12 Mode)"
                style={{ width:'100%', background:'var(--bg4)', border:'1px solid var(--border2)', color:'var(--text)', fontFamily:'var(--font-body)', padding:'7px 10px', borderRadius:7, fontSize:12, outline:'none', marginBottom:8 }} />
              <div style={{ display:'flex', gap:8 }}>
                <input value={newExePath} onChange={e=>setNewExePath(e.target.value)} placeholder="Path to .exe"
                  style={{ flex:1, background:'var(--bg4)', border:'1px solid var(--border2)', color:'var(--text)', fontFamily:'monospace', padding:'7px 10px', borderRadius:7, fontSize:11, outline:'none' }} />
                <button onClick={handleBrowseExe} style={{ padding:'7px 10px', borderRadius:7, border:'1px solid var(--border2)', background:'var(--bg4)', color:'var(--text2)', fontSize:12, cursor:'pointer' }}>📂</button>
                <button onClick={addExe} disabled={!newExePath.trim()} style={{ padding:'7px 14px', borderRadius:7, border:'none', background:'var(--accent)', color:'#fff', fontSize:12, fontWeight:700, cursor:newExePath.trim()?'pointer':'default', opacity:newExePath.trim()?1:.5 }}>Add</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}