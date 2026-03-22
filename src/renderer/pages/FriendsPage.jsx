import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'

const IS = typeof window !== 'undefined' && window.spicegames?.isElectron

const STATE_LABELS = { 0:'Offline', 1:'Online', 2:'Busy', 3:'Away', 4:'Snooze', 6:'Playing' }
const STATE_COLORS = { 0:'#6B7280', 1:'#10B981', 2:'#F59E0B', 3:'#6B7280', 4:'#6B7280', 6:'#6366F1' }

export default function FriendsPage() {
  const settings   = useStore(s => s.settings)
  const [friends,  setFriends]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const hasCreds = settings?.steamApiKey && settings?.steamUserId

  const load = async () => {
    if (!IS || !hasCreds) return
    setLoading(true); setError(null)
    try {
      const res = await window.spicegames.getSteamFriends({ steamKey: settings.steamApiKey, steamId: settings.steamUserId })
      if (res.ok) setFriends(res.friends)
      else setError(res.error || 'Failed to load friends')
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  useEffect(() => { if (hasCreds) load() }, [settings?.steamApiKey, settings?.steamUserId])

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'16px 22px 12px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'var(--text)', lineHeight:1 }}>Friends</h1>
            <p style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>Steam friends currently playing games</p>
          </div>
          <div style={{ flex:1 }} />
          {hasCreds && (
            <button onClick={load} disabled={loading}
              style={{ padding:'8px 18px', borderRadius:9, border:'1px solid var(--border2)', background:'var(--bg3)', color:'var(--text)', fontSize:13, cursor:loading?'default':'pointer', fontFamily:'var(--font-body)', display:'flex', alignItems:'center', gap:8, opacity:loading?.6:1, transition:'background .18s' }}
              onMouseEnter={e=>!loading&&(e.currentTarget.style.background='var(--bg4)')}
              onMouseLeave={e=>(e.currentTarget.style.background='var(--bg3)')}>
              {loading ? <><div style={{ width:13, height:13, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite' }} />Refreshing…</> : '↻ Refresh'}
            </button>
          )}
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'18px 22px 60px' }}>
        {!hasCreds && (
          <div style={{ textAlign:'center', padding:'80px 20px' }}>
            <div style={{ fontSize:52, marginBottom:16, opacity:.2 }}>👥</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color:'var(--text)', marginBottom:8 }}>Steam API Key Required</h2>
            <p style={{ fontSize:14, color:'var(--text3)', marginBottom:16, lineHeight:1.7 }}>
              Go to <strong style={{ color:'var(--accent)' }}>Settings → Steam Integration</strong> and add your<br/>
              Steam API Key and Steam ID to see friends activity.
            </p>
            <p style={{ fontSize:12, color:'var(--text3)' }}>
              Get a free API key at{' '}
              <a href="https://steamcommunity.com/dev/apikey" target="_blank" rel="noreferrer" style={{ color:'var(--accent)' }}>
                steamcommunity.com/dev/apikey
              </a>
            </p>
          </div>
        )}

        {hasCreds && error && (
          <div style={{ padding:'16px 20px', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:12, color:'var(--danger)', fontSize:13 }}>
            ⚠ {error}
          </div>
        )}

        {hasCreds && !loading && !error && friends.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text3)' }}>
            <div style={{ fontSize:44, marginBottom:12, opacity:.25 }}>😴</div>
            <p style={{ fontSize:15, marginBottom:6 }}>No friends currently playing games</p>
            <p style={{ fontSize:13 }}>Check back later</p>
          </div>
        )}

        {hasCreds && loading && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {Array.from({length:6}).map((_,i) => (
              <div key={i} style={{ display:'flex', gap:14, padding:'14px 16px', borderRadius:13, background:'var(--bg2)', border:'1px solid var(--border)', alignItems:'center' }}>
                <div className="shimmer" style={{ width:44, height:44, borderRadius:'50%', flexShrink:0 }} />
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                  <div className="shimmer" style={{ height:14, borderRadius:6, width:'40%' }} />
                  <div className="shimmer" style={{ height:11, borderRadius:6, width:'60%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {hasCreds && !loading && friends.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ fontSize:12, color:'var(--text3)', marginBottom:8 }}>
              {friends.length} friend{friends.length!==1?'s':''} currently playing
            </div>
            {friends.map(f => {
              const stateColor = STATE_COLORS[f.state] || '#6B7280'
              return (
                <a key={f.steamId} href={f.profileUrl} target="_blank" rel="noreferrer"
                  style={{ display:'flex', gap:14, padding:'14px 16px', borderRadius:13, background:'var(--bg2)', border:'1px solid var(--border)', textDecoration:'none', transition:'all .2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='var(--bg3)';e.currentTarget.style.borderColor='rgba(var(--accent-rgb),.25)'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='var(--bg2)';e.currentTarget.style.borderColor='var(--border)'}}>
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <img src={f.avatar} alt="" style={{ width:44, height:44, borderRadius:'50%', display:'block' }} onError={e=>e.target.style.display='none'} />
                    <div style={{ position:'absolute', bottom:1, right:1, width:12, height:12, borderRadius:'50%', background:stateColor, border:'2px solid var(--bg2)' }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:4 }}>{f.name}</div>
                    {f.gameName && (
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <span style={{ fontSize:12, color:'var(--accent)', fontWeight:600 }}>🎮 Playing: {f.gameName}</span>
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize:11, color:stateColor, fontWeight:600, flexShrink:0, alignSelf:'center' }}>
                    {STATE_LABELS[f.state] || 'Unknown'}
                  </span>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}