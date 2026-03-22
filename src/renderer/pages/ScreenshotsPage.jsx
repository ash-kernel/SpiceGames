import React, { useState } from 'react'
import toast from 'react-hot-toast'

const IS = typeof window !== 'undefined' && window.spicegames?.isElectron

export default function ScreenshotsPage() {
  const [files,    setFiles]    = useState([])
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState(null)
  const [search,   setSearch]   = useState('')

  const scan = async () => {
    if (!IS) return
    setLoading(true)
    try {
      const res = await window.spicegames.scanScreenshots()
      if (res.ok) { setFiles(res.files); toast.success(`Found ${res.files.length} screenshots`) }
      else toast.error('Could not scan folder')
    } catch { toast.error('Scan failed') }
    setLoading(false)
  }

  const filtered = search ? files.filter(f => f.name.toLowerCase().includes(search.toLowerCase())) : files

  const fmtSize = b => b > 1048576 ? `${(b/1048576).toFixed(1)}MB` : `${Math.round(b/1024)}KB`

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'16px 22px 12px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'var(--text)', lineHeight:1 }}>Screenshots</h1>
            <p style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>Scan any folder for game screenshots</p>
          </div>
          <div style={{ flex:1 }} />
          {files.length > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:50, padding:'7px 14px', width:220 }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" style={{ color:'var(--text3)', flexShrink:0 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Filter screenshots…"
                style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, fontFamily:'var(--font-body)' }} />
            </div>
          )}
          <button onClick={scan} disabled={loading}
            style={{ padding:'9px 18px', borderRadius:9, border:'none', background:`linear-gradient(135deg,var(--accent),var(--accent2))`, color:'#fff', fontSize:13, fontWeight:700, cursor:loading?'default':'pointer', fontFamily:'var(--font-display)', display:'flex', alignItems:'center', gap:8, boxShadow:'var(--shadow-glow)', opacity:loading?.7:1 }}>
            {loading ? <><div style={{ width:13, height:13, border:'2px solid #fff', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite' }} />Scanning…</> : '📁 Scan Folder'}
          </button>
        </div>
      </div>

      <div style={{ flex:1, overflow:'hidden', display:'flex' }}>
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px 60px' }}>
          {files.length === 0 && !loading && (
            <div style={{ textAlign:'center', padding:'80px 20px' }}>
              <div style={{ fontSize:52, marginBottom:16, opacity:.2 }}>📸</div>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color:'var(--text)', marginBottom:8 }}>No screenshots loaded</h2>
              <p style={{ fontSize:14, color:'var(--text3)', lineHeight:1.7 }}>Click "Scan Folder" to browse for a screenshots folder.<br/>Works with Steam, Epic, or any game's screenshot directory.</p>
            </div>
          )}

          {filtered.length > 0 && (
            <>
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:12 }}>{filtered.length} screenshot{filtered.length!==1?'s':''}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
                {filtered.map((f, i) => (
                  <div key={i} onClick={() => setSelected(selected?.path===f.path ? null : f)}
                    style={{ borderRadius:10, overflow:'hidden', cursor:'pointer', border:`2px solid ${selected?.path===f.path?'var(--accent)':'transparent'}`, transition:'all .18s', position:'relative' }}
                    onMouseEnter={e=>{ if(selected?.path!==f.path) e.currentTarget.style.borderColor='rgba(var(--accent-rgb),.3)' }}
                    onMouseLeave={e=>{ if(selected?.path!==f.path) e.currentTarget.style.borderColor='transparent' }}>
                    <img src={f.dataUrl} alt={f.name} style={{ width:'100%', aspectRatio:'16/9', objectFit:'cover', display:'block' }} />
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'6px 8px', background:'linear-gradient(to top,rgba(0,0,0,.8),transparent)', fontSize:10, color:'rgba(255,255,255,.7)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {f.name}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {selected && (
          <div style={{ width:320, borderLeft:'1px solid var(--border)', background:'var(--bg2)', display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0 }}>
            <div style={{ aspectRatio:'16/9', overflow:'hidden', background:'var(--bg4)', flexShrink:0 }}>
              <img src={selected.dataUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
            </div>
            <div style={{ padding:16, flex:1, overflowY:'auto' }}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:12, wordBreak:'break-all' }}>{selected.name}</div>
              {[['Date', new Date(selected.mtime).toLocaleString()],['Size', fmtSize(selected.size)],['Path', selected.path]].map(([k,v]) => (
                <div key={k} style={{ marginBottom:10 }}>
                  <div style={{ fontSize:10, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.4px', marginBottom:3 }}>{k}</div>
                  <div style={{ fontSize:12, color:'var(--text2)', wordBreak:'break-all', lineHeight:1.5 }}>{v}</div>
                </div>
              ))}
              <button onClick={() => IS && window.spicegames.revealInExplorer(selected.path)}
                style={{ width:'100%', marginTop:8, padding:'9px', borderRadius:8, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text)', fontSize:13, cursor:'pointer', transition:'background .18s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
                onMouseLeave={e=>e.currentTarget.style.background='var(--bg3)'}>
                📁 Show in Explorer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}