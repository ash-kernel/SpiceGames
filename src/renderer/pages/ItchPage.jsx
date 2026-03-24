import React, { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

const IS = typeof window !== 'undefined' && window.spicegames != null

const TAGS = [
  { id:'',             label:'🔥 Top Rated'   },
  { id:'action',       label:'⚔️ Action'       },
  { id:'adventure',    label:'🗺️ Adventure'    },
  { id:'rpg',          label:'⚗️ RPG'          },
  { id:'platformer',   label:'🎮 Platformer'   },
  { id:'puzzle',       label:'🧩 Puzzle'       },
  { id:'horror',       label:'👻 Horror'       },
  { id:'shooter',      label:'🎯 Shooter'      },
  { id:'strategy',     label:'♟️ Strategy'     },
  { id:'simulation',   label:'🏗️ Simulation'  },
  { id:'visual-novel', label:'📖 Visual Novel' },
  { id:'free',         label:'🆓 Free'         },
]

function ItchCard({ game, index, onSelect }) {
  const [hov,    setHov]    = useState(false)
  const [imgErr, setImgErr] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <div onClick={() => onSelect(game)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ borderRadius:12, overflow:'hidden', cursor:'pointer', background:'var(--bg3)', border:`1px solid ${hov?'rgba(var(--accent-rgb),.3)':'var(--border)'}`, transform:hov?'translateY(-3px)':'none', boxShadow:hov?'0 12px 32px rgba(0,0,0,.6)':'0 2px 8px rgba(0,0,0,.3)', transition:'all .2s', animation:`fadeUp .3s ease ${(index%16)*25}ms backwards` }}>
      <div style={{ aspectRatio:'2/1', position:'relative', overflow:'hidden', background:'var(--bg4)' }}>
        {!loaded && !imgErr && game.cover && <div className="shimmer" style={{ position:'absolute', inset:0 }} />}
        {game.cover && !imgErr
          ? <img src={game.cover} alt="" onLoad={()=>setLoaded(true)} onError={()=>setImgErr(true)}
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', opacity:loaded?1:0, transition:'opacity .3s', transform:hov?'scale(1.04)':'scale(1)', transitionProperty:'opacity,transform', transitionDuration:'.3s,.4s' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, opacity:.3 }}>🎮</div>
        }
        <div style={{ position:'absolute', top:7, left:7 }}>
          <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:game.price==='Free'?'rgba(16,185,129,.88)':'rgba(0,0,0,.7)', color:'#fff', backdropFilter:'blur(6px)' }}>
            {game.price||'Free'}
          </span>
        </div>
      </div>
      <div style={{ padding:'10px 12px 12px' }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:4 }}>
          {game.title}
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          {game.rating
            ? <span style={{ fontSize:11, color:'#F59E0B' }}>{'★'.repeat(Math.min(5,Math.round(game.rating/20)))}{'☆'.repeat(Math.max(0,5-Math.round(game.rating/20)))}</span>
            : <span style={{ fontSize:11, color:'var(--text3)' }}>{game.author||''}</span>
          }
          {game.genre && <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:'var(--bg4)', color:'var(--text3)', textTransform:'capitalize' }}>{game.genre}</span>}
        </div>
      </div>
    </div>
  )
}

function ItchDetailModal({ game, onClose }) {
  const [details,    setDetails]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [activeShot, setShot]       = useState(null)

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!IS) { setLoading(false); return }
    window.spicegames.getItchDetails({ url: game.url })
      .then(res => { if (res.ok) setDetails(res) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [game.url])

  const d = details || game
  const heroImg = d.cover || game.cover || null

  return (
    <div onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.88)', backdropFilter:'blur(14px)', zIndex:400, display:'flex', alignItems:'center', justifyContent:'center', padding:24, animation:'fadeIn .2s ease' }}>
      <div style={{ width:'100%', maxWidth:700, background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:18, overflow:'hidden', maxHeight:'88vh', display:'flex', flexDirection:'column', animation:'fadeInScale .25s ease' }}>
        <div style={{ position:'relative', height:180, flexShrink:0, background:'var(--bg4)', overflow:'hidden' }}>
          {heroImg && <img src={heroImg} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 30%,rgba(0,0,0,.85))' }} />
          <button onClick={onClose} style={{ position:'absolute', top:12, right:12, width:30, height:30, borderRadius:'50%', border:'none', background:'rgba(0,0,0,.55)', color:'#fff', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(6px)' }}>×</button>
          <div style={{ position:'absolute', bottom:14, left:18, right:60 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:900, color:'#fff', marginBottom:4, lineHeight:1.2 }}>{d.title}</h2>
            {d.author && <span style={{ fontSize:12, color:'rgba(255,255,255,.65)' }}>by {d.author}</span>}
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:20 }}>
          {loading
            ? <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[80,60,90,50].map((w,i) => <div key={i} className="shimmer" style={{ height:13, borderRadius:6, width:`${w}%` }} />)}
              </div>
            : <>
                {d.description && <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.8, marginBottom:18 }}>{d.description}</p>}

                {d.screenshots?.length > 0 && (
                  <div style={{ marginBottom:18 }}>
                    <div style={{ fontSize:11, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>Screenshots</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                      {d.screenshots.slice(0,6).map((s,i) => (
                        <div key={i} onClick={()=>setShot(activeShot===s?null:s)}
                          style={{ borderRadius:7, overflow:'hidden', aspectRatio:'16/9', cursor:'pointer', border:activeShot===s?'2px solid var(--accent)':'2px solid transparent' }}>
                          <img src={s} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                        </div>
                      ))}
                    </div>
                    {activeShot && (
                      <div onClick={()=>setShot(null)} style={{ marginTop:8, borderRadius:10, overflow:'hidden', cursor:'zoom-out' }}>
                        <img src={activeShot} alt="" style={{ width:'100%', display:'block', borderRadius:10 }} />
                      </div>
                    )}
                  </div>
                )}

                {d.tags?.length > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                    {d.tags.map(t => <span key={t} style={{ fontSize:11, padding:'3px 9px', borderRadius:20, background:'var(--bg4)', color:'var(--text3)', border:'1px solid var(--border)' }}>{t}</span>)}
                  </div>
                )}
              </>
          }
        </div>

        <div style={{ padding:'12px 18px', borderTop:'1px solid var(--border)', display:'flex', gap:10, flexShrink:0 }}>
          <button onClick={() => window.spicegames?.openExternal(game.url)}
            style={{ flex:1, padding:'10px', borderRadius:9, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text)', fontSize:13, cursor:'pointer', textAlign:'center', fontFamily:'var(--font-body)', transition:'background .15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
            onMouseLeave={e=>e.currentTarget.style.background='var(--bg3)'}>
            🌐 View on itch.io
          </button>
          <button onClick={() => window.spicegames?.openExternal(game.url)}
            style={{ flex:1, padding:'10px', borderRadius:9, border:'none', background:`linear-gradient(135deg,var(--accent),var(--accent2))`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)', boxShadow:'var(--shadow-glow)' }}>
            ⬇ Download / Get Game
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ItchPage() {
  const [games,       setGames]       = useState([])
  const [loading,     setLoading]     = useState(false)
  const [activeTag,   setActiveTag]   = useState('')
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selected,    setSelected]    = useState(null)
  const [query,       setQuery]       = useState('')
  const [searching,   setSearching]   = useState(false)

  const load = useCallback(async (tag, p, append) => {
    if (!IS) return
    if (p === 1) setLoading(true); else setLoadingMore(true)
    try {
      const sort = tag === 'free' ? 'free' : 'top-rated'
      const genre = tag === 'free' ? '' : tag
      const res = await window.spicegames.fetchItch({ sort, genre, page: p })
      if (res.ok) {
        setGames(prev => append ? [...prev, ...res.games] : res.games)
        setHasMore(res.games.length >= 10)
      }
    } catch { toast.error('Failed to load games') }
    if (p === 1) setLoading(false); else setLoadingMore(false)
  }, [])

  const doSearch = async (q) => {
    if (!q.trim() || !IS) return
    setSearching(true); setGames([])
    try {
      const res = await window.spicegames.searchItch({ query: q.trim() })
      if (res.ok) { setGames(res.games); setHasMore(false) }
    } catch {}
    setSearching(false)
  }

  // Auto-search as user types (debounced 600ms)
  useEffect(() => {
    if (!query.trim()) {
      setPage(1); setGames([]); load(activeTag, 1, false)
      return
    }
    const timer = setTimeout(() => doSearch(query), 600)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!query) { setPage(1); setGames([]); load(activeTag, 1, false) }
  }, [activeTag, load])

  useEffect(() => {
    setPage(1); setGames([]); load(activeTag, 1, false)
  }, [])

  const handleLoadMore = () => {
    const next = page + 1
    setPage(next)
    load(activeTag, next, true)
  }

  const activeTagObj = TAGS.find(t => t.id === activeTag) || TAGS[0]

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'14px 20px 12px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'var(--text)', lineHeight:1 }}>itch.io</h1>
            <p style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>Indie games · click a tag to browse</p>
          </div>
          <div style={{ flex:1 }} />
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:50, padding:'7px 14px', width:220, position:'relative' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" style={{ color:'var(--text3)', flexShrink:0 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key==='Enter' && doSearch(query)}
              placeholder="Search games…"
              style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, fontFamily:'var(--font-body)', paddingRight:'24px' }} />
            {query && <button onClick={() => setQuery('')} style={{ position:'absolute', right:14, background:'none', border:'none', color:'var(--text2)', cursor:'pointer', width:16, height:16, minWidth:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0, padding:0 }}>×</button>}
          </div>
          {query && <button onClick={() => doSearch(query)} disabled={searching}
            style={{ padding:'7px 16px', borderRadius:50, border:'none', background:`linear-gradient(135deg,var(--accent),var(--accent2))`, color:'#fff', fontSize:12, fontWeight:700, cursor:searching?'default':'pointer', opacity:searching?.6:1 }}>
            {searching?'…':'Search'}
          </button>}
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {TAGS.map(tag => (
            <button key={tag.id} onClick={() => setActiveTag(tag.id)}
              style={{ padding:'6px 13px', borderRadius:50, border:`1px solid ${activeTag===tag.id?'var(--accent)':'var(--border2)'}`, background:activeTag===tag.id?`rgba(var(--accent-rgb),.12)`:'transparent', color:activeTag===tag.id?'var(--accent)':'var(--text3)', fontSize:12, fontWeight:activeTag===tag.id?600:400, cursor:'pointer', transition:'all .18s', whiteSpace:'nowrap' }}>
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'16px 18px 40px' }}>
        {loading && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
            {Array.from({length:12}).map((_,i) => (
              <div key={i} style={{ borderRadius:12, overflow:'hidden', background:'var(--bg3)' }}>
                <div className="shimmer" style={{ aspectRatio:'2/1' }} />
                <div style={{ padding:'10px 12px 12px', display:'flex', flexDirection:'column', gap:7 }}>
                  <div className="shimmer" style={{ height:13, borderRadius:6, width:'80%' }} />
                  <div className="shimmer" style={{ height:10, borderRadius:6, width:'50%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && games.length > 0 && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
              {games.map((g,i) => <ItchCard key={g.id||g.url||i} game={g} index={i} onSelect={setSelected} />)}
            </div>
            {hasMore && (
              <div style={{ display:'flex', justifyContent:'center', marginTop:24 }}>
                <button onClick={handleLoadMore} disabled={loadingMore}
                  style={{ padding:'10px 32px', borderRadius:50, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text)', fontSize:13, cursor:loadingMore?'default':'pointer', opacity:loadingMore?.6:1, transition:'background .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
                  onMouseLeave={e=>e.currentTarget.style.background='var(--bg3)'}>
                  {loadingMore ? '…' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}

        {!loading && games.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text3)' }}>
            <div style={{ fontSize:44, marginBottom:12, opacity:.2 }}>🎮</div>
            <p style={{ fontSize:14 }}>No games found</p>
          </div>
        )}
      </div>

      {selected && <ItchDetailModal game={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}