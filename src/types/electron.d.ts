export interface TokenStats {
  totalTokens: number
  byTool: Record<string, number>
  lastUpdated: number
  velocity: number
  messageCount: number
  messageVelocity: number
}

export type BfiStage = 'calm' | 'warming' | 'heating' | 'brain-fry'

export interface AppStatus {
  elapsedMinutes: number
  threshold: number
  tokenStats: TokenStats
  isMeditating: boolean
  bfi: number
  bfiStage: BfiStage
  tokenVelocity: number
  messageVelocity: number
  messageCount: number
  activeTools: string[]
  activeSessionCount: number
}

export interface ElectronAPI {
  getSettings: () => Promise<Record<string, any>>
  updateSetting: (key: string, value: string) => Promise<boolean>
  getStatus: () => Promise<AppStatus>
  getTokenStats: () => Promise<TokenStats>
  onStatusUpdate: (callback: (data: AppStatus) => void) => () => void
  takeBreak: () => void
  meditationReady: () => void
  cancelMeditation: () => void
  endMeditation: (completed: boolean) => void
  emergencyExit: () => void
  selectDuration: (seconds: number) => void
  onMeditationSelect: (
    callback: (data: { defaultMinutes: number; musicAutoplay: boolean }) => void
  ) => () => void
  onMeditationStart: (
    callback: (data: { duration: number; musicAutoplay: boolean }) => void
  ) => () => void
  onShowExitDialog: (callback: () => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
