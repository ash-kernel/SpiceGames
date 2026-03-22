import React, { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

const STATUS_DOT = { 'Playing':'#6366F1', 'Completed':'#10B981', 'Dropped':'#EF4444', 'On Hold':'#F59E0B', 'Not Started':'#6B7280' }

function fmt(m) { return !m ? null : m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60?m%60+'m':''}` }

function Cover({ game, compact }) {
  const baseHeader  = game.header || (game.steamId ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/header.jpg` : null)
  const portraitUrl = game.cover  || (game.steamId ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/library_600x900.jpg` : null)
  const [src, setSrc]       = useState(portraitUrl || baseHeader)
  const [tried, setTried]   = useState(false)
  const [loaded, setLoaded] = useState(false)

  const onErr = () => {
    if (!tried && baseHeader && src !== baseHeader) { setSrc(baseHeader); setTried(true) }
    else setSrc(null)
  }

  if (!src) return (
    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,var(--bg4),var(--bg5))', fontSize: compact ? 20 : 36, opacity:.4 }}>🎮</div>
  )
  return (
    <>
      {!loaded && <div className="shimmer" style={{ position:'absolute', inset:0, borderRadius:0 }} />}
      <img src={src} alt="" onLoad={() => setLoaded(true)} onError={onErr}
        style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center', display:'block', opacity:loaded?1:0, transition:'opacity .3s' }} />
    </>
  )
}

export function GameCardGrid({ game, compact }) {
  const [hov, setHov]       = useState(false)
  const launchGame          = useStore(s => s.launchGame)
  const setSelectedGame     = useStore(s => s.setSelectedGame)
  const runningGames        = useStore(s => s.runningGames)
  const isRunning           = runningGames.has(game.id)
  const lastSession         = game.sessions?.length ? game.sessions[game.sessions.length-1] : null
  const statusColor         = STATUS_DOT[game.status||'Not Started']

  const handleLaunch = async (e) => {
    e.stopPropagation()
    try { await launchGame(game); toast.success(`Launching ${game.name}…`) }
    catch (err) { toast.error(err.message) }
  }

  if (compact) {
    return (
      <div onClick={() => setSelectedGame(game)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ borderRadius:10, overflow:'hidden', cursor:'pointer', background:'var(--bg3)', border:`1px solid ${hov?'rgba(var(--accent-rgb),.25)':'var(--border)'}`, transition:'all .18s', display:'flex', alignItems:'center', gap:10, padding:8, position:'relative' }}>
        <div style={{ width:40, height:40, borderRadius:7, overflow:'hidden', position:'relative', flexShrink:0 }}>
          <Cover game={game} compact />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{game.name}</div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:statusColor, flexShrink:0 }} />
            <span style={{ fontSize:11, color:'var(--text3)' }}>{game.status||'Not Started'}</span>
            {fmt(game.playtime) && <span style={{ fontSize:11, color:'var(--text3)' }}>· {fmt(game.playtime)}</span>}
          </div>
        </div>
        {isRunning && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:20, background:'rgba(16,185,129,.2)', color:'var(--success)' }}>●</span>}
        <button onClick={handleLaunch} disabled={isRunning}
          style={{ width:28, height:28, borderRadius:7, border:'none', background:isRunning?'var(--bg5)':`rgba(var(--accent-rgb),.15)`, color:isRunning?'var(--text3)':'var(--accent)', fontSize:12, cursor:isRunning?'default':'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          ▶
        </button>
      </div>
    )
  }

  return (
    <div onClick={() => setSelectedGame(game)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ borderRadius:14, overflow:'hidden', cursor:'pointer', background:'var(--bg3)', border:`1px solid ${hov?'rgba(var(--accent-rgb),.3)':'var(--border)'}`, transform:hov?'translateY(-5px) scale(1.015)':'translateY(0) scale(1)', boxShadow:hov?'0 20px 50px rgba(0,0,0,.7),0 0 0 1px rgba(var(--accent-rgb),.2)':'0 4px 16px rgba(0,0,0,.4)', transition:'transform .3s cubic-bezier(.34,1.4,.64,1),box-shadow .3s,border-color .2s', position:'relative', willChange:'transform' }}>
      <div style={{ aspectRatio:'3/4', overflow:'hidden', background:'var(--bg4)', position:'relative' }}>
        <Cover game={game} />

        {isRunning && (
          <div style={{ position:'absolute', top:10, left:10, display:'flex', alignItems:'center', gap:5, background:'rgba(16,185,129,.88)', borderRadius:20, padding:'3px 10px', fontSize:10, fontWeight:700, color:'#fff', backdropFilter:'blur(6px)', animation:'runningPulse 2s infinite' }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#fff' }} />RUNNING
          </div>
        )}

        <div style={{ position:'absolute', top:8, right:8, width:10, height:10, borderRadius:'50%', background:statusColor, boxShadow:`0 0 6px ${statusColor}` }} title={game.status||'Not Started'} />

        {game.metacritic && (
          <div style={{ position:'absolute', bottom:8, right:8, width:30, height:30, borderRadius:7, background:game.metacritic>=75?'#2ECC71':game.metacritic>=50?'#F59E0B':'#EF4444', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:800, fontSize:11, color:'#fff' }}>
            {game.metacritic}
          </div>
        )}

        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.9) 0%,rgba(0,0,0,.2) 40%,transparent 70%)', opacity:hov?1:0, transition:'opacity .22s', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:12, gap:8 }}>
          <button onClick={handleLaunch} disabled={isRunning}
            style={{ width:'100%', padding:'8px', borderRadius:9, border:'none', background:isRunning?'rgba(16,185,129,.2)':`linear-gradient(135deg,var(--accent),var(--accent2))`, color:isRunning?'var(--success)':'#fff', fontSize:12, fontWeight:700, cursor:isRunning?'default':'pointer', fontFamily:'var(--font-display)', letterSpacing:'.3px', transition:'all .18s' }}>
            {isRunning ? '● RUNNING' : '▶ PLAY'}
          </button>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.6)', textAlign:'center' }}>
            {game.genres?.slice(0,2).join(' · ')}
          </div>
        </div>
      </div>

      <div style={{ padding:'10px 11px 12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex:1 }}>{game.name}</div>
          {game.categories?.includes('Full controller support') && <span title="Full controller support" style={{ fontSize:12, flexShrink:0 }}>🎮</span>}
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, minWidth:0 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:statusColor, flexShrink:0 }} />
            <span style={{ fontSize:11, color:'var(--text3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{game.status||'Not Started'}</span>
          </div>
          {lastSession && <span style={{ fontSize:10, color:'var(--text3)', flexShrink:0, whiteSpace:'nowrap' }}>{fmt(lastSession.duration)}</span>}
        </div>
        {game.goalMinutes > 0 && (
          <div style={{ marginTop:6 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3, fontSize:10, color:'var(--text3)' }}>
              <span>Goal</span>
              <span>{Math.min(100,Math.round(((game.playtime||0)/game.goalMinutes)*100))}%</span>
            </div>
            <div style={{ height:3, borderRadius:2, background:'var(--bg4)', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${Math.min(100,((game.playtime||0)/game.goalMinutes)*100)}%`, background:`linear-gradient(90deg,var(--accent),var(--accent2))`, borderRadius:2, transition:'width .4s ease' }} />
            </div>
          </div>
        )}
        {!game.goalMinutes && fmt(game.playtime) && (
          <div style={{ fontSize:11, color:'var(--accent)', marginTop:3, fontWeight:600 }}>{fmt(game.playtime)} total</div>
        )}
      </div>
    </div>
  )
}

export function GameCardList({ game }) {
  const [hov, setHov]     = useState(false)
  const launchGame        = useStore(s => s.launchGame)
  const setSelectedGame   = useStore(s => s.setSelectedGame)
  const runningGames      = useStore(s => s.runningGames)
  const isRunning         = runningGames.has(game.id)
  const statusColor       = STATUS_DOT[game.status||'Not Started']
  const lastSession       = game.sessions?.length ? game.sessions[game.sessions.length-1] : null

  const headerSrc = game.header || (game.steamId ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/header.jpg` : null)
  const coverSrc  = game.cover  || (game.steamId ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/library_600x900.jpg` : null) || headerSrc
  const [imgSrc, setImgSrc] = useState(coverSrc)
  const [tried, setTried]   = useState(false)

  const handleLaunch = async (e) => {
    e.stopPropagation()
    try { await launchGame(game); toast.success(`Launching ${game.name}…`) }
    catch (err) { toast.error(err.message) }
  }

  return (
    <div onClick={() => setSelectedGame(game)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 14px', borderRadius:12, cursor:'pointer', background:hov?'var(--bg3)':'transparent', border:`1px solid ${hov?'var(--border2)':'transparent'}`, transition:'all .18s' }}>
      <div style={{ width:56, height:56, borderRadius:8, overflow:'hidden', background:'var(--bg4)', flexShrink:0, position:'relative' }}>
        {imgSrc
          ? <img src={imgSrc} alt="" onError={() => { if(!tried&&headerSrc){setImgSrc(headerSrc);setTried(true)}else setImgSrc(null) }} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, opacity:.4 }}>🎮</div>}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{game.name}</div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:statusColor, flexShrink:0 }} />
            <span style={{ fontSize:11, color:'var(--text3)' }}>{game.status||'Not Started'}</span>
          </div>
          {game.genres?.length > 0 && <span style={{ fontSize:11, color:'var(--text3)' }}>{game.genres.slice(0,2).join(', ')}</span>}
          {lastSession && <span style={{ fontSize:11, color:'var(--text3)' }}>Last: {fmt(lastSession.duration)}</span>}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        {fmt(game.playtime) && <span style={{ fontSize:12, color:'var(--accent)', fontWeight:600 }}>{fmt(game.playtime)}</span>}
        {game.metacritic && <span style={{ fontSize:11, fontWeight:700, width:28, height:28, borderRadius:7, background:game.metacritic>=75?'rgba(16,185,129,.15)':'rgba(245,158,11,.15)', color:game.metacritic>=75?'var(--success)':'var(--warning)', display:'flex', alignItems:'center', justifyContent:'center' }}>{game.metacritic}</span>}
        <button onClick={handleLaunch} disabled={isRunning}
          style={{ padding:'7px 14px', borderRadius:8, border:'none', background:isRunning?'rgba(16,185,129,.12)':`rgba(var(--accent-rgb),.15)`, color:isRunning?'var(--success)':'var(--accent)', fontSize:12, fontWeight:700, cursor:isRunning?'default':'pointer', fontFamily:'var(--font-display)', transition:'all .18s', letterSpacing:'.3px' }}>
          {isRunning ? '● ON' : '▶'}
        </button>
      </div>
    </div>
  )
}