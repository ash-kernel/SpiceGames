import React, { useState, useEffect, useRef } from 'react'

const BUTTONS = [
  { index:0,  label:'A',       x:215, y:130, r:14, color:'#22c55e' },
  { index:1,  label:'B',       x:240, y:108, r:14, color:'#ef4444' },
  { index:2,  label:'X',       x:190, y:108, r:14, color:'#3b82f6' },
  { index:3,  label:'Y',       x:215, y:86,  r:14, color:'#f59e0b' },
  { index:4,  label:'LB',      x:68,  y:54,  r:12, color:'#8b5cf6' },
  { index:5,  label:'RB',      x:212, y:54,  r:12, color:'#8b5cf6' },
  { index:6,  label:'LT',      x:55,  y:36,  r:12, color:'#a78bfa' },
  { index:7,  label:'RT',      x:225, y:36,  r:12, color:'#a78bfa' },
  { index:8,  label:'⊞',      x:118, y:108, r:10, color:'#6b7280' },
  { index:9,  label:'☰',      x:162, y:108, r:10, color:'#6b7280' },
  { index:10, label:'L3',      x:100, y:148, r:11, color:'#6366f1' },
  { index:11, label:'R3',      x:178, y:148, r:11, color:'#6366f1' },
  { index:12, label:'↑',       x:76,  y:148, r:10, color:'#94a3b8' },
  { index:13, label:'↓',       x:76,  y:170, r:10, color:'#94a3b8' },
  { index:14, label:'←',       x:58,  y:159, r:10, color:'#94a3b8' },
  { index:15, label:'→',       x:94,  y:159, r:10, color:'#94a3b8' },
]

export default function ControllerPage() {
  const [pads,      setPads]      = useState([])
  const [activePad, setActivePad] = useState(0)
  const [state,     setState]     = useState({ buttons:[], axes:[] })
  const rafRef = useRef(null)

  useEffect(() => {
    // Tell the app-level gamepad nav to pause while we're on this page
    window.__controllerPageActive = true
    return () => { window.__controllerPageActive = false }
  }, [])

  useEffect(() => {
    const onConnect    = () => setPads([...navigator.getGamepads()].filter(Boolean))
    const onDisconnect = () => setPads([...navigator.getGamepads()].filter(Boolean))
    window.addEventListener('gamepadconnected',    onConnect)
    window.addEventListener('gamepaddisconnected', onDisconnect)
    setPads([...navigator.getGamepads()].filter(Boolean))

    const poll = () => {
      const pads = [...navigator.getGamepads()].filter(Boolean)
      setPads(pads)
      const pad = pads[activePad]
      if (pad) setState({ buttons: [...pad.buttons].map(b => ({ pressed: b.pressed, value: b.value })), axes: [...pad.axes] })
      rafRef.current = requestAnimationFrame(poll)
    }
    rafRef.current = requestAnimationFrame(poll)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('gamepadconnected',    onConnect)
      window.removeEventListener('gamepaddisconnected', onDisconnect)
    }
  }, [activePad])

  const pressed = state.buttons.map ? state.buttons : []
  const btnPressed = (i) => pressed[i]?.pressed
  const btnValue   = (i) => pressed[i]?.value ?? 0
  const axes    = state.axes
  const lx = axes[0] || 0, ly = axes[1] || 0
  const rx = axes[2] || 0, ry = axes[3] || 0

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'16px 22px 12px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'var(--text)', lineHeight:1 }}>Controller</h1>
        <p style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>Press any button to test · axes shown as live meters</p>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px 60px' }}>
        {pads.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px' }}>
            <div style={{ fontSize:64, marginBottom:16, opacity:.15 }}>🎮</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color:'var(--text)', marginBottom:8 }}>No controller detected</h2>
            <p style={{ fontSize:14, color:'var(--text3)', lineHeight:1.7 }}>Plug in your controller and press any button.<br/>Works with Xbox, PlayStation, and generic controllers.</p>
          </div>
        ) : (
          <>
            {pads.length > 1 && (
              <div style={{ display:'flex', gap:8, marginBottom:20 }}>
                {pads.map((p,i) => (
                  <button key={i} onClick={() => setActivePad(i)}
                    style={{ padding:'7px 16px', borderRadius:8, border:`1px solid ${activePad===i?'var(--accent)':'var(--border2)'}`, background:activePad===i?`rgba(var(--accent-rgb),.12)`:'var(--bg3)', color:activePad===i?'var(--accent)':'var(--text)', fontSize:12, cursor:'pointer' }}>
                    {p.id.slice(0,30)}
                  </button>
                ))}
              </div>
            )}

            {pads[activePad] && (
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:20, padding:'10px 14px', background:'var(--bg3)', borderRadius:10, border:'1px solid var(--border)' }}>
                🎮 <strong style={{ color:'var(--text)' }}>{pads[activePad].id.slice(0,60)}</strong>
              </div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, maxWidth:700 }}>
              <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:12 }}>Buttons</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
                  {BUTTONS.map(btn => (
                    <div key={btn.index}
                      style={{ height:38, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, border:`1px solid ${btnPressed(btn.index)?btn.color:'var(--border2)'}`, background:btnPressed(btn.index)?`${btn.color}22`:'var(--bg3)', color:btnPressed(btn.index)?btn.color:'var(--text3)', transition:'all .08s', transform:btnPressed(btn.index)?'scale(.94)':'scale(1)' }}>
                      {btn.label}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:16, display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'1px' }}>Analog Sticks</div>

                {[['Left Stick', lx, ly], ['Right Stick', rx, ry]].map(([name, ax, ay]) => (
                  <div key={name}>
                    <div style={{ fontSize:11, color:'var(--text3)', marginBottom:6 }}>{name}</div>
                    <div style={{ width:80, height:80, borderRadius:'50%', border:'2px solid var(--border2)', background:'var(--bg3)', position:'relative', margin:'0 auto' }}>
                      <div style={{ position:'absolute', top:'50%', left:'50%', width:18, height:18, borderRadius:'50%', background:'var(--accent)', transform:`translate(calc(-50% + ${ax*28}px), calc(-50% + ${ay*28}px))`, transition:'transform .04s', boxShadow:`0 0 8px var(--accent)` }} />
                      <div style={{ position:'absolute', top:'49%', left:0, right:0, height:1, background:'var(--border)' }} />
                      <div style={{ position:'absolute', left:'49%', top:0, bottom:0, width:1, background:'var(--border)' }} />
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'var(--text3)', fontFamily:'monospace' }}>
                      <span>X: {ax.toFixed(2)}</span><span>Y: {ay.toFixed(2)}</span>
                    </div>
                  </div>
                ))}

                {[6,7].map(ti => {
                    const val = btnValue(ti)
                    const pct = Math.round(val * 100)
                    return (
                      <div key={ti}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ fontSize:11, color:'var(--text3)' }}>{ti===6?'Left Trigger':'Right Trigger'}</span>
                          <span style={{ fontSize:10, color: val > 0.05 ? 'var(--accent)' : 'var(--text3)', fontFamily:'monospace', fontWeight:700 }}>{pct}%</span>
                        </div>
                        <div style={{ height:8, borderRadius:4, background:'var(--bg3)', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,var(--accent),var(--accent2))`, borderRadius:4, transition:'width .03s' }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}