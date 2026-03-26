import { powerMonitor } from 'electron'

interface ActivityTrackerOptions {
  onTick: () => void
}

export class ActivityTracker {
  private startTime: number = Date.now()
  private pausedAt: number | null = null
  private pausedDuration: number = 0
  private intervalId: ReturnType<typeof setInterval> | null = null
  private running: boolean = false
  private options: ActivityTrackerOptions
  private idleCheckInterval: ReturnType<typeof setInterval> | null = null

  constructor(options: ActivityTrackerOptions) {
    this.options = options
  }

  start() {
    this.running = true
    this.startTime = Date.now()
    this.pausedDuration = 0

    // Check every minute
    this.intervalId = setInterval(() => this.tick(), 60_000)

    // Check idle state every 30 seconds
    this.idleCheckInterval = setInterval(() => {
      const idleSeconds = powerMonitor.getSystemIdleTime()
      if (idleSeconds >= 300) {
        this.reset()
      }
    }, 30_000)
  }

  stop() {
    this.running = false
    if (this.intervalId) clearInterval(this.intervalId)
    if (this.idleCheckInterval) clearInterval(this.idleCheckInterval)
  }

  pause() {
    if (this.pausedAt) return
    this.pausedAt = Date.now()
  }

  resume() {
    if (!this.pausedAt) return
    this.pausedDuration += Date.now() - this.pausedAt
    this.pausedAt = null
  }

  reset() {
    this.startTime = Date.now()
    this.pausedDuration = 0
    this.pausedAt = null
  }

  getElapsedMinutes(): number {
    if (this.pausedAt) {
      return Math.floor((this.pausedAt - this.startTime - this.pausedDuration) / 60_000)
    }
    return Math.floor((Date.now() - this.startTime - this.pausedDuration) / 60_000)
  }

  private tick() {
    if (!this.running || this.pausedAt) return
    this.options.onTick()
  }
}
