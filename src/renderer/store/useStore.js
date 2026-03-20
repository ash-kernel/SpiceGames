import { create } from 'zustand'

const IS = typeof window !== 'undefined' && window.spicegames?.isElectron

function uid() { return `game-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

export const useStore = create((set, get) => ({

    games: [],
    runningGames: new Set(),
    settings: null,
    view: 'grid',
    sortBy: 'name',
    filterGenre: 'all',
    searchQuery: '',
    selectedGame: null,
    addGameOpen: false,


    init: async () => {
        if (!IS) return
        const [settings, games] = await Promise.all([
            window.spicegames.getSettings(),
            window.spicegames.getGames(),
        ])
        set({ settings, games: games || [] })


        if (settings.theme && settings.theme !== 'dark') {
            document.body.classList.add(`theme-${settings.theme}`)
        }
        if (settings.accentColor) {
            document.documentElement.style.setProperty('--accent', settings.accentColor)
        }


        window.spicegames.onGameStopped(({ gameId, playtime, error }) => {
            set(s => {
                const running = new Set(s.runningGames)
                running.delete(gameId)
                const games = s.games.map(g => {
                    if (g.id !== gameId) return g
                    return {
                        ...g,
                        playtime: (g.playtime || 0) + (playtime || 0),
                        lastPlayed: new Date().toISOString(),
                    }
                })
                return { runningGames: running, games }
            })
            if (!error) get().saveLibrary()
        })
    },


    saveLibrary: async () => {
        if (!IS) return
        await window.spicegames.saveGames(get().games)
    },


    addGame: (game) => {
        const newGame = { id: uid(), addedAt: new Date().toISOString(), playtime: 0, ...game }
        set(s => ({ games: [...s.games, newGame], addGameOpen: false }))
        get().saveLibrary()
        return newGame
    },

    updateGame: (id, patch) => {
        set(s => ({ games: s.games.map(g => g.id === id ? { ...g, ...patch } : g) }))
        get().saveLibrary()
    },

    removeGame: (id) => {
        set(s => ({ games: s.games.filter(g => g.id !== id), selectedGame: s.selectedGame?.id === id ? null : s.selectedGame }))
        get().saveLibrary()
    },


    launchGame: async (game) => {
        if (!IS) { alert('Launch only works in the Electron desktop app'); return }
        if (get().runningGames.has(game.id)) return

        set(s => { const r = new Set(s.runningGames); r.add(game.id); return { runningGames: r } })
        get().updateGame(game.id, { lastPlayed: new Date().toISOString() })

        const result = await window.spicegames.launchGame({ gameId: game.id, exePath: game.exePath })
        if (!result.ok) {
            set(s => { const r = new Set(s.runningGames); r.delete(game.id); return { runningGames: r } })
            throw new Error(result.error)
        }
    },


    saveSettings: async (patch) => {
        const merged = { ...get().settings, ...patch }
        set({ settings: merged })
        if (IS) await window.spicegames.saveSettings(merged)
    },

    applyTheme: (theme) => {
        document.body.classList.remove('theme-red', 'theme-neon', 'theme-ember')
        if (theme !== 'dark') document.body.classList.add(`theme-${theme}`)
        const defaults = { dark: '#6366F1', red: '#EF4444', neon: '#00FF88', ember: '#F97316' }
        const col = defaults[theme] || '#6366F1'
        document.documentElement.style.setProperty('--accent', col)

        const rgb = col.replace('#', '').match(/.{2}/g).map(h => parseInt(h, 16)).join(',')
        document.documentElement.style.setProperty('--accent-rgb', rgb)
        get().saveSettings({ theme, accentColor: col })
    },


    setView: (v) => set({ view: v }),
    setSortBy: (s) => set({ sortBy: s }),
    setFilterGenre: (g) => set({ filterGenre: g }),
    setSearch: (q) => set({ searchQuery: q }),
    setSelectedGame: (g) => set({ selectedGame: g }),
    setAddGameOpen: (v) => set({ addGameOpen: v }),


    getFilteredGames: () => {
        const { games, sortBy, filterGenre, searchQuery } = get()
        let list = [...games]
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            list = list.filter(g => g.name?.toLowerCase().includes(q) || g.genres?.some(x => x.toLowerCase().includes(q)))
        }
        if (filterGenre !== 'all') {
            list = list.filter(g => g.genres?.includes(filterGenre))
        }
        list.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name)
            if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
            if (sortBy === 'playtime') return (b.playtime || 0) - (a.playtime || 0)
            if (sortBy === 'lastPlayed') return new Date(b.lastPlayed || 0) - new Date(a.lastPlayed || 0)
            if (sortBy === 'added') return new Date(b.addedAt || 0) - new Date(a.addedAt || 0)
            return 0
        })
        return list
    },

    getAllGenres: () => {
        const genres = new Set()
        get().games.forEach(g => (g.genres || []).forEach(x => genres.add(x)))
        return [...genres].sort()
    },

    getTotalPlaytime: () => get().games.reduce((t, g) => t + (g.playtime || 0), 0),
}))