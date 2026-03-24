import React, { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

const IS = typeof window !== 'undefined' && window.spicegames != null

const MODES = [
  { id:'trending', label:'🔥 Trending' },
  { id:'new',      label:'🆕 New'      },
  { id:'toprated', label:'⭐ Top Rated' },
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

const VIDEO_TABS = [
  { id:'trailer',  label:'Trailers'   },
  { id:'gameplay', label:'Gameplay'   },
  { id:'tutorial', label:'Tutorials'  },
  { id:'review',   label:'Reviews'    },
]

// ─── helpers ─────────────────────────────────────────────────────────────────

function ratioColor(pos, neg) {
  if (!pos && !neg) return '#6B7280'
  const r = pos / (pos + neg)
  if (r >= 0.80) return '#10B981'
  if (r >= 0.60) return '#F59E0B'
  return '#EF4444'
}
function ratioLabel(pos, neg) {
  const total = pos + neg
  if (!total) return null
  const r = pos / total
  if (r >= 0.95) return 'Overwhelmingly Positive'
  if (r >= 0.80) return 'Very Positive'
  if (r >= 0.70) return 'Mostly Positive'
  if (r >= 0.40) return 'Mixed'
  return 'Negative'
}
function fmtOwners(o) {
  if (!o) return null
  const n = parseInt(o.split('..')[0].replace(/[^0-9]/g, ''))
  if (isNaN(n) || n === 0) return null
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M owners`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k owners`
  return `${n} owners`
}
function hFmt(h) {
  return !h ? null : h < 1 ? '<1h' : `${Math.round(h)}h`
}

// ─── Game Card ────────────────────────────────────────────────────────────────

function GameCard({ game, hltb, onSelect, index }) {
  const [imgSrc,   setImgSrc]  = useState(game.cover)
  const [fallback, setFallback]= useState(0)
  const [loaded,   setLoaded]  = useState(false)
  const [hov,      setHov]     = useState(false)

  const IMGS = [game.cover, game.capsule, game.header]
  const onErr = () => {
    const next = fallback + 1
    if (next < IMGS.length) { setFallback(next); setImgSrc(IMGS[next]) }
  }

  const col   = ratioColor(game.positive, game.negative)
  const label = ratioLabel(game.positive, game.negative)
  const hltbH = hltb?.mainStory

  return (
    <div
      onClick={() => onSelect(game)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
        background: 'var(--bg2)',
        border: `1px solid ${hov ? 'rgba(var(--accent-rgb),.4)' : 'var(--border)'}`,
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov
          ? '0 16px 44px rgba(0,0,0,.65), 0 0 0 1px rgba(var(--accent-rgb),.12)'
          : '0 2px 10px rgba(0,0,0,.35)',
        transition: 'all .2s cubic-bezier(.4,0,.2,1)',
        animation: `fadeUp .3s ease ${Math.min(index, 16) * 25}ms backwards`,
      }}
    >
      <div style={{ aspectRatio: '3/4', position: 'relative', overflow: 'hidden', background: 'var(--bg4)' }}>
        {!loaded && <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />}
        <img
          src={imgSrc} alt=""
          onLoad={() => setLoaded(true)} onError={onErr}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: loaded ? 1 : 0, transition: 'opacity .3s, transform .4s', transform: hov ? 'scale(1.05)' : 'scale(1)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,.82) 100%)' }} />
        {hov && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.28)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: '2px solid rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3" fill="white"/></svg>
            </div>
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: '#fff', lineHeight: 1.3, textShadow: '0 1px 6px rgba(0,0,0,.8)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {game.name}
          </div>
        </div>
      </div>
      <div style={{ padding: '8px 10px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          {label && <span style={{ fontSize: 10, fontWeight: 700, color: col }}>{label}</span>}
          {game.price && (
            <span style={{ fontSize: 11, fontWeight: 700, color: game.price === 'Free' ? '#10B981' : 'var(--text)', background: 'var(--bg4)', padding: '2px 7px', borderRadius: 6 }}>
              {game.price}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {hltbH && <span style={{ fontSize: 10, color: '#f5c518' }}>⏱ {hFmt(hltbH)}</span>}
          {!hltbH && game.avgPlaytime > 0 && <span style={{ fontSize: 10, color: 'var(--text3)' }}>~{game.avgPlaytime}h avg</span>}
          {fmtOwners(game.owners) && <span style={{ fontSize: 10, color: 'var(--text3)' }}>{fmtOwners(game.owners)}</span>}
        </div>
      </div>
    </div>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function VideoCard({ video }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={() => window.spicegames?.openExternal(video.url)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ borderRadius: 10, overflow: 'hidden', cursor: 'pointer', border: `1px solid ${hov ? 'rgba(var(--accent-rgb),.4)' : 'var(--border)'}`, background: 'var(--bg3)', transition: 'all .18s', transform: hov ? 'translateY(-2px)' : 'none', boxShadow: hov ? '0 8px 24px rgba(0,0,0,.5)' : 'none' }}
    >
      <div style={{ position: 'relative', aspectRatio: '16/9', background: 'var(--bg4)', overflow: 'hidden' }}>
        {video.thumb && <img src={video.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display = 'none'} />}
        <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${hov ? .4 : .2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .18s' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: hov ? 'rgba(255,0,0,.9)' : 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .18s' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
        {video.duration && (
          <div style={{ position: 'absolute', bottom: 5, right: 6, fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 4, background: 'rgba(0,0,0,.82)', color: '#fff' }}>
            {video.duration}
          </div>
        )}
      </div>
      <div style={{ padding: '8px 10px 9px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 4 }}>
          {video.title}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{video.channel}</span>
          {video.views && <span style={{ fontSize: 10, color: 'var(--text3)', flexShrink: 0, marginLeft: 6 }}>{video.views}</span>}
        </div>
      </div>
    </div>
  )
}

function DetailModal({ game, onClose }) {
  const [d,         setD]        = useState(null)
  const [hltb,      setHltb]     = useState(null)
  const [bigShot,   setBig]      = useState(null)
  const [loading,   setLoading]  = useState(true)
  const [videoTab,  setVideoTab] = useState('trailer')
  const [videos,    setVideos]   = useState({})
  const [vidLoading,setVidLoad]  = useState(false)
  const [tab,       setTab]      = useState('info')

  useEffect(() => {
    const esc = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  useEffect(() => {
    if (!IS) { setLoading(false); return }
    window.spicegames.discoverDetails({ steamId: game.steamId })
      .then(r => { if (r.ok) setD(r) })
      .finally(() => setLoading(false))
    const s = useStore.getState().settings || {}
    if (s.hltbEnabled !== false) {
      window.spicegames.hltbSearch({ name: game.name })
        .then(r => r.ok && r.results?.[0] && setHltb(r.results[0]))
        .catch(() => {})
    }
  }, [game.steamId, game.name])

  // Fetch videos when Videos tab opens or video tab type changes
  useEffect(() => {
    if (tab !== 'videos' || !IS) return
    if (videos[videoTab]) return   // already fetched
    setVidLoad(true)
    window.spicegames.fetchYtVideos({ gameName: game.name, type: videoTab })
      .then(r => { if (r.ok) setVideos(prev => ({ ...prev, [videoTab]: r.videos })) })
      .finally(() => setVidLoad(false))
  }, [tab, videoTab, game.name, videos])

  const info    = d || game
  const ratioC  = ratioColor(info.positive, info.negative)
  const label   = ratioLabel(info.positive, info.negative)
  const curVids = videos[videoTab] || []

  const TABS = [
    { id: 'info',       label: 'Info'        },
    { id: 'screenshots',label: 'Screenshots' },
    { id: 'videos',     label: '▶ Videos'    },
  ]

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', backdropFilter: 'blur(20px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn .18s ease' }}
    >
      <div style={{ width: '100%', maxWidth: 860, maxHeight: '92vh', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 50px 120px rgba(0,0,0,.9)', animation: 'fadeInScale .22s ease' }}>

        {/* Hero */}
        <div style={{ height: 220, position: 'relative', flexShrink: 0, background: 'var(--bg4)', overflow: 'hidden' }}>
          <img
            src={info.hero || info.header || info.cover} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .6 }}
            onError={e => { if (info.header) e.target.src = info.header; else e.target.style.display = 'none' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,.15) 0%, rgba(0,0,0,.88) 100%)' }} />
          <button onClick={onClose}
            style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.65)', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ×
          </button>

          <div style={{ position: 'absolute', bottom: 16, left: 22, right: 60 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {info.metacritic && (
                <span style={{ fontSize: 12, fontWeight: 800, padding: '3px 9px', borderRadius: 7, background: info.metacritic >= 80 ? '#10B981' : info.metacritic >= 60 ? '#F59E0B' : '#EF4444', color: '#fff' }}>
                  {info.metacritic} MC
                </span>
              )}
              {label && <span style={{ fontSize: 11, fontWeight: 700, color: ratioC }}>● {label}</span>}
              {info.price && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(0,0,0,.5)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                  {info.price}
                </span>
              )}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.15, textShadow: '0 2px 12px rgba(0,0,0,.9)' }}>
              {info.name}
            </h2>
            {d?.developers?.[0] && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>by {d.developers.join(', ')}</div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, padding: '10px 22px 0', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg2)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '7px 16px', borderRadius: '8px 8px 0 0', border: 'none', background: tab === t.id ? 'var(--bg3)' : 'transparent', color: tab === t.id ? 'var(--text)' : 'var(--text3)', fontSize: 12, fontWeight: tab === t.id ? 700 : 400, cursor: 'pointer', borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all .15s', fontFamily: 'var(--font-body)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px 20px' }}>

          {/* ── INFO TAB ── */}
          {tab === 'info' && (
            <>
              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[90, 70, 85, 60, 75].map((w, i) => <div key={i} className="shimmer" style={{ height: 13, borderRadius: 6, width: `${w}%` }} />)}
                </div>
              )}
              {!loading && (
                <>
                  {/* HLTB */}
                  {hltb && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 18, padding: '12px 14px', borderRadius: 12, background: 'rgba(245,196,24,.07)', border: '1px solid rgba(245,196,24,.2)' }}>
                      <div style={{ gridColumn: '1/-1', fontSize: 11, fontWeight: 700, color: '#f5c518', marginBottom: 4 }}>⏱ HowLongToBeat — {hltb.name}</div>
                      {[['Main Story', hltb.mainStory], ['Main + Extra', hltb.mainExtra], ['Completionist', hltb.completionist]].filter(([, v]) => v).map(([l, h]) => (
                        <div key={l} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: 'var(--bg4)' }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>{hFmt(h)}</div>
                          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  {d?.description && (
                    <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 18 }}>{d.description}</p>
                  )}

                  {/* Info grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                    {[
                      ['Released',      d?.releaseDate],
                      ['Genre',         d?.genres?.slice(0, 3).join(', ')],
                      ['Developer',     d?.developers?.slice(0, 2).join(', ')],
                      ['Publisher',     d?.publishers?.[0]],
                      ['Avg Playtime',  d?.avgPlaytime ? `~${d.avgPlaytime}h` : null],
                      ['Peak Players',  d?.peakCCU ? d.peakCCU.toLocaleString() : null],
                      ['Owners',        fmtOwners(d?.owners)],
                      ['Platforms',     d?.platforms?.join(', ')],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} style={{ padding: '9px 11px', borderRadius: 9, background: 'var(--bg3)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3 }}>{k}</div>
                        <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Tags/categories */}
                  {d?.categories?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {d.categories.map(t => (
                        <span key={t} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'var(--bg4)', color: 'var(--text3)', border: '1px solid var(--border)' }}>{t}</span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── SCREENSHOTS TAB ── */}
          {tab === 'screenshots' && (
            <div>
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                  {[1, 2, 3, 4].map(i => <div key={i} className="shimmer" style={{ borderRadius: 9, aspectRatio: '16/9' }} />)}
                </div>
              ) : d?.screenshots?.length > 0 ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                    {d.screenshots.map((s, i) => (
                      <div key={i} onClick={() => setBig(bigShot === s ? null : s)}
                        style={{ borderRadius: 9, overflow: 'hidden', aspectRatio: '16/9', cursor: 'zoom-in', border: `2px solid ${bigShot === s ? 'var(--accent)' : 'transparent'}`, transition: 'border-color .15s' }}>
                        <img src={s} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    ))}
                  </div>
                  {bigShot && (
                    <div style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', cursor: 'zoom-out' }} onClick={() => setBig(null)}>
                      <img src={bigShot} alt="" style={{ width: '100%', display: 'block' }} />
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
                  <div style={{ fontSize: 36, opacity: .2, marginBottom: 10 }}>🖼</div>
                  <p>No screenshots available</p>
                </div>
              )}
            </div>
          )}

          {/* ── VIDEOS TAB ── */}
          {tab === 'videos' && (
            <div>
              {/* Video type pills */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {VIDEO_TABS.map(vt => (
                  <button key={vt.id} onClick={() => setVideoTab(vt.id)}
                    style={{ padding: '5px 14px', borderRadius: 50, border: `1px solid ${videoTab === vt.id ? 'var(--accent)' : 'var(--border2)'}`, background: videoTab === vt.id ? `rgba(var(--accent-rgb),.12)` : 'transparent', color: videoTab === vt.id ? 'var(--accent)' : 'var(--text3)', fontSize: 12, fontWeight: videoTab === vt.id ? 700 : 400, cursor: 'pointer', transition: 'all .15s', fontFamily: 'var(--font-body)' }}>
                    {vt.label}
                  </button>
                ))}
              </div>

              {vidLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ borderRadius: 10, overflow: 'hidden', background: 'var(--bg3)' }}>
                      <div className="shimmer" style={{ aspectRatio: '16/9' }} />
                      <div style={{ padding: '8px 10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="shimmer" style={{ height: 11, borderRadius: 5, width: '85%' }} />
                        <div className="shimmer" style={{ height: 9, borderRadius: 5, width: '55%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : curVids.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                  {curVids.map(v => <VideoCard key={v.id} video={v} />)}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
                  <div style={{ fontSize: 36, opacity: .2, marginBottom: 10 }}>▶</div>
                  <p style={{ fontSize: 13 }}>No videos found for "{game.name}"</p>
                  <button
                    onClick={() => window.spicegames?.openExternal(`https://www.youtube.com/results?search_query=${encodeURIComponent(game.name + ' ' + videoTab)}`)}
                    style={{ marginTop: 12, padding: '7px 18px', borderRadius: 8, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                    Search on YouTube ↗
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer — View on Steam only */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            onClick={() => window.spicegames?.openExternal(`https://store.steampowered.com/app/${game.steamId}`)}
            style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#1b2838,#2a475e)', color: '#c7d5e0', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity .15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#c7d5e0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
            View on Steam
          </button>
          {d?.website && (
            <button
              onClick={() => window.spicegames?.openExternal(d.website)}
              style={{ padding: '11px 18px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}>
              🌐
            </button>
          )}
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
  const settings = useStore(s => s.settings) || {}

  const load = useCallback(async (m, g, q, p, append) => {
    if (!IS) return
    if (p === 1) setLoading(true); else setMoreLoad(true)
    try {
      const res = await window.spicegames.discoverGames({ mode: m, genre: g, search: q, page: p })
      if (res.ok) {
        setGames(prev => append ? [...prev, ...res.games] : res.games)
        setHasMore(res.hasMore)
        if (!append && settings.hltbEnabled !== false) {
          res.games.slice(0, 8).forEach(async gm => {
            try {
              const h = await window.spicegames.hltbSearch({ name: gm.name })
              if (h.ok && h.results?.[0]) setHltbMap(prev => ({ ...prev, [gm.steamId]: h.results[0] }))
            } catch {}
          })
        }
      }
    } catch {}
    if (p === 1) setLoading(false); else setMoreLoad(false)
  }, [settings.hltbEnabled])

  useEffect(() => {
    setPage(1); setGames([]); setHltbMap({})
    load(mode, genre, '', 1, false)
  }, [mode, genre, load])

  // Debounced search on type
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1); setGames([]); setHltbMap({})
      load(mode, genre, query, 1, false)
    }, 500)
    return () => clearTimeout(t)
  }, [query])

  const loadMore = () => {
    const next = page + 1; setPage(next)
    load(mode, genre, query, next, true)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--text)', lineHeight: 1, margin: 0 }}>Discover</h1>
          </div>
          <div style={{ flex: 1 }} />
          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg3)', borderRadius: 9, padding: 3 }}>
            {MODES.map(m => (
              <button key={m.id} onClick={() => { setMode(m.id); setGenre(''); setQuery('') }}
                style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: mode === m.id ? 'var(--bg5)' : 'transparent', color: mode === m.id ? 'var(--text)' : 'var(--text3)', fontSize: 12, fontWeight: mode === m.id ? 600 : 400, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}>
                {m.label}
              </button>
            ))}
          </div>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 50, padding: '7px 12px', position: 'relative' }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" style={{ color: 'var(--text3)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search games…"
              style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 12, fontFamily: 'var(--font-body)', width: 160, paddingRight: '20px' }}
            />
            {query && (
              <button onClick={() => setQuery('')}
                style={{ position: 'absolute', right: 10, background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', width: 16, height: 16, minWidth: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, padding: 0 }}>
                ×
              </button>
            )}
          </div>
        </div>
        {/* Genre pills */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {GENRES.map(g => (
            <button key={g.id} onClick={() => setGenre(g.id)}
              style={{ padding: '4px 12px', borderRadius: 50, border: `1px solid ${genre === g.id ? 'var(--accent)' : 'var(--border2)'}`, background: genre === g.id ? `rgba(var(--accent-rgb),.12)` : 'transparent', color: genre === g.id ? 'var(--accent)' : 'var(--text3)', fontSize: 11, fontWeight: genre === g.id ? 700 : 400, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 40px' }}>
        {!IS && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 52, opacity: .15, marginBottom: 14 }}>🖥</div>
            <p style={{ color: 'var(--text2)' }}>Run in Electron to browse games</p>
          </div>
        )}
        {IS && loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))', gap: 12 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                <div className="shimmer" style={{ aspectRatio: '3/4' }} />
                <div style={{ padding: '8px 10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="shimmer" style={{ height: 12, borderRadius: 5, width: '80%' }} />
                  <div className="shimmer" style={{ height: 10, borderRadius: 5, width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        )}
        {IS && !loading && games.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))', gap: 12 }}>
              {games.map((g, i) => (
                <GameCard key={g.steamId} game={g} hltb={hltbMap[g.steamId]} onSelect={setSelected} index={i} />
              ))}
            </div>
            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
                <button onClick={loadMore} disabled={moreLoad}
                  style={{ padding: '10px 34px', borderRadius: 50, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 13, fontWeight: 600, cursor: moreLoad ? 'default' : 'pointer', opacity: moreLoad ? .6 : 1, transition: 'background .15s', fontFamily: 'var(--font-body)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}>
                  {moreLoad ? '…' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
        {IS && !loading && games.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text3)' }}>
            <div style={{ fontSize: 44, marginBottom: 12, opacity: .2 }}>🔍</div>
            <p style={{ fontSize: 14 }}>No games found</p>
          </div>
        )}
      </div>
      {selected && <DetailModal game={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}