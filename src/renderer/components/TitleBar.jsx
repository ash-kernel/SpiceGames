import React from 'react'
import logoSvg from '../logo.svg'

export default function TitleBar() {
  return (
    <div className="drag" style={{ height:42, background:'var(--bg2)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', paddingLeft:14, paddingRight:12, flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <img src={logoSvg} alt="SpiceGames" style={{ width:28, height:28, borderRadius:8 }} />
        <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:14, color:'var(--text)', letterSpacing:'.3px' }}>SpiceGames</span>
      </div>
      <div className="no-drag" style={{ display:'flex', gap:6 }}>
        {[
          { fn:'minimize', col:'#F59E0B', sym:'−' },
          { fn:'maximize', col:'#10B981', sym:'⤢' },
          { fn:'close',    col:'#EF4444', sym:'×' },
        ].map(b => (
          <button key={b.fn} onClick={() => window.spicegames[b.fn]()}
            style={{ width:28, height:28, borderRadius:'50%', border:'none', background:'var(--bg4)', color:'var(--text3)', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background=b.col;e.currentTarget.style.color='#fff'}}
            onMouseLeave={e=>{e.currentTarget.style.background='var(--bg4)';e.currentTarget.style.color='var(--text3)'}}>
            {b.sym}
          </button>
        ))}
      </div>
    </div>
  )
}