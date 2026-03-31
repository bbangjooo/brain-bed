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

export interface OnboardingScanData {
  totalTokens: number
  activeToolCount: number
  latestTime: string | null
  bfiStage: BfiStage
}

export interface OnboardingSettings {
  default_meditation_minutes: number
  late_night_enabled: boolean
  launch_at_login: boolean
}

export interface ElectronAPI {
  getAudioPath: () => Promise<string>
  restartForUpdate: () => void
  onUpdateReady: (callback: (data: { version: string }) => void) => () => void
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
  // Onboarding
  onboardingRequestAccessibility: () => Promise<boolean>
  onboardingGetScanData: () => Promise<OnboardingScanData | null>
  onboardingComplete: (settings: OnboardingSettings) => void
  onboardingReplay: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
