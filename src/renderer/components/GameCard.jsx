import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'


function ReviewBadge({ score }) {
  if (!score) return null
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
      <div style={{ width:8, height:8, borderRadius:'50%', background:color }} />
      <span style={{ fontSize:11, color, fontWeight:700 }}>{score}%</span>
    </div>
  )
}


export function GameCardGrid({ game, style }) {
  const [hov, setHov]     = useState(false)
  const [imgErr, setErr]  = useState(false)
  const [loaded, setLoaded] = useState(false)
  const launchGame        = useStore(s => s.launchGame)
  const setSelectedGame   = useStore(s => s.setSelectedGame)
  const runningGames      = useStore(s => s.runningGames)
  const isRunning         = runningGames.has(game.id)



  const baseHeader  = game.header  || (game.steamId ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/header.jpg`  : null)
  const portraitUrl = game.cover   || (game.steamId ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/library_600x900.jpg` : null)

  const [coverSrc, setCoverSrc] = useState(portraitUrl || baseHeader)
  const fallbackSrc = baseHeader

  const handleLaunch = async (e) => {
    e.stopPropagation()
    try { await launchGame(game); toast.success(`Launching ${game.name}…`) }
    catch (err) { toast.error(err.message) }
  }

  const accent = game.accentColor || 'var(--accent)'

  return (
    <div
      onClick={() => setSelectedGame(game)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'var(--bg3)',
        border: `1px solid ${hov ? `${accent}44` : 'var(--border)'}`,
        transform: hov ? 'translateY(-5px) scale(1.015)' : 'translateY(0) scale(1)',
        boxShadow: hov
          ? `0 20px 50px rgba(0,0,0,.7), 0 0 0 1px ${accent}33`
          : '0 4px 16px rgba(0,0,0,.4)',
        transition: 'transform .3s cubic-bezier(.34,1.4,.64,1), box-shadow .3s ease, border-color .2s',
        position: 'relative',
        willChange: 'transform',
        ...style,
      }}
    >
      {}
      <div style={{ aspectRatio:'3/4', position:'relative', overflow:'hidden', background:'var(--bg4)' }}>
        {!loaded && !imgErr && (
          <div className="shimmer" style={{ position:'absolute', inset:0, borderRadius:0 }} />
        )}

        {coverSrc && !imgErr ? (
          <img
            src={coverSrc}
            alt={game.name}
            onLoad={() => setLoaded(true)}
            onError={() => {
              if (fallbackSrc && coverSrc !== fallbackSrc) { setCoverSrc(fallbackSrc) }
              else { setErr(true) }
            }}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'top center',
              display: 'block',
              opacity: loaded ? 1 : 0,
              transition: 'opacity .4s ease, transform .5s ease',
              transform: hov ? 'scale(1.06)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, background:`linear-gradient(135deg, var(--bg4), var(--bg5))` }}>
            <span style={{ fontSize:42 }}>🎮</span>
            <span style={{ fontSize:11, color:'var(--text3)' }}>{game.name?.slice(0,16)}</span>
          </div>
        )}

        {}
        {isRunning && (
          <div style={{ position:'absolute', top:10, left:10, display:'flex', alignItems:'center', gap:5, background:'rgba(16,185,129,.9)', backdropFilter:'blur(8px)', borderRadius:20, padding:'4px 10px', fontSize:10, fontWeight:700, color:'#fff', animation:'runningPulse 2s infinite' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#fff' }} />
            RUNNING
          </div>
        )}

        {}
        {game.metacritic && (
          <div style={{ position:'absolute', top:10, right:10, width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:800, fontSize:12, color:'#fff', background: game.metacritic >= 75 ? 'rgba(16,185,129,.9)' : game.metacritic >= 50 ? 'rgba(245,158,11,.9)' : 'rgba(239,68,68,.9)', backdropFilter:'blur(6px)' }}>
            {game.metacritic}
          </div>
        )}

        {}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,.92) 0%, rgba(0,0,0,.4) 45%, transparent 100%)', opacity:hov?1:0, transition:'opacity .22s', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'14px 12px', gap:8 }}>
          <div style={{ color:'#fff', fontSize:12, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', textShadow:'0 1px 4px rgba(0,0,0,.8)' }}>{game.name}</div>
          {game.genres?.length > 0 && (
            <div style={{ display:'flex', gap:4, overflow:'hidden' }}>
              {game.genres.slice(0,2).map(g => (
                <span key={g} style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:`${accent}33`, color:accent, fontWeight:600, backdropFilter:'blur(4px)', whiteSpace:'nowrap' }}>{g}</span>
              ))}
            </div>
          )}
          <button
            onClick={handleLaunch}
            disabled={isRunning}
            style={{ padding:'9px', borderRadius:10, border:'none', background: isRunning ? 'rgba(16,185,129,.3)' : `${accent}ee`, backdropFilter:'blur(8px)', color:'#fff', fontSize:13, fontWeight:800, cursor:isRunning?'default':'pointer', fontFamily:'var(--font-display)', letterSpacing:'.5px', transition:'all .18s' }}
            onMouseEnter={e => { if (!isRunning) e.currentTarget.style.background = accent }}
            onMouseLeave={e => { if (!isRunning) e.currentTarget.style.background = `${accent}ee` }}
          >
            {isRunning ? '▶ RUNNING' : '▶ PLAY'}
          </button>
        </div>
      </div>

      {}
      <div style={{ padding:'10px 12px 12px' }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:5 }}>{game.name}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <ReviewBadge score={game.reviewScore} />
          {game.playtime > 0
            ? <span style={{ fontSize:11, color:'var(--text3)' }}>{game.playtime}h</span>
            : <span style={{ fontSize:11, color:'var(--text3)' }}>{game.released?.slice(0,4) || ''}</span>
          }
        </div>
      </div>
    </div>
  )
}


export function GameCardList({ game, index }) {
  const [hov, setHov]   = useState(false)
  const [imgErr, setErr] = useState(false)
  const launchGame      = useStore(s => s.launchGame)
  const setSelectedGame = useStore(s => s.setSelectedGame)
  const runningGames    = useStore(s => s.runningGames)
  const isRunning       = runningGames.has(game.id)


  const headerSrc = game.header || (game.steamId ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/header.jpg` : null)
  const coverSrc  = game.cover  || (game.steamId ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/library_600x900.jpg` : null) || headerSrc

  const handleLaunch = async (e) => {
    e.stopPropagation()
    try { await launchGame(game); toast.success(`Launching ${game.name}…`) }
    catch (err) { toast.error(err.message) }
  }

  return (
    <div
      onClick={() => setSelectedGame(game)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 14px', borderRadius:10, background:hov?'var(--bg3)':'transparent', border:`1px solid ${hov?'var(--border2)':'transparent'}`, cursor:'pointer', transition:'all .18s', animation:`fadeUp .3s ease ${index*25}ms backwards` }}
    >
      {}
      <div style={{ width:52, height:70, borderRadius:8, overflow:'hidden', flexShrink:0, background:'var(--bg4)' }}>
        {coverSrc && !imgErr
          ? <img src={coverSrc} alt="" onError={() => setErr(true)} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }} />
          : headerSrc && !imgErr
          ? <img src={headerSrc} alt="" onError={() => setErr(true)} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🎮</div>
        }
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{game.name}</span>
          {isRunning && <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'rgba(16,185,129,.15)', color:'var(--success)', flexShrink:0 }}>RUNNING</span>}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          {game.genres?.slice(0,3).map(g => <span key={g} style={{ fontSize:11, color:'var(--text3)' }}>{g}</span>)}
          {game.developer && <span style={{ fontSize:11, color:'var(--text3)' }}>· {game.developer}</span>}
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
        <ReviewBadge score={game.reviewScore} />
        {game.metacritic && <span style={{ fontSize:12, fontWeight:700, padding:'3px 8px', borderRadius:6, background:'rgba(16,185,129,.1)', color:'var(--success)' }}>MC {game.metacritic}</span>}
        <span style={{ fontSize:12, color:'var(--text3)', minWidth:50, textAlign:'right' }}>{game.playtime||0}h</span>
        <button onClick={handleLaunch} disabled={isRunning}
          style={{ padding:'8px 18px', borderRadius:8, border:`1px solid ${isRunning?'rgba(16,185,129,.3)':'rgba(var(--accent-rgb),.3)'}`, background:isRunning?'rgba(16,185,129,.08)':`rgba(var(--accent-rgb),.08)`, color:isRunning?'var(--success)':'var(--accent)', fontSize:12, fontWeight:700, cursor:isRunning?'default':'pointer', fontFamily:'var(--font-display)', transition:'all .18s' }}
          onMouseEnter={e=>{ if(!isRunning) e.currentTarget.style.background=`rgba(var(--accent-rgb),.16)` }}
          onMouseLeave={e=>{ if(!isRunning) e.currentTarget.style.background=`rgba(var(--accent-rgb),.08)` }}>
          {isRunning ? '▶ RUNNING' : '▶ PLAY'}
        </button>
      </div>
    </div>
  )
}