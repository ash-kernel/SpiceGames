import React from 'react'
import { useStore } from '../store/useStore'

export default function StatsPage() {
  const games          = useStore(s => s.games)
  const getTotalPlaytime = useStore(s => s.getTotalPlaytime)

  const totalTime  = getTotalPlaytime()
  const played     = games.filter(g => g.playtime > 0)
  const topRated   = [...games].sort((a,b)=>(b.rating||0)-(a.rating||0)).slice(0,5)
  const mostPlayed = [...games].sort((a,b)=>(b.playtime||0)-(a.playtime||0)).slice(0,5)
  const recentlyAdded = [...games].sort((a,b)=>new Date(b.addedAt||0)-new Date(a.addedAt||0)).slice(0,5)

  const genreCounts = {}
  games.forEach(g => (g.genres||[]).forEach(x => { genreCounts[x]=(genreCounts[x]||0)+1 }))
  const topGenres = Object.entries(genreCounts).sort((a,b)=>b[1]-a[1]).slice(0,6)

  const fmt = (m) => m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'24px' }}>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:900, marginBottom:24 }}>Stats</h1>

      {}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:28 }}>
        {[
          { label:'Total Games',    value:games.length,     icon:'🎮', color:'var(--accent)' },
          { label:'Games Played',   value:played.length,    icon:'▶',  color:'var(--success)' },
          { label:'Total Playtime', value:fmt(totalTime),   icon:'⏱',  color:'var(--warning)' },
          { label:'Avg Rating',     value: games.filter(g=>g.rating).length ? (games.reduce((s,g)=>s+(g.rating||0),0)/games.filter(g=>g.rating).length).toFixed(1) : 'N/A', icon:'★', color:'#F59E0B' },
        ].map(s => (
          <div key={s.label} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'18px 16px', textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:6, textTransform:'uppercase', letterSpacing:'.5px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
        <StatList title="Most Played" items={mostPlayed} valueKey="playtime" fmt={fmt} />
        <StatList title="Top Rated" items={topRated} valueKey="rating" fmt={v=>v?`★ ${v?.toFixed(1)}`:'N/A'} />
        <StatList title="Recently Added" items={recentlyAdded} valueKey="addedAt" fmt={v=>v?new Date(v).toLocaleDateString():'–'} />
        {topGenres.length > 0 && (
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'18px 20px' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, marginBottom:14, color:'var(--text)' }}>Genre Breakdown</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {topGenres.map(([genre, count]) => (
                <div key={genre}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:13, color:'var(--text2)' }}>{genre}</span>
                    <span style={{ fontSize:12, color:'var(--text3)' }}>{count} game{count!==1?'s':''}</span>
                  </div>
                  <div style={{ height:4, borderRadius:2, background:'var(--bg4)', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${(count/games.length)*100}%`, background:`linear-gradient(135deg,var(--accent),var(--accent2))`, borderRadius:2, transition:'width .6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {games.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text3)' }}>
          <div style={{ fontSize:48, marginBottom:12, opacity:.3 }}>📊</div>
          <p>Add games to your library to see stats</p>
        </div>
      )}
    </div>
  )
}

function StatList({ title, items, valueKey, fmt }) {
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'18px 20px' }}>
      <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, marginBottom:14, color:'var(--text)' }}>{title}</h3>
      {items.length === 0
        ? <p style={{ color:'var(--text3)', fontSize:13 }}>No data yet</p>
        : items.map((g,i) => (
          <div key={g.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:24, height:24, borderRadius:6, overflow:'hidden', flexShrink:0, background:'var(--bg4)' }}>
              {g.cover ? <img src={g.cover} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>🎮</div>}
            </div>
            <span style={{ flex:1, fontSize:13, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{g.name}</span>
            <span style={{ fontSize:12, color:'var(--text3)', flexShrink:0 }}>{fmt(g[valueKey])}</span>
          </div>
        ))}
    </div>
  )
}
