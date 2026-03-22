const { app, BrowserWindow, ipcMain, dialog, shell, Tray, Menu, nativeImage } = require('electron')
const path = require('path')
const fs = require('fs')
const https = require('https')
const http = require('http')
const { spawn, execFile } = require('child_process')

const storePath = path.join(app.getPath('userData'), 'spicegames.json')
function readStore() { try { if (fs.existsSync(storePath)) return JSON.parse(fs.readFileSync(storePath, 'utf8')) } catch (_) {} return {} }
function writeStore(d) { try { fs.writeFileSync(storePath, JSON.stringify(d, null, 2)) } catch (_) {} }
function getStore(k, def) { const s = readStore(); return k in s ? s[k] : def }
function setStore(k, v) { const s = readStore(); s[k] = v; writeStore(s) }

const DEFAULT_SETTINGS = {
  theme:            'dark',
  accentColor:      '#6366F1',
  defaultView:      'grid',
  sortBy:           'name',
  minimizeOnLaunch: true,
  minimizeToTray:   false,
  runOnStartup:     true,
  trackPlaytime:    true,
  autoFill:         true,
  compactMode:      false,
  showItch:         true,
  showNews:         true,
  showDeals:        true,
  hltbEnabled:      true,
}

let mainWindow
let tray = null
function createWindow() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
  
  const iconFile = process.platform === 'win32'   ? 'icon.ico'
                 : process.platform === 'darwin'  ? 'icon.icns'
                 : 'icon.png'
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'assets', 'icons', iconFile)
    : path.join(__dirname, '../../assets/icons', iconFile)

  mainWindow = new BrowserWindow({
    width: 1400, height: 860, minWidth: 1100, minHeight: 700,
    frame: false, titleBarStyle: 'hidden',
    title: 'SpiceGames',
    backgroundColor: '#0A0A0F',
    icon: iconPath,   
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  })
  mainWindow.on('close', (e) => {
    const settings = { ...DEFAULT_SETTINGS, ...getStore('settings', {}) }
    if (settings.minimizeToTray && !app._isQuitting) {
      e.preventDefault()
      mainWindow.hide()
    }
  })

  if (isDev) { mainWindow.loadURL('http://localhost:5173'); mainWindow.webContents.openDevTools() }
  else mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
}

app.whenReady().then(() => {
  createWindow()

  const createTray = () => {
    const iconFile = process.platform === 'win32' ? 'icon.ico' : 'icon.png'
    
    let iconPath
    if (app.isPackaged) {
      // In packaged app, assets are in app.asar root
      iconPath = path.join(app.getAppPath(), 'assets', 'icons', iconFile)
    } else {
      // In development, look relative to main.js
      iconPath = path.join(__dirname, '../../assets/icons', iconFile)
    }

    console.log('[SpiceDeck] Tray: mode=' + (app.isPackaged ? 'packaged' : 'dev') + ', path=' + iconPath)

    try {
      if (!fs.existsSync(iconPath)) {
        console.warn(`[SpiceDeck] Tray icon not found at: ${iconPath}`)
        return
      }

      const img = nativeImage.createFromPath(iconPath)
      if (img.isEmpty()) {
        console.warn('[SpiceDeck] Tray icon loaded but is empty')
        return
      }

      tray = new Tray(img)
      tray.setToolTip('SpiceDeck')
      tray.setContextMenu(Menu.buildFromTemplate([
        { label: 'Show', click: () => { mainWindow?.show(); mainWindow?.focus() } },
        { type: 'separator' },
        { label: 'Quit', click: () => { app._isQuitting = true; app.quit() } },
      ]))

      tray.on('click', () => {
        if (mainWindow?.isVisible()) mainWindow.hide()
        else { mainWindow?.show(); mainWindow?.focus() }
      })

      console.log('[SpiceDeck] Tray icon created successfully')
    } catch (e) {
      console.error('[SpiceDeck] Tray creation failed:', e.message, e.stack)
    }
  }

  // Create tray with a small delay to ensure resources are ready
  setTimeout(createTray, 500)

  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    const settings = { ...DEFAULT_SETTINGS, ...getStore('settings', {}) }
    if (!settings.minimizeToTray) app.quit()
  }
})

function applyStartupSetting(enable) {
  if (app.isPackaged) {
    
    app.setLoginItemSettings({
      openAtLogin: enable,
      name: 'SpiceGames',
      args: ['--hidden'],
    })
  } else {
    
    console.log('[SpiceGames] Startup setting (dev mode, skipped):', enable)
  }
}

app.whenReady().then(() => {
  const settings = { ...DEFAULT_SETTINGS, ...getStore('settings', {}) }
  
  const shouldRun = settings.runOnStartup !== false
  applyStartupSetting(shouldRun)
})

ipcMain.handle('set-run-on-startup', (_, enable) => {
  applyStartupSetting(enable)
  return { ok: true }
})

ipcMain.handle('get-startup-status', () => {
  if (!app.isPackaged) return { enabled: false, supported: false, devMode: true }
  const status = app.getLoginItemSettings()
  return { enabled: status.openAtLogin, supported: true }
})

app.on('before-quit', () => { app._isQuitting = true })

ipcMain.on('win-minimize', () => { if (mainWindow) mainWindow.minimize() })
ipcMain.on('win-maximize', () => { if (mainWindow) { if (mainWindow.isMaximized()) mainWindow.unmaximize(); else mainWindow.maximize() } })
ipcMain.on('win-close',    () => { if (mainWindow) mainWindow.close() })

ipcMain.handle('get-settings', () => ({ ...DEFAULT_SETTINGS, ...getStore('settings', {}) }))
ipcMain.handle('save-settings', (_, s) => { setStore('settings', { ...getStore('settings', {}), ...s }); return { ok: true } })

ipcMain.handle('get-games',    () => getStore('games', []))
ipcMain.handle('save-games',   (_, games)   => { setStore('games', games); return { ok:true } })
ipcMain.handle('get-wishlist',  () => getStore('wishlist', []))
ipcMain.handle('save-wishlist', (_, items)  => { setStore('wishlist', items); return { ok:true } })

ipcMain.handle('browse-exe', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Game Executable',
    filters: [
      { name: 'Executables', extensions: ['exe', 'app', 'sh', 'AppImage'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['openFile'],
  })
  if (result.canceled) return null
  const exePath = result.filePaths[0]
  const name = path.basename(exePath, path.extname(exePath))
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
  return { exePath, name }
})

ipcMain.handle('browse-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Cover Image',
    filters: [{ name: 'Images', extensions: ['jpg','jpeg','png','webp','gif'] }],
    properties: ['openFile'],
  })
  if (result.canceled) return null
  
  const buf = fs.readFileSync(result.filePaths[0])
  const ext = path.extname(result.filePaths[0]).slice(1).toLowerCase()
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`
  return `data:${mime};base64,${buf.toString('base64')}`
})

const runningGames = new Map()

ipcMain.handle('launch-game', async (event, { gameId, exePath, launchArgs, preLaunchScript }) => {
  if (!fs.existsSync(exePath)) return { ok: false, error: 'Executable not found: ' + exePath }
  if (runningGames.has(gameId)) return { ok: false, error: 'Already running' }

  try {
    const settings = { ...DEFAULT_SETTINGS, ...getStore('settings', {}) }

    // Run pre-launch script if specified
    if (preLaunchScript && preLaunchScript.trim()) {
      const scriptPath = preLaunchScript.trim()
      if (fs.existsSync(scriptPath)) {
        await new Promise(res => {
          const s = spawn(scriptPath, [], { detached: true, stdio: 'ignore', cwd: path.dirname(scriptPath) })
          s.unref()
          s.on('exit', res)
          s.on('error', res) // don't block on script errors
          setTimeout(res, 5000)
        })
      }
    }

    if (settings.minimizeOnLaunch) mainWindow?.minimize()

    const args = launchArgs ? launchArgs.trim().split(/\s+/).filter(Boolean) : []

    // On Windows, paths with spaces need shell:true to resolve correctly.
    // Use execFile first (safer), fall back to spawn with shell.
    const isWin    = process.platform === 'win32'
    const spawnOpts = {
      detached:    true,
      stdio:       'ignore',
      cwd:         path.dirname(exePath),
      windowsHide: false,
      ...(isWin ? { shell: false } : {}),   // shell:false is fine when we pass the full path
    }

    let child
    try {
      // execFile is the most reliable for direct .exe paths
      const { execFile: execFileFn } = require('child_process')
      child = execFileFn(exePath, args, {
        detached:    true,
        windowsHide: false,
        cwd:         path.dirname(exePath),
      })
    } catch (_) {
      // fallback to spawn with shell:true for paths with spaces or special chars
      child = spawn(exePath, args, { ...spawnOpts, shell: isWin })
    }
    child.unref()

    const startTime = Date.now()
    runningGames.set(gameId, { pid: child.pid, startTime })

    // Poll every 10s to see if the process is still alive
    // This handles launchers that spawn a child and exit themselves
    const pollInterval = setInterval(() => {
      try {
        // process.kill(pid, 0) throws if process is dead — doesn't actually kill it
        process.kill(child.pid, 0)
      } catch {
        // Process is gone
        clearInterval(pollInterval)
        const elapsed = Math.floor((Date.now() - startTime) / 60000)
        runningGames.delete(gameId)
        if (!event.sender.isDestroyed()) {
          event.sender.send('game-stopped', { gameId, playtime: elapsed })
        }
        if (settings.minimizeOnLaunch) mainWindow?.restore()
      }
    }, 10_000)

    // Also listen to child exit in case it's a direct process (not a launcher)
    child.on('exit', () => {
      // Give it 3 seconds — if it was a launcher, the real game PID won't match
      // So we let the poller handle cleanup instead of restoring immediately
      setTimeout(() => {
        if (runningGames.has(gameId)) {
          // Still in map after 3s = poller hasn't fired = launcher already exited,
          // real game is running under a different PID. Stop polling the dead PID.
          clearInterval(pollInterval)
          runningGames.delete(gameId)
          const elapsed = Math.floor((Date.now() - startTime) / 60000)
          if (!event.sender.isDestroyed()) {
            event.sender.send('game-stopped', { gameId, playtime: elapsed })
          }
          if (settings.minimizeOnLaunch) mainWindow?.restore()
        }
      }, 3000)
    })

    child.on('error', err => {
      clearInterval(pollInterval)
      runningGames.delete(gameId)
      if (!event.sender.isDestroyed()) {
        event.sender.send('game-stopped', { gameId, error: err.message })
      }
      if (settings.minimizeOnLaunch) mainWindow?.restore()
    })

    return { ok: true, pid: child.pid }
  } catch (err) {
    runningGames.delete(gameId)
    if (settings?.minimizeOnLaunch) mainWindow?.restore()
    return { ok: false, error: err.message }
  }
})

ipcMain.handle('is-game-running', (_, gameId) => runningGames.has(gameId))
ipcMain.handle('get-running-games', () => [...runningGames.keys()])

function nodeFetch(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http
    proto.get(url, {
      headers: { 'User-Agent': 'SpiceGames/1.0', ...headers }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return nodeFetch(res.headers.location, headers).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode))
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => { try { resolve(JSON.parse(data)) } catch { reject(new Error('Bad JSON')) } })
    }).on('error', reject)
  })
}

function nodeFetchText(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http
    proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return nodeFetchText(res.headers.location).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode))
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    }).on('error', reject)
  })
}

function steamImages(appId) {
  const base = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}`
  return {
    
    portrait: `${base}/library_600x900.jpg`,
    
    header:   `${base}/header.jpg`,
    
    capsule:  `${base}/capsule_616x353.jpg`,
    
    hero:     `${base}/library_hero.jpg`,
  }
}

ipcMain.handle('search-game', async (_, { name, nsfwFilter = false }) => {
  try {
    const encoded = encodeURIComponent(name)
    const data = await nodeFetch(`https://store.steampowered.com/api/storesearch/?term=${encoded}&l=english&cc=US`)
    const items = data?.items || []
    return items.slice(0, 10).map(g => {
      const sid = String(g.id)
      const imgs = steamImages(sid)
      return {
        steamId:   sid,
        name:      g.name,
        cover:     imgs.portrait,
        header:    imgs.header,
        capsule:   imgs.capsule,
        
        tinyImage: g.tiny_image || null,
        price:     g.price?.final_formatted || (g.price === null ? 'Free' : ''),
        platforms: Object.keys(g.platforms || {}).filter(k => g.platforms[k]),
        source:    'Steam',
      }
    })
  } catch (e) {
    console.error('[SpiceGames] Steam search error:', e.message)
    return []
  }
})

ipcMain.handle('get-game-details', async (_, { steamId }) => {
  try {
    
    const [steamRes, reviewRes, spyRes, ocSearchRes] = await Promise.allSettled([
      nodeFetch(`https://store.steampowered.com/api/appdetails?appids=${steamId}&l=english`),
      nodeFetch(`https://store.steampowered.com/appreviews/${steamId}?json=1&language=english&num_per_page=0`),
      nodeFetch(`https://steamspy.com/api.php?request=appdetails&appid=${steamId}`),
      nodeFetch(`https://api.opencritic.com/api/game/search?criteria=${encodeURIComponent(steamId)}`),
    ])

    
    const raw = steamRes.status === 'fulfilled' ? steamRes.value?.[steamId] : null
    if (!raw?.success) return null
    const d = raw.data

    
    let reviewScore = null, reviewTotal = 0
    if (reviewRes.status === 'fulfilled') {
      const rs = reviewRes.value?.query_summary
      if (rs?.total_reviews > 0) {
        reviewScore = Math.round((rs.total_positive / rs.total_reviews) * 100)
        reviewTotal = rs.total_reviews
      }
    }

    
    let spyData = {}
    if (spyRes.status === 'fulfilled' && spyRes.value) {
      const spy = spyRes.value
      spyData = {
        owners:      spy.owners || '',         
        players24h:  spy.players_forever || 0,
        avgPlaytime: spy.average_forever || 0, 
        spyTags:     Object.keys(spy.tags || {}).slice(0, 12),
      }
    }

    
    let ocScore = null, ocOutlet = null, ocUrl = null
    if (ocSearchRes.status === 'fulfilled' && Array.isArray(ocSearchRes.value) && ocSearchRes.value.length > 0) {
      const ocGame = ocSearchRes.value[0]
      try {
        const ocDetail = await nodeFetch(`https://api.opencritic.com/api/game/${ocGame.id}`)
        ocScore  = ocDetail?.averageScore ? Math.round(ocDetail.averageScore) : null
        ocOutlet = ocDetail?.numReviews ? `${ocDetail.numReviews} critic reviews` : null
        ocUrl    = `https://opencritic.com/game/${ocGame.id}/${ocGame.slug || ''}`
      } catch {}
    }

    
    const imgs = steamImages(steamId)
    const screenshots = (d.screenshots || []).slice(0, 10).map(s => s.path_full)

    return {
      steamId,
      name:         d.name,
      
      cover:        imgs.portrait,
      header:       imgs.header,
      capsule:      imgs.capsule,
      hero:         imgs.hero,

      
      description:  d.short_description || '',
      fullDesc:     (d.detailed_description || '').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim(),
      developer:    (d.developers || []).join(', '),
      publisher:    (d.publishers || []).join(', '),
      released:     d.release_date?.date || '',
      genres:       (d.genres || []).map(x => x.description),
      categories:   (d.categories || []).slice(0, 8).map(x => x.description),
      platforms:    Object.keys(d.platforms || {}).filter(k => d.platforms[k]).map(k => k.charAt(0).toUpperCase()+k.slice(1)),
      website:      d.website || '',
      price:        d.price_overview?.final_formatted || (d.is_free ? 'Free' : ''),
      ageRating:    d.required_age || null,
      screenshots,

      
      steamReviewScore: reviewScore,
      steamReviewTotal: reviewTotal,
      reviewScore,        
      metacritic:         d.metacritic?.score || null,
      metacriticUrl:      d.metacritic?.url   || null,
      openCriticScore:    ocScore,
      openCriticOutlets:  ocOutlet,
      openCriticUrl:      ocUrl,

      
      owners:       spyData.owners      || '',
      avgPlaytime:  spyData.avgPlaytime || 0,
      spyTags:      spyData.spyTags     || [],
      tags:         spyData.spyTags.length ? spyData.spyTags : (d.categories || []).map(x => x.description).slice(0,8),
    }
  } catch (e) {
    console.error('[SpiceGames] Details error:', e.message)
    return null
  }
})

function parseItchHTML(html) {
  const games = []

  
  const parts = html.split('data-game_id="')
  for (let i = 1; i < parts.length; i++) {
    const idEnd = parts[i].indexOf('"')
    const gameId = parts[i].slice(0, idEnd)

    
    const full = parts[i].slice(0, 2000)

    
    const hrefM = full.match(/href="(https?:\/\/[^"]+\.itch\.io\/[^"]+)"/)
    const url   = hrefM ? hrefM[1] : null
    if (!url) continue

    
    const titleM = full.match(/class="[^"]*title[^"]*"[^>]*>([^<]+)</)
    const title  = titleM ? titleM[1].trim() : ''
    if (!title) continue

    
    const imgM  = full.match(/data-lazy_src="([^"]+)"/) ||
                  full.match(/data-src="([^"]+)"/) ||
                  full.match(/src="(https:\/\/img\.itch\.zone[^"]+)"/)
    const cover = imgM ? imgM[1] : null

    
    const priceM = full.match(/class="[^"]*price_tag[^"]*"[^>]*>\s*\$?([\d.]+|Free|free)/i)
    const price  = priceM ? (priceM[1].toLowerCase() === 'free' ? 'Free' : '$' + priceM[1]) : 'Free'

    
    const genreM = full.match(/class="[^"]*genre[^"]*"[^>]*>([^<]+)</)
    const genre  = genreM ? genreM[1].trim() : ''

    
    const descM     = full.match(/class="[^"]*game_short_text[^"]*"[^>]*>([^<]+)</)
    const shortText = descM ? descM[1].trim() : ''

    
    const ratingM = full.match(/title="Rated ([0-9.]+)/)
    const rating  = ratingM ? parseFloat(ratingM[1]) : null

    games.push({ id: gameId, title, cover, url, shortText, price, genre, rating })
  }
  return games
}

async function parseItchGamePage(html) {
  const get = (pattern) => { const m = html.match(pattern); return m ? m[1].trim() : null }

  const title       = get(/<h1[^>]*class="[^"]*game_title[^"]*"[^>]*>([^<]+)</)
               || get(/<title>([^<|]+)/)  || ''
  const description = (() => {
    const si = html.indexOf('class="formatted_description')
    if (si === -1) return ''
    const bodyStart = html.indexOf('>', si) + 1
    const bodyEnd   = html.indexOf('</div>', bodyStart)
    return html.slice(bodyStart, bodyEnd).replace(/<[^>]+>/g,' ').replace(/  +/g,' ').trim().slice(0,800)
  })()

  const screenshots = []
  const ssRegex = /href="(https:\/\/img\.itch\.zone\/[^"]+\.(png|jpg|jpeg|gif|webp)[^"]*)"/g
  let ssM
  while ((ssM = ssRegex.exec(html)) !== null) {
    if (!screenshots.includes(ssM[1]) && screenshots.length < 8) screenshots.push(ssM[1])
  }

  const coverM = html.match(/class="[^"]*screenshot[^"]*"[\s\S]*?src="([^"]+)"/)
              || html.match(/og:image[^>]+content="([^"]+)"/)
  const cover  = coverM ? coverM[1] : null

  const priceM = html.match(/class="price_tag[^"]*"[^>]*>\$?([\d.]+|Free|free)/)
  const price  = priceM ? (priceM[1].toLowerCase() === 'free' ? 'Free' : '$' + priceM[1]) : 'Free'

  const authorM = html.match(/class="[^"]*user_name[^"]*"[^>]*>([^<]+)</)
  const author  = authorM ? authorM[1].trim() : null

  const tagsArr = []
  const tagParts = html.split('href="https://itch.io/games/tag-')
  for (let i = 1; i < tagParts.length && tagsArr.length < 10; i++) {
    const end = tagParts[i].indexOf('"')
    const slug = tagParts[i].slice(0, end)
    const labelM = tagParts[i].match(/>([^<]{1,30})</)
    const label = labelM ? labelM[1].trim() : slug.replace(/-/g, ' ')
    if (slug && label && label.length > 1) tagsArr.push(label)
  }

  return { title, description, cover, screenshots, price, author, tags: [...new Set(tagsArr)] }
}

ipcMain.handle('fetch-itch', async (_, { sort = 'top-rated', genre = '', page = 1, nsfwFilter = false }) => {
  try {
    const sortMap = { 'top-rated':'top-rated', 'new':'newest', 'featured':'featured', 'free':'free' }
    const s = sortMap[sort] || 'top-rated'
    let url
    if (genre) {
      url = `https://itch.io/games/tag-${encodeURIComponent(genre)}?format=game_grid&page=${page}&sort=${s}`
    } else {
      url = `https://itch.io/games/${s}?format=game_grid&platform=windows&page=${page}`
    }
    const html  = await nodeFetchText(url)
    const games = parseItchHTML(html)
    return { ok: true, games }
  } catch (e) {
    console.error('[SpiceDeck] itch.io fetch error:', e.message)
    return { ok: false, games: [] }
  }
})

ipcMain.handle('search-itch', async (_, { query }) => {
  try {
    const url  = `https://itch.io/games/top-rated?format=game_grid&q=${encodeURIComponent(query)}&platform=windows`
    const html  = await nodeFetchText(url)
    const games = parseItchHTML(html)
    return { ok: true, games }
  } catch (e) {
    console.error('[SpiceDeck] itch.io search error:', e.message)
    return { ok: false, games: [] }
  }
})

ipcMain.handle('get-itch-details', async (_, { url }) => {
  try {
    const html = await nodeFetchText(url)
    return { ok: true, ...(await parseItchGamePage(html)), url }
  } catch (e) {
    console.error('[SpiceDeck] itch.io details error:', e.message)
    return { ok: false }
  }
})

ipcMain.handle('import-from-steam', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Steam libraryfolders.vdf',
      filters: [{ name: 'VDF Files', extensions: ['vdf'] }],
      defaultPath: 'C:\\Program Files (x86)\\Steam\\steamapps',
      properties: ['openFile'],
    })
    if (result.canceled) return { ok: false, games: [] }
    const vdfPath = result.filePaths[0]
    const content = fs.readFileSync(vdfPath, 'utf8')
    const pathMatches = content.match(/"path"\s+"([^"]+)"/gi) || []
    const steamPaths = pathMatches.map(m => {
      const raw = m.replace(/.*"([^"]+)".*/, '$1')
      
      return raw.replace(/[/\\]+/g, path.sep)
    }).filter(Boolean)

    const games = []
    for (const steamPath of steamPaths) {
      const appsDir = path.join(steamPath, 'steamapps')
      if (!fs.existsSync(appsDir)) continue
      const acfs = fs.readdirSync(appsDir).filter(f => f.startsWith('appmanifest_') && f.endsWith('.acf'))
      for (const acf of acfs) {
        try {
          const acfContent = fs.readFileSync(path.join(appsDir, acf), 'utf8')
          const nameM  = acfContent.match(/"name"\s+"([^"]+)"/)
          const appidM = acfContent.match(/"appid"\s+"([^"]+)"/)
          const instM  = acfContent.match(/"installdir"\s+"([^"]+)"/)
          if (!nameM || !appidM || !instM) continue
          const steamId = appidM[1]
          const name    = nameM[1]
          const installDir = path.join(appsDir, 'common', instM[1])
          const exes = fs.existsSync(installDir)
            ? fs.readdirSync(installDir).filter(f => f.endsWith('.exe')).map(f => path.join(installDir, f))
            : []
          const exePath = exes[0] || null
          games.push({
            name,
            steamId,
            exePath,
            source: 'steam-import',
            cover: `https://cdn.akamai.steamstatic.com/steam/apps/${steamId}/library_600x900.jpg`,
            header: `https://cdn.akamai.steamstatic.com/steam/apps/${steamId}/header.jpg`,
          })
        } catch {}
      }
    }
    return { ok: true, games }
  } catch (e) {
    return { ok: false, games: [], error: e.message }
  }
})

ipcMain.handle('scan-folder', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select folder to scan for games',
      properties: ['openDirectory'],
    })
    if (result.canceled) return { ok: false, games: [] }
    const dir = result.filePaths[0]
    const games = []
    const scan = (d, depth = 0) => {
      if (depth > 3) return
      try {
        const entries = fs.readdirSync(d, { withFileTypes: true })
        for (const entry of entries) {
          if (entry.isDirectory()) {
            scan(path.join(d, entry.name), depth + 1)
          } else if (entry.name.endsWith('.exe') && !entry.name.match(/unins|setup|install|redist|vcredist|crash|update/i)) {
            const exePath = path.join(d, entry.name)
            const name = entry.name.replace('.exe','').replace(/[_-]/g,' ').trim()
            games.push({ name, exePath })
          }
        }
      } catch {}
    }
    scan(dir)
    return { ok: true, games: games.slice(0, 50) }
  } catch (e) {
    return { ok: false, games: [], error: e.message }
  }
})

ipcMain.handle('fetch-gog', async (_, { page = 1, search = '' }) => {
  try {
    let url = `https://catalog.gog.com/v1/catalog?productType=in:game&page=${page}&limit=48&order=desc:trending&countryCode=US&locale=en-US&currencyCode=USD`
    if (search) url += `&phrase=${encodeURIComponent(search)}`
    const data = await nodeFetch(url)
    const products = data?.products || []

    const gogImg = (raw) => {
      if (!raw) return null
      const base = raw.startsWith('//') ? 'https:' + raw : raw
      
      return base.replace(/(_product_card_v2_)*$/, '') + '_product_card_v2_mobile_slider_639.jpg'
    }

    return {
      ok: true,
      games: products.map(g => ({
        id:          g.id,
        title:       g.title,
        cover:       gogImg(g.coverHorizontal) || gogImg(g.coverVertical) || null,
        url:         `https://www.gog.com/en/game/${g.slug}`,
        price:       g.price?.finalMoney?.amount === '0.00' ? 'Free'
                     : g.price?.finalMoney?.amount ? `\$${parseFloat(g.price.finalMoney.amount).toFixed(2)}`
                     : '',
        originalPrice: g.price?.baseMoney?.amount ? `\$${parseFloat(g.price.baseMoney.amount).toFixed(2)}` : null,
        discount:    g.price?.discount || 0,
        rating:      g.reviewsRating ? Math.round(g.reviewsRating) : null,
        genres:      (g.genres || []).map(x => x.name),
        releaseDate: g.releaseDate,
        developer:   g.developers?.[0]?.name || '',
        publisher:   g.publishers?.[0]?.name || '',
        isAvailable: g.isAvailableInStore !== false,
        isFree:      g.price?.finalMoney?.amount === '0.00',
      }))
    }
  } catch (e) {
    console.error('[SpiceDeck] GOG error:', e.message)
    return { ok: false, games: [] }
  }
})

ipcMain.handle('fetch-deals', async (_, { storeId = '', pageSize = 40, sortBy = 'DealRating', upperPrice = 0 }) => {
  try {
    const descending = sortBy !== 'Price'
    let url = `https://www.cheapshark.com/api/1.0/deals?pageSize=${pageSize}&sortBy=${sortBy}&desc=${descending?1:0}&onSale=1`
    if (storeId)    url += `&storeID=${storeId}`
    if (upperPrice) url += `&upperPrice=${upperPrice}`
    const deals = await nodeFetch(url)
    return {
      ok: true,
      deals: (deals || []).map(d => ({
        id:          d.gameID,
        dealId:      d.dealID,
        title:       d.title,
        cover:       d.thumb,
        salePrice:   isNaN(parseFloat(d.salePrice))   ? 0 : parseFloat(d.salePrice),
        normalPrice: isNaN(parseFloat(d.normalPrice)) ? 0 : parseFloat(d.normalPrice),
        savings:     isNaN(parseFloat(d.savings))     ? 0 : Math.round(parseFloat(d.savings)),
        store:       d.storeID,
        storeId:     d.storeID,
        metacritic:  d.metacriticScore !== '0' ? parseInt(d.metacriticScore) : null,
        steamRating: d.steamRatingText || null,
        dealUrl:     `https://www.cheapshark.com/redirect?dealID=${d.dealID}`,
      }))
    }
  } catch (e) {
    console.error('[SpiceDeck] Deals error:', e.message)
    return { ok: false, deals: [] }
  }
})

ipcMain.handle('fetch-stores', async () => {
  try {
    const stores = await nodeFetch('https://www.cheapshark.com/api/1.0/stores')
    return { ok: true, stores: stores || [] }
  } catch { return { ok: false, stores: [] } }
})

ipcMain.handle('get-steam-friends', async (_, { steamKey, steamId }) => {
  try {
    if (!steamKey || !steamId) return { ok: false, error: 'API key and Steam ID required' }
    const [friends, own] = await Promise.allSettled([
      nodeFetch(`https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${steamKey}&steamid=${steamId}&relationship=friend`),
      nodeFetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamKey}&steamids=${steamId}`),
    ])
    const friendIds = friends.status === 'fulfilled'
      ? (friends.value?.friendslist?.friends || []).slice(0,50).map(f => f.steamid).join(',')
      : ''
    if (!friendIds) return { ok: true, friends: [] }
    const [summaries, recentAll] = await Promise.allSettled([
      nodeFetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamKey}&steamids=${friendIds}`),
      nodeFetch(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${steamKey}&steamid=${steamId}&count=10`),
    ])
    const players = summaries.status === 'fulfilled' ? summaries.value?.response?.players || [] : []
    return {
      ok: true,
      friends: players.map(p => ({
        steamId:     p.steamid,
        name:        p.personaname,
        avatar:      p.avatarmedium,
        state:       p.personastate,
        gameId:      p.gameid || null,
        gameName:    p.gameextrainfo || null,
        profileUrl:  p.profileurl,
      })).filter(f => f.gameId),
    }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('get-achievements', async (_, { steamKey, steamId, appId }) => {
  try {
    if (!steamKey || !steamId || !appId) return { ok: false }
    const [playerAch, schemaAch] = await Promise.allSettled([
      nodeFetch(`https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?key=${steamKey}&steamid=${steamId}&appid=${appId}&l=english`),
      nodeFetch(`https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=${steamKey}&appid=${appId}&l=english`),
    ])
    const achievements = playerAch.status === 'fulfilled' ? playerAch.value?.playerstats?.achievements || [] : []
    const schema = schemaAch.status === 'fulfilled' ? schemaAch.value?.game?.availableGameStats?.achievements || [] : []
    const schemaMap = {}
    schema.forEach(s => { schemaMap[s.name] = s })
    const unlocked = achievements.filter(a => a.achieved === 1).length
    return {
      ok: true,
      total:     achievements.length,
      unlocked,
      pct:       achievements.length ? Math.round((unlocked/achievements.length)*100) : 0,
      list:      achievements.slice(0,20).map(a => ({
        name:        a.apiname,
        displayName: schemaMap[a.apiname]?.displayName || a.apiname,
        icon:        schemaMap[a.apiname]?.icon || null,
        achieved:    a.achieved === 1,
        unlockTime:  a.unlocktime || null,
      })),
    }
  } catch (e) {
    return { ok: false }
  }
})

ipcMain.handle('scan-screenshots', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select screenshots folder',
      properties: ['openDirectory'],
    })
    if (result.canceled) return { ok: false, files: [] }
    const dir  = result.filePaths[0]
    const exts = new Set(['.png','.jpg','.jpeg','.webp'])
    const files = []
    const scan = (d, depth=0) => {
      if (depth > 3) return
      try {
        fs.readdirSync(d,{withFileTypes:true}).forEach(e => {
          if (e.isDirectory()) scan(path.join(d,e.name), depth+1)
          else if (exts.has(path.extname(e.name).toLowerCase())) {
            const fp = path.join(d,e.name)
            const st = fs.statSync(fp)
            files.push({ path:fp, name:e.name, size:st.size, mtime:st.mtime.toISOString() })
          }
        })
      } catch {}
    }
    scan(dir)
    files.sort((a,b) => new Date(b.mtime) - new Date(a.mtime))
    const withData = files.slice(0,80).map(f => {
      try {
        const buf  = fs.readFileSync(f.path)
        const ext  = path.extname(f.path).slice(1).toLowerCase()
        const mime = ext==='jpg'||ext==='jpeg' ? 'image/jpeg' : `image/${ext}`
        return { ...f, dataUrl: `data:${mime};base64,${buf.toString('base64')}` }
      } catch { return null }
    }).filter(Boolean)
    return { ok: true, files: withData }
  } catch (e) {
    return { ok: false, files: [] }
  }
})

ipcMain.handle('check-price-alerts', async (_, { wishlist }) => {
  const results = []
  for (const item of (wishlist||[]).slice(0,20)) {
    if (!item.targetPrice) continue
    try {
      const res = await nodeFetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(item.name)}&limit=1`)
      if (Array.isArray(res) && res[0]) {
        const price = parseFloat(res[0].cheapest)
        if (price <= item.targetPrice) {
          results.push({
            gameId:      item.id,
            name:        item.name,
            targetPrice: item.targetPrice,
            currentPrice:price,
            store:       res[0].cheapestDealID,
          })
        }
      }
    } catch {}
  }
  return { ok: true, alerts: results }
})

ipcMain.handle('get-featured-games', async () => {
  try {
    const data = await nodeFetch('https://store.steampowered.com/api/featuredcategories/?l=english&cc=US')
    const results = []
    const sections = ['top_sellers', 'new_releases', 'specials', 'coming_soon']
    for (const key of sections) {
      const items = data?.[key]?.items || []
      for (const g of items.slice(0, 8)) {
        const sid = String(g.id)
        const apiImg = g.large_capsule_image || g.small_capsule_image || g.capsule_image || null
        results.push({
          steamId:  sid,
          name:     g.name,
          cover:    apiImg || `https://cdn.akamai.steamstatic.com/steam/apps/${sid}/capsule_616x353.jpg`,
          header:   apiImg || `https://cdn.akamai.steamstatic.com/steam/apps/${sid}/header.jpg`,
          price:    g.final_price === 0 ? 'Free' : g.final_formatted || '',
          discount: g.discount_percent || 0,
          section:  key,
          source:   'Steam',
          platforms: Object.keys(g.platforms || {}).filter(k => g.platforms[k]),
        })

      }
    }
    const seen = new Set()
    return results.filter(r => { if (seen.has(r.steamId)) return false; seen.add(r.steamId); return true })
  } catch (e) {
    console.error('[SpiceDeck] Featured games error:', e.message)
    return []
  }
})


ipcMain.handle('fetch-news', async () => {
  const FEEDS = [
    { name:'PC Gamer',          url:'https://www.pcgamer.com/rss/',                      color:'#e53e3e' },
    { name:'Rock Paper Shotgun',url:'https://www.rockpapershotgun.com/feed',             color:'#6366F1' },
    { name:'Eurogamer',         url:'https://www.eurogamer.net/feed',                    color:'#f59e0b' },
    { name:'IGN',               url:'https://feeds.feedburner.com/ign/news',             color:'#e53e3e' },
  ]

  const parseRSS = (xml, feed) => {
    const items = []
    const parts = xml.split('<item>')
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i]
      const get = (tag) => {
        const m = part.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))?.[1]
                || part.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`))?.[1]
                || ''
        return m.trim()
      }
      const encM = part.match(/enclosure[^>]+url="([^"]+)"/)
      const medM = part.match(/media:thumbnail[^>]+url="([^"]+)"/)
        || part.match(/media:content[^>]+url="([^"]+)"/)
      const imgM  = part.match(/<img[^>]+src="([^"]+)"/)
      const title = get('title')
      const link  = get('link') || part.match(/<link>([^<]+)<\/link>/)?.[1]?.trim() || ''
      const date  = get('pubDate')
      const desc  = get('description').replace(/<[^>]+>/g,' ').trim().slice(0,180)
      const image = encM?.[1] || medM?.[1] || imgM?.[1] || null
      if (title && link) items.push({ title, link, date, description:desc, image, source:feed.name, sourceColor:feed.color, id:link })
    }
    return items
  }

  const results = await Promise.allSettled(
    FEEDS.map(async feed => {
      try {
        const xml = await nodeFetchText(feed.url)
        return parseRSS(xml, feed)
      } catch { return [] }
    })
  )

  const all = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .sort((a,b) => new Date(b.date||0) - new Date(a.date||0))

  return { ok: true, items: all }
})

ipcMain.handle('open-external', (_, url) => { shell.openExternal(url); return { ok:true } })


// ── Discover: Steam + SteamSpy (100% public, zero keys) ─────────────────────
ipcMain.handle('discover-games', async (_, { mode = 'trending', genre = '', search = '', page = 1 }) => {
  try {
    // SteamSpy endpoints (free, no key, ~40k games tracked)
    const GENRE_MAP = {
      action:'Action', rpg:'RPG', strategy:'Strategy', simulation:'Simulation',
      adventure:'Adventure', indie:'Indie', sports:'Sports', racing:'Racing',
      puzzle:'Puzzle', horror:'Horror', shooter:'Shooter', casual:'Casual',
    }

    let appids = []

    if (search.trim()) {
      // Use Steam store search
      const encoded = encodeURIComponent(search.trim())
      const res = await nodeFetch(`https://store.steampowered.com/api/storesearch/?term=${encoded}&l=english&cc=US`)
      const items = res?.items || []
      appids = items.slice(0, 24).map(i => ({ appid: i.id, name: i.name, price: i.final_price === 0 ? 'Free' : i.final_formatted || '' }))
    } else if (genre && GENRE_MAP[genre]) {
      // SteamSpy genre endpoint
      const data = await nodeFetch(`https://steamspy.com/api.php?request=genre&genre=${encodeURIComponent(GENRE_MAP[genre])}`)
      const all  = Object.values(data || {})
      // Sort by owners (trending) or score
      all.sort((a, b) => {
        const ao = parseInt((a.owners || '0').replace(/[^0-9]/g,'')) || 0
        const bo = parseInt((b.owners || '0').replace(/[^0-9]/g,'')) || 0
        return bo - ao
      })
      appids = all.slice((page-1)*24, page*24).map(g => ({ appid: g.appid, name: g.name, owners: g.owners, score: g.score_rank }))
    } else {
      // Top lists from SteamSpy
      const endpoint = mode === 'toprated'   ? 'top100forever'
                     : mode === 'new'        ? 'top100in2weeks'
                     : mode === 'free'       ? 'price&price=0'
                     :                         'top100in2weeks'
      const data = await nodeFetch(`https://steamspy.com/api.php?request=${endpoint}`)
      const all  = Object.values(data || {})
      appids = all.slice((page-1)*24, page*24).map(g => ({ appid: g.appid, name: g.name, owners: g.owners, score: g.score_rank, positive: g.positive, negative: g.negative, price: g.price === '0' ? 'Free' : g.price ? `$${(parseInt(g.price)/100).toFixed(2)}` : '' }))
    }

    // Build game objects with Steam CDN images (no API call needed for images)
    const games = appids.map(g => {
      const id = String(g.appid)
      // 4-level image fallback baked in
      return {
        steamId:    id,
        name:       g.name || '',
        cover:      `https://cdn.akamai.steamstatic.com/steam/apps/${id}/library_600x900.jpg`,
        header:     `https://cdn.akamai.steamstatic.com/steam/apps/${id}/header.jpg`,
        capsule:    `https://cdn.akamai.steamstatic.com/steam/apps/${id}/capsule_616x353.jpg`,
        hero:       `https://cdn.akamai.steamstatic.com/steam/apps/${id}/library_hero.jpg`,
        price:      g.price || '',
        owners:     g.owners || '',
        score:      g.score  || null,
        positive:   g.positive || 0,
        negative:   g.negative || 0,
        storeUrl:   `https://store.steampowered.com/app/${id}`,
      }
    })

    return { ok: true, games, hasMore: appids.length >= 24 }
  } catch (e) {
    console.error('[SpiceDeck] Discover error:', e.message)
    return { ok: false, games: [], hasMore: false }
  }
})

ipcMain.handle('discover-details', async (_, { steamId }) => {
  try {
    const [details, spy, reviews] = await Promise.all([
      nodeFetch(`https://store.steampowered.com/api/appdetails?appids=${steamId}&l=english`),
      nodeFetch(`https://steamspy.com/api.php?request=appdetails&appid=${steamId}`),
      nodeFetch(`https://store.steampowered.com/appreviews/${steamId}?json=1&language=english&num_per_page=0`),
    ])

    const d = details?.[steamId]?.data
    if (!d) return { ok: false }

    const score = reviews?.query_summary
    const totalVotes = (score?.total_positive || 0) + (score?.total_negative || 0)
    const rating = totalVotes > 0 ? Math.round((score.total_positive / totalVotes) * 100) : null

    return {
      ok:          true,
      steamId,
      name:        d.name,
      description: d.short_description || '',
      longDesc:    d.detailed_description || '',
      cover:       `https://cdn.akamai.steamstatic.com/steam/apps/${steamId}/library_600x900.jpg`,
      header:      d.header_image || `https://cdn.akamai.steamstatic.com/steam/apps/${steamId}/header.jpg`,
      hero:        `https://cdn.akamai.steamstatic.com/steam/apps/${steamId}/library_hero.jpg`,
      screenshots: (d.screenshots || []).slice(0, 10).map(s => s.path_full),
      genres:      (d.genres || []).map(g => g.description),
      categories:  (d.categories || []).slice(0, 6).map(c => c.description),
      developers:  d.developers || [],
      publishers:  d.publishers || [],
      releaseDate: d.release_date?.date || '',
      metacritic:  d.metacritic?.score || null,
      website:     d.website || null,
      price:       d.is_free ? 'Free' : d.price_overview?.final_formatted || '',
      platforms:   Object.keys(d.platforms || {}).filter(k => d.platforms[k]),
      rating,
      totalVotes,
      owners:      spy?.owners || '',
      avgPlaytime: spy?.average_forever ? Math.round(spy.average_forever / 60) : null,
      peakCCU:     spy?.ccu || null,
    }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

// ── HowLongToBeat ─────────────────────────────────────────────────────────────
ipcMain.handle('hltb-search', async (_, { name }) => {
  try {
    const payload = JSON.stringify({
      searchType:    'games',
      searchTerms:   name.split(' ').filter(Boolean),
      searchPage:    1,
      size:          5,
      searchOptions: { games: { userId: 0, platform: '', sortCategory: 'popular', rangeCategory: 'main', rangeTime: { min: 0, max: 0 }, gameplay: { perspective: '', flow: '', genre: '' }, modifier: '' }, users: { sortCategory: 'postcount' }, filter: '', sort: 0, randomizer: 0 },
    })

    const res = await nodeFetch('https://howlongtobeat.com/api/search', {
      method:  'POST',
      body:    payload,
      headers: {
        'Content-Type': 'application/json',
        'Referer':      'https://howlongtobeat.com',
        'Origin':       'https://howlongtobeat.com',
        'User-Agent':   'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    })

    if (!res?.data?.length) return { ok: true, results: [] }

    const results = res.data.slice(0, 3).map(g => ({
      id:           g.game_id,
      name:         g.game_name,
      cover:        g.game_image
                      ? `https://howlongtobeat.com/games/${g.game_image}`
                      : null,
      mainStory:    g.comp_main   ? Math.round(g.comp_main   / 3600) : null,
      mainExtra:    g.comp_plus   ? Math.round(g.comp_plus   / 3600) : null,
      completionist:g.comp_100    ? Math.round(g.comp_100    / 3600) : null,
    }))

    return { ok: true, results }
  } catch {
    // HLTB is non-critical, fail silently
    return { ok: true, results: [] }
  }
})

// ── Auto-update checker ───────────────────────────────────────────────────────
ipcMain.handle('check-update', async () => {
  try {
    const current = app.getVersion()
    const release = await nodeFetch(
      'https://api.github.com/repos/ash-kernel/spicedeck/releases/latest',
      { headers: { 'User-Agent': 'SpiceDeck' } }
    )

    if (!release?.tag_name) return { ok: false }

    const latest    = release.tag_name.replace(/^v/, '')
    const hasUpdate = latest !== current

    return {
      ok:        true,
      current,
      latest,
      hasUpdate,
      url:       release.html_url || '',
      notes:     release.body     || '',
    }
  } catch {
    return { ok: false }
  }
})

ipcMain.handle('reveal-in-explorer', (_, exePath) => {
  shell.showItemInFolder(exePath)
  return { ok: true }
})

ipcMain.handle('get-app-version', () => app.getVersion())