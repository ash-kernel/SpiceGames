import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

const IS = typeof window !== 'undefined' && window.spicegames?.isElectron

const CURRENCIES = [
  { code:'USD', symbol:'$', rate:1 },
  { code:'EUR', symbol:'€', rate:0.92 },
  { code:'GBP', symbol:'£', rate:0.79 },
  { code:'INR', symbol:'₹', rate:83.1 },
  { code:'CAD', symbol:'C$', rate:1.36 },
  { code:'AUD', symbol:'A$', rate:1.53 },
  { code:'JPY', symbol:'¥', rate:149.5 },
  { code:'BRL', symbol:'R$', rate:4.97 },
]

function WishCard({ item, currency, onRemove, onSetPrice, onMoveToLibrary }) {
  const [hov,         setHov]   = useState(false)
  const [editPrice,   setEdit]  = useState(false)
  const [priceInput,  setPI]    = useState(item.targetPrice ? String(item.targetPrice) : '')

  const savePrice = () => {
    const p = parseFloat(priceInput)
    onSetPrice(item.id, isNaN(p) ? null : p)
    setEdit(false)
    toast.success(isNaN(p) ? 'Price alert removed' : `Alert set at ${currency.symbol}${(p * currency.rate).toFixed(2)}`)
  }

  const cover = item.cover || (item.steamId ? `https://cdn.akamai.steamstatic.com/steam/apps/${item.steamId}/header.jpg` : null)
  const dispPrice = item.currentBestPrice
    ? `${currency.symbol}${(item.currentBestPrice * currency.rate).toFixed(2)}`
    : null
  const targetDisp = item.targetPrice
    ? `${currency.symbol}${(item.targetPrice * currency.rate).toFixed(2)}`
    : null
  const isAlert = item.targetPrice && item.currentBestPrice && item.currentBestPrice <= item.targetPrice

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:'var(--bg2)', border:`1px solid ${hov?'rgba(var(--accent-rgb),.25)':'var(--border)'}`, borderRadius:16, overflow:'hidden', transition:'all .2s', transform:hov?'translateY(-2px)':'none', boxShadow:hov?'0 8px 28px rgba(0,0,0,.5)':'0 2px 10px rgba(0,0,0,.3)' }}>

      <div style={{ height:120, position:'relative', overflow:'hidden', background:'var(--bg4)' }}>
        {cover && <img src={cover} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }} onError={e=>e.target.style.display='none'} />}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 30%,rgba(0,0,0,.8))' }} />

        {isAlert && (
          <div style={{ position:'absolute', top:10, left:10, display:'flex', alignItems:'center', gap:5, background:'rgba(16,185,129,.9)', borderRadius:20, padding:'4px 12px', fontSize:11, fontWeight:700, color:'#fff', animation:'runningPulse 2s infinite' }}>
            🔔 Price Alert!
          </div>
        )}

        {item.source && (
          <div style={{ position:'absolute', top:10, right:10, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, background:'rgba(0,0,0,.65)', color:'rgba(255,255,255,.8)', backdropFilter:'blur(6px)' }}>
            {item.source}
          </div>
        )}

        <div style={{ position:'absolute', bottom:10, left:12, right:12, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:14, color:'#fff', lineHeight:1.2 }}>
            {item.name}
          </div>
          {dispPrice && (
            <div style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:16, color:'var(--success)' }}>
              {dispPrice}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding:'12px 14px' }}>
        {(item.genres?.length > 0 || item.developer) && (
          <div style={{ fontSize:12, color:'var(--text3)', marginBottom:10, display:'flex', gap:8, flexWrap:'wrap' }}>
            {item.developer && <span>{item.developer}</span>}
            {item.genres?.slice(0,2).map(g => <span key={g} style={{ padding:'1px 7px', borderRadius:20, background:'var(--bg4)', fontSize:11 }}>{g}</span>)}
          </div>
        )}

        {editPrice ? (
          <div style={{ display:'flex', gap:8, marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:8, padding:'6px 10px', flex:1 }}>
              <span style={{ color:'var(--text3)', fontSize:13, marginRight:4 }}>{currency.symbol}</span>
              <input value={priceInput} onChange={e => setPI(e.target.value)} onKeyDown={e => e.key==='Enter'&&savePrice()}
                placeholder="0.00" autoFocus
                style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, fontFamily:'var(--font-body)', width:80 }} />
            </div>
            <button onClick={savePrice} style={{ padding:'6px 12px', borderRadius:8, border:'none', background:'var(--accent)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>Set</button>
            <button onClick={() => setEdit(false)} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text2)', fontSize:12, cursor:'pointer' }}>✕</button>
          </div>
        ) : (
          <div style={{ marginBottom:10 }}>
            {targetDisp ? (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', borderRadius:8, background:isAlert?'rgba(16,185,129,.1)':'rgba(var(--accent-rgb),.08)', border:`1px solid ${isAlert?'rgba(16,185,129,.25)':'rgba(var(--accent-rgb),.2)'}`, cursor:'pointer' }} onClick={() => setEdit(true)}>
                <span style={{ fontSize:11, color:isAlert?'var(--success)':'var(--accent)' }}>🔔 Alert at {targetDisp}</span>
                {isAlert && <span style={{ fontSize:11, fontWeight:700, color:'var(--success)' }}>— In range!</span>}
                <span style={{ fontSize:11, color:'var(--text3)', marginLeft:'auto' }}>Edit</span>
              </div>
            ) : (
              <button onClick={() => setEdit(true)}
                style={{ width:'100%', padding:'6px', borderRadius:8, border:'1px dashed var(--border2)', background:'transparent', color:'var(--text3)', fontSize:12, cursor:'pointer', transition:'all .18s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--text3)'}}>
                🔔 Set price alert
              </button>
            )}
          </div>
        )}

        <div style={{ display:'flex', gap:8 }}>
          {item.url && (
            <a href={item.url} target="_blank" rel="noreferrer"
              style={{ flex:1, padding:'7px', borderRadius:8, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text2)', fontSize:12, textAlign:'center', textDecoration:'none', transition:'background .18s' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
              onMouseLeave={e=>e.currentTarget.style.background='var(--bg3)'}>
              View ↗
            </a>
          )}
          <button onClick={() => onMoveToLibrary(item)}
            style={{ flex:1, padding:'7px', borderRadius:8, border:'none', background:`rgba(var(--accent-rgb),.15)`, color:'var(--accent)', fontSize:12, fontWeight:700, cursor:'pointer', transition:'background .18s' }}
            onMouseEnter={e=>e.currentTarget.style.background=`rgba(var(--accent-rgb),.25)`}
            onMouseLeave={e=>e.currentTarget.style.background=`rgba(var(--accent-rgb),.15)`}>
            + Library
          </button>
          <button onClick={() => onRemove(item.id)}
            style={{ width:32, height:32, borderRadius:8, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text3)', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .18s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,.1)';e.currentTarget.style.color='var(--danger)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='var(--bg3)';e.currentTarget.style.color='var(--text3)'}}>
            🗑
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WishlistPage() {
  const wishlist            = useStore(s => s.wishlist)
  const removeFromWishlist  = useStore(s => s.removeFromWishlist)
  const setWishlistTargetPrice = useStore(s => s.setWishlistTargetPrice)
  const addGame             = useStore(s => s.addGame)
  const setAddOpen          = useStore(s => s.setAddGameOpen)

  const [currency,  setCurrency]  = useState(CURRENCIES[0])
  const [checking,  setChecking]  = useState(false)
  const [alerts,    setAlerts]    = useState([])

  const checkAlerts = async () => {
    if (!IS) return
    setChecking(true)
    try {
      const res = await window.spicegames.checkPriceAlerts({ wishlist })
      if (res.ok && res.alerts.length > 0) {
        setAlerts(res.alerts)
        toast.success(`${res.alerts.length} price alert${res.alerts.length>1?'s':''} triggered!`)
      } else {
        toast('No deals found at your target prices yet', { icon:'💤' })
      }
    } catch { toast.error('Price check failed') }
    setChecking(false)
  }

  const moveToLibrary = (item) => {
    addGame({
      name:   item.name,
      cover:  item.cover,
      header: item.header,
      steamId:item.steamId,
      genres: item.genres,
      price:  item.price,
    })
    removeFromWishlist(item.id)
    toast.success(`${item.name} moved to library!`)
  }

  const alertIds = new Set(alerts.map(a => a.gameId))

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'16px 22px 12px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'var(--text)', lineHeight:1 }}>Wishlist</h1>
              <span style={{ fontSize:13, fontWeight:700, padding:'3px 11px', borderRadius:20, background:`rgba(var(--accent-rgb),.12)`, color:'var(--accent)', border:'1px solid rgba(var(--accent-rgb),.2)' }}>
                {wishlist.length}
              </span>
            </div>
            <p style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>Add games from Discover, itch.io or GOG · set price alerts</p>
          </div>
          <div style={{ flex:1 }} />

          <select value={currency.code} onChange={e => setCurrency(CURRENCIES.find(c=>c.code===e.target.value))}
            style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--text)', fontFamily:'var(--font-body)', padding:'7px 28px 7px 10px', borderRadius:8, fontSize:13, outline:'none', cursor:'pointer', appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238B89A8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 8px center' }}>
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} {c.symbol}</option>)}
          </select>

          {IS && wishlist.some(w => w.targetPrice) && (
            <button onClick={checkAlerts} disabled={checking}
              style={{ padding:'8px 18px', borderRadius:9, border:'none', background:`linear-gradient(135deg,var(--accent),var(--accent2))`, color:'#fff', fontSize:13, fontWeight:700, cursor:checking?'default':'pointer', fontFamily:'var(--font-display)', display:'flex', alignItems:'center', gap:8, boxShadow:'var(--shadow-glow)', opacity:checking?.7:1 }}>
              {checking ? <><div style={{ width:13, height:13, border:'2px solid #fff', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite' }} />Checking…</> : '🔔 Check Prices'}
            </button>
          )}
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'18px 22px 60px' }}>
        {wishlist.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px' }}>
            <div style={{ fontSize:52, marginBottom:16, opacity:.2 }}>🎯</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color:'var(--text)', marginBottom:8 }}>Wishlist is empty</h2>
            <p style={{ fontSize:14, color:'var(--text3)', marginBottom:20, lineHeight:1.7 }}>Add games from Discover, itch.io, or GOG.<br/>Set a target price and get alerts when it drops.</p>
            <button onClick={() => setAddOpen(true)}
              style={{ padding:'10px 24px', borderRadius:10, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-body)' }}>
              Browse games
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {[...wishlist].sort((a,b) => alertIds.has(b.id)?1:-1).map(item => (
              <WishCard
                key={item.id}
                item={{ ...item, currentBestPrice: alerts.find(a=>a.gameId===item.id)?.currentPrice }}
                currency={currency}
                onRemove={removeFromWishlist}
                onSetPrice={setWishlistTargetPrice}
                onMoveToLibrary={moveToLibrary}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}