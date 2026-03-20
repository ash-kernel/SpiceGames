const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const https = require('https')
const http = require('http')
const { spawn, execFile } = require('child_process')

const storePath = path.join(app.getPath('userData'), 'spicegames.json')
function readStore() { try { if (fs.existsSync(storePath)) return JSON.parse(fs.readFileSync(storePath, 'utf8')) } catch (_) { } return {} }
function writeStore(d) { try { fs.writeFileSync(storePath, JSON.stringify(d, null, 2)) } catch (_) { } }
function getStore(k, def) { const s = readStore(); return k in s ? s[k] : def }
function setStore(k, v) { const s = readStore(); s[k] = v; writeStore(s) }

const DEFAULT_SETTINGS = {
    theme: 'dark',
    accentColor: '#6366F1',
    defaultView: 'grid',
    sortBy: 'name',
    showFPS: false,
    minimizeOnLaunch: true,
    runOnStartup: true,
    minimizeToTray: false,
    trackPlaytime: true,
    autoFill: true,
}

let mainWindow
function createWindow() {
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

    const iconFile = process.platform === 'win32' ? 'icon.ico'
        : process.platform === 'darwin' ? 'icon.icns'
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
        },
    })
    if (isDev) { mainWindow.loadURL('http://localhost:5173'); mainWindow.webContents.openDevTools() }
    else mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })

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

ipcMain.on('win-minimize', () => mainWindow?.minimize())
ipcMain.on('win-maximize', () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize())
ipcMain.on('win-close', () => mainWindow?.close())

ipcMain.handle('get-settings', () => ({ ...DEFAULT_SETTINGS, ...getStore('settings', {}) }))
ipcMain.handle('save-settings', (_, s) => { setStore('settings', { ...getStore('settings', {}), ...s }); return { ok: true } })

ipcMain.handle('get-games', () => getStore('games', []))
ipcMain.handle('save-games', (_, games) => { setStore('games', games); return { ok: true } })

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
        filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] }],
        properties: ['openFile'],
    })
    if (result.canceled) return null

    const buf = fs.readFileSync(result.filePaths[0])
    const ext = path.extname(result.filePaths[0]).slice(1).toLowerCase()
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`
    return `data:${mime};base64,${buf.toString('base64')}`
})

const runningGames = new Map()

ipcMain.handle('launch-game', async (event, { gameId, exePath }) => {
    if (!fs.existsSync(exePath)) return { ok: false, error: 'Executable not found at path: ' + exePath }
    if (runningGames.has(gameId)) return { ok: false, error: 'Game is already running' }

    try {
        const settings = { ...DEFAULT_SETTINGS, ...getStore('settings', {}) }
        if (settings.minimizeOnLaunch) mainWindow?.minimize()

        const child = spawn(exePath, [], {
            detached: true,
            stdio: 'ignore',
            cwd: path.dirname(exePath),
        })
        child.unref()

        const startTime = Date.now()
        runningGames.set(gameId, { pid: child.pid, startTime })

        child.on('error', err => {
            runningGames.delete(gameId)
            event.sender.send('game-stopped', { gameId, error: err.message })
        })
        child.on('exit', () => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60)
            runningGames.delete(gameId)
            event.sender.send('game-stopped', { gameId, playtime: elapsed })
            if (settings.minimizeOnLaunch) mainWindow?.restore()
        })

        return { ok: true, pid: child.pid }
    } catch (err) {
        runningGames.delete(gameId)
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
            if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))
            let data = ''
            res.on('data', c => data += c)
            res.on('end', () => { try { resolve(JSON.parse(data)) } catch { reject(new Error('Bad JSON')) } })
        }).on('error', reject)
    })
}

function steamImages(appId) {
    const base = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}`
    return {

        portrait: `${base}/library_600x900.jpg`,

        header: `${base}/header.jpg`,

        capsule: `${base}/capsule_616x353.jpg`,

        hero: `${base}/library_hero.jpg`,
    }
}

ipcMain.handle('search-game', async (_, { name }) => {
    try {
        const encoded = encodeURIComponent(name)
        const data = await nodeFetch(
            `https://store.steampowered.com/api/storesearch/?term=${encoded}&l=english&cc=US`
        )
        const items = data?.items || []
        return items.slice(0, 10).map(g => {
            const sid = String(g.id)
            const imgs = steamImages(sid)
            return {
                steamId: sid,
                name: g.name,

                cover: imgs.portrait,
                header: imgs.header,
                capsule: imgs.capsule,
                price: g.price?.final_formatted || (g.price === null ? 'Free' : ''),
                platforms: Object.keys(g.platforms || {}).filter(k => g.platforms[k]),
                source: 'Steam',
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
                owners: spy.owners || '',
                players24h: spy.players_forever || 0,
                avgPlaytime: spy.average_forever || 0,
                spyTags: Object.keys(spy.tags || {}).slice(0, 12),
            }
        }


        let ocScore = null, ocOutlet = null, ocUrl = null
        if (ocSearchRes.status === 'fulfilled' && Array.isArray(ocSearchRes.value) && ocSearchRes.value.length > 0) {
            const ocGame = ocSearchRes.value[0]
            try {
                const ocDetail = await nodeFetch(`https://api.opencritic.com/api/game/${ocGame.id}`)
                ocScore = ocDetail?.averageScore ? Math.round(ocDetail.averageScore) : null
                ocOutlet = ocDetail?.numReviews ? `${ocDetail.numReviews} critic reviews` : null
                ocUrl = `https://opencritic.com/game/${ocGame.id}/${ocGame.slug || ''}`
            } catch { }
        }


        const imgs = steamImages(steamId)
        const screenshots = (d.screenshots || []).slice(0, 10).map(s => s.path_full)

        return {
            steamId,
            name: d.name,

            cover: imgs.portrait,
            header: imgs.header,
            capsule: imgs.capsule,
            hero: imgs.hero,


            description: d.short_description || '',
            fullDesc: (d.detailed_description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
            developer: (d.developers || []).join(', '),
            publisher: (d.publishers || []).join(', '),
            released: d.release_date?.date || '',
            genres: (d.genres || []).map(x => x.description),
            categories: (d.categories || []).slice(0, 8).map(x => x.description),
            platforms: Object.keys(d.platforms || {}).filter(k => d.platforms[k]).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
            website: d.website || '',
            price: d.price_overview?.final_formatted || (d.is_free ? 'Free' : ''),
            ageRating: d.required_age || null,
            screenshots,


            steamReviewScore: reviewScore,
            steamReviewTotal: reviewTotal,
            reviewScore,
            metacritic: d.metacritic?.score || null,
            metacriticUrl: d.metacritic?.url || null,
            openCriticScore: ocScore,
            openCriticOutlets: ocOutlet,
            openCriticUrl: ocUrl,


            owners: spyData.owners || '',
            avgPlaytime: spyData.avgPlaytime || 0,
            spyTags: spyData.spyTags || [],
            tags: spyData.spyTags.length ? spyData.spyTags : (d.categories || []).map(x => x.description).slice(0, 8),
        }
    } catch (e) {
        console.error('[SpiceGames] Details error:', e.message)
        return null
    }
})

ipcMain.handle('reveal-in-explorer', (_, exePath) => {
    shell.showItemInFolder(exePath)
    return { ok: true }
})

ipcMain.handle('get-app-version', () => app.getVersion())