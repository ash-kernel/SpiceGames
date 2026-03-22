import React, { useState, useEffect } from 'react'

const IS = typeof window !== 'undefined' && window.spicegames != null

const SOURCES = ['All','PC Gamer','Rock Paper Shotgun','Eurogamer','IGN']
const COLORS  = { 'PC Gamer':'#e53e3e', 'Rock Paper Shotgun':'#6366F1', 'Eurogamer':'#f59e0b', 'IGN':'#ef4444' }

function NewsCard({ item, index }) {
  const [hov, setHov] = useState(false)
  const ago = (() => {
    if (!item.date) return ''
    const diff = (Date.now() - new Date(item.date)) / 1000
    if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
    return `${Math.floor(diff/86400)}d ago`
  })()
  const col = COLORS[item.source] || 'var(--accent)'

  return (
    <a href={item.link} target="_blank" rel="noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex', gap:14, padding:'13px 20px', borderBottom:'1px solid var(--border)', textDecoration:'none', background:hov?'var(--bg3)':'transparent', transition:'background .15s', animation:`fadeUp .3s ease ${(index%10)*20}ms backwards` }}>
      {item.image && (
        <div style={{ width:88, height:58, borderRadius:8, overflow:'hidden', flexShrink:0, background:'var(--bg4)' }}>
          <img src={item.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} onError={e=>e.target.style.display='none'} />
        </div>
      )}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--text)', lineHeight:1.4, marginBottom:5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {item.title}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:20, background:`${col}20`, color:col, border:`1px solid ${col}30` }}>{item.source}</span>
          {ago && <span style={{ fontSize:11, color:'var(--text3)' }}>{ago}</span>}
        </div>
        {item.description && (
          <div style={{ fontSize:11, color:'var(--text3)', marginTop:4, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {item.description}
          </div>
        )}
      </div>
      <div style={{ fontSize:13, color:'var(--text3)', flexShrink:0, alignSelf:'flex-start', opacity:hov?1:.3, transition:'opacity .15s' }}>↗</div>
    </a>
  )
}

export default function GameNewsPage() {
  const [news,    setNews]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [source,  setSource]  = useState('All')

  const load = async () => {
    if (!IS) return
    setLoading(true); setError(null)
    try {
      const res = await window.spicegames.fetchNews()
      if (res.ok && res.items.length > 0) setNews(res.items)
      else setError('No articles loaded — check your connection')
    } catch { setError('Failed to load news') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const displayed = source === 'All' ? news : news.filter(n => n.source === source)

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'16px 22px 12px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'var(--text)', lineHeight:1 }}>Game News</h1>
            <p style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>PC Gamer · RPS · Eurogamer · IGN</p>
          </div>
          <div style={{ flex:1 }} />
          {news.length > 0 && <span style={{ fontSize:12, color:'var(--text3)' }}>{news.length} articles</span>}
          <button onClick={load} disabled={loading}
            style={{ padding:'7px 14px', borderRadius:8, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text)', fontSize:12, cursor:loading?'default':'pointer', opacity:loading?.5:1, transition:'background .15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
            onMouseLeave={e=>e.currentTarget.style.background='var(--bg3)'}>
            {loading ? '…' : '↻ Refresh'}
          </button>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {SOURCES.map(s => {
            const col = COLORS[s] || 'var(--accent)'
            const active = source === s
            return (
              <button key={s} onClick={() => setSource(s)}
                style={{ padding:'5px 13px', borderRadius:50, border:`1px solid ${active?col:'var(--border2)'}`, background:active?`${col}18`:'transparent', color:active?col:'var(--text3)', fontSize:12, fontWeight:active?600:400, cursor:'pointer', transition:'all .18s' }}>
                {s}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto' }}>
        {loading && Array.from({length:8}).map((_,i) => (
          <div key={i} style={{ display:'flex', gap:14, padding:'13px 20px', borderBottom:'1px solid var(--border)' }}>
            <div className="shimmer" style={{ width:88, height:58, borderRadius:8, flexShrink:0 }} />
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8, justifyContent:'center' }}>
              <div className="shimmer" style={{ height:13, borderRadius:6, width:'80%' }} />
              <div className="shimmer" style={{ height:13, borderRadius:6, width:'55%' }} />
              <div className="shimmer" style={{ height:10, borderRadius:6, width:'30%' }} />
            </div>
          </div>
        ))}

        {!loading && error && (
          <div style={{ textAlign:'center', padding:'80px 20px' }}>
            <div style={{ fontSize:44, marginBottom:12, opacity:.2 }}>📰</div>
            <p style={{ fontSize:14, color:'var(--text2)', marginBottom:8 }}>{error}</p>
            <button onClick={load} style={{ padding:'8px 18px', borderRadius:8, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text)', fontSize:13, cursor:'pointer' }}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && displayed.length > 0 &&
          displayed.map((item, i) => <NewsCard key={item.id||i} item={item} index={i} />)
        }

        {!loading && !error && displayed.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text3)' }}>
            <div style={{ fontSize:44, marginBottom:12, opacity:.2 }}>📰</div>
            <p>No articles found</p>
          </div>
        )}
      </div>
    </div>
  )
}