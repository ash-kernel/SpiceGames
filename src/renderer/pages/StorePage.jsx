import React, { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

const IS = typeof window !== 'undefined' && window.spicegames?.isElectron


const GENRES = [
  { id:'Action',      emoji:'⚔️' },
  { id:'Adventure',   emoji:'🗺️' },
  { id:'RPG',         emoji:'⚗️' },
  { id:'Strategy',    emoji:'♟️' },
  { id:'Shooter',     emoji:'🎯' },
  { id:'Horror',      emoji:'👻' },
  { id:'Sports',      emoji:'⚽' },
  { id:'Racing',      emoji:'🏎️' },
  { id:'Puzzle',      emoji:'🧩' },
  { id:'Indie',       emoji:'🎸' },
  { id:'Simulation',  emoji:'🏗️' },
  { id:'Fighting',    emoji:'🥊' },
]


function DiscoverCard({ game, index, already, onSelect }) {
  const [hov,    setHov]    = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [imgSrc, setImgSrc] = useState(game.cover)
  const [triedFallback, setTriedFallback] = useState(false)

  const handleImgError = () => {
    if (!triedFallback && game.header) {
      setImgSrc(game.header)
      setTriedFallback(true)
    } else {
      setImgSrc(null)
    }
  }

  return (
    <div
      onClick={() => onSelect(game)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14,
        overflow: 'hidden',
        background: 'var(--bg3)',
        border: `1px solid ${hov ? 'rgba(var(--accent-rgb),.3)' : 'var(--border)'}`,
        transform: hov ? 'translateY(-5px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: hov
          ? '0 20px 48px rgba(0,0,0,.7), 0 0 0 1px rgba(var(--accent-rgb),.2)'
          : '0 4px 16px rgba(0,0,0,.4)',
        transition: 'transform .3s cubic-bezier(.34,1.4,.64,1), box-shadow .3s, border-color .18s',
        cursor: 'pointer',
        animation: `fadeUp .35s ease ${(index % 12) * 30}ms backwards`,
        position: 'relative',
      }}
    >
      {}
      <div style={{ aspectRatio: '3/4', position: 'relative', overflow: 'hidden', background: 'var(--bg4)' }}>

        {}
        {!loaded && imgSrc && (
          <div className="shimmer" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
        )}

        {imgSrc ? (
          <img
            src={imgSrc}
            alt={game.name}
            onLoad={() => setLoaded(true)}
            onError={handleImgError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              display: 'block',
              opacity: loaded ? 1 : 0,
              transition: 'opacity .4s ease, transform .5s ease',
              transform: hov ? 'scale(1.06)' : 'scale(1)',
            }}
          />
        ) : (

          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 8,
            background: `linear-gradient(135deg, var(--bg4), var(--bg5))`,
          }}>
            <span style={{ fontSize: 40, opacity: .5 }}>🎮</span>
            <span style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center', padding: '0 8px' }}>{game.name?.slice(0, 20)}</span>
          </div>
        )}

        {}
        {already && (
          <div style={{ position: 'absolute', top: 9, left: 9, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: 'rgba(16,185,129,.88)', color: '#fff', backdropFilter: 'blur(6px)' }}>
            ✓ IN LIBRARY
          </div>
        )}

        {}
        {game.price && (
          <div style={{ position: 'absolute', top: 9, right: 9, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: 'rgba(0,0,0,.65)', color: game.price === 'Free' ? '#10B981' : 'rgba(255,255,255,.9)', backdropFilter: 'blur(6px)' }}>
            {game.price}
          </div>
        )}

        {}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.2) 50%, transparent 100%)',
          opacity: hov ? 1 : 0, transition: 'opacity .22s',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '12px 10px',
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
            {game.platforms?.slice(0,2).map(p => (
              <span key={p} style={{ background: 'rgba(255,255,255,.12)', padding: '1px 6px', borderRadius: 10 }}>{p}</span>
            ))}
          </div>
          <div style={{ background: 'rgba(var(--accent-rgb),.9)', borderRadius: 8, padding: '8px', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: '#fff', letterSpacing: '.3px' }}>
            View Details
          </div>
        </div>
      </div>

      {}
      <div style={{ padding: '10px 11px 12px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {game.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{game.platforms?.slice(0,2).join(' · ') || 'PC'}</span>
          {game.source && (
            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'var(--bg4)', color: 'var(--text3)', fontWeight: 600 }}>
              {game.source}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}


function DiscoverDetailModal({ game, onClose, onAddToLibrary }) {
  const [details, setDetails]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const reliableHdr = game.header || (game.steamId ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/header.jpg` : null)
  const [imgSrc,  setImgSrc]    = useState(game.cover || reliableHdr)
  const [triedFb, setTriedFb]   = useState(false)
  const addGame  = useStore(s => s.addGame)
  const setAddOpen = useStore(s => s.setAddGameOpen)
  const games    = useStore(s => s.games)
  const already  = games.some(g => g.steamId === game.steamId)

  useEffect(() => {
    const load = async () => {
      if (!IS || !game.steamId) { setLoading(false); return }
      try {
        const d = await window.spicegames.getGameDetails({ steamId: game.steamId })
        setDetails(d)
        if (d?.cover) setImgSrc(d.cover)
      } catch {}
      setLoading(false)
    }
    load()
  }, [game.steamId])

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const d = details || game
  const heroImg = d.header || (game.steamId ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/header.jpg` : null)

  const handleAddToLibrary = () => {

    onAddToLibrary(d)
    onClose()
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', backdropFilter: 'blur(14px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn .2s ease' }}
    >
      <div style={{ width: '100%', maxWidth: 780, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 20, overflow: 'hidden', maxHeight: '88vh', display: 'flex', flexDirection: 'column', animation: 'fadeInScale .25s ease' }}>

        {}
        <div style={{ position: 'relative', height: 200, flexShrink: 0, background: 'var(--bg4)', overflow: 'hidden' }}>
          {heroImg && (
            <img src={heroImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              onError={e => { if (game.cover) e.target.src = game.cover }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,.1), rgba(0,0,0,.82))' }} />
          <button onClick={onClose}
            style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.55)', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
            ×
          </button>
          <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6 }}>{d.name}</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(d.genres || []).slice(0,3).map(g => (
                <span key={g} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'rgba(var(--accent-rgb),.7)', color: '#fff', fontWeight: 600, backdropFilter: 'blur(4px)' }}>{g}</span>
              ))}
              {d.price && <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'rgba(0,0,0,.5)', color: d.price === 'Free' ? '#10B981' : 'rgba(255,255,255,.9)', backdropFilter: 'blur(4px)' }}>{d.price}</span>}
            </div>
          </div>
        </div>

        {}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {}
          <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid var(--border)', overflowY: 'auto', padding: 16 }}>
            <div style={{ aspectRatio: '3/4', borderRadius: 10, overflow: 'hidden', background: 'var(--bg4)', marginBottom: 14 }}>
              {imgSrc ? (
                <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                  onError={() => { if (!triedFb && d.header) { setImgSrc(d.header); setTriedFb(true) } else setImgSrc(null) }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🎮</div>
              )}
            </div>

            {}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {d.openCriticScore && (
                <div style={{ padding:'8px 10px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)' }}>
                  <div style={{ fontSize:10, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.4px', marginBottom:4 }}>OpenCritic</div>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, color:'#F28C28' }}>{d.openCriticScore}</div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>{d.openCriticOutlets || 'Critics'}</div>
                </div>
              )}
              {d.steamReviewScore && (
                <div style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>User Reviews</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: d.reviewScore >= 80 ? 'var(--success)' : d.reviewScore >= 60 ? 'var(--warning)' : 'var(--danger)' }}>{d.reviewScore}%</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{d.reviewScore >= 80 ? 'Positive' : d.reviewScore >= 60 ? 'Mixed' : 'Negative'}</div>
                </div>
              )}
              {d.metacritic && (
                <div style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Metacritic</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: d.metacritic >= 75 ? 'var(--success)' : d.metacritic >= 50 ? 'var(--warning)' : 'var(--danger)' }}>{d.metacritic}</div>
                </div>
              )}
            </div>

            {}
            {[
              ['Developer', d.developer],
              ['Publisher', d.publisher],
              ['Released',  d.released],
              ['Platforms', (d.platforms||[]).join(', ')],
            ].filter(([,v])=>v).map(([k,v]) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{v}</div>
              </div>
            ))}
          </div>

          {}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[80,60,90,40].map((w,i) => <div key={i} className="shimmer" style={{ height: 14, borderRadius: 6, width: `${w}%` }} />)}
              </div>
            ) : (
              <>
                {d.description && (
                  <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.85, marginBottom: 20 }}>{d.description}</p>
                )}

                {}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Watch</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {[
                      { label: `${d.name} — Official Trailer`,    q: `${d.name} official trailer` },
                      { label: `${d.name} — Gameplay`,            q: `${d.name} gameplay` },
                      { label: `${d.name} — Review`,              q: `${d.name} review` },
                    ].map(({ label, q }) => (
                      <a key={q}
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`}
                        target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', textDecoration: 'none', transition: 'all .18s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(239,68,68,.4)';e.currentTarget.style.background='rgba(239,68,68,.06)'}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg3)'}}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', flexShrink: 0 }}>▶</div>
                        <span style={{ fontSize: 13, color: 'var(--text)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                        <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>↗</span>
                      </a>
                    ))}
                  </div>
                </div>

                {}
                {d.screenshots?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Screenshots</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                      {d.screenshots.slice(0, 6).map((s, i) => (
                        <div key={i} style={{ borderRadius: 8, overflow: 'hidden', aspectRatio: '16/9', cursor: 'pointer' }}
                          onClick={() => window.open(s, '_blank')}>
                          <img src={s} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }}
                            onMouseEnter={e=>e.target.style.transform='scale(1.04)'}
                            onMouseLeave={e=>e.target.style.transform='scale(1)'} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {}
                {d.tags?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Tags</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {d.tags.slice(0, 12).map(t => (
                        <span key={t} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'var(--bg4)', color: 'var(--text3)', border: '1px solid var(--border)' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, flexShrink: 0, alignItems: 'center' }}>
          {game.steamId && (
            <a href={`https://store.steampowered.com/app/${game.steamId}`} target="_blank" rel="noreferrer"
              style={{ padding: '10px 18px', borderRadius: 9, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'background .18s' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
              onMouseLeave={e=>e.currentTarget.style.background='var(--bg3)'}>
              🛒 View on Steam
            </a>
          )}
          <div style={{ flex: 1 }} />
          {already ? (
            <div style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✓</span> In your library
            </div>
          ) : (
            <button onClick={handleAddToLibrary}
              style={{ padding: '10px 24px', borderRadius: 9, border: 'none', background: `linear-gradient(135deg,var(--accent),var(--accent2))`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-display)', boxShadow: 'var(--shadow-glow)', letterSpacing: '.3px' }}>
              + Add to Library
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


export default function StorePage() {
  const games       = useStore(s => s.games)
  const setAddOpen  = useStore(s => s.setAddGameOpen)

  const [results,     setResults]     = useState([])
  const [loading,     setLoading]     = useState(false)
  const [query,       setQuery]       = useState('')
  const [activeGenre, setActiveGenre] = useState('')
  const [searched,    setSearched]    = useState(false)
  const [detailGame,  setDetailGame]  = useState(null)
  const [prefilledGame, setPrefilledGame] = useState(null)


  const doSearch = useCallback(async (q = query) => {
    if (!q.trim()) return
    setLoading(true); setSearched(true)
    try {
      const res = IS ? await window.spicegames.searchGame({ name: q }) : []

      setResults((res || []).map(r => ({ ...r, source: 'Steam' })))
    } catch { setResults([]) }
    setLoading(false)
  }, [query])

  const handleGenre = (g) => {
    setActiveGenre(g)
    setQuery(g)
    doSearch(g)
  }


  useEffect(() => {
    if (IS) doSearch('top rated popular games')
  }, [])

  const inLibrary = (steamId) => games.some(g => g.steamId === steamId)


  const handleAddFromDiscover = (gameData) => {


    setAddOpen(true)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {}
      <div style={{ padding: '16px 22px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>Discover</h1>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>Search and browse games via Steam · click to view details</p>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: 'rgba(16,185,129,.1)', color: 'var(--success)', fontWeight: 700, border: '1px solid rgba(16,185,129,.2)' }}>
            ● Steam API · Free
          </div>
        </div>

        {}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 50, padding: '9px 18px', transition: 'all .18s' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" style={{ color: 'var(--text3)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="Search any game on Steam…"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13, fontFamily: 'var(--font-body)' }}
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setSearched(false) }}
                style={{ background: 'var(--bg4)', border: 'none', color: 'var(--text3)', cursor: 'pointer', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>×</button>
            )}
          </div>
          <button onClick={() => doSearch()} disabled={loading || !query.trim()}
            style={{ padding: '9px 22px', borderRadius: 50, border: 'none', background: `linear-gradient(135deg,var(--accent),var(--accent2))`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading || !query.trim() ? 'default' : 'pointer', fontFamily: 'var(--font-display)', opacity: loading || !query.trim() ? .6 : 1, transition: 'opacity .18s' }}>
            {loading ? '…' : 'Search'}
          </button>
        </div>

        {}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {GENRES.map(g => {
            const active = activeGenre === g.id
            return (
              <button key={g.id} onClick={() => handleGenre(g.id)}
                style={{ padding: '5px 13px', borderRadius: 50, border: `1px solid ${active ? 'var(--accent)' : 'var(--border2)'}`, background: active ? `rgba(var(--accent-rgb),.12)` : 'transparent', color: active ? 'var(--accent)' : 'var(--text3)', fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all .18s', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 13 }}>{g.emoji}</span>
                <span>{g.id}</span>
              </button>
            )
          })}
        </div>
      </div>

      {}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px 60px' }}>
        {!IS && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text2)' }}>
            <div style={{ fontSize: 52, marginBottom: 14, opacity: .25 }}>🖥</div>
            <p style={{ fontSize: 16, marginBottom: 6 }}>Desktop app required</p>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>Run SpiceGames in Electron to browse the Steam catalogue</p>
          </div>
        )}

        {IS && loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 14 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 14, overflow: 'hidden', animationDelay: `${i * 35}ms` }}>
                <div className="shimmer" style={{ aspectRatio: '3/4', borderRadius: 0 }} />
                <div style={{ padding: 12 }}>
                  <div className="shimmer" style={{ height: 13, borderRadius: 6, marginBottom: 7 }} />
                  <div className="shimmer" style={{ height: 10, borderRadius: 6, width: '55%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {IS && !loading && results.length > 0 && (
          <>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>
              {results.length} result{results.length !== 1 ? 's' : ''}
              {query && <span> for "<span style={{ color: 'var(--text)' }}>{query}</span>"</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 14 }}>
              {results.map((r, i) => (
                <DiscoverCard
                  key={r.steamId || r.name}
                  game={r}
                  index={i}
                  already={inLibrary(r.steamId)}
                  onSelect={setDetailGame}
                />
              ))}
            </div>
          </>
        )}

        {IS && !loading && searched && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text3)' }}>
            <div style={{ fontSize: 44, marginBottom: 12, opacity: .25 }}>🔍</div>
            <p style={{ fontSize: 15, marginBottom: 8 }}>No results for "{query}"</p>
            <p style={{ fontSize: 13 }}>Try a different game name</p>
          </div>
        )}
      </div>

      {}
      {detailGame && (
        <DiscoverDetailModal
          game={detailGame}
          onClose={() => setDetailGame(null)}
          onAddToLibrary={handleAddFromDiscover}
        />
      )}
    </div>
  )
}