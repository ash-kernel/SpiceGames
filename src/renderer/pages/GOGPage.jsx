import React, { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

const IS = typeof window !== 'undefined' && window.spicegames?.isElectron

function GOGCard({ game, index }) {
  const [hov,    setHov]    = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)

  // Try multiple GOG image size suffixes until one works
  const SUFFIXES = [
    '_product_card_v2_mobile_slider_639.jpg',
    '_product_card_v2_tablet_slider.jpg',
    '_product_tile_256.jpg',
    '',
  ]
  const base = game.cover
    ? (game.cover.startsWith('//') ? 'https:' + game.cover : game.cover).replace(/_product_card.*$/, '').replace(/_product_tile.*$/, '')
    : null
  const coverUrl = base && imgIdx < SUFFIXES.length ? base + SUFFIXES[imgIdx] : null

  const onImgErr = () => { setLoaded(false); setImgIdx(i => i + 1) }
  const open = () => { if (game.url) window.open(game.url, '_blank') }

  return (
    <div onClick={open} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ borderRadius:14, overflow:'hidden', background:'var(--bg3)', border:`1px solid ${hov?'rgba(var(--accent-rgb),.3)':'var(--border)'}`, transform:hov?'translateY(-5px) scale(1.015)':'translateY(0) scale(1)', boxShadow:hov?'0 20px 48px rgba(0,0,0,.7)':'0 4px 16px rgba(0,0,0,.4)', transition:'transform .3s cubic-bezier(.34,1.4,.64,1),box-shadow .3s,border-color .18s', cursor:'pointer', animation:`fadeUp .35s ease ${(index%12)*25}ms backwards` }}>
      <div style={{ aspectRatio:'16/9', position:'relative', overflow:'hidden', background:'var(--bg4)' }}>
        {!loaded && coverUrl && imgIdx < SUFFIXES.length && <div className="shimmer" style={{ position:'absolute', inset:0, borderRadius:0 }} />}
        {coverUrl && imgIdx < SUFFIXES.length
          ? <img src={coverUrl} alt={game.title} onLoad={()=>setLoaded(true)} onError={onImgErr}
              style={{ width:'100%', height:'100%', objectFit:'cover', opacity:loaded?1:0, transition:'opacity .3s,transform .5s', transform:hov?'scale(1.06)':'scale(1)', display:'block' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, opacity:.3 }}>🎮</div>}

        <div style={{ position:'absolute', top:8, left:8, display:'flex', gap:5, flexWrap:'wrap' }}>
          {game.price !== undefined && game.price !== '' && (
            <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, background:game.isFree||game.price==='Free'?'rgba(16,185,129,.88)':'rgba(0,0,0,.75)', color:'#fff', backdropFilter:'blur(6px)' }}>
              {game.isFree || game.price === 'Free' ? 'Free' : game.price}
            </span>
          )}
          {game.discount > 0 && (
            <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, background:'rgba(99,102,241,.88)', color:'#fff', backdropFilter:'blur(6px)' }}>-{game.discount}%</span>
          )}
          {!game.isAvailable && <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, background:'rgba(239,68,68,.7)', color:'#fff' }}>N/A</span>}
        </div>

        {game.rating && (
          <div style={{ position:'absolute', top:8, right:8, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, background:'rgba(0,0,0,.7)', color:'#F59E0B', backdropFilter:'blur(6px)' }}>
            ★ {(game.rating/20).toFixed(1)}
          </div>
        )}

        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.88) 0%,transparent 60%)', opacity:hov?1:0, transition:'opacity .22s', display:'flex', alignItems:'flex-end', padding:'10px' }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.7)', lineHeight:1.5 }}>{game.genres?.slice(0,2).join(' · ')}</div>
        </div>
      </div>

      <div style={{ padding:'10px 12px 12px' }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:4 }}>{game.title}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:11, color:'var(--text3)' }}>{game.developer || 'GOG.com'}</span>
          {game.releaseDate && <span style={{ fontSize:10, color:'var(--text3)' }}>{game.releaseDate.slice(0,4)}</span>}
        </div>
      </div>
    </div>
  )
}

export default function GOGPage() {
  const addToWishlist = useStore(s => s.addToWishlist)
  const [games,       setGames]       = useState([])
  const [loading,     setLoading]     = useState(false)
  const [query,       setQuery]       = useState('')
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [freeOnly,    setFreeOnly]    = useState(false)

  const load = useCallback(async (q, p, append) => {
    if (!IS) return
    if (p===1) setLoading(true); else setLoadingMore(true)
    try {
      const res = await window.spicegames.fetchGOG({ page: p, search: q })
    if (res.ok && freeOnly) res.games = res.games.filter(g => g.isFree || g.price === 'Free' || g.price === '$0.00')
      if (res.ok) {
        setGames(prev => append ? [...prev, ...res.games] : res.games)
        setHasMore(res.games.length >= 20)
      }
    } catch {}
    setLoading(false); setLoadingMore(false)
  }, [])

  useEffect(() => { if (IS) load('', 1, false) }, [])

  const doSearch = () => { setPage(1); load(query, 1, false) }
  const loadMore = () => { const next = page+1; setPage(next); load(query, next, true) }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'16px 22px 12px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'var(--text)', lineHeight:1 }}>GOG</h1>
              <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(99,102,241,.12)', color:'#9b8cff', border:'1px solid rgba(99,102,241,.25)' }}>DRM FREE</span>
            </div>
            <p style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>DRM-free games · click to open on GOG</p>
          </div>
          <div style={{ flex:1 }} />
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:50, padding:'8px 16px', width:240 }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" style={{ color:'var(--text3)', flexShrink:0 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSearch()} placeholder="Search GOG…"
              style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, fontFamily:'var(--font-body)' }} />
            {query && <button onClick={()=>{setQuery('');load('',1,false)}} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:14, lineHeight:1 }}>×</button>}
          </div>
          <button onClick={doSearch} style={{ padding:'9px 18px', borderRadius:50, border:'none', background:`linear-gradient(135deg,var(--accent),var(--accent2))`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)' }}>Search</button>
          <button onClick={() => { const next=!freeOnly; setFreeOnly(next); setPage(1); load(query, 1, false) }}
            style={{ padding:'9px 18px', borderRadius:50, border:`1px solid ${freeOnly?'var(--success)':'var(--border2)'}`, background:freeOnly?'rgba(16,185,129,.12)':'var(--bg3)', color:freeOnly?'var(--success)':'var(--text2)', fontSize:13, fontWeight:freeOnly?700:400, cursor:'pointer', transition:'all .18s', display:'flex', alignItems:'center', gap:7 }}>
            🆓 Free Only
          </button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'18px 22px 60px' }}>
        {!IS && <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text3)' }}><p>Desktop app required</p></div>}
        {IS && loading && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
            {Array.from({length:12}).map((_,i) => (
              <div key={i} style={{ borderRadius:14, overflow:'hidden' }}>
                <div className="shimmer" style={{ aspectRatio:'16/9', borderRadius:0 }} />
                <div style={{ padding:12 }}><div className="shimmer" style={{ height:13, borderRadius:6, marginBottom:7 }} /><div className="shimmer" style={{ height:10, borderRadius:6, width:'55%' }} /></div>
              </div>
            ))}
          </div>
        )}
        {IS && !loading && games.length > 0 && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
              {games.map((g,i) => <GOGCard key={g.id||i} game={g} index={i} />)}
            </div>
            {hasMore && (
              <div style={{ display:'flex', justifyContent:'center', marginTop:28 }}>
                <button onClick={loadMore} disabled={loadingMore}
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
          <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text3)' }}><div style={{ fontSize:44, marginBottom:12, opacity:.25 }}>🎮</div><p>No results</p></div>
        )}
      </div>
    </div>
  )
}