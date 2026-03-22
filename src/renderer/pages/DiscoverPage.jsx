import React, { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

const IS = typeof window !== 'undefined' && window.spicegames != null

const MODES = [
  { id:'trending',  label:'🔥 Trending'    },
  { id:'new',       label:'🆕 New'         },
  { id:'toprated',  label:'⭐ Top Rated'   },
]

const GENRES = [
  { id:'',           label:'All'         },
  { id:'action',     label:'Action'      },
  { id:'rpg',        label:'RPG'         },
  { id:'shooter',    label:'Shooter'     },
  { id:'adventure',  label:'Adventure'   },
  { id:'strategy',   label:'Strategy'    },
  { id:'indie',      label:'Indie'       },
  { id:'simulation', label:'Simulation'  },
  { id:'puzzle',     label:'Puzzle'      },
  { id:'horror',     label:'Horror'      },
  { id:'sports',     label:'Sports'      },
  { id:'racing',     label:'Racing'      },
  { id:'casual',     label:'Casual'      },
]

// ─── helpers ─────────────────────────────────────────────────────────────────

function ratioColor(pos, neg) {
  if (!pos && !neg) return '#6B7280'
  const total = pos + neg
  if (!total) return '#6B7280'
  const r = pos / total
  if (r >= 0.80) return '#10B981'
  if (r >= 0.60) return '#F59E0B'
  return '#EF4444'
}
function ratioLabel(pos, neg) {
  const total = pos + neg
  if (!total) return null
  const r = pos / total
  if (r >= 0.95) return 'Overwhelmingly +'
  if (r >= 0.80) return 'Very Positive'
  if (r >= 0.70) return 'Mostly +'
  if (r >= 0.40) return 'Mixed'
  if (r >= 0.20) return 'Mostly -'
  return 'Overwhelmingly -'
}
function fmtOwners(o) {
  if (!o) return null
  const n = parseInt(o.split('..')[0].replace(/[^0-9]/g, ''))
  if (isNaN(n) || n === 0) return null
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M owners`
  if (n >= 1_000)     return `${(n/1_000).toFixed(0)}k owners`
  return `${n} owners`
}
function hFmt(h) {
  if (!h) return null
  return h < 1 ? '<1h' : `${Math.round(h)}h`
}

// ─── GameCard ─────────────────────────────────────────────────────────────────

function GameCard({ game, hltb, onSelect, inLib, index }) {
  const [imgSrc,  setImgSrc]  = useState(game.cover)
  const [fallback,setFallback]= useState(0)
  const [loaded,  setLoaded]  = useState(false)
  const [hov,     setHov]     = useState(false)

  const FALLBACKS = [game.cover, game.capsule, game.header]
  const onErr = () => {
    const next = fallback + 1
    if (next < FALLBACKS.length) { setFallback(next); setImgSrc(FALLBACKS[next]) }
  }

  const col   = ratioColor(game.positive, game.negative)
  const label = ratioLabel(game.positive, game.negative)
  const owners= fmtOwners(game.owners)
  const hltbH = hltb?.mainStory

  return (
    <div
      onClick={() => onSelect(game)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'var(--bg2)',
        border: `1px solid ${hov ? 'rgba(var(--accent-rgb),.4)' : 'var(--border)'}`,
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov
          ? '0 16px 44px rgba(0,0,0,.65), 0 0 0 1px rgba(var(--accent-rgb),.12)'
          : '0 2px 10px rgba(0,0,0,.35)',
        transition: 'all .2s cubic-bezier(.4,0,.2,1)',
        animation: `fadeUp .3s ease ${Math.min(index,16)*25}ms backwards`,
      }}
    >
      {/* Image */}
      <div style={{ aspectRatio:'3/4', position:'relative', overflow:'hidden', background:'var(--bg4)' }}>
        {!loaded && <div className="shimmer" style={{ position:'absolute', inset:0 }} />}
        <img
          src={imgSrc} alt=""
          onLoad={() => setLoaded(true)}
          onError={onErr}
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', opacity:loaded?1:0, transition:'opacity .3s, transform .4s', transform: hov ? 'scale(1.05)' : 'scale(1)' }}
        />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,.82) 100%)' }} />

        {inLib && (
          <div style={{ position:'absolute', top:8, right:8, fontSize:9, fontWeight:700, padding:'3px 7px', borderRadius:20, background:'rgba(16,185,129,.88)', color:'#fff', backdropFilter:'blur(6px)' }}>
            ✓ IN LIBRARY
          </div>
        )}

        {hov && (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,.3)' }}>
            <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,.15)', border:'2px solid rgba(255,255,255,.6)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
          </div>
        )}

        <div style={{ position:'absolute', bottom:8, left:8, right:8 }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:12, color:'#fff', lineHeight:1.3, textShadow:'0 1px 6px rgba(0,0,0,.8)', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {game.name}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:'8px 10px 10px', display:'flex', flexDirection:'column', gap:5 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:6 }}>
          {label && (
            <span style={{ fontSize:10, fontWeight:700, color:col }}>
              {label}
            </span>
          )}
          {game.price && (
            <span style={{ fontSize:11, fontWeight:700, color: game.price==='Free'?'#10B981':'var(--text)', background:'var(--bg4)', padding:'2px 7px', borderRadius:6 }}>
              {game.price}
            </span>
          )}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          {hltbH && (
            <span style={{ fontSize:10, color:'#f5c518', display:'flex', alignItems:'center', gap:3 }}>
              ⏱ {hFmt(hltbH)}
            </span>
          )}
          {!hltbH && game.avgPlaytime > 0 && (
            <span style={{ fontSize:10, color:'var(--text3)' }}>~{game.avgPlaytime}h avg</span>
          )}
          {owners && <span style={{ fontSize:10, color:'var(--text3)' }}>{owners}</span>}
        </div>
      </div>
    </div>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ game, onClose }) {
  const [d,       setD]       = useState(null)
  const [hltb,    setHltb]    = useState(null)
  const [bigShot, setBig]     = useState(null)
  const [loading, setLoading] = useState(true)
  const addGame = useStore(s => s.addGame)
  const games   = useStore(s => s.games)
  const inLib   = games.some(g => String(g.steamId) === String(game.steamId))

  useEffect(() => {
    const esc = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  useEffect(() => {
    if (!IS) { setLoading(false); return }
    window.spicegames.discoverDetails({ steamId: game.steamId })
      .then(r => { if (r.ok) setD(r); setLoading(false) })
      .catch(() => setLoading(false))
    const settings = useStore.getState().settings || {}
    if (settings.hltbEnabled !== false) {
      window.spicegames.hltbSearch({ name: game.name })
        .then(r => r.ok && r.results?.[0] && setHltb(r.results[0]))
        .catch(() => {})
    }
  }, [game.steamId, game.name])

  const info = d || game
  const ratioC = ratioColor(info.positive, info.negative)
  const label  = ratioLabel(info.positive, info.negative)

  const handleAdd = () => {
    if (inLib) return
    addGame({ name:info.name, steamId:info.steamId, cover:info.cover, header:info.header, status:'Not Started' })
    toast.success(`${info.name} added to library!`)
  }

  return (
    <div onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.92)', backdropFilter:'blur(20px)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:20, animation:'fadeIn .18s ease' }}>
      <div style={{ width:'100%', maxWidth:820, maxHeight:'92vh', background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:20, overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 50px 120px rgba(0,0,0,.9)', animation:'fadeInScale .22s ease' }}>

        {/* Hero */}
        <div style={{ height:220, position:'relative', flexShrink:0, background:'var(--bg4)', overflow:'hidden' }}>
          <img src={info.hero || info.header} alt=""
            style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.6 }}
            onError={e => { e.target.src = info.header }}
          />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,.2) 0%, rgba(0,0,0,.85) 100%)' }} />
          <button onClick={onClose}
            style={{ position:'absolute', top:12, right:12, width:34, height:34, borderRadius:'50%', border:'none', background:'rgba(0,0,0,.65)', color:'#fff', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            ×
          </button>
          <div style={{ position:'absolute', bottom:16, left:20, right:60 }}>
            <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap', alignItems:'center' }}>
              {info.metacritic && <span style={{ fontSize:12, fontWeight:800, padding:'3px 9px', borderRadius:7, background: info.metacritic>=80?'#10B981':info.metacritic>=60?'#F59E0B':'#EF4444', color:'#fff' }}>{info.metacritic} MC</span>}
              {label && <span style={{ fontSize:11, fontWeight:700, color:ratioC }}>● {label}</span>}
              {info.price && <span style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:20, background:'rgba(0,0,0,.5)', color:'#fff', backdropFilter:'blur(4px)' }}>{info.price}</span>}
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:900, color:'#fff', margin:0, lineHeight:1.15, textShadow:'0 2px 12px rgba(0,0,0,.9)' }}>{info.name}</h2>
            {d?.developers?.[0] && <div style={{ fontSize:12, color:'rgba(255,255,255,.55)', marginTop:4 }}>by {d.developers.join(', ')}</div>}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'18px 22px 20px' }}>
          {loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[90,70,85,60,75].map((w,i) => <div key={i} className="shimmer" style={{ height:13, borderRadius:6, width:`${w}%` }} />)}
            </div>
          )}

          {!loading && (
            <>
              {/* HLTB */}
              {hltb && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:18, padding:'12px 14px', borderRadius:12, background:'rgba(245,196,24,.07)', border:'1px solid rgba(245,196,24,.2)' }}>
                  <div style={{ gridColumn:'1/-1', fontSize:11, fontWeight:700, color:'#f5c518', marginBottom:4 }}>⏱ HowLongToBeat — {hltb.name}</div>
                  {[['Main Story', hltb.mainStory],['Main + Extra', hltb.mainExtra],['Completionist', hltb.completionist]].filter(([,v])=>v).map(([l,h])=>(
                    <div key={l} style={{ textAlign:'center', padding:'8px 4px', borderRadius:8, background:'var(--bg4)' }}>
                      <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, color:'var(--text)' }}>{hFmt(h)}</div>
                      <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>{l}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              {d?.description && <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.75, marginBottom:16 }}>{d.description}</p>}

              {/* Info grid */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
                {[
                  ['Released',     d?.releaseDate],
                  ['Genres',       d?.genres?.slice(0,3).join(', ')],
                  ['Developer',    d?.developers?.slice(0,2).join(', ')],
                  ['Publisher',    d?.publishers?.[0]],
                  ['Avg Playtime', d?.avgPlaytime ? `~${d.avgPlaytime}h` : null],
                  ['Peak Players', d?.peakCCU ? d.peakCCU.toLocaleString() : null],
                  ['Owners',       fmtOwners(d?.owners)],
                  ['Platforms',    d?.platforms?.join(', ')],
                ].filter(([,v]) => v).map(([k,v]) => (
                  <div key={k} style={{ padding:'8px 10px', borderRadius:9, background:'var(--bg3)', border:'1px solid var(--border)' }}>
                    <div style={{ fontSize:10, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:2 }}>{k}</div>
                    <div style={{ fontSize:12, color:'var(--text)', fontWeight:500 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Screenshots */}
              {d?.screenshots?.length > 0 && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>Screenshots</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                    {d.screenshots.slice(0,6).map((s,i) => (
                      <div key={i} onClick={e=>{e.stopPropagation();setBig(bigShot===s?null:s)}}
                        style={{ borderRadius:8, overflow:'hidden', aspectRatio:'16/9', cursor:'zoom-in', border:`2px solid ${bigShot===s?'var(--accent)':'transparent'}`, transition:'border-color .15s' }}>
                        <img src={s} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                      </div>
                    ))}
                  </div>
                  {bigShot && (
                    <div style={{ marginTop:8, borderRadius:12, overflow:'hidden', cursor:'zoom-out' }} onClick={()=>setBig(null)}>
                      <img src={bigShot} alt="" style={{ width:'100%', display:'block' }} />
                    </div>
                  )}
                </div>
              )}

              {/* Categories/tags */}
              {d?.categories?.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {d.categories.map(t => (
                    <span key={t} style={{ fontSize:11, padding:'3px 9px', borderRadius:20, background:'var(--bg4)', color:'var(--text3)', border:'1px solid var(--border)' }}>{t}</span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'12px 20px', borderTop:'1px solid var(--border)', display:'flex', gap:10, flexShrink:0 }}>
          <button onClick={handleAdd} disabled={inLib}
            style={{ flex:1, padding:'10px', borderRadius:10, border:'none', background:inLib?'var(--bg3)':`linear-gradient(135deg,var(--accent),var(--accent2))`, color:inLib?'var(--text3)':'#fff', fontSize:13, fontWeight:700, cursor:inLib?'default':'pointer', fontFamily:'var(--font-body)', boxShadow:inLib?'none':'var(--shadow-glow)', transition:'all .18s' }}>
            {inLib ? '✓ In Library' : '+ Add to Library'}
          </button>
          <button onClick={() => window.spicegames?.openExternal(`https://store.steampowered.com/app/${game.steamId}`)}
            style={{ padding:'10px 18px', borderRadius:10, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-body)', transition:'background .15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
            onMouseLeave={e=>e.currentTarget.style.background='var(--bg3)'}>
            🔗 Steam Page
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const [games,    setGames]   = useState([])
  const [hltbMap,  setHltbMap] = useState({})
  const [loading,  setLoading] = useState(false)
  const [moreLoad, setMoreLoad]= useState(false)
  const [hasMore,  setHasMore] = useState(true)
  const [page,     setPage]    = useState(1)
  const [mode,     setMode]    = useState('trending')
  const [genre,    setGenre]   = useState('')
  const [query,    setQuery]   = useState('')
  const [selected, setSelected]= useState(null)
  const settings  = useStore(s => s.settings) || {}
  const libGames  = useStore(s => s.games)
  const inLib = id => libGames.some(g => String(g.steamId) === String(id))

  const load = useCallback(async (m, g, q, p, append) => {
    if (!IS) return
    if (p === 1) setLoading(true); else setMoreLoad(true)
    try {
      const res = await window.spicegames.discoverGames({ mode:m, genre:g, search:q, page:p })
      if (res.ok) {
        const newGames = res.games
        setGames(prev => append ? [...prev, ...newGames] : newGames)
        setHasMore(res.hasMore)
        // Async HLTB fetch for first 8
        if (!append && settings.hltbEnabled !== false) {
          newGames.slice(0, 8).forEach(async gm => {
            try {
              const h = await window.spicegames.hltbSearch({ name: gm.name })
              if (h.ok && h.results?.[0]) setHltbMap(prev => ({ ...prev, [gm.steamId]: h.results[0] }))
            } catch {}
          })
        }
      }
    } catch { toast.error('Failed to load games') }
    if (p === 1) setLoading(false); else setMoreLoad(false)
  }, [settings.hltbEnabled])

  useEffect(() => {
    setPage(1); setGames([]); setHltbMap({})
    load(mode, genre, '', 1, false)
  }, [mode, genre, load])

  const handleSearch = useCallback((q) => {
    setPage(1); setGames([]); setHltbMap({})
    load(mode, genre, q, 1, false)
  }, [mode, genre, load])

  // Auto-search as user types (debounced 500ms)
  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query), 500)
    return () => clearTimeout(timer)
  }, [query])

  const clearSearch = () => {
    setQuery('')
    setPage(1); setGames([]); setHltbMap({})
    load(mode, genre, '', 1, false)
  }

  const loadMore = () => {
    const next = page + 1; setPage(next)
    load(mode, genre, query, next, true)
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'14px 20px 10px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'var(--text)', lineHeight:1, margin:0 }}>Discover</h1>
            <p style={{ fontSize:11, color:'var(--text3)', margin:'3px 0 0', lineHeight:1 }}>
              Steam · SteamSpy {settings.hltbEnabled !== false ? '· HLTB' : ''}
            </p>
          </div>
          <div style={{ flex:1 }} />
          {/* Mode tabs */}
          <div style={{ display:'flex', gap:4, background:'var(--bg3)', borderRadius:9, padding:3 }}>
            {MODES.map(m => (
              <button key={m.id} onClick={() => { setMode(m.id); setGenre('') }}
                style={{ padding:'5px 12px', borderRadius:7, border:'none', background:mode===m.id?'var(--bg5)':'transparent', color:mode===m.id?'var(--text)':'var(--text3)', fontSize:12, fontWeight:mode===m.id?600:400, cursor:'pointer', transition:'all .15s', whiteSpace:'nowrap' }}>
                {m.label}
              </button>
            ))}
          </div>
          {/* Search */}
          <div style={{ display:'flex', alignItems:'center', gap:7, background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:50, padding:'7px 12px' }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" style={{ color:'var(--text3)', flexShrink:0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSearch(query)}
              placeholder="Search games…"
              style={{ background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:12, fontFamily:'var(--font-body)', width:160 }} />
            {query && (
              <button onClick={clearSearch}
                style={{ background:'var(--bg4)', border:'none', color:'var(--text2)', cursor:'pointer', width:18, height:18, minWidth:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>×</button>
            )}
          </div>
        </div>
        {/* Genre pills */}
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {GENRES.map(g => (
            <button key={g.id} onClick={() => setGenre(g.id)}
              style={{ padding:'4px 12px', borderRadius:50, border:`1px solid ${genre===g.id?'var(--accent)':'var(--border2)'}`, background:genre===g.id?`rgba(var(--accent-rgb),.12)`:'transparent', color:genre===g.id?'var(--accent)':'var(--text3)', fontSize:11, fontWeight:genre===g.id?700:400, cursor:'pointer', transition:'all .15s', whiteSpace:'nowrap' }}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px 16px 40px' }}>
        {!IS && (
          <div style={{ textAlign:'center', padding:'80px 20px' }}>
            <div style={{ fontSize:52, opacity:.15, marginBottom:14 }}>🖥</div>
            <p style={{ color:'var(--text2)' }}>Run in Electron to browse games</p>
          </div>
        )}
        {IS && loading && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))', gap:12 }}>
            {Array.from({length:12}).map((_,i) => (
              <div key={i} style={{ borderRadius:12, overflow:'hidden', background:'var(--bg2)', border:'1px solid var(--border)' }}>
                <div className="shimmer" style={{ aspectRatio:'3/4' }} />
                <div style={{ padding:'8px 10px 10px', display:'flex', flexDirection:'column', gap:6 }}>
                  <div className="shimmer" style={{ height:12, borderRadius:5, width:'80%' }} />
                  <div className="shimmer" style={{ height:10, borderRadius:5, width:'50%' }} />
                </div>
              </div>
            ))}
          </div>
        )}
        {IS && !loading && games.length > 0 && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))', gap:12 }}>
              {games.map((g,i) => (
                <GameCard key={g.steamId} game={g} hltb={hltbMap[g.steamId]} onSelect={setSelected} inLib={inLib(g.steamId)} index={i} />
              ))}
            </div>
            {hasMore && (
              <div style={{ display:'flex', justifyContent:'center', marginTop:22 }}>
                <button onClick={loadMore} disabled={moreLoad}
                  style={{ padding:'10px 34px', borderRadius:50, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text)', fontSize:13, fontWeight:600, cursor:moreLoad?'default':'pointer', opacity:moreLoad?.6:1, transition:'background .15s', fontFamily:'var(--font-body)' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
                  onMouseLeave={e=>e.currentTarget.style.background='var(--bg3)'}>
                  {moreLoad ? '…' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
        {IS && !loading && games.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text3)' }}>
            <div style={{ fontSize:44, marginBottom:12, opacity:.2 }}>🔍</div>
            <p style={{ fontSize:14 }}>No games found</p>
          </div>
        )}
      </div>
      {selected && <DetailModal game={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}