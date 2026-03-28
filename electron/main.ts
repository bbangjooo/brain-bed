import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  Notification,
  ipcMain,
  nativeImage,
  powerMonitor,
  screen,
  globalShortcut,
  systemPreferences,
  dialog,
  shell,
} from 'electron'
import path from 'path'
import { spawn, ChildProcess } from 'child_process'
import { autoUpdater } from 'electron-updater'
import { ActivityTracker } from './activity-tracker'
import { CliTokenTracker } from './cli-token-tracker'
import { SettingsStore } from './settings-store'
import { calculateBfi, getBfiMessage, type BfiStage, type BfiResult } from './bfi-calculator'

const isDev = !app.isPackaged

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let meditationWindow: BrowserWindow | null = null
let activityTracker: ActivityTracker
let cliTokenTracker: CliTokenTracker
let settingsStore: SettingsStore
let keyboardBlockerProcess: ChildProcess | null = null
let statusUpdateInterval: ReturnType<typeof setInterval> | null = null
let lastBfiStage: BfiStage = 'calm'
let currentBfi: BfiResult = { score: 0, stage: 'calm', dominant: 'elapsedRatio' }
let highBfiSince: number | null = null     // when heating/brain-fry started
let notificationCount: number = 0          // how many notifications sent this episode
let lastNotificationAt: number | null = null // when last notification was sent

const DIST = path.join(__dirname, '../dist')
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

// ── Main Window ──────────────────────────────────────────

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 680,
    minWidth: 360,
    minHeight: 560,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 14 },
    vibrancy: 'under-window',
    backgroundColor: '#0f0c29',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(`${VITE_DEV_SERVER_URL}#/dashboard`)
  } else {
    mainWindow.loadFile(path.join(DIST, 'index.html'), {
      hash: '/dashboard',
    })
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('close', (e) => {
    // Hide instead of quit — keep tray alive
    if (!app.isQuitting) {
      e.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Push status updates to the main window every 10s
  statusUpdateInterval = setInterval(() => sendStatusToMain(), 10_000)
}

function computeBfi(): BfiResult {
  const stats = cliTokenTracker.getStats()
  const activeTools = Object.entries(stats.byTool)
    .filter(([, tokens]) => tokens > 0)
    .map(([tool]) => tool)

  const inputs = {
    messageVelocity: stats.messageVelocity,
    activeToolCount: activeTools.length,
    activeSessionCount: stats.activeSessionCount,
    currentHour: new Date().getHours(),
    lateNightStart: settingsStore.get('late_night_start', 22),
    lateNightEnd: settingsStore.get('late_night_end', 6),
    tokenVelocity: stats.velocity,
    contextSwitchRate: stats.contextSwitchRate,
  }

  const result = calculateBfi(inputs)
  console.log(`[BrainBed] BFI: ${result.score} (${result.stage}) msgVel=${inputs.messageVelocity} sessions=${inputs.activeSessionCount} hour=${inputs.currentHour}`)
  return result
}

function sendStatusToMain() {
  if (!mainWindow || mainWindow.isDestroyed()) return

  currentBfi = computeBfi()
  const stats = cliTokenTracker.getStats()
  const activeTools = Object.entries(stats.byTool)
    .filter(([, tokens]) => tokens > 0)
    .map(([tool]) => tool)

  mainWindow.webContents.send('status:update', {
    elapsedMinutes: activityTracker.getElapsedMinutes(),
    threshold: settingsStore.get('alert_threshold_minutes', 60),
    tokenStats: stats,
    isMeditating: meditationWindow !== null,
    bfi: currentBfi.score,
    bfiStage: currentBfi.stage,
    tokenVelocity: stats.velocity,
    messageVelocity: stats.messageVelocity,
    messageCount: stats.messageCount,
    activeTools,
    activeSessionCount: stats.activeSessionCount,
  })
}

function showMainWindow() {
  if (!mainWindow) {
    createMainWindow()
  } else {
    mainWindow.show()
    mainWindow.focus()
  }
}

// ── Tray ─────────────────────────────────────────────────

function createTray() {
  const iconPath = path.join(__dirname, '..', 'resources', 'icons', 'trayTemplate.png')
  let trayIcon: nativeImage
  try {
    trayIcon = nativeImage.createFromPath(iconPath)
    trayIcon = trayIcon.resize({ width: 16, height: 16 })
  } catch {
    trayIcon = nativeImage.createEmpty()
  }

  tray = new Tray(trayIcon)
  tray.setToolTip('Brain Bed')

  tray.on('click', () => showMainWindow())
  updateTrayMenu()
}

function stageLabel(stage: BfiStage): string {
  return stage === 'brain-fry' ? 'Brain Fry' : stage.charAt(0).toUpperCase() + stage.slice(1)
}

function updateTrayMenu() {
  if (!tray) return

  const bfi = currentBfi
  const tokenStats = cliTokenTracker.getStats()
  const elapsed = activityTracker.getElapsedMinutes()

  const velocityStr = tokenStats.velocity > 0 ? ` (${formatTokens(tokenStats.velocity)}/min)` : ''

  const contextMenu = Menu.buildFromTemplate([
    { label: `BFI: ${bfi.score} — ${stageLabel(bfi.stage)}`, enabled: false },
    { label: `Active: ${elapsed}min`, enabled: false },
    { label: `Tokens: ${formatTokens(tokenStats.totalTokens)}${velocityStr}`, enabled: false },
    { type: 'separator' },
    { label: 'Take a Break', click: () => showTimeSelection() },
    { type: 'separator' },
    { label: 'Show Dashboard', click: () => showMainWindow() },
    { type: 'separator' },
    { label: 'Quit', click: () => { (app as any).isQuitting = true; app.quit() } },
  ])
  tray.setContextMenu(contextMenu)
  tray.setToolTip(`Brain Bed — BFI: ${bfi.score} (${stageLabel(bfi.stage)})`)
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

// ── Meditation ───────────────────────────────────────────

function showTimeSelection() {
  if (meditationWindow) return

  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize
  const winW = 600
  const winH = 800

  meditationWindow = new BrowserWindow({
    width: winW,
    height: winH,
    x: Math.round((screenW - winW) / 2),
    y: Math.round((screenH - winH) / 2),
    alwaysOnTop: true,
    closable: true,
    minimizable: false,
    maximizable: false,
    resizable: false,
    frame: false,
    transparent: true,
    hasShadow: true,
    roundedCorners: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    meditationWindow.loadURL(`${VITE_DEV_SERVER_URL}#/meditation`)
  } else {
    meditationWindow.loadFile(path.join(DIST, 'index.html'), {
      hash: '/meditation',
    })
  }

  const defaultMinutes = settingsStore.get('default_meditation_minutes', 10)
  ipcMain.once('meditation:renderer-ready', () => {
    meditationWindow?.webContents.send('meditation:select', {
      defaultMinutes,
      musicAutoplay: settingsStore.get('music_autoplay', true),
    })
  })

  meditationWindow.on('closed', () => {
    meditationWindow = null
    unblockKeyboard()
  })

  sendStatusToMain()
}

function startMeditation(durationSeconds: number) {
  if (!meditationWindow) return

  // Lock window and keyboard once the user commits
  meditationWindow.setClosable(false)
  meditationWindow.webContents.send('meditation:start', {
    duration: durationSeconds,
    musicAutoplay: settingsStore.get('music_autoplay', true),
  })

  blockKeyboard()
  activityTracker.pause()
  sendStatusToMain()
}

function endMeditation(completed: boolean) {
  if (!meditationWindow) return

  unblockKeyboard()
  meditationWindow.setClosable(true)
  meditationWindow.close()
  meditationWindow = null

  if (completed) {
    activityTracker.reset()
    highBfiSince = null
    notificationCount = 0
    lastNotificationAt = null
  }
  activityTracker.resume()
  updateTrayMenu()
  sendStatusToMain()
}

// ── Keyboard Blocking ────────────────────────────────────
// Uses a native Swift binary that installs a CGEventTap to intercept
// all keyboard events at the system level (requires Accessibility permission).
// Based on: github.com/raycast/extensions/tree/main/extensions/clean-keyboard
//
// The Swift process:
//   - Blocks all keyDown/keyUp events
//   - Unlock hotkey Cmd+Shift+Escape triggers exit dialog
//   - Receives "unlock" on stdin to release keyboard
//   - Prints "locked"/"unlocked" on stdout for status

function getKeyboardBlockerPath(): string {
  return isDev
    ? path.join(__dirname, '..', 'resources', 'bin', 'keyboard-blocker')
    : path.join(process.resourcesPath, 'bin', 'keyboard-blocker')
}

function checkAccessibilityPermission() {
  const trusted = systemPreferences.isTrustedAccessibilityClient(false)
  if (!trusted && mainWindow) {
    dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'Accessibility Permission Required',
      message: 'Brain Bed needs Accessibility permission to block keyboard input during meditation.',
      detail: 'Go to System Settings > Privacy & Security > Accessibility, then add Brain Bed.',
      buttons: ['Open Settings', 'Later'],
      defaultId: 0,
    }).then((result) => {
      if (result.response === 0) {
        shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility')
      }
    })
  }
}

function registerExitShortcut() {
  globalShortcut.register('CommandOrControl+Shift+Escape', () => {
    meditationWindow?.webContents.send('meditation:show-exit-dialog')
  })
}

function unregisterExitShortcut() {
  globalShortcut.unregister('CommandOrControl+Shift+Escape')
}

function blockKeyboard() {
  if (keyboardBlockerProcess) return

  const binPath = getKeyboardBlockerPath()
  const proc = spawn(binPath, [], {
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  keyboardBlockerProcess = proc

  proc.stdout?.on('data', (data: Buffer) => {
    const msg = data.toString().trim()
    if (msg === 'unlocked') {
      // The user pressed Cmd+Shift+Escape inside the native blocker
      meditationWindow?.webContents.send('meditation:show-exit-dialog')
      // Note: we don't kill the process here — the exit dialog will
      // call endMeditation which calls unblockKeyboard
    }
  })

  proc.stderr?.on('data', (data: Buffer) => {
    const msg = data.toString().trim()
    if (msg.includes('accessibility_permission_required')) {
      // Native blocker can't start — register globalShortcut as fallback
      registerExitShortcut()
    }
  })

  proc.on('exit', () => {
    keyboardBlockerProcess = null
  })
}

function unblockKeyboard() {
  unregisterExitShortcut()

  if (!keyboardBlockerProcess) return

  try {
    keyboardBlockerProcess.stdin?.write('unlock\n')
  } catch {
    // Process may have already exited
  }

  // Give it a moment, then force kill if still running
  setTimeout(() => {
    if (keyboardBlockerProcess) {
      keyboardBlockerProcess.kill('SIGTERM')
      keyboardBlockerProcess = null
    }
  }, 500)
}

// ── Notification ─────────────────────────────────────────

function sendNotification() {
  const bfi = currentBfi
  const body = getBfiMessage(bfi)

  const notification = new Notification({
    title: `Brain Bed — ${stageLabel(bfi.stage)} (${bfi.score})`,
    body,
    actions: [
      { type: 'button', text: 'Take a Break' },
    ],
    closeButtonText: 'Dismiss',
  })

  notification.on('action', () => {
    showTimeSelection()
  })

  notification.on('click', () => showTimeSelection())
  notification.show()
}

// ── IPC ──────────────────────────────────────────────────

function setupIPC() {
  ipcMain.handle('audio:get-path', () => {
    return isDev
      ? path.join(__dirname, '..', 'resources', 'audio')
      : path.join(process.resourcesPath, 'audio')
  })

  ipcMain.on('app:restart-for-update', () => {
    autoUpdater.quitAndInstall()
  })

  ipcMain.handle('settings:get', () => settingsStore.getAll())

  ipcMain.handle('settings:update', (_event, key: string, value: string) => {
    settingsStore.set(key, value)
    updateTrayMenu()
    sendStatusToMain()
    return true
  })

  ipcMain.handle('token-stats:get', () => cliTokenTracker.getStats())

  ipcMain.handle('status:get', () => {
    currentBfi = computeBfi()
    const stats = cliTokenTracker.getStats()
    const activeTools = Object.entries(stats.byTool)
      .filter(([, tokens]) => tokens > 0)
      .map(([tool]) => tool)

    return {
      elapsedMinutes: activityTracker.getElapsedMinutes(),
      threshold: settingsStore.get('alert_threshold_minutes', 60),
      tokenStats: stats,
      isMeditating: meditationWindow !== null,
      bfi: currentBfi.score,
      bfiStage: currentBfi.stage,
      tokenVelocity: stats.velocity,
      messageVelocity: stats.messageVelocity,
      messageCount: stats.messageCount,
      activeTools,
    }
  })

  ipcMain.on('meditation:end', (_event, data: { completed: boolean }) => {
    endMeditation(data.completed)
  })

  ipcMain.on('meditation:emergency-exit', () => {
    endMeditation(false)
  })

  ipcMain.on('meditation:cancel', () => {
    if (meditationWindow && meditationWindow.closable) {
      meditationWindow.close()
      meditationWindow = null
      sendStatusToMain()
      updateTrayMenu()
    }
  })

  ipcMain.on('meditation:select-duration', (_event, seconds: number) => {
    startMeditation(seconds)
  })

  ipcMain.on('app:take-break', () => {
    showTimeSelection()
  })

  ipcMain.on('app:open-settings', () => {
    // Settings are now in the main window via hash route
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

// ── App lifecycle ────────────────────────────────────────

app.whenReady().then(() => {
  settingsStore = new SettingsStore()

  cliTokenTracker = new CliTokenTracker()
  cliTokenTracker.start()

  activityTracker = new ActivityTracker({
    onTick: () => {
      currentBfi = computeBfi()
      const isHigh = currentBfi.stage === 'heating' || currentBfi.stage === 'brain-fry'

      if (isHigh) {
        const now = Date.now()
        // Start tracking when high BFI begins
        if (!highBfiSince) {
          highBfiSince = now
          notificationCount = 0
          lastNotificationAt = null
        }

        // Exponential backoff: 10m → 20m → 40m → 60m (cap)
        const interval = Math.min(10 * 60_000 * Math.pow(2, notificationCount), 60 * 60_000)
        const anchor = lastNotificationAt ?? highBfiSince
        if (now - anchor >= interval) {
          sendNotification()
          notificationCount++
          lastNotificationAt = now
        }
      } else {
        // Dropped back to calm/warming — reset tracking
        highBfiSince = null
        notificationCount = 0
        lastNotificationAt = null
      }

      lastBfiStage = currentBfi.stage
      updateTrayMenu()
      sendStatusToMain()
    },
  })

  createMainWindow()
  createTray()
  setupIPC()
  checkAccessibilityPermission()
  activityTracker.start()

  powerMonitor.on('suspend', () => activityTracker.pause())
  powerMonitor.on('resume', () => activityTracker.resume())
  powerMonitor.on('lock-screen', () => activityTracker.pause())
  powerMonitor.on('unlock-screen', () => activityTracker.resume())

  // Auto-updater (private repo requires GH_TOKEN)
  if (!isDev) {
    autoUpdater.autoDownload = true
    autoUpdater.autoInstallOnAppQuit = true

    autoUpdater.on('update-downloaded', (info) => {
      mainWindow?.webContents.send('update:ready', { version: info.version })
    })

    autoUpdater.checkForUpdatesAndNotify().catch(() => {})
  }
})

app.on('before-quit', () => {
  (app as any).isQuitting = true
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  activityTracker?.stop()
  cliTokenTracker?.stop()
  if (statusUpdateInterval) clearInterval(statusUpdateInterval)
})

app.on('window-all-closed', (e: Event) => {
  e.preventDefault()
})

app.on('activate', () => {
  showMainWindow()
})
