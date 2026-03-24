import React, { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

const IS = typeof window !== 'undefined' && window.spicegames != null

function PriceHistoryChart({ history, lowestEver, gameName }) {
  if (!history?.length) return (
    <div style={{ textAlign:'center', padding:'30px 20px', color:'var(--text3)', fontSize:12 }}>
      No price history found for "{gameName}"
    </div>
  )

  const prices   = history.map(h => h.price)
  const maxPrice = Math.max(...prices, lowestEver || 0) * 1.1 || 60
  const minPrice = 0
  const W = 500, H = 160, PAD = { t:10, r:10, b:28, l:42 }
  const cW = W - PAD.l - PAD.r
  const cH = H - PAD.t - PAD.b

  const toX = (i) => PAD.l + (i / (history.length - 1 || 1)) * cW
  const toY = (p) => PAD.t + cH - ((p - minPrice) / (maxPrice - minPrice)) * cH

  const pathD = history.map((h, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(h.price).toFixed(1)}`).join(' ')
  const fillD = pathD + ` L${toX(history.length-1)},${(PAD.t+cH).toFixed(1)} L${PAD.l},${(PAD.t+cH).toFixed(1)} Z`

  // X-axis labels (show up to 6)
  const step = Math.max(1, Math.floor(history.length / 5))
  const labels = history.filter((_, i) => i % step === 0 || i === history.length - 1)
    .map((h, idx, arr) => ({ ...h, x: toX(history.indexOf(h)) }))

  return (
    <div>
      {lowestEver !== null && lowestEver !== undefined && (
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10, fontSize:12, color:'var(--success)' }}>
          <span style={{ fontWeight:700 }}>Lowest ever: ${lowestEver}</span>
          <span style={{ color:'var(--text3)' }}>via CheapShark</span>
        </div>
      )}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:'visible' }}>
        <defs>
          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02"/>
          </linearGradient>
          <clipPath id="chartClip">
            <rect x={PAD.l} y={PAD.t} width={cW} height={cH} />
          </clipPath>
        </defs>

        {/* Grid lines */}
        {[0,.25,.5,.75,1].map((t, i) => {
          const y = PAD.t + cH * t
          const price = maxPrice * (1 - t)
          return (
            <g key={i}>
              <line x1={PAD.l} y1={y} x2={W-PAD.r} y2={y} stroke="rgba(255,255,255,.05)" strokeDasharray="3,3" />
              <text x={PAD.l-6} y={y+4} fontSize="9" fill="rgba(255,255,255,.35)" textAnchor="end">${price.toFixed(0)}</text>
            </g>
          )
        })}

        {/* Fill area */}
        <path d={fillD} fill="url(#priceGrad)" clipPath="url(#chartClip)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#chartClip)" />

        {/* Lowest ever line */}
        {lowestEver > 0 && (
          <line x1={PAD.l} y1={toY(lowestEver)} x2={W-PAD.r} y2={toY(lowestEver)}
            stroke="var(--success)" strokeWidth="1" strokeDasharray="4,3" opacity=".7" />
        )}

        {/* Data points */}
        {history.map((h, i) => (
          <circle key={i} cx={toX(i)} cy={toY(h.price)} r="3"
            fill="var(--accent)" stroke="var(--bg2)" strokeWidth="1.5" />
        ))}

        {/* X labels */}
        {labels.map((h, i) => (
          <text key={i} x={h.x} y={H-6} fontSize="9" fill="rgba(255,255,255,.35)" textAnchor="middle">
            {h.date?.slice(5)}
          </text>
        ))}
      </svg>
    </div>
  )
}

function WishlistCard({ item, onRemove, onSetTarget, onViewHistory }) {
  const [hov, setHov] = useState(false)
  const isAlert = item.currentPrice > 0 && item.currentPrice <= item.targetPrice

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ borderRadius:12, overflow:'hidden', background:'var(--bg2)', border:`1px solid ${isAlert?'var(--success)':hov?'rgba(var(--accent-rgb),.3)':'var(--border)'}`, boxShadow:isAlert?'0 0 20px rgba(16,185,129,.2)':hov?'0 8px 24px rgba(0,0,0,.4)':'none', transition:'all .2s' }}
    >
      <div style={{ display:'flex', gap:0, overflow:'hidden' }}>
        {/* Cover */}
        <div style={{ width:70, flexShrink:0, background:'var(--bg4)', position:'relative' }}>
          {item.cover
            ? <img src={item.cover} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} onError={e => e.target.style.display='none'} />
            : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, opacity:.2 }}>🎮</div>
          }
        </div>

        {/* Info */}
        <div style={{ flex:1, padding:'12px 14px' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text)', lineHeight:1.3 }}>{item.name}</div>
            <button onClick={() => onRemove(item.id)}
              style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:16, opacity:.5, padding:'0 2px', flexShrink:0, transition:'opacity .15s' }}
              onMouseEnter={e=>e.currentTarget.style.opacity='1'}
              onMouseLeave={e=>e.currentTarget.style.opacity='.5'}>
              ×
            </button>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8, flexWrap:'wrap' }}>
            {item.currentPrice > 0 && (
              <span style={{ fontSize:14, fontWeight:800, color: isAlert?'var(--success)':'var(--text)', fontFamily:'var(--font-display)' }}>
                ${item.currentPrice.toFixed(2)}
              </span>
            )}
            {item.normalPrice > 0 && item.currentPrice < item.normalPrice && (
              <span style={{ fontSize:11, color:'var(--text3)', textDecoration:'line-through' }}>${item.normalPrice.toFixed(2)}</span>
            )}
            {isAlert && (
              <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'rgba(16,185,129,.15)', color:'var(--success)', border:'1px solid rgba(16,185,129,.3)' }}>
                🎯 Price alert hit!
              </span>
            )}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
            <span style={{ fontSize:11, color:'var(--text3)' }}>Target:</span>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ color:'var(--text3)', fontSize:12 }}>$</span>
              <input
                type="number" min="0" step="0.99"
                value={item.targetPrice || ''}
                onChange={e => onSetTarget(item.id, parseFloat(e.target.value) || 0)}
                placeholder="Set price"
                style={{ width:72, background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--text)', fontFamily:'var(--font-body)', padding:'4px 7px', borderRadius:7, fontSize:12, outline:'none' }}
              />
            </div>
            <button onClick={() => onViewHistory(item)}
              style={{ marginLeft:'auto', padding:'4px 11px', borderRadius:7, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text3)', fontSize:11, cursor:'pointer', transition:'all .15s', fontFamily:'var(--font-body)' }}
              onMouseEnter={e=>{e.currentTarget.style.background='var(--bg4)';e.currentTarget.style.color='var(--text)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='var(--bg3)';e.currentTarget.style.color='var(--text3)'}}>
              📈 History
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function HistoryModal({ item, onClose }) {
  const [history,  setHistory]  = useState([])
  const [lowest,   setLowest]   = useState(null)
  const [gameName, setGameName] = useState('')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const esc = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  useEffect(() => {
    if (!IS || !item) return
    window.spicegames.fetchPriceHistory({ gameName: item.name, steamId: item.steamId })
      .then(r => {
        if (r.ok) {
          setHistory(r.history || [])
          setLowest(r.lowestEver)
          setGameName(r.gameName || item.name)
        }
      })
      .finally(() => setLoading(false))
  }, [item])

  return (
    <div onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.88)', backdropFilter:'blur(16px)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:600, background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:18, overflow:'hidden', boxShadow:'0 40px 100px rgba(0,0,0,.8)', animation:'fadeInScale .2s ease' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:800, color:'var(--text)' }}>Price History</div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{gameName || item.name}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:18 }}>×</button>
        </div>
        <div style={{ padding:'18px 20px 20px' }}>
          {loading
            ? <div style={{ display:'flex', justifyContent:'center', padding:'30px 0' }}><div style={{ width:24, height:24, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite' }} /></div>
            : <PriceHistoryChart history={history} lowestEver={lowest} gameName={item.name} />
          }
        </div>
      </div>
    </div>
  )
}

export default function WishlistPage() {
  const [wishlist,     setWishlist]     = useState([])
  const [historyItem,  setHistoryItem]  = useState(null)
  const [checking,     setChecking]     = useState(false)
  const [search,       setSearch]       = useState('')
  const [searchRes,    setSearchRes]    = useState([])
  const [searching,    setSearching]    = useState(false)
  const libGames = useStore(s => s.games)

  useEffect(() => {
    if (!IS) return
    window.spicegames.getFullWishlist().then(w => w && setWishlist(w)).catch(() => {})
    // Auto-check alerts on load
    window.spicegames.checkWishlistAlerts().then(r => {
      if (r.ok && r.alerts.length) {
        r.alerts.forEach(a => toast(`🎯 ${a.name} hit $${a.currentPrice.toFixed(2)}!`, { duration:8000, icon:'💸' }))
        setWishlist(prev => prev.map(w => {
          const alert = r.alerts.find(a => a.id === w.id)
          return alert ? { ...w, currentPrice: alert.currentPrice } : w
        }))
      }
    }).catch(() => {})
  }, [])

  const save = (updated) => {
    setWishlist(updated)
    if (IS) window.spicegames.saveFullWishlist(updated).catch(() => {})
  }

  const removeItem = id => save(wishlist.filter(w => w.id !== id))

  const setTarget = (id, price) => save(wishlist.map(w => w.id === id ? { ...w, targetPrice:price } : w))

  const checkNow = async () => {
    if (!IS || !wishlist.length) return
    setChecking(true)
    try {
      const res = await window.spicegames.checkWishlistAlerts()
      if (res.ok) {
        if (res.alerts.length) {
          res.alerts.forEach(a => toast(`🎯 ${a.name} is $${a.currentPrice.toFixed(2)}!`, { duration:8000 }))
          setWishlist(prev => prev.map(w => {
            const a = res.alerts.find(x => x.id === w.id)
            return a ? { ...w, currentPrice:a.currentPrice } : w
          }))
        } else {
          toast('No price alerts triggered', { icon:'💤' })
        }
      }
    } catch { toast.error('Check failed') }
    setChecking(false)
  }

  const doSearch = async (q) => {
    if (!q.trim() || !IS) return
    setSearching(true)
    try {
      const res = await window.spicegames.searchGame({ name: q.trim() })
      setSearchRes((res || []).slice(0, 6))
    } catch {}
    setSearching(false)
  }

  useEffect(() => {
    if (!search.trim()) { setSearchRes([]); return }
    const t = setTimeout(() => doSearch(search), 500)
    return () => clearTimeout(t)
  }, [search])

  const addToWishlist = (game) => {
    if (wishlist.some(w => w.steamId === game.steamId)) { toast('Already in wishlist'); return }
    const item = { id: Date.now().toString(), name: game.name, steamId: game.steamId, cover: game.cover, targetPrice: 0, normalPrice: null, currentPrice: 0, addedAt: new Date().toISOString() }
    const updated = [...wishlist, item]
    save(updated)
    setSearch('')
    setSearchRes([])
    toast.success(`${game.name} added to wishlist!`)
  }

  const alertCount = wishlist.filter(w => w.currentPrice > 0 && w.targetPrice > 0 && w.currentPrice <= w.targetPrice).length

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'14px 20px 12px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'var(--text)', lineHeight:1, margin:0 }}>Wishlist</h1>
            <p style={{ fontSize:12, color:'var(--text3)', marginTop:3, marginBottom:0 }}>
              {wishlist.length} game{wishlist.length!==1?'s':''}{alertCount>0?` · 🎯 ${alertCount} alert${alertCount>1?'s':''} triggered`:''}
            </p>
          </div>
          <div style={{ flex:1 }} />
          <button onClick={checkNow} disabled={checking||!wishlist.length||!IS}
            style={{ padding:'7px 16px', borderRadius:9, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text)', fontSize:12, cursor:checking||!wishlist.length?'default':'pointer', opacity:!wishlist.length?.5:1, fontFamily:'var(--font-body)', transition:'background .15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
            onMouseLeave={e=>e.currentTarget.style.background='var(--bg3)'}>
            {checking ? '…' : '🔔 Check Prices'}
          </button>
        </div>
        {/* Search to add */}
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:50, padding:'8px 14px', position:'relative' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" style={{ color:'var(--text3)', flexShrink:0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search games to add to wishlist…"
              style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, fontFamily:'var(--font-body)', paddingRight:'24px' }}
            />
            {searching && <div style={{ position:'absolute', right:14, width:12, height:12, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite', flexShrink:0 }} />}
            {search && !searching && <button onClick={() => { setSearch(''); setSearchRes([]) }} style={{ position:'absolute', right:14, background:'none', border:'none', color:'var(--text2)', cursor:'pointer', width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, flexShrink:0, padding:0 }}>×</button>}
          </div>
          {searchRes.length > 0 && (
            <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:12, overflow:'hidden', zIndex:100, boxShadow:'0 12px 32px rgba(0,0,0,.6)' }}>
              {searchRes.map(g => (
                <div key={g.steamId} onClick={() => addToWishlist(g)}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer', transition:'background .15s', borderBottom:'1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  {g.cover && <img src={g.cover} alt="" style={{ width:38, height:38, borderRadius:7, objectFit:'cover' }} onError={e => e.target.style.display='none'} />}
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{g.name}</div>
                    {g.price && <div style={{ fontSize:11, color:'var(--text3)' }}>{g.price}</div>}
                  </div>
                  <span style={{ fontSize:11, color:'var(--accent)' }}>+ Add</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'14px 18px 40px' }}>
        {wishlist.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px' }}>
            <div style={{ fontSize:52, opacity:.15, marginBottom:16 }}>💛</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:8 }}>Wishlist is empty</h2>
            <p style={{ fontSize:13, color:'var(--text3)', lineHeight:1.7 }}>Search for games above and set a target price.<br/>We'll alert you when they hit your price.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {wishlist.map(item => (
              <WishlistCard key={item.id} item={item} onRemove={removeItem} onSetTarget={setTarget} onViewHistory={setHistoryItem} />
            ))}
          </div>
        )}
      </div>

      {historyItem && <HistoryModal item={historyItem} onClose={() => setHistoryItem(null)} />}
    </div>
  )
}