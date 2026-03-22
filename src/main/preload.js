const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('spicegames', {
  // Window
  minimize: () => ipcRenderer.send('win-minimize'),
  maximize: () => ipcRenderer.send('win-maximize'),
  close:    () => ipcRenderer.send('win-close'),

  // Settings
  getSettings:  ()  => ipcRenderer.invoke('get-settings'),
  saveSettings: (s) => ipcRenderer.invoke('save-settings', s),

  // Library
  getGames:     ()  => ipcRenderer.invoke('get-games'),
  saveGames:    (g) => ipcRenderer.invoke('save-games', g),
  getWishlist:  ()  => ipcRenderer.invoke('get-wishlist'),
  saveWishlist: (w) => ipcRenderer.invoke('save-wishlist', w),

  // File pickers
  browseExe:   () => ipcRenderer.invoke('browse-exe'),
  browseImage: () => ipcRenderer.invoke('browse-image'),

  // Game launching
  launchGame:     (opts)   => ipcRenderer.invoke('launch-game', opts),
  isGameRunning:  (id)     => ipcRenderer.invoke('is-game-running', id),
  getRunningGames: ()      => ipcRenderer.invoke('get-running-games'),
  onGameStopped:  (cb) => {
    const h = (_, d) => cb(d)
    ipcRenderer.on('game-stopped', h)
    return () => ipcRenderer.removeListener('game-stopped', h)
  },

  // RAWG metadata
  searchGame:     (opts) => ipcRenderer.invoke('search-game', opts),
  getGameDetails: (opts) => ipcRenderer.invoke('get-game-details', opts),

  // Utils
  revealInExplorer: (p) => ipcRenderer.invoke('reveal-in-explorer', p),
  getAppVersion:    ()  => ipcRenderer.invoke('get-app-version'),

  setRunOnStartup:    (e)    => ipcRenderer.invoke('set-run-on-startup', e),
  getStartupStatus:   ()     => ipcRenderer.invoke('get-startup-status'),
  importFromSteam:    ()     => ipcRenderer.invoke('import-from-steam'),
  scanFolder:         ()     => ipcRenderer.invoke('scan-folder'),
  getFeaturedGames:   ()     => ipcRenderer.invoke('get-featured-games'),
  fetchDeals:         (opts) => ipcRenderer.invoke('fetch-deals', opts),
  fetchStores:        ()     => ipcRenderer.invoke('fetch-stores'),
  getSteamFriends:    (opts) => ipcRenderer.invoke('get-steam-friends', opts),
  getAchievements:    (opts) => ipcRenderer.invoke('get-achievements', opts),
  scanScreenshots:    ()     => ipcRenderer.invoke('scan-screenshots'),
  checkPriceAlerts:   (opts) => ipcRenderer.invoke('check-price-alerts', opts),
  fetchItch:      (opts) => ipcRenderer.invoke('fetch-itch', opts),
  searchItch:     (opts) => ipcRenderer.invoke('search-itch', opts),
  getItchDetails: (opts) => ipcRenderer.invoke('get-itch-details', opts),
  isElectron: true,
})