import React, { useMemo } from 'react'
import { useStore } from '../store/useStore'

function fmt(m) { return !m ? '0m' : m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60?m%60+'m':''}` }

function BarChart({ data, height = 120 }) {
  if (!data?.length) return null
  const max = Math.max(...data.map(d => d.mins), 1)
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:3, height, paddingBottom:18, position:'relative' }}>
      {data.map((d,i) => {
        const pct = d.mins / max
        const barH = Math.max(pct * (height - 22), d.mins > 0 ? 4 : 0)
        return (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, justifyContent:'flex-end', height:'100%' }}>
            <div title={`${d.date}: ${fmt(d.mins)}`}
              style={{ width:'100%', height:barH, borderRadius:'4px 4px 0 0', background:d.mins>0?`linear-gradient(to top,var(--accent),var(--accent2))`:'var(--bg4)', transition:'height .4s ease', cursor:'default', minHeight:d.mins>0?2:0 }} />
            {data.length <= 14 && (
              <div style={{ fontSize:8, color:'var(--text3)', textAlign:'center', whiteSpace:'nowrap', overflow:'hidden', width:'100%', textOverflow:'ellipsis', position:'absolute', bottom:0 }}>
                {d.date.split(' ')[1]}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PieChart({ data, size = 160 }) {
  if (!data?.length) return null
  const total = data.reduce((s,d) => s + d.count, 0)
  const COLORS = ['#6366F1','#8B5CF6','#EC4899','#F59E0B','#10B981','#3B82F6','#EF4444','#F97316']
  let angle = 0
  const slices = data.map((d,i) => {
    const pct   = d.count / total
    const start = angle
    angle += pct * 360
    return { ...d, pct, start, color: COLORS[i % COLORS.length] }
  })

  const polarToXY = (angleDeg, r) => {
    const rad = (angleDeg - 90) * Math.PI / 180
    return { x: size/2 + r * Math.cos(rad), y: size/2 + r * Math.sin(rad) }
  }

  const paths = slices.map(s => {
    const r = size/2 - 4
    const a1 = polarToXY(s.start, r)
    const a2 = polarToXY(s.start + s.pct*360, r)
    const large = s.pct > 0.5 ? 1 : 0
    return `M${size/2},${size/2} L${a1.x},${a1.y} A${r},${r} 0 ${large},1 ${a2.x},${a2.y} Z`
  })

  return (
    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
      <svg width={size} height={size} style={{ flexShrink:0 }}>
        {slices.map((s,i) => (
          <path key={i} d={paths[i]} fill={s.color} stroke='var(--bg2)' strokeWidth={2}>
            <title>{s.genre}: {s.count} ({Math.round(s.pct*100)}%)</title>
          </path>
        ))}
        <circle cx={size/2} cy={size/2} r={size/4} fill='var(--bg2)' />
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle" fill='var(--text)' fontSize={13} fontWeight={800} fontFamily="system-ui">{total}</text>
        <text x={size/2} y={size/2+14} textAnchor="middle" dominantBaseline="middle" fill='var(--text3)' fontSize={9} fontFamily="system-ui">games</text>
      </svg>
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:5 }}>
        {slices.map((s,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ width:10, height:10, borderRadius:3, background:s.color, flexShrink:0 }} />
            <span style={{ fontSize:12, color:'var(--text2)', flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.genre}</span>
            <span style={{ fontSize:11, color:'var(--text3)', flexShrink:0 }}>{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StatsPage() {
  const games           = useStore(s => s.games)
  const getTotalPlaytime= useStore(s => s.getTotalPlaytime)
  const getPlaytimeByDay= useStore(s => s.getPlaytimeByDay)
  const getGenreBreakdown=useStore(s => s.getGenreBreakdown)
  const getLongestSession=useStore(s => s.getLongestSession)
  const nudges          = useStore(s => s.nudges)
  const setSelectedGame = useStore(s => s.setSelectedGame)

  const totalPlaytime   = getTotalPlaytime()
  const playtimeByDay   = getPlaytimeByDay(14)
  const genreBreakdown  = getGenreBreakdown()
  const longestSession  = getLongestSession()

  const topGames = useMemo(() =>
    [...games].sort((a,b) => (b.playtime||0) - (a.playtime||0)).slice(0, 5),
  [games])

  const statusCounts = useMemo(() => {
    const c = {}
    games.forEach(g => { const s = g.status||'Not Started'; c[s] = (c[s]||0) + 1 })
    return Object.entries(c).sort((a,b)=>b[1]-a[1])
  }, [games])

  const sessionsThisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000
    return games.reduce((t,g) => t + (g.sessions||[]).filter(s => new Date(s.date).getTime() > weekAgo).length, 0)
  }, [games])

  const STATUS_COLORS = { 'Playing':'#6366F1','Completed':'#10B981','Dropped':'#EF4444','On Hold':'#F59E0B','Not Started':'#6B7280' }

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'20px 24px 60px' }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'var(--text)', lineHeight:1 }}>Stats</h1>
        <p style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>Your gaming history and insights</p>
      </div>

      <div style={{ maxWidth:900 }}>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:22 }}>
          {[
            { v:games.length,       l:'Total Games', sub:'in library' },
            { v:fmt(totalPlaytime), l:'Total Playtime', sub:'all time' },
            { v:sessionsThisWeek,   l:'Sessions', sub:'this week' },
            { v:longestSession.duration ? fmt(longestSession.duration) : '—', l:'Best Session', sub:longestSession.game?.name||'—' },
            { v:games.filter(g=>(g.status||'Not Started')==='Completed').length, l:'Completed', sub:'games finished' },
            { v:games.filter(g=>(g.status||'Not Started')==='Playing').length,   l:'Playing Now', sub:'in progress' },
          ].map(s => (
            <div key={s.l} style={{ padding:'14px 16px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14 }}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:22, color:'var(--accent)', lineHeight:1, marginBottom:4 }}>{s.v}</div>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', marginBottom:2 }}>{s.l}</div>
              <div style={{ fontSize:11, color:'var(--text3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:18 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.6px', marginBottom:14 }}>Playtime — Last 14 Days</div>
            {playtimeByDay.some(d=>d.mins > 0)
              ? <BarChart data={playtimeByDay} height={130} />
              : <div style={{ height:130, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)', fontSize:13 }}>No sessions recorded yet</div>}
          </div>

          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:18 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.6px', marginBottom:14 }}>Library by Genre</div>
            {genreBreakdown.length > 0
              ? <PieChart data={genreBreakdown} size={140} />
              : <div style={{ height:130, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)', fontSize:13 }}>Add games to see breakdown</div>}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:18 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.6px', marginBottom:14 }}>Top Played Games</div>
            {topGames.length === 0
              ? <div style={{ color:'var(--text3)', fontSize:13 }}>No playtime recorded yet</div>
              : topGames.map((g,i) => {
                const maxPt = topGames[0]?.playtime || 1
                return (
                  <div key={g.id} onClick={() => setSelectedGame(g)}
                    style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, cursor:'pointer', borderRadius:8, padding:'4px 0', transition:'background .15s' }}>
                    <span style={{ fontSize:12, fontWeight:800, color:'var(--text3)', minWidth:16, textAlign:'center' }}>{i+1}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:13, fontWeight:600, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex:1, marginRight:8 }}>{g.name}</span>
                        <span style={{ fontSize:11, color:'var(--accent)', fontWeight:600, flexShrink:0 }}>{fmt(g.playtime)}</span>
                      </div>
                      <div style={{ height:4, borderRadius:2, background:'var(--bg4)', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${(g.playtime/maxPt)*100}%`, background:`linear-gradient(90deg,var(--accent),var(--accent2))`, borderRadius:2 }} />
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>

          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:18 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.6px', marginBottom:14 }}>Status Breakdown</div>
            {statusCounts.length === 0
              ? <div style={{ color:'var(--text3)', fontSize:13 }}>No games yet</div>
              : statusCounts.map(([status, count]) => (
                <div key={status} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:STATUS_COLORS[status]||'#6B7280', flexShrink:0 }} />
                  <span style={{ fontSize:13, color:'var(--text2)', flex:1 }}>{status}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:80, height:4, borderRadius:2, background:'var(--bg4)', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${(count/games.length)*100}%`, background:STATUS_COLORS[status]||'#6B7280', borderRadius:2 }} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:'var(--text3)', minWidth:20, textAlign:'right' }}>{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {nudges.length > 0 && (
          <div style={{ background:'var(--bg2)', border:'1px solid rgba(99,102,241,.2)', borderRadius:14, padding:18 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'.6px', marginBottom:12 }}>🕹 Haven't Played in 30+ Days</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {nudges.map(n => {
                const g = games.find(x=>x.id===n.id)
                return (
                  <div key={n.id} onClick={() => g && setSelectedGame(g)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'var(--bg3)', borderRadius:10, border:'1px solid var(--border)', cursor:'pointer', transition:'all .18s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='var(--bg4)';e.currentTarget.style.borderColor='rgba(var(--accent-rgb),.2)'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='var(--bg3)';e.currentTarget.style.borderColor='var(--border)'}}>
                    <span style={{ fontSize:13, fontWeight:600, color:'var(--text)', flex:1 }}>{n.name}</span>
                    <span style={{ fontSize:11, color:'var(--text3)' }}>Last played {new Date(n.lastPlayed).toLocaleDateString()}</span>
                    <span style={{ fontSize:12, color:'var(--accent)', fontWeight:700 }}>Play →</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}