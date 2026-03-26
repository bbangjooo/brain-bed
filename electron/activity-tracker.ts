import { powerMonitor } from 'electron'

interface ActivityTrackerOptions {
  onThresholdReached: () => void
  onTick: () => void
  getThreshold: () => number
  getSnoozeInterval: () => number
}

export class ActivityTracker {
  private startTime: number = Date.now()
  private pausedAt: number | null = null
  private pausedDuration: number = 0
  private intervalId: ReturnType<typeof setInterval> | null = null
  private snoozedUntil: number | null = null
  private notificationCount: number = 0
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
    this.notificationCount = 0
    this.snoozedUntil = null

    // Check every minute
    this.intervalId = setInterval(() => this.tick(), 60_000)

    // Check idle state every 30 seconds
    this.idleCheckInterval = setInterval(() => {
      const idleSeconds = powerMonitor.getSystemIdleTime()
      if (idleSeconds >= 300) {
        // 5 minutes idle = reset
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
    this.notificationCount = 0
    this.snoozedUntil = null
  }

  snooze(minutes: number) {
    this.snoozedUntil = Date.now() + minutes * 60_000
    this.notificationCount++
  }

  getSnoozeCount(): number {
    return this.notificationCount
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

    const elapsed = this.getElapsedMinutes()
    const threshold = this.options.getThreshold()

    // Check if snoozed
    if (this.snoozedUntil && Date.now() < this.snoozedUntil) {
      return
    }
    this.snoozedUntil = null

    if (elapsed >= threshold) {
      this.options.onThresholdReached()
    }
  }
}
