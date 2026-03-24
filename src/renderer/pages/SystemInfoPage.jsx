import React, { useEffect, useState } from 'react';

function Row({ label, children, last }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', borderBottom:last?'none':'1px solid var(--border)', minHeight:50 }}>
      <div style={{ flex:1, minWidth:0, fontSize:13, color:'var(--text)', fontWeight:500 }}>{label}</div>
      <div style={{ flexShrink:0, fontSize:13, color:'var(--text2)', textAlign:'right' }}>
        {children}
      </div>
    </div>
  )
}

function Card({ title, children, noPad }) {
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:0 }}>
      <div style={{ padding:'9px 16px', borderBottom:'1px solid var(--border)', fontSize:10, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'1.2px' }}>
        {title}
      </div>
      {noPad ? children : <div>{children}</div>}
    </div>
  )
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${['B', 'KB', 'MB', 'GB', 'TB'][i]}`
}


export default function SystemInfoPage() {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getInfo() {
      try {
        if (!window.spicegames || !window.spicegames.getSystemInfo) {
          setError('System info API not available');
          return;
        }
        const systemInfo = await window.spicegames.getSystemInfo();
        setInfo(systemInfo);
      } catch (err) {
        console.error('Failed to load system info:', err);
        setError('Failed to load system information');
      }
    }
    getInfo();
  }, []);

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'16px 20px 60px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:900, color:'var(--text)' }}>System Information</div>
          <div style={{ fontSize:11, color:'var(--text3)' }}>A detailed overview of your system hardware.</div>
        </div>
      </div>

      {error && (
        <div style={{ padding:'14px 16px', background:'rgba(239, 68, 68, 0.1)', border:'1px solid rgba(239, 68, 68, 0.3)', borderRadius:8, color:'#ef4444', fontSize:13, marginBottom:16 }}>
          {error}
        </div>
      )}

      {info ? (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, alignItems:'start' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Card title="Operating System">
              <Row label="Platform">{info.os.platform}</Row>
              <Row label="Distro">{info.os.distro}</Row>
              <Row label="Release">{info.os.release}</Row>
              <Row label="Kernel">{info.os.kernel}</Row>
              <Row label="Architecture" last>{info.os.arch}</Row>
            </Card>

            <Card title={<div style={{ display:'flex', alignItems:'center', gap:8 }}><span>🖥️</span> Processor</div>}>
              <Row label="Manufacturer">{info.cpu.manufacturer}</Row>
              <Row label="Brand">{info.cpu.brand}</Row>
              <Row label="Speed">{info.cpu.speed} GHz</Row>
              <Row label="Cores">{info.cpu.cores}</Row>
              <Row label="Physical Cores" last>{info.cpu.physicalCores}</Row>
            </Card>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Card title={<div style={{ display:'flex', alignItems:'center', gap:8 }}><span>🎮</span> Graphics</div>}>
              {info.gpu.controllers.map((gpu, i) => (
                <div key={i}>
                  <Row label="Vendor">{gpu.vendor}</Row>
                  <Row label="Model">{gpu.model}</Row>
                  <Row label="VRAM" last={i === info.gpu.controllers.length - 1}>{gpu.vram} MB</Row>
                  {i < info.gpu.controllers.length - 1 && <div style={{ borderBottom:'1px solid var(--border)', margin:'12px 0' }} />}
                </div>
              ))}
            </Card>

            <Card title="Memory">
              <Row label="Total" last>{formatBytes(info.mem.total)}</Row>
            </Card>
          </div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, alignItems:'start' }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="shimmer" style={{ height: 200, borderRadius:'var(--radius)' }} />
              <div className="shimmer" style={{ height: 150, borderRadius:'var(--radius)' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
