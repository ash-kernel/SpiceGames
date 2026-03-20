import React, { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import { GameCardGrid, GameCardList } from '../components/GameCard'

export default function LibraryPage() {
  const getFilteredGames = useStore(s => s.getFilteredGames)
  const getAllGenres      = useStore(s => s.getAllGenres)
  const view             = useStore(s => s.view)
  const sortBy           = useStore(s => s.sortBy)
  const filterGenre      = useStore(s => s.filterGenre)
  const searchQuery      = useStore(s => s.searchQuery)
  const setView          = useStore(s => s.setView)
  const setSortBy        = useStore(s => s.setSortBy)
  const setFilterGenre   = useStore(s => s.setFilterGenre)
  const setSearch        = useStore(s => s.setSearch)
  const setAddOpen       = useStore(s => s.setAddGameOpen)
  const runningGames     = useStore(s => s.runningGames)
  const games            = useStore(s => s.games)

  const [searchVal, setSearchVal] = useState(searchQuery)
  const timerRef = useRef(null)

  const filtered = getFilteredGames()
  const genres   = getAllGenres()
  const running  = [...runningGames].length

  const onSearch = (v) => {
    setSearchVal(v)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setSearch(v), 300)
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {}
      <div style={{ padding:'16px 22px 12px', borderBottom:'1px solid var(--border)', flexShrink:0, background:'var(--bg)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>

          {}
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'var(--text)', lineHeight:1 }}>Library</h1>
            <p style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>
              {games.length} game{games.length !== 1 ? 's' : ''}
              {running > 0 && <span style={{ color:'var(--success)', fontWeight:600 }}> · {running} running</span>}
            </p>
          </div>

          <div style={{ flex:1 }} />

          {}
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:50, padding:'8px 16px', width:220, transition:'all .18s' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" style={{ color:'var(--text3)', flexShrink:0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={searchVal} onChange={e => onSearch(e.target.value)}
              placeholder="Search library…"
              style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, fontFamily:'var(--font-body)' }} />
            {searchVal && (
              <button onClick={() => onSearch('')} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:14, lineHeight:1 }}>×</button>
            )}
          </div>

          {}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--text)', padding:'8px 12px', borderRadius:8, fontSize:12, outline:'none', cursor:'pointer', fontFamily:'var(--font-body)' }}>
            <option value="name">Name A–Z</option>
            <option value="rating">Top Rated</option>
            <option value="playtime">Most Played</option>
            <option value="lastPlayed">Recent</option>
            <option value="added">Newest</option>
          </select>

          {}
          <div style={{ display:'flex', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
            {[['grid','▦'],['list','☰']].map(([v,icon]) => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding:'8px 11px', border:'none', background: view===v ? `rgba(var(--accent-rgb),.15)` : 'transparent', color: view===v ? 'var(--accent)' : 'var(--text3)', fontSize:15, cursor:'pointer', transition:'all .18s' }}>
                {icon}
              </button>
            ))}
          </div>

          {}
          <button onClick={() => setAddOpen(true)}
            style={{ padding:'9px 18px', borderRadius:9, border:'none', background:`linear-gradient(135deg,var(--accent),var(--accent2))`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)', boxShadow:'var(--shadow-glow)', letterSpacing:'.3px', whiteSpace:'nowrap' }}>
            + Add Game
          </button>
        </div>

        {}
        {genres.length > 0 && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {['all', ...genres].map(g => {
              const active = filterGenre === g
              return (
                <button key={g} onClick={() => setFilterGenre(g)}
                  style={{ padding:'4px 13px', borderRadius:50, border:`1px solid ${active ? 'var(--accent)' : 'var(--border2)'}`, background: active ? `rgba(var(--accent-rgb),.12)` : 'transparent', color: active ? 'var(--accent)' : 'var(--text3)', fontSize:12, fontWeight: active ? 600 : 400, cursor:'pointer', transition:'all .18s', textTransform:'capitalize' }}>
                  {g === 'all' ? 'All' : g}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {}
      <div style={{ flex:1, overflowY:'auto', padding:'18px 22px 60px' }}>
        {games.length === 0 ? (
          <EmptyState onAdd={() => setAddOpen(true)} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text3)' }}>
            <div style={{ fontSize:44, marginBottom:12, opacity:.25 }}>🔍</div>
            <p style={{ fontSize:15 }}>No games match your filters</p>
            <button onClick={() => { onSearch(''); setFilterGenre('all') }}
              style={{ marginTop:12, padding:'8px 18px', borderRadius:8, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text2)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-body)' }}>
              Clear filters
            </button>
          </div>
        ) : view === 'grid' ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(175px, 1fr))', gap:14 }}>
            {filtered.map((g, i) => (
              <div key={g.id} style={{ animationDelay:`${(i % 12) * 35}ms` }}>
                <GameCardGrid game={g} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {filtered.map((g, i) => <GameCardList key={g.id} game={g} index={i} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 20px', textAlign:'center', minHeight:400 }}>
      <div style={{ width:96, height:96, borderRadius:24, background:`linear-gradient(135deg,rgba(var(--accent-rgb),.15),rgba(var(--accent-rgb),.05))`, border:`1px dashed rgba(var(--accent-rgb),.3)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:44, marginBottom:22 }}>🎮</div>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:900, color:'var(--text)', marginBottom:8 }}>Library is empty</h2>
      <p style={{ fontSize:14, color:'var(--text2)', marginBottom:28, maxWidth:340, lineHeight:1.75 }}>
        Search for a game, get its artwork & metadata automatically, then link your <code style={{ background:'var(--bg4)', padding:'1px 6px', borderRadius:4, fontSize:12 }}>.exe</code> to launch it.
      </p>
      <button onClick={onAdd}
        style={{ padding:'13px 32px', borderRadius:10, border:'none', background:`linear-gradient(135deg,var(--accent),var(--accent2))`, color:'#fff', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'var(--font-display)', boxShadow:'var(--shadow-glow)', letterSpacing:'.5px' }}>
        + Add Your First Game
      </button>
    </div>
  )
}