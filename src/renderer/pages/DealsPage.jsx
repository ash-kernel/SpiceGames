import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

const IS = typeof window !== 'undefined' && window.spicegames != null

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

const SORT_OPTIONS = [
  { v:'DealRating',  l:'Best Deals'       },
  { v:'Savings',     l:'Biggest Discount' },
  { v:'Price',       l:'Lowest Price'     },
  { v:'Metacritic',  l:'Metacritic Score' },
  { v:'Reviews',     l:'Steam Reviews'    },
]

const STORE_ICONS = { '1':'🎮','2':'🌿','3':'🟠','7':'💗','8':'🟦','11':'🔵','13':'🟣','15':'💙' }

function DealCard({ deal, currency, index }) {
  const [hov, setHov] = useState(false)
  const saleDisp   = `${currency.symbol}${(deal.salePrice * currency.rate).toFixed(currency.code==='JPY'?0:2)}`
  const normalDisp = `${currency.symbol}${(deal.normalPrice * currency.rate).toFixed(currency.code==='JPY'?0:2)}`

  const savingsColor = deal.savings >= 75 ? 'var(--success)' : deal.savings >= 50 ? 'var(--warning)' : 'var(--accent)'

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex', gap:14, padding:'12px 14px', borderRadius:13, background:'var(--bg2)', border:`1px solid ${hov?'rgba(var(--accent-rgb),.25)':'var(--border)'}`, transition:'all .2s', transform:hov?'translateY(-2px)':'none', boxShadow:hov?'0 8px 28px rgba(0,0,0,.55)':'0 2px 8px rgba(0,0,0,.3)', animation:`fadeUp .3s ease ${(index%20)*20}ms backwards`, cursor:'pointer', position:'relative' }}
      onClick={() => window.open(`https://www.cheapshark.com/redirect?dealID=${deal.dealId}`, '_blank')}>

      <div style={{ width:84, height:60, borderRadius:9, overflow:'hidden', background:'var(--bg4)', flexShrink:0 }}>
        {deal.cover
          ? <img src={deal.cover} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} onError={e=>e.target.style.display='none'} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, opacity:.3 }}>🎮</div>}
      </div>

      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', justifyContent:'center', gap:5 }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{deal.title}</div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span style={{ fontSize:12 }}>{STORE_ICONS[deal.storeId]||'🛒'}</span>
          {deal.metacritic && <span style={{ fontSize:11, fontWeight:700, color:deal.metacritic>=75?'var(--success)':'var(--warning)' }}>MC {deal.metacritic}</span>}
          {deal.steamRating && <span style={{ fontSize:11, color:'var(--text3)' }}>{deal.steamRating}</span>}
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', justifyContent:'center', gap:4, flexShrink:0 }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:17, color:'var(--success)', lineHeight:1 }}>{saleDisp}</div>
        <div style={{ fontSize:11, color:'var(--text3)', textDecoration:'line-through' }}>{normalDisp}</div>
        <div style={{ fontSize:11, fontWeight:800, padding:'2px 8px', borderRadius:20, background:`${savingsColor}20`, color:savingsColor, border:`1px solid ${savingsColor}40` }}>
          -{deal.savings}%
        </div>
      </div>


    </div>
  )
}

export default function DealsPage() {
  const [deals,       setDeals]       = useState([])
  const [stores,      setStores]      = useState([])
  const [loading,     setLoading]     = useState(false)
  const [sortBy,      setSortBy]      = useState('DealRating')
  const [storeFilter, setStoreFilter] = useState('')
  const [maxPrice,    setMaxPrice]    = useState(0)
  const [currency,    setCurrency]    = useState(CURRENCIES[0])

  const load = async (sort, store, price) => {
    if (!IS) return
    setLoading(true)
    try {
      const priceInUSD = price && currency.rate !== 1 ? Math.round(price / currency.rate) : price
      const res = await window.spicegames.fetchDeals({ sortBy:sort, storeId:store, upperPrice:priceInUSD||0 })
      if (res.ok) setDeals(res.deals)
    } catch (e) { console.error('Deals error:', e) }
    setLoading(false)
  }

  useEffect(() => {
    if (!IS) return
    load('DealRating','',0)
    window.spicegames.fetchStores().then(r => { if(r.ok) setStores(r.stores) }).catch(()=>{})
  }, [])

  const handleSort     = s => { setSortBy(s); load(s, storeFilter, maxPrice) }
  const handleStore    = s => { setStoreFilter(s); load(sortBy, s, maxPrice) }
  const handleMaxPrice = p => { setMaxPrice(p); load(sortBy, storeFilter, p) }


  const savings75  = deals.filter(d => d.savings >= 75).length
  const freeDeals  = deals.filter(d => d.salePrice === 0).length

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'16px 22px 12px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, flexWrap:'wrap' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'var(--text)', lineHeight:1 }}>Deals</h1>
              <div style={{ display:'flex', gap:6 }}>
                {savings75 > 0 && <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(16,185,129,.1)', color:'var(--success)', border:'1px solid rgba(16,185,129,.2)' }}>{savings75} · 75%+ off</span>}
                {freeDeals > 0 && <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(99,102,241,.1)', color:'var(--accent)', border:'1px solid rgba(99,102,241,.2)' }}>{freeDeals} free</span>}
              </div>
            </div>
            <p style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>Via CheapShark · Steam, GOG, Epic, Humble & more · click to buy</p>
          </div>
          <div style={{ flex:1 }} />

          <select value={currency.code} onChange={e => setCurrency(CURRENCIES.find(c=>c.code===e.target.value))}
            style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--text)', fontFamily:'var(--font-body)', padding:'7px 28px 7px 10px', borderRadius:8, fontSize:13, outline:'none', cursor:'pointer', appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238B89A8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 8px center' }}>
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} {c.symbol}</option>)}
          </select>
        </div>

        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {SORT_OPTIONS.map(o => (
              <button key={o.v} onClick={() => handleSort(o.v)}
                style={{ padding:'5px 13px', borderRadius:50, border:`1px solid ${sortBy===o.v?'var(--accent)':'var(--border2)'}`, background:sortBy===o.v?`rgba(var(--accent-rgb),.12)`:'transparent', color:sortBy===o.v?'var(--accent)':'var(--text3)', fontSize:12, fontWeight:sortBy===o.v?600:400, cursor:'pointer', transition:'all .18s' }}>
                {o.l}
              </button>
            ))}
          </div>

          {stores.length > 0 && (
            <select value={storeFilter} onChange={e=>handleStore(e.target.value)}
              style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--text)', fontFamily:'var(--font-body)', padding:'6px 24px 6px 10px', borderRadius:20, fontSize:12, outline:'none', cursor:'pointer', appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M1 1l3 3 3-3' stroke='%238B89A8' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 8px center' }}>
              <option value="">All Stores</option>
              {stores.map(s => <option key={s.storeID} value={s.storeID}>{STORE_ICONS[s.storeID]||'🛒'} {s.storeName}</option>)}
            </select>
          )}

          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:20, padding:'5px 14px' }}>
            <span style={{ fontSize:12, color:'var(--text3)' }}>Max {currency.symbol}</span>
            <input value={maxPrice||''} onChange={e => { const v=parseFloat(e.target.value)||0; setMaxPrice(v) }}
              onBlur={() => handleMaxPrice(maxPrice)}
              onKeyDown={e => e.key==='Enter'&&handleMaxPrice(maxPrice)}
              placeholder="any"
              style={{ width:60, background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:12, fontFamily:'var(--font-body)' }} />
          </div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'16px 22px 60px' }}>
        {!IS && <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text3)' }}><div style={{ fontSize:44, opacity:.25 }}>💸</div><p style={{ marginTop:12 }}>Desktop app required</p></div>}
        {IS && loading && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {Array.from({length:12}).map((_,i) => (
              <div key={i} style={{ display:'flex', gap:14, padding:'12px 14px', borderRadius:13, background:'var(--bg2)', border:'1px solid var(--border)', alignItems:'center' }}>
                <div className="shimmer" style={{ width:84, height:60, borderRadius:9, flexShrink:0 }} />
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                  <div className="shimmer" style={{ height:14, borderRadius:6, width:'70%' }} />
                  <div className="shimmer" style={{ height:10, borderRadius:6, width:'45%' }} />
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:5, alignItems:'flex-end' }}>
                  <div className="shimmer" style={{ width:44, height:18, borderRadius:6 }} />
                  <div className="shimmer" style={{ width:36, height:12, borderRadius:6 }} />
                  <div className="shimmer" style={{ width:42, height:18, borderRadius:20 }} />
                </div>
              </div>
            ))}
          </div>
        )}
        {IS && !loading && deals.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {deals.map((d,i) => <DealCard key={d.dealId||i} deal={d} currency={currency} index={i} />)}
          </div>
        )}
        {IS && !loading && deals.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text3)' }}><div style={{ fontSize:44, marginBottom:12, opacity:.25 }}>💸</div><p>No deals found</p></div>
        )}
      </div>
    </div>
  )
}