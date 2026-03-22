import React, { useState, useEffect, useCallback } from 'react'

const IS = typeof window !== 'undefined' && window.spicegames != null

const SORTS = [
  { id:'top-rated', label:'Top Rated', emoji:'⭐' },
  { id:'new',       label:'Newest',    emoji:'🆕' },
  { id:'featured',  label:'Featured',  emoji:'✦'  },
  { id:'free',      label:'Free',      emoji:'🆓' },
]

const GENRES = [
  { id:'',             label:'All'         },
  { id:'action',       label:'Action'      },
  { id:'adventure',    label:'Adventure'   },
  { id:'rpg',          label:'RPG'         },
  { id:'strategy',     label:'Strategy'    },
  { id:'puzzle',       label:'Puzzle'      },
  { id:'platformer',   label:'Platformer'  },
  { id:'shooter',      label:'Shooter'     },
  { id:'horror',       label:'Horror'      },
  { id:'simulation',   label:'Simulation'  },
  { id:'visual-novel', label:'Visual Novel'},
]

function ItchCard({ game, index, onSelect }) {
  const [hov,    setHov]    = useState(false)
  const [imgErr, setImgErr] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      onClick={() => onSelect(game)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14, overflow: 'hidden', background: 'var(--bg3)',
        border: `1px solid ${hov ? 'rgba(var(--accent-rgb),.3)' : 'var(--border)'}`,
        transform: hov ? 'translateY(-5px) scale(1.015)' : 'translateY(0) scale(1)',
        boxShadow: hov ? '0 20px 48px rgba(0,0,0,.7),0 0 0 1px rgba(var(--accent-rgb),.2)' : '0 4px 16px rgba(0,0,0,.4)',
        transition: 'transform .3s cubic-bezier(.34,1.4,.64,1),box-shadow .3s,border-color .18s',
        cursor: 'pointer',
        animation: `fadeUp .35s ease ${(index % 12) * 25}ms backwards`,
        position: 'relative',
      }}
    >
      <div style={{ aspectRatio:'16/9', position:'relative', overflow:'hidden', background:'var(--bg4)' }}>
        {!loaded && !imgErr && game.cover && (
          <div className="shimmer" style={{ position:'absolute', inset:0, borderRadius:0 }} />
        )}
        {game.cover && !imgErr ? (
          <img
            src={game.cover} alt={game.title}
            onLoad={() => setLoaded(true)}
            onError={() => setImgErr(true)}
            style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', display:'block', opacity:loaded?1:0, transition:'opacity .4s,transform .5s', transform:hov?'scale(1.06)':'scale(1)' }}
          />
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,var(--bg4),var(--bg5))' }}>
            <span style={{ fontSize:32, opacity:.4 }}>🎮</span>
            <span style={{ fontSize:10, color:'var(--text3)', textAlign:'center', padding:'0 8px' }}>{game.title?.slice(0,20)}</span>
          </div>
        )}
        <div style={{ position:'absolute', top:9, left:9 }}>
          <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20, background:game.price==='Free'?'rgba(16,185,129,.88)':'rgba(0,0,0,.65)', color:'#fff', backdropFilter:'blur(6px)' }}>
            {game.price}
          </span>
        </div>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.88) 0%,rgba(0,0,0,.2) 50%,transparent 100%)', opacity:hov?1:0, transition:'opacity .22s', display:'flex', alignItems:'flex-end', padding:'12px 10px' }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.75)', lineHeight:1.5 }}>
            {game.shortText?.slice(0,70)}{game.shortText?.length>70?'…':''}
          </div>
        </div>
      </div>
      <div style={{ padding:'10px 12px 12px' }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:5 }}>
          {game.title}
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          {game.rating ? (
            <span style={{ fontSize:11, color:'#F59E0B' }}>{'★'.repeat(Math.min(5,Math.round(game.rating/20)))}{'☆'.repeat(Math.max(0,5-Math.round(game.rating/20)))}</span>
          ) : <span />}
          {game.genre && <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:'var(--bg4)', color:'var(--text3)', textTransform:'capitalize' }}>{game.genre}</span>}
        </div>
      </div>
    </div>
  )
}

function ItchDetailModal({ game, onClose }) {
  const [details,  setDetails]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [activeShot, setShot]   = useState(null)

  useEffect(() => {
    const load = async () => {
      if (!IS) { setLoading(false); return }
      try {
        const res = await window.spicegames.getItchDetails({ url: game.url })
        if (res.ok) setDetails(res)
      } catch {}
      setLoading(false)
    }
    load()
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [game.url])

  useEffect(() => { setShot(null) }, [game.url])

  const d = details || game
  const cover = d.cover || game.cover
  const title = d.title || game.title

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.88)', backdropFilter:'blur(14px)', zIndex:400, display:'flex', alignItems:'center', justifyContent:'center', padding:24, animation:'fadeIn .2s ease' }}>
      <div style={{ width:'100%', maxWidth:820, background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:20, overflow:'hidden', maxHeight:'88vh', display:'flex', flexDirection:'column', animation:'fadeInScale .25s ease' }}>

        <div style={{ position:'relative', height:200, flexShrink:0, background:'var(--bg4)', overflow:'hidden' }}>
          {cover && <img src={cover} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }} onError={e=>e.target.style.display='none'} />}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(0,0,0,.1),rgba(0,0,0,.85))' }} />
          <button onClick={onClose}
            style={{ position:'absolute', top:12, right:12, width:32, height:32, borderRadius:'50%', border:'none', background:'rgba(0,0,0,.55)', color:'#fff', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(6px)' }}>
            ×
          </button>
          <div style={{ position:'absolute', bottom:16, left:20, right:20 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'#fff', marginBottom:6 }}>{title}</h2>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:d.price==='Free'?'rgba(16,185,129,.85)':'rgba(var(--accent-rgb),.8)', color:'#fff', backdropFilter:'blur(4px)' }}>{d.price || game.price}</span>
              {d.author && <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'rgba(0,0,0,.5)', color:'rgba(255,255,255,.8)', backdropFilter:'blur(4px)' }}>by {d.author}</span>}
              {game.genre && <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'rgba(0,0,0,.5)', color:'rgba(255,255,255,.7)', backdropFilter:'blur(4px)', textTransform:'capitalize' }}>{game.genre}</span>}
            </div>
          </div>
        </div>

        <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>
          <div style={{ flex:1, overflowY:'auto', padding:22 }}>
            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[80,65,90,45,70].map((w,i) => <div key={i} className="shimmer" style={{ height:13, borderRadius:6, width:`${w}%` }} />)}
              </div>
            ) : (
              <>
                {d.description && (
                  <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.85, marginBottom:18 }}>{d.description}</p>
                )}

                <div style={{ marginBottom:18 }}>
                  <div style={{ fontSize:11, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:10 }}>Watch on YouTube</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                    {[
                      { label:`${title} — Trailer`,  q:`${title} trailer` },
                      { label:`${title} — Gameplay`, q:`${title} gameplay` },
                    ].map(({ label, q }) => (
                      <a key={q}
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`}
                        target="_blank" rel="noreferrer"
                        style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)', textDecoration:'none', transition:'all .18s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(239,68,68,.4)';e.currentTarget.style.background='rgba(239,68,68,.06)'}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg3)'}}>
                        <div style={{ width:28, height:28, borderRadius:7, background:'#FF0000', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', flexShrink:0 }}>▶</div>
                        <span style={{ fontSize:13, color:'var(--text)', flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{label}</span>
                        <span style={{ fontSize:11, color:'var(--text3)', flexShrink:0 }}>↗</span>
                      </a>
                    ))}
                  </div>
                </div>

                {details?.screenshots?.length > 0 && (
                  <div>
                    <div style={{ fontSize:11, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>Screenshots</div>
                    {activeShot !== null && (
                      <div style={{ marginBottom:8, borderRadius:10, overflow:'hidden', border:'1px solid var(--border)' }}>
                        <img src={details.screenshots[activeShot]} alt="" style={{ width:'100%', display:'block', aspectRatio:'16/9', objectFit:'cover' }} />
                      </div>
                    )}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                      {details.screenshots.map((s,i) => (
                        <div key={i} onClick={() => setShot(i === activeShot ? null : i)}
                          style={{ borderRadius:7, overflow:'hidden', cursor:'pointer', border:`2px solid ${activeShot===i?'var(--accent)':'transparent'}`, transition:'border-color .18s' }}
                          onMouseEnter={e=>e.currentTarget.style.opacity='.8'}
                          onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                          <img src={s} alt="" style={{ width:'100%', aspectRatio:'16/9', objectFit:'cover', display:'block' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {details?.tags?.length > 0 && (
                  <div style={{ marginTop:14 }}>
                    <div style={{ fontSize:11, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:7 }}>Tags</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                      {details.tags.map(t => <span key={t} style={{ fontSize:11, padding:'3px 9px', borderRadius:20, background:'var(--bg4)', color:'var(--text3)', border:'1px solid var(--border)' }}>{t}</span>)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div style={{ padding:'14px 20px', borderTop:'1px solid var(--border)', display:'flex', gap:10, flexShrink:0, alignItems:'center' }}>
          <a href={game.url} target="_blank" rel="noreferrer"
            style={{ padding:'10px 18px', borderRadius:9, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text)', fontSize:13, textDecoration:'none', display:'flex', alignItems:'center', gap:6, transition:'background .18s' }}
            onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
            onMouseLeave={e=>e.currentTarget.style.background='var(--bg3)'}>
            🌐 View on itch.io
          </a>
          <div style={{ flex:1 }} />
          <a href={game.url} target="_blank" rel="noreferrer"
            style={{ padding:'10px 24px', borderRadius:9, border:'none', background:`linear-gradient(135deg,var(--accent),var(--accent2))`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)', boxShadow:'var(--shadow-glow)', letterSpacing:'.3px', textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
            ⬇ Download / Get Game
          </a>
        </div>
      </div>
    </div>
  )
}

export default function ItchPage() {
  const [games,       setGames]       = useState([])
  const [loading,     setLoading]     = useState(false)
  const [sort,        setSort]        = useState('top-rated')
  const [genre,       setGenre]       = useState('')
  const [query,       setQuery]       = useState('')
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selected,    setSelected]    = useState(null)

  const load = useCallback(async (s, g, p, append) => {
    if (!IS) return
    if (p === 1) setLoading(true); else setLoadingMore(true)
    try {
      const res = await window.spicegames.fetchItch({ sort:s, genre:g, page:p })
      if (res.ok) {
        setGames(prev => append ? [...prev, ...res.games] : res.games)
        setHasMore(res.games.length >= 10)
      }
    } catch {}
    setLoading(false)
    setLoadingMore(false)
  }, [])

  const doSearch = useCallback(async () => {
    if (!query.trim() || !IS) return
    setLoading(true)
    try {
      const res = await window.spicegames.searchItch({ query:query.trim() })
      if (res.ok) { setGames(res.games); setHasMore(false) }
    } catch {}
    setLoading(false)
  }, [query])

  useEffect(() => {
    if (!query) { setPage(1); load(sort, genre, 1, false) }
  }, [sort, genre])

  useEffect(() => {
    if (IS && !query) load(sort, genre, 1, false)
  }, [])

  const handleSort  = (s) => { setSort(s);  setPage(1); setQuery(''); load(s, genre,  1, false) }
  const handleGenre = (g) => { setGenre(g); setPage(1); setQuery(''); load(sort,  g,     1, false) }
  const clearSearch = () => { setQuery(''); setPage(1); load(sort, genre, 1, false) }
  const handleLoadMore = () => { const next = page+1; setPage(next); load(sort, genre, next, true) }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      <div style={{ padding:'16px 22px 12px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'var(--text)', lineHeight:1 }}>itch.io</h1>
              <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(250,100,50,.12)', color:'#FA6432', border:'1px solid rgba(250,100,50,.25)' }}>INDIE GAMES</span>
            </div>
            <p style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>Browse independent games · click to view details &amp; download</p>
          </div>
          <div style={{ flex:1 }} />
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:50, padding:'8px 16px', width:220 }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" style={{ color:'var(--text3)', flexShrink:0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSearch()}
              placeholder="Search itch.io…"
              style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, fontFamily:'var(--font-body)' }} />
            {query && <button onClick={clearSearch} style={{ background:'var(--bg4)', border:'none', color:'var(--text2)', cursor:'pointer', width:20, height:20, minWidth:20, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0, lineHeight:'1' }}>×</button>}
          </div>
          <button onClick={doSearch} disabled={!query.trim()||loading}
            style={{ padding:'9px 18px', borderRadius:50, border:'none', background:`linear-gradient(135deg,var(--accent),var(--accent2))`, color:'#fff', fontSize:13, fontWeight:700, cursor:!query.trim()||loading?'default':'pointer', fontFamily:'var(--font-display)', opacity:!query.trim()||loading?.5:1 }}>
            Search
          </button>
        </div>

        <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:6 }}>
            {SORTS.map(s => (
              <button key={s.id} onClick={() => handleSort(s.id)} disabled={!!query}
                style={{ padding:'6px 14px', borderRadius:50, border:`1px solid ${sort===s.id&&!query?'var(--accent)':'var(--border2)'}`, background:sort===s.id&&!query?`rgba(var(--accent-rgb),.12)`:'transparent', color:sort===s.id&&!query?'var(--accent)':'var(--text3)', fontSize:12, fontWeight:sort===s.id&&!query?600:400, cursor:'pointer', transition:'all .18s', display:'flex', alignItems:'center', gap:5, opacity:query?.4:1 }}>
                <span>{s.emoji}</span><span>{s.label}</span>
              </button>
            ))}
          </div>
          <div style={{ width:1, height:18, background:'var(--border)' }} />
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {GENRES.map(g => (
              <button key={g.id} onClick={() => handleGenre(g.id)} disabled={!!query}
                style={{ padding:'5px 12px', borderRadius:50, border:`1px solid ${genre===g.id&&!query?'var(--accent)':'var(--border2)'}`, background:genre===g.id&&!query?`rgba(var(--accent-rgb),.12)`:'transparent', color:genre===g.id&&!query?'var(--accent)':'var(--text3)', fontSize:11, fontWeight:genre===g.id&&!query?600:400, cursor:'pointer', transition:'all .18s', opacity:query?.4:1 }}>
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'18px 22px 60px' }}>
        {!IS && (
          <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text2)' }}>
            <div style={{ fontSize:52, marginBottom:14, opacity:.25 }}>🖥</div>
            <p style={{ fontSize:16, marginBottom:6 }}>Desktop app required</p>
            <p style={{ fontSize:13, color:'var(--text3)' }}>Run SpiceDeck in Electron to browse itch.io</p>
          </div>
        )}
        {IS && loading && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
            {Array.from({length:12}).map((_,i) => (
              <div key={i} style={{ borderRadius:14, overflow:'hidden' }}>
                <div className="shimmer" style={{ aspectRatio:'16/9', borderRadius:0 }} />
                <div style={{ padding:12 }}>
                  <div className="shimmer" style={{ height:13, borderRadius:6, marginBottom:7 }} />
                  <div className="shimmer" style={{ height:10, borderRadius:6, width:'55%' }} />
                </div>
              </div>
            ))}
          </div>
        )}
        {IS && !loading && games.length > 0 && (
          <>
            {query && <div style={{ fontSize:12, color:'var(--text3)', marginBottom:14 }}>{games.length} result{games.length!==1?'s':''} for "<span style={{ color:'var(--text)' }}>{query}</span>"</div>}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
              {games.map((g,i) => <ItchCard key={`${g.id}-${i}`} game={g} index={i} onSelect={setSelected} />)}
            </div>
            {hasMore && !query && (
              <div style={{ display:'flex', justifyContent:'center', marginTop:28 }}>
                <button onClick={handleLoadMore} disabled={loadingMore}
                  style={{ padding:'10px 32px', borderRadius:50, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text)', fontSize:13, fontWeight:600, cursor:loadingMore?'default':'pointer', fontFamily:'var(--font-body)', display:'flex', alignItems:'center', gap:10, transition:'background .18s' }}
                  onMouseEnter={e=>!loadingMore&&(e.currentTarget.style.background='var(--bg4)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='var(--bg3)')}>
                  {loadingMore ? <><div style={{ width:14, height:14, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite' }} />Loading…</> : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
        {IS && !loading && games.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text3)' }}>
            <div style={{ fontSize:44, marginBottom:12, opacity:.25 }}>🎮</div>
            <p style={{ fontSize:15, marginBottom:6 }}>No games found</p>
            <p style={{ fontSize:13 }}>Try a different sort or genre</p>
          </div>
        )}
      </div>

      {selected && <ItchDetailModal game={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}