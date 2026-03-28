import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Audio
  getAudioPath: () => ipcRenderer.invoke('audio:get-path'),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSetting: (key: string, value: string) =>
    ipcRenderer.invoke('settings:update', key, value),

  // Status
  getStatus: () => ipcRenderer.invoke('status:get'),
  getTokenStats: () => ipcRenderer.invoke('token-stats:get'),
  onStatusUpdate: (callback: (data: any) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: any) => callback(data)
    ipcRenderer.on('status:update', handler)
    return () => ipcRenderer.removeListener('status:update', handler)
  },

  // Actions from dashboard
  takeBreak: () => ipcRenderer.send('app:take-break'),
  meditationReady: () => ipcRenderer.send('meditation:renderer-ready'),
  cancelMeditation: () => ipcRenderer.send('meditation:cancel'),

  // Meditation
  endMeditation: (completed: boolean) =>
    ipcRenderer.send('meditation:end', { completed }),
  emergencyExit: () => ipcRenderer.send('meditation:emergency-exit'),
  selectDuration: (seconds: number) =>
    ipcRenderer.send('meditation:select-duration', seconds),

  // Event listeners
  onMeditationSelect: (callback: (data: { defaultMinutes: number; musicAutoplay: boolean }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { defaultMinutes: number; musicAutoplay: boolean }) => callback(data)
    ipcRenderer.on('meditation:select', handler)
    return () => ipcRenderer.removeListener('meditation:select', handler)
  },
  onMeditationStart: (callback: (data: { duration: number; musicAutoplay: boolean }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { duration: number; musicAutoplay: boolean }) => callback(data)
    ipcRenderer.on('meditation:start', handler)
    return () => ipcRenderer.removeListener('meditation:start', handler)
  },
  onShowExitDialog: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('meditation:show-exit-dialog', handler)
    return () => ipcRenderer.removeListener('meditation:show-exit-dialog', handler)
  },
})
