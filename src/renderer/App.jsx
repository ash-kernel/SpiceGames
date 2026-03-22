import React, { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import LibraryPage from './pages/LibraryPage'
import StorePage from './pages/StorePage'
import ItchPage from './pages/ItchPage'
import DealsPage from './pages/DealsPage'
import ScreenshotsPage from './pages/ScreenshotsPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'
import AddGameModal from './components/AddGameModal'
import GameDetailPanel from './components/GameDetailPanel'
import { useStore } from './store/useStore'
import toast from 'react-hot-toast'

const IS = typeof window !== 'undefined' && window.spicegames != null

const ROUTES = ['/library','/store','/itch','/deals','/screenshots','/stats','/settings']

function GamepadNav() {
  const navigate = useNavigate()
  useEffect(() => {
    let rafId
    const prev = {}

    const poll = () => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : []
      for (const pad of pads) {
        if (!pad) continue
        const lb     = pad.buttons[4]?.pressed
        const rb     = pad.buttons[5]?.pressed
        const start  = pad.buttons[9]?.pressed

        if (lb && !prev[pad.index + '_4']) {
          const cur = ROUTES.indexOf(window.location.hash.replace('#',''))
          navigate(ROUTES[Math.max(0, cur - 1)])
          toast('⬅ ' + ROUTES[Math.max(0, cur - 1)].slice(1), { duration:900 })
        }
        if (rb && !prev[pad.index + '_5']) {
          const cur = ROUTES.indexOf(window.location.hash.replace('#',''))
          navigate(ROUTES[Math.min(ROUTES.length - 1, cur + 1)])
          toast('➡ ' + ROUTES[Math.min(ROUTES.length - 1, cur + 1)].slice(1), { duration:900 })
        }
        if (start && !prev[pad.index + '_9']) {
          toast('🎮 LB/RB to switch tabs · A to launch · Start to see this', { duration:3000 })
        }

        prev[pad.index + '_4'] = lb
        prev[pad.index + '_5'] = rb
        prev[pad.index + '_9'] = start
      }
      rafId = requestAnimationFrame(poll)
    }

    const onConnect = e => {
      toast(`🎮 ${e.gamepad.id.slice(0,28)} connected`, { duration:3000 })
      rafId = rafId || requestAnimationFrame(poll)
    }
    const onDisconn = () => toast('🎮 Controller disconnected', { duration:2000 })

    window.addEventListener('gamepadconnected', onConnect)
    window.addEventListener('gamepaddisconnected', onDisconn)
    rafId = requestAnimationFrame(poll)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('gamepadconnected', onConnect)
      window.removeEventListener('gamepaddisconnected', onDisconn)
    }
  }, [navigate])
  return null
}

function RouteWatcher() {
  const location        = useLocation()
  const setSelectedGame = useStore(s => s.setSelectedGame)
  useEffect(() => {
    if (location.pathname !== '/library') setSelectedGame(null)
  }, [location.pathname])
  return null
}

function AppLayout() {
  const location     = useLocation()
  const init         = useStore(s => s.init)
  const addGameOpen  = useStore(s => s.addGameOpen)
  const selectedGame = useStore(s => s.selectedGame)
  const onLibrary    = location.pathname === '/library'

  useEffect(() => {
    document.title = 'SpiceDeck'
    if (IS) {
      const saved = (() => { try { return JSON.parse(localStorage.getItem('sw_settings')||'{}') } catch { return {} } })()
      document.body.classList.remove('theme-red','theme-neon','theme-ember')
      const t = saved.theme || 'dark'
      if (t !== 'dark') document.body.classList.add(`theme-${t}`)
      const accent = saved.accentColor || '#6366F1'
      document.documentElement.style.setProperty('--accent', accent)
      const rgb = accent.replace('#','').match(/.{2}/g).map(h=>parseInt(h,16)).join(',')
      document.documentElement.style.setProperty('--accent-rgb', rgb)
      init()
    }
  }, [])

  return (
    <>
      <GamepadNav />
      <RouteWatcher />
      <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'var(--bg)' }}>
        {IS && <TitleBar />}
        <div style={{ display:'flex', flex:1, overflow:'hidden', position:'relative' }}>
          <Sidebar />
          <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
            <Routes>
              <Route path="/"            element={<Navigate to="/library" replace />} />
              <Route path="/library"     element={<LibraryPage />} />
              <Route path="/store"       element={<StorePage />} />
              <Route path="/itch"        element={<ItchPage />} />
              <Route path="/deals"       element={<DealsPage />} />
              <Route path="/screenshots" element={<ScreenshotsPage />} />
              <Route path="/stats"       element={<StatsPage />} />
              <Route path="/settings"    element={<SettingsPage />} />
            </Routes>
          </div>
          {selectedGame && onLibrary && <GameDetailPanel />}
        </div>
        {addGameOpen && <AddGameModal />}
        <Toaster position="bottom-right" toastOptions={{
          style:{ background:'var(--bg3)', color:'var(--text)', border:'1px solid var(--border2)', borderRadius:'10px', fontFamily:'var(--font-body)', fontSize:'13px' },
          success:{ iconTheme:{ primary:'var(--success)', secondary:'var(--bg3)' } },
          error:  { iconTheme:{ primary:'var(--danger)',  secondary:'var(--bg3)' } },
        }} />
      </div>
    </>
  )
}

export default function App() {


  return (
    <HashRouter future={{ v7_startTransition:true, v7_relativeSplatPath:true }}>
      <AppLayout />

    </HashRouter>
  )
}