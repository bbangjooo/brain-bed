import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

const DEFAULT_SETTINGS: Record<string, string> = {
  alert_threshold_minutes: '60',
  realert_interval_minutes: '10',
  default_meditation_minutes: '10',
  emergency_hotkey: 'CommandOrControl+Shift+Escape',
  force_entry_enabled: 'false',
  music_autoplay: 'true',
  launch_at_login: 'false',
  bfi_enabled: 'true',
  late_night_start: '22',
  late_night_end: '6',
}

export class SettingsStore {
  private db: Database.Database

  constructor() {
    const userDataPath = app.getPath('userData')
    fs.mkdirSync(userDataPath, { recursive: true })

    const dbPath = path.join(userDataPath, 'brainbed.db')
    this.db = new Database(dbPath)
    this.initialize()
  }

  private initialize() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS meditation_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        started_at DATETIME NOT NULL,
        ended_at DATETIME,
        duration_seconds INTEGER NOT NULL,
        actual_duration_seconds INTEGER,
        completed BOOLEAN DEFAULT FALSE,
        trigger_type TEXT DEFAULT 'manual',
        continuous_usage_minutes INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Insert defaults if not exists
    const insert = this.db.prepare(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
    )
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      insert.run(key, value)
    }
  }

  get(key: string, defaultValue?: number | string | boolean): any {
    const row = this.db
      .prepare('SELECT value FROM settings WHERE key = ?')
      .get(key) as { value: string } | undefined

    if (!row) return defaultValue

    // Auto-convert types
    if (row.value === 'true') return true
    if (row.value === 'false') return false
    const num = Number(row.value)
    if (!isNaN(num) && row.value.trim() !== '') return num
    return row.value
  }

  set(key: string, value: string | number | boolean) {
    this.db
      .prepare(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
      )
      .run(key, String(value))
  }

  getAll(): Record<string, any> {
    const rows = this.db.prepare('SELECT key, value FROM settings').all() as {
      key: string
      value: string
    }[]

    const result: Record<string, any> = {}
    for (const row of rows) {
      if (row.value === 'true') result[row.key] = true
      else if (row.value === 'false') result[row.key] = false
      else {
        const num = Number(row.value)
        result[row.key] = !isNaN(num) && row.value.trim() !== '' ? num : row.value
      }
    }
    return result
  }

  logSession(data: {
    duration_seconds: number
    actual_duration_seconds: number
    completed: boolean
    trigger_type: string
    continuous_usage_minutes: number
  }) {
    this.db
      .prepare(
        `INSERT INTO meditation_sessions
        (started_at, duration_seconds, actual_duration_seconds, completed, trigger_type, continuous_usage_minutes)
        VALUES (datetime('now'), ?, ?, ?, ?, ?)`
      )
      .run(
        data.duration_seconds,
        data.actual_duration_seconds,
        data.completed ? 1 : 0,
        data.trigger_type,
        data.continuous_usage_minutes
      )
  }
}
