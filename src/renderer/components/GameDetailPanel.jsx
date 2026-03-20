import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

const IS = typeof window !== 'undefined' && window.spicegames?.isElectron

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
  const game            = useStore(s => s.selectedGame)
  const setSelectedGame = useStore(s => s.setSelectedGame)
  const launchGame      = useStore(s => s.launchGame)
  const removeGame      = useStore(s => s.removeGame)
  const runningGames    = useStore(s => s.runningGames)

  const [tab,         setTab]        = useState('about')
  const [confirmDel,  setConfirmDel] = useState(false)
  const [trailerQuery,setTQ]         = useState('')
  const [activeShot,  setActiveShot] = useState(null)

  const isRunning = runningGames.has(game?.id)

  useEffect(() => {
    if (game) {
      setTab('about')
      setConfirmDel(false)
      setActiveShot(null)

      setTQ(encodeURIComponent(`${game.name} official trailer gameplay 2024`))
    }
  }, [game?.id])

  if (!game) return null

  const handleLaunch = async () => {
    try { await launchGame(game); toast.success(`Launching ${game.name}…`) }
    catch (err) { toast.error(err.message) }
  }
  const handleReveal = async () => { if (IS) await window.spicegames.revealInExplorer(game.exePath) }
  const handleDelete = () => { removeGame(game.id); toast(`${game.name} removed`) }

  const fmt = (m) => !m ? '0m' : m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60 ? m%60+'m' : ''}`



  const headerUrl = game.header  || (game.steamId ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/header.jpg` : null)
  const heroImg   = game.hero    || (game.steamId ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/library_hero.jpg` : null) || headerUrl
  const coverImg  = game.cover   || (game.steamId ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/library_600x900.jpg` : null) || headerUrl

  const tabs = ['about','reviews','media','exe']

  return (
    <div style={{ width:420, background:'var(--bg2)', borderLeft:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden', animation:'slideInRight .28s cubic-bezier(.4,0,.2,1)' }}>

      {}
      <div style={{ position:'relative', height:210, flexShrink:0, overflow:'hidden', background:'var(--bg4)' }}>
        {heroImg && (
          <img src={heroImg} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }}
            onError={e => {
              if (headerUrl && e.target.src !== headerUrl) { e.target.src = headerUrl }
              else if (coverImg && e.target.src !== coverImg) { e.target.src = coverImg }
              else e.target.style.display = 'none'
            }} />
        )}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,.15) 0%, rgba(0,0,0,.88) 100%)' }} />

        {}
        <button onClick={() => setSelectedGame(null)}
          style={{ position:'absolute', top:12, right:12, width:30, height:30, borderRadius:'50%', border:'none', background:'rgba(0,0,0,.55)', backdropFilter:'blur(8px)', color:'rgba(255,255,255,.85)', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .18s' }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,0,0,.8)';e.currentTarget.style.color='#fff'}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,0,0,.55)';e.currentTarget.style.color='rgba(255,255,255,.85)'}}>
          ×
        </button>

        {}
        {isRunning && (
          <div style={{ position:'absolute', top:12, left:12, display:'flex', alignItems:'center', gap:5, background:'rgba(16,185,129,.88)', backdropFilter:'blur(8px)', borderRadius:20, padding:'4px 12px', fontSize:11, fontWeight:700, color:'#fff', animation:'runningPulse 2s infinite' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#fff' }} />
            RUNNING
          </div>
        )}

        {}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'14px 16px' }}>
          {}
          <div style={{ display:'flex', gap:6, marginBottom:7, flexWrap:'wrap' }}>
            {game.metacritic && (
              <span style={{ fontSize:11, fontWeight:800, padding:'3px 9px', borderRadius:7, background: game.metacritic>=75?'rgba(16,185,129,.9)':game.metacritic>=50?'rgba(245,158,11,.9)':'rgba(239,68,68,.9)', color:'#fff' }}>
                MC {game.metacritic}
              </span>
            )}
            {game.reviewScore && (
              <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:7, background:'rgba(99,102,241,.85)', color:'#fff' }}>
                👍 {game.reviewScore}%
              </span>
            )}
            {game.genres?.slice(0,2).map(g => (
              <span key={g} style={{ fontSize:10, fontWeight:600, padding:'3px 9px', borderRadius:7, background:'rgba(0,0,0,.5)', backdropFilter:'blur(4px)', color:'rgba(255,255,255,.8)' }}>{g}</span>
            ))}
          </div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:900, color:'#fff', textShadow:'0 2px 8px rgba(0,0,0,.8)', lineHeight:1.2 }}>{game.name}</h2>
          {game.developer && <div style={{ fontSize:12, color:'rgba(255,255,255,.55)', marginTop:3 }}>{game.developer}{game.released?` · ${game.released.slice(0,4)}`:''}</div>}
        </div>
      </div>

      {}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        {[
          { v: fmt(game.playtime), l:'Playtime' },
          { v: game.price || '—',  l:'Price' },
          { v: game.released?.slice(0,4) || '—', l:'Released' },
        ].map((s,i) => (
          <div key={s.l} style={{ padding:'11px 0', textAlign:'center', borderRight: i<2 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:16, color:'var(--accent)', lineHeight:1 }}>{s.v}</div>
            <div style={{ fontSize:10, color:'var(--text3)', marginTop:3, textTransform:'uppercase', letterSpacing:'.4px' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {}
      <div style={{ display:'flex', gap:8, padding:'12px 14px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <button onClick={handleLaunch} disabled={isRunning}
          style={{ flex:1, padding:'11px', borderRadius:10, border:'none', background: isRunning ? 'rgba(16,185,129,.12)' : `linear-gradient(135deg,var(--accent),var(--accent2))`, color: isRunning ? 'var(--success)' : '#fff', fontSize:14, fontWeight:800, cursor:isRunning?'default':'pointer', fontFamily:'var(--font-display)', boxShadow: isRunning?'none':'var(--shadow-glow)', letterSpacing:'.5px', transition:'all .18s' }}
          onMouseEnter={e=>{ if(!isRunning) e.currentTarget.style.opacity='.9' }}
          onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
          {isRunning ? '▶ RUNNING' : '▶ PLAY NOW'}
        </button>
        <button onClick={handleReveal} title="Show in Explorer"
          style={{ width:40, height:40, borderRadius:10, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text2)', fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .18s' }}
          onMouseEnter={e=>{e.currentTarget.style.background='var(--bg4)';e.currentTarget.style.color='var(--text)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='var(--bg3)';e.currentTarget.style.color='var(--text2)'}}>
          📁
        </button>
        <button onClick={() => setConfirmDel(true)} title="Remove"
          style={{ width:40, height:40, borderRadius:10, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text3)', fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .18s' }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,.1)';e.currentTarget.style.color='var(--danger)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='var(--bg3)';e.currentTarget.style.color='var(--text3)'}}>
          🗑
        </button>
      </div>

      {}
      {confirmDel && (
        <div style={{ padding:'10px 14px', background:'rgba(239,68,68,.07)', borderBottom:'1px solid rgba(239,68,68,.18)', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <span style={{ fontSize:13, color:'var(--danger)', flex:1 }}>Remove "{game.name}"?</span>
          <button onClick={handleDelete} style={{ padding:'5px 12px', borderRadius:6, border:'none', background:'var(--danger)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>Remove</button>
          <button onClick={() => setConfirmDel(false)} style={{ padding:'5px 12px', borderRadius:6, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text2)', fontSize:12, cursor:'pointer' }}>Cancel</button>
        </div>
      )}

      {}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex:1, padding:'10px 4px', border:'none', background:'transparent', color: tab===t ? 'var(--accent)' : 'var(--text3)', fontSize:12, fontWeight: tab===t ? 700 : 400, cursor:'pointer', borderBottom: tab===t ? '2px solid var(--accent)' : '2px solid transparent', transition:'all .18s', fontFamily:'var(--font-body)', textTransform:'capitalize' }}>
            {t === 'exe' ? 'EXE' : t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {}
      <div style={{ flex:1, overflowY:'auto', padding:14 }}>

        {}
        {tab === 'about' && (
          <div>
            {game.description
              ? <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.85, marginBottom:16 }}>{game.description}</p>
              : <p style={{ fontSize:13, color:'var(--text3)', fontStyle:'italic', marginBottom:16 }}>No description available.</p>}

            {game.fullDesc && game.fullDesc !== game.description && (
              <details style={{ marginBottom:16 }}>
                <summary style={{ fontSize:12, color:'var(--accent)', cursor:'pointer', marginBottom:8 }}>Read full description</summary>
                <p style={{ fontSize:12, color:'var(--text3)', lineHeight:1.8, marginTop:8 }}>{game.fullDesc?.slice(0,1200)}{game.fullDesc?.length>1200?'…':''}</p>
              </details>
            )}

            {}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                ['Developer',  game.developer],
                ['Publisher',  game.publisher],
                ['Release',    game.released],
                ['Platforms',  game.platforms?.join(', ')],
                ['Price',      game.price],
                ['Playtime',   game.playtime ? fmt(game.playtime) : null],
                ['Last played',game.lastPlayed ? new Date(game.lastPlayed).toLocaleDateString() : null],
              ].filter(([,v])=>v).map(([k,v]) => (
                <div key={k} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                  <span style={{ fontSize:11, color:'var(--text3)', fontWeight:600, minWidth:84, textAlign:'right', paddingTop:1, flexShrink:0 }}>{k}</span>
                  <span style={{ fontSize:12, color:'var(--text2)', flex:1, lineHeight:1.5 }}>{v}</span>
                </div>
              ))}
            </div>

            {}
            {}
            {game.owners && (
              <div style={{ marginTop:12, padding:'10px 12px', background:'var(--bg3)', borderRadius:8, border:'1px solid var(--border)', display:'flex', gap:16 }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.4px', marginBottom:3 }}>Owners</div>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>{game.owners}</div>
                </div>
                {game.avgPlaytime > 0 && (
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.4px', marginBottom:3 }}>Avg. Playtime</div>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>{Math.round(game.avgPlaytime/60)}h</div>
                  </div>
                )}
              </div>
            )}

            {game.tags?.length > 0 && (
              <div style={{ marginTop:14 }}>
                <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:7 }}>Tags</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {game.tags.slice(0,10).map(t => (
                    <span key={t} style={{ fontSize:11, padding:'3px 9px', borderRadius:20, background:'var(--bg4)', color:'var(--text3)', border:'1px solid var(--border)' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {}
        {tab === 'reviews' && (
          <div>
            {}
            <div style={{ background:'var(--bg3)', borderRadius:12, padding:16, marginBottom:16, border:'1px solid var(--border)' }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:12, textTransform:'uppercase', letterSpacing:'.5px' }}>Score Overview</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <ReviewBar score={game.reviewScore} label="Steam User Reviews" />
                {game.metacritic && <ReviewBar score={game.metacritic} label="Metacritic" />}
              </div>
            </div>

            {}
            {game.reviewScore && (
              <div style={{ padding:14, borderRadius:10, border:'1px solid var(--border)', background:'var(--bg3)', marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ fontSize:36, fontFamily:'var(--font-display)', fontWeight:900, color: game.reviewScore>=80?'var(--success)':game.reviewScore>=60?'var(--warning)':'var(--danger)' }}>
                    {game.reviewScore}%
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>
                      {game.reviewScore >= 95 ? 'Overwhelmingly Positive'
                       : game.reviewScore >= 80 ? 'Very Positive'
                       : game.reviewScore >= 70 ? 'Mostly Positive'
                       : game.reviewScore >= 40 ? 'Mixed'
                       : 'Negative'}
                    </div>
                    <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>Based on Steam user reviews</div>
                  </div>
                </div>
              </div>
            )}

            {}
            {game.openCriticScore && (
              <a href={game.openCriticUrl} target="_blank" rel="noreferrer"
                style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg3)', textDecoration:'none', transition:'all .18s', marginBottom:10 }}
                onMouseEnter={e=>{e.currentTarget.style.background='var(--bg4)';e.currentTarget.style.borderColor='var(--border2)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='var(--bg3)';e.currentTarget.style.borderColor='var(--border)'}}>
                <div style={{ width:36, height:36, borderRadius:8, background:'#F28C28', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:900, fontSize:13, color:'#fff', flexShrink:0 }}>{game.openCriticScore}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>OpenCritic Score</div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>{game.openCriticOutlets || 'Critic reviews'} ↗</div>
                </div>
              </a>
            )}

            {game.metacriticUrl && (
              <a href={game.metacriticUrl} target="_blank" rel="noreferrer"
                style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg3)', textDecoration:'none', transition:'all .18s', marginBottom:16 }}
                onMouseEnter={e=>{e.currentTarget.style.background='var(--bg4)';e.currentTarget.style.borderColor='var(--border2)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='var(--bg3)';e.currentTarget.style.borderColor='var(--border)'}}>
                <div style={{ width:36, height:36, borderRadius:8, background: game.metacritic>=75?'#2ECC71':game.metacritic>=50?'#F59E0B':'#EF4444', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:900, fontSize:14, color:'#fff', flexShrink:0 }}>{game.metacritic}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>View on Metacritic</div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>See critic reviews and scores ↗</div>
                </div>
              </a>
            )}

            {(!game.reviewScore && !game.metacritic) && (
              <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--text3)' }}>
                <div style={{ fontSize:36, marginBottom:8, opacity:.3 }}>📊</div>
                <p>No review data available for this game</p>
              </div>
            )}
          </div>
        )}

        {}
        {tab === 'media' && (
          <div>
            {}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>Trailer / Gameplay</div>
              <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid var(--border)', background:'var(--bg3)' }}>
                {}
                <div style={{ padding:16, display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>
                    Watch trailers and gameplay videos on YouTube.
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {[
                      { label:`${game.name} — Official Trailer`, q:`${game.name} official trailer` },
                      { label:`${game.name} — Gameplay`,        q:`${game.name} gameplay 2024` },
                      { label:`${game.name} — Review`,          q:`${game.name} review` },
                    ].map(({ label, q }) => (
                      <a key={q}
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`}
                        target="_blank" rel="noreferrer"
                        style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, background:'var(--bg4)', border:'1px solid var(--border)', textDecoration:'none', transition:'all .18s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(239,68,68,.4)';e.currentTarget.style.background='rgba(239,68,68,.06)'}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg4)'}}>
                        <div style={{ width:30, height:30, borderRadius:7, background:'#FF0000', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>▶</div>
                        <span style={{ fontSize:13, color:'var(--text)', flex:1 }}>{label}</span>
                        <span style={{ fontSize:11, color:'var(--text3)' }}>YouTube ↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {}
            {game.screenshots?.length > 0 && (
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>Screenshots</div>
                {}
                {activeShot !== null && (
                  <div style={{ marginBottom:8, borderRadius:10, overflow:'hidden', border:'1px solid var(--border)' }}>
                    <img src={game.screenshots[activeShot]} alt="" style={{ width:'100%', display:'block', aspectRatio:'16/9', objectFit:'cover' }} />
                  </div>
                )}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                  {game.screenshots.map((s,i) => (
                    <div key={i} onClick={() => setActiveShot(i === activeShot ? null : i)}
                      style={{ borderRadius:7, overflow:'hidden', cursor:'pointer', border:`2px solid ${activeShot===i?'var(--accent)':'transparent'}`, transition:'border-color .18s' }}
                      onMouseEnter={e=>e.currentTarget.style.opacity='.8'}
                      onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                      <img src={s} alt="" style={{ width:'100%', aspectRatio:'16/9', objectFit:'cover', display:'block' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!game.screenshots?.length && (
              <div style={{ textAlign:'center', padding:'30px 20px', color:'var(--text3)' }}>
                <div style={{ fontSize:36, opacity:.3, marginBottom:8 }}>🖼</div>
                <p style={{ fontSize:13 }}>No screenshots available</p>
              </div>
            )}
          </div>
        )}

        {}
        {tab === 'exe' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:14 }}>
              <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:6 }}>Executable Path</div>
              <div style={{ fontSize:12, color:'var(--text2)', fontFamily:'monospace', wordBreak:'break-all', lineHeight:1.7 }}>{game.exePath || 'Not set'}</div>
            </div>
            <button onClick={handleReveal}
              style={{ padding:'10px', borderRadius:9, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-body)', textAlign:'center', transition:'background .18s' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
              onMouseLeave={e=>e.currentTarget.style.background='var(--bg3)'}>
              📁 Reveal in Explorer
            </button>
            {game.steamId && (
              <a href={`https://store.steampowered.com/app/${game.steamId}`} target="_blank" rel="noreferrer"
                style={{ padding:'10px', borderRadius:9, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--accent)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-body)', textAlign:'center', textDecoration:'none', display:'block', transition:'background .18s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
                onMouseLeave={e=>e.currentTarget.style.background='var(--bg3)'}>
                View on Steam Store ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}