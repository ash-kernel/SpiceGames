import React, { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import LibraryPage from './pages/LibraryPage'
import StorePage from './pages/StorePage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'
import AddGameModal from './components/AddGameModal'
import GameDetailPanel from './components/GameDetailPanel'
import { useStore } from './store/useStore'

const IS = typeof window !== 'undefined' && window.spicegames?.isElectron

export default function App() {
    const init = useStore(s => s.init)
    const addGameOpen = useStore(s => s.addGameOpen)
    const selectedGame = useStore(s => s.selectedGame)

    useEffect(() => {
        document.title = 'SpiceGames'
        if (IS) init()
    }, [])

    return (
        <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
                {IS && <TitleBar />}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <Sidebar />
                    <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                        <Routes>
                            <Route path="/" element={<Navigate to="/library" replace />} />
                            <Route path="/library" element={<LibraryPage />} />
                            <Route path="/store" element={<StorePage />} />
                            <Route path="/stats" element={<StatsPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Routes>
                    </div>
                    {selectedGame && <GameDetailPanel />}
                </div>
                {addGameOpen && <AddGameModal />}
                <Toaster position="bottom-right" toastOptions={{
                    style: { background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border2)', borderRadius: '10px', fontFamily: 'var(--font-body)', fontSize: '14px' },
                    success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg3)' } },
                    error: { iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg3)' } },
                }} />
            </div>
        </HashRouter>
    )
}