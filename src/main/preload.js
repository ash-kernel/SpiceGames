const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('spicegames', {

  minimize: () => ipcRenderer.send('win-minimize'),
  maximize: () => ipcRenderer.send('win-maximize'),
  close:    () => ipcRenderer.send('win-close'),


  getSettings:  ()  => ipcRenderer.invoke('get-settings'),
  saveSettings: (s) => ipcRenderer.invoke('save-settings', s),


  getGames:  ()     => ipcRenderer.invoke('get-games'),
  saveGames: (g)    => ipcRenderer.invoke('save-games', g),


  browseExe:   () => ipcRenderer.invoke('browse-exe'),
  browseImage: () => ipcRenderer.invoke('browse-image'),


  launchGame:     (opts)   => ipcRenderer.invoke('launch-game', opts),
  isGameRunning:  (id)     => ipcRenderer.invoke('is-game-running', id),
  getRunningGames: ()      => ipcRenderer.invoke('get-running-games'),
  onGameStopped:  (cb) => {
    const h = (_, d) => cb(d)
    ipcRenderer.on('game-stopped', h)
    return () => ipcRenderer.removeListener('game-stopped', h)
  },


  searchGame:     (opts) => ipcRenderer.invoke('search-game', opts),
  getGameDetails: (opts) => ipcRenderer.invoke('get-game-details', opts),


  revealInExplorer: (p) => ipcRenderer.invoke('reveal-in-explorer', p),
  getAppVersion:    ()  => ipcRenderer.invoke('get-app-version'),

  setRunOnStartup:  (e) => ipcRenderer.invoke('set-run-on-startup', e),
  getStartupStatus:  () => ipcRenderer.invoke('get-startup-status'),
  isElectron: true,
})