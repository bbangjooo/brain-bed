import fs from 'fs'
import path from 'path'
import os from 'os'

interface TokenStats {
  totalTokens: number
  byTool: Record<string, number>
  lastUpdated: number
  velocity: number
  activeSessionCount: number
  messageCount: number
  messageVelocity: number
  contextSwitchRate: number  // project switches per 10-min window
}

interface TokenSnapshot {
  time: number
  total: number
}

interface MessageSnapshot {
  time: number
  total: number
}

// Track read position per file
interface FileTracker {
  path: string
  lastSize: number
}

export class CliTokenTracker {
  private stats: TokenStats = {
    totalTokens: 0, byTool: {}, lastUpdated: Date.now(),
    velocity: 0, activeSessionCount: 0, messageCount: 0, messageVelocity: 0,
    contextSwitchRate: 0,
  }
  private intervalId: ReturnType<typeof setInterval> | null = null
  private dailyResetDate: string = new Date().toDateString()
  private snapshots: TokenSnapshot[] = []
  private messageSnapshots: MessageSnapshot[] = []
  private fileTrackers: Map<string, FileTracker> = new Map()
  private geminiPrevTotals: Map<string, { tokens: number; messages: number }> = new Map()
  private lastActiveProject: string | null = null
  private contextSwitches: { time: number }[] = []

  private home: string
  private claudeProjectsDir: string
  private claudeSessionsDir: string
  private geminiTmpDir: string
  private codexDir: string

  constructor() {
    this.home = os.homedir()
    this.claudeProjectsDir = path.join(this.home, '.claude', 'projects')
    this.claudeSessionsDir = path.join(this.home, '.claude', 'sessions')
    this.geminiTmpDir = path.join(this.home, '.gemini', 'tmp')
    this.codexDir = path.join(this.home, '.codex')
  }

  // ── Claude Code ──────────────────────────────────────

  private findActiveClaudeFiles(): string[] {
    const thirtyMinAgo = Date.now() - 30 * 60_000
    const results: string[] = []

    try {
      if (!fs.existsSync(this.claudeProjectsDir)) return results
      const projects = fs.readdirSync(this.claudeProjectsDir, { withFileTypes: true })

      for (const proj of projects) {
        if (!proj.isDirectory()) continue
        const projDir = path.join(this.claudeProjectsDir, proj.name)
        try {
          const files = fs.readdirSync(projDir).filter((f) => f.endsWith('.jsonl'))
          for (const file of files) {
            const fullPath = path.join(projDir, file)
            try {
              const stat = fs.statSync(fullPath)
              if (stat.mtimeMs >= thirtyMinAgo) {
                results.push(fullPath)
              }
            } catch { /* skip */ }
          }
        } catch { /* skip */ }
      }
    } catch { /* skip */ }

    return results
  }

  private parseClaudeCodeContent(content: string): { tokens: number; messages: number } {
    let tokens = 0
    let messages = 0
    const lines = content.split('\n').filter(Boolean)

    for (const line of lines) {
      try {
        const data = JSON.parse(line)

        // Token counting: top-level usage or nested in message
        if (data.usage) {
          tokens += (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0)
        }
        if (data.costUSD) {
          tokens += Math.round(data.costUSD / 0.000009)
        }
        if (data.type === 'assistant' && data.message?.usage) {
          tokens += (data.message.usage.input_tokens || 0) + (data.message.usage.output_tokens || 0)
        }

        // Message counting: all user interactions (prompts + tool approvals)
        if (data.type === 'user') {
          messages++
        }
      } catch { /* skip malformed */ }
    }

    return { tokens, messages }
  }

  // ── Gemini CLI ───────────────────────────────────────

  private findActiveGeminiFiles(): string[] {
    const thirtyMinAgo = Date.now() - 30 * 60_000
    const results: string[] = []

    try {
      if (!fs.existsSync(this.geminiTmpDir)) return results

      // Gemini stores chats in ~/.gemini/tmp/{user}/chats/session-*.json
      // and logs in ~/.gemini/tmp/{user}/logs.json
      const users = fs.readdirSync(this.geminiTmpDir, { withFileTypes: true })
      for (const user of users) {
        if (!user.isDirectory()) continue
        const chatsDir = path.join(this.geminiTmpDir, user.name, 'chats')
        try {
          if (!fs.existsSync(chatsDir)) continue
          const files = fs.readdirSync(chatsDir).filter((f) => f.endsWith('.json'))
          for (const file of files) {
            const fullPath = path.join(chatsDir, file)
            try {
              const stat = fs.statSync(fullPath)
              if (stat.mtimeMs >= thirtyMinAgo) {
                results.push(fullPath)
              }
            } catch { /* skip */ }
          }
        } catch { /* skip */ }
      }
    } catch { /* skip */ }

    return results
  }

  private parseGeminiContent(content: string): { tokens: number; messages: number } {
    let tokens = 0
    let messages = 0

    try {
      const data = JSON.parse(content)

      // Session file: { messages: [ { type: "user" | "gemini", ... } ] }
      if (data.messages && Array.isArray(data.messages)) {
        for (const msg of data.messages) {
          if (msg.type === 'user') messages++
          // Gemini uses { tokens: { input, output, total } }
          if (msg.tokens) {
            tokens += (msg.tokens.input || 0) + (msg.tokens.output || 0)
          }
          if (msg.usage) {
            tokens += (msg.usage.input_tokens || 0) + (msg.usage.output_tokens || 0)
          }
        }
      }

      // logs.json: array of entries
      if (Array.isArray(data)) {
        for (const entry of data) {
          if (entry.type === 'user') messages++
          if (entry.usage) {
            tokens += (entry.usage.input_tokens || 0) + (entry.usage.output_tokens || 0)
          }
        }
      }
    } catch { /* skip */ }

    return { tokens, messages }
  }

  // ── Codex CLI ────────────────────────────────────────

  private findActiveCodexFiles(): string[] {
    const thirtyMinAgo = Date.now() - 30 * 60_000
    const results: string[] = []

    try {
      if (!fs.existsSync(this.codexDir)) return results
      const files = this.findFilesRecursive(this.codexDir, '.jsonl', 3)
      for (const file of files) {
        try {
          const stat = fs.statSync(file)
          if (stat.mtimeMs >= thirtyMinAgo) results.push(file)
        } catch { /* skip */ }
      }
    } catch { /* skip */ }

    return results
  }

  private parseCodexContent(content: string): { tokens: number; messages: number } {
    let tokens = 0
    let messages = 0
    const lines = content.split('\n').filter(Boolean)

    for (const line of lines) {
      try {
        const data = JSON.parse(line)
        if (data.usage) {
          tokens += (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0)
          tokens += (data.usage.prompt_tokens || 0) + (data.usage.completion_tokens || 0)
        }
        if (data.token_count) tokens += data.token_count
        if (data.role === 'user' || data.type === 'user') messages++
      } catch { /* skip */ }
    }

    return { tokens, messages }
  }

  // ── Session Counting ──────────────────────────────────

  private countClaudeSessions(): number {
    // ~/.claude/sessions/*.json — one file per running session (PID-based)
    try {
      if (!fs.existsSync(this.claudeSessionsDir)) return 0
      const files = fs.readdirSync(this.claudeSessionsDir).filter((f) => f.endsWith('.json'))
      return files.length
    } catch {
      return 0
    }
  }

  private countCodexSessions(): number {
    // Codex stores sessions in ~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl
    // Count files modified in last 30 minutes
    const thirtyMinAgo = Date.now() - 30 * 60_000
    const sessionsDir = path.join(this.codexDir, 'sessions')
    let count = 0

    try {
      if (!fs.existsSync(sessionsDir)) return 0
      const files = this.findFilesRecursive(sessionsDir, '.jsonl', 4)
      for (const file of files) {
        try {
          const stat = fs.statSync(file)
          if (stat.mtimeMs >= thirtyMinAgo) count++
        } catch { /* skip */ }
      }
    } catch { /* skip */ }

    return count
  }

  // ── Shared ───────────────────────────────────────────

  private findFilesRecursive(dir: string, ext: string, maxDepth: number): string[] {
    if (maxDepth <= 0) return []
    const results: string[] = []
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          results.push(...this.findFilesRecursive(fullPath, ext, maxDepth - 1))
        } else if (entry.name.endsWith(ext)) {
          results.push(fullPath)
        }
      }
    } catch { /* skip */ }
    return results
  }

  private readNewContent(filePath: string): string | null {
    try {
      const stat = fs.statSync(filePath)
      const tracker = this.fileTrackers.get(filePath)
      const lastSize = tracker?.lastSize ?? 0

      if (stat.size <= lastSize) return null

      const fd = fs.openSync(filePath, 'r')
      const newBytes = stat.size - lastSize
      const buffer = Buffer.alloc(Math.min(newBytes, 1024 * 1024))
      fs.readSync(fd, buffer, 0, buffer.length, lastSize)
      fs.closeSync(fd)

      this.fileTrackers.set(filePath, { path: filePath, lastSize: stat.size })
      return buffer.toString('utf-8')
    } catch {
      return null
    }
  }

  private readFullFileIfChanged(filePath: string): string | null {
    try {
      const stat = fs.statSync(filePath)
      const tracker = this.fileTrackers.get(filePath)

      // Skip if size hasn't changed
      if (tracker && stat.size === tracker.lastSize) return null

      const content = fs.readFileSync(filePath, 'utf-8')
      this.fileTrackers.set(filePath, { path: filePath, lastSize: stat.size })
      return content
    } catch {
      return null
    }
  }

  // ── Main check loop ──────────────────────────────────

  private checkLogs() {
    // Reset daily
    const today = new Date().toDateString()
    if (today !== this.dailyResetDate) {
      this.stats = {
        totalTokens: 0, byTool: {}, lastUpdated: Date.now(),
        velocity: 0, activeSessionCount: 0, messageCount: 0, messageVelocity: 0,
        contextSwitchRate: 0,
      }
      this.snapshots = []
      this.messageSnapshots = []
      this.contextSwitches = []
      this.lastActiveProject = null
      this.fileTrackers.clear()
      this.geminiPrevTotals.clear()
      this.dailyResetDate = today
    }

    let totalActiveSessions = 0

    // Claude Code — count sessions via ~/.claude/sessions/*.json
    totalActiveSessions += this.countClaudeSessions()

    // Claude Code — read all active project log files
    const claudeFiles = this.findActiveClaudeFiles()
    for (const file of claudeFiles) {
      const content = this.readNewContent(file)
      if (content) {
        const result = this.parseClaudeCodeContent(content)
        if (result.tokens > 0) {
          this.stats.byTool['Claude Code'] = (this.stats.byTool['Claude Code'] || 0) + result.tokens
          this.stats.totalTokens += result.tokens
          this.stats.lastUpdated = Date.now()
        }
        if (result.messages > 0) {
          this.stats.messageCount += result.messages
        }
      }
    }

    // Gemini CLI — count + read active chat files
    const geminiFiles = this.findActiveGeminiFiles()
    for (const file of geminiFiles) {
      const content = this.readFullFileIfChanged(file)
      if (content) {
        const result = this.parseGeminiContent(content)
        // For full-file reads, store totals per file and apply diff
        const prevKey = `gemini:${file}`
        const prev = this.geminiPrevTotals.get(prevKey) ?? { tokens: 0, messages: 0 }
        const deltaTokens = Math.max(0, result.tokens - prev.tokens)
        const deltaMessages = Math.max(0, result.messages - prev.messages)
        this.geminiPrevTotals.set(prevKey, result)

        if (deltaTokens > 0) {
          this.stats.byTool['Gemini CLI'] = (this.stats.byTool['Gemini CLI'] || 0) + deltaTokens
          this.stats.totalTokens += deltaTokens
          this.stats.lastUpdated = Date.now()
        }
        if (deltaMessages > 0) {
          this.stats.messageCount += deltaMessages
        }
      }
    }
    totalActiveSessions += geminiFiles.length

    // Codex CLI
    const codexFiles = this.findActiveCodexFiles()
    for (const file of codexFiles) {
      const content = this.readNewContent(file)
      if (content) {
        const result = this.parseCodexContent(content)
        if (result.tokens > 0) {
          this.stats.byTool['Codex CLI'] = (this.stats.byTool['Codex CLI'] || 0) + result.tokens
          this.stats.totalTokens += result.tokens
          this.stats.lastUpdated = Date.now()
        }
        if (result.messages > 0) {
          this.stats.messageCount += result.messages
        }
      }
    }
    totalActiveSessions += codexFiles.length

    // Codex — count via session files
    totalActiveSessions += this.countCodexSessions()

    this.stats.activeSessionCount = totalActiveSessions

    // Track context switching (project changes)
    const now = Date.now()
    const allActiveFiles = [...claudeFiles, ...geminiFiles, ...codexFiles]
    let mostRecentFile: string | null = null
    let mostRecentTime = 0
    for (const file of allActiveFiles) {
      try {
        const stat = fs.statSync(file)
        if (stat.mtimeMs > mostRecentTime) {
          mostRecentTime = stat.mtimeMs
          // Extract project name from path
          mostRecentFile = path.dirname(file)
        }
      } catch { /* skip */ }
    }
    if (mostRecentFile && this.lastActiveProject && mostRecentFile !== this.lastActiveProject) {
      this.contextSwitches.push({ time: now })
    }
    if (mostRecentFile) this.lastActiveProject = mostRecentFile

    const tenMinAgo = now - 10 * 60_000
    this.contextSwitches = this.contextSwitches.filter((s) => s.time >= tenMinAgo)
    this.stats.contextSwitchRate = this.contextSwitches.length

    // Update token velocity (rolling 10-minute window)
    this.snapshots.push({ time: now, total: this.stats.totalTokens })
    const tenMinAgo = now - 10 * 60_000
    this.snapshots = this.snapshots.filter((s) => s.time >= tenMinAgo)

    if (this.snapshots.length >= 2) {
      const oldest = this.snapshots[0]
      const deltaTokens = this.stats.totalTokens - oldest.total
      const deltaMin = (now - oldest.time) / 60_000
      this.stats.velocity = deltaMin > 0 ? Math.round(deltaTokens / deltaMin) : 0
    } else {
      this.stats.velocity = 0
    }

    // Update message velocity (rolling 10-minute window)
    this.messageSnapshots.push({ time: now, total: this.stats.messageCount })
    this.messageSnapshots = this.messageSnapshots.filter((s) => s.time >= tenMinAgo)

    if (this.messageSnapshots.length >= 2) {
      const oldest = this.messageSnapshots[0]
      const deltaMessages = this.stats.messageCount - oldest.total
      const deltaMin = (now - oldest.time) / 60_000
      this.stats.messageVelocity = deltaMin > 0 ? Math.round((deltaMessages / deltaMin) * 100) / 100 : 0
    } else {
      this.stats.messageVelocity = 0
    }
  }

  // Bootstrap: read today's full totals + recent 10-min velocity
  private bootstrapRecentActivity() {
    const now = Date.now()
    const tenMinAgo = now - 10 * 60_000
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayStartMs = todayStart.getTime()

    let totalTokensClaude = 0
    let totalTokensGemini = 0
    let totalMessages = 0
    let recentMessages = 0 // last 10min only, for velocity

    // Claude Code — read ALL today's log files (not just 30min active)
    try {
      if (fs.existsSync(this.claudeProjectsDir)) {
        const projects = fs.readdirSync(this.claudeProjectsDir, { withFileTypes: true })
        for (const proj of projects) {
          if (!proj.isDirectory()) continue
          const projDir = path.join(this.claudeProjectsDir, proj.name)
          try {
            const files = fs.readdirSync(projDir).filter((f) => f.endsWith('.jsonl'))
            for (const file of files) {
              const fp = path.join(projDir, file)
              try {
                const stat = fs.statSync(fp)
                // Skip files not modified today
                if (stat.mtimeMs < todayStartMs) continue

                const content = fs.readFileSync(fp, 'utf-8')
                const lines = content.split('\n').filter(Boolean)
                for (const line of lines) {
                  try {
                    const data = JSON.parse(line)
                    const ts = data.timestamp ? new Date(data.timestamp).getTime() : 0
                    if (ts < todayStartMs) continue // skip yesterday's entries

                    // Tokens
                    if (data.usage) {
                      totalTokensClaude += (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0)
                    }
                    if (data.costUSD) {
                      totalTokensClaude += Math.round(data.costUSD / 0.000009)
                    }
                    if (data.type === 'assistant' && data.message?.usage) {
                      totalTokensClaude += (data.message.usage.input_tokens || 0) + (data.message.usage.output_tokens || 0)
                    }

                    // Messages
                    if (data.type === 'user') {
                      totalMessages++
                      if (ts >= tenMinAgo) recentMessages++
                    }
                  } catch { /* skip */ }
                }

                // Set file tracker so checkLogs doesn't re-read
                this.fileTrackers.set(fp, { path: fp, lastSize: stat.size })
              } catch { /* skip */ }
            }
          } catch { /* skip */ }
        }
      }
    } catch { /* skip */ }

    // Gemini — read all today's session files
    try {
      if (fs.existsSync(this.geminiTmpDir)) {
        const users = fs.readdirSync(this.geminiTmpDir, { withFileTypes: true })
        for (const user of users) {
          if (!user.isDirectory()) continue
          const chatsDir = path.join(this.geminiTmpDir, user.name, 'chats')
          try {
            if (!fs.existsSync(chatsDir)) continue
            const files = fs.readdirSync(chatsDir).filter((f) => f.endsWith('.json'))
            for (const file of files) {
              const fp = path.join(chatsDir, file)
              try {
                const stat = fs.statSync(fp)
                if (stat.mtimeMs < todayStartMs) continue

                const content = fs.readFileSync(fp, 'utf-8')
                const result = this.parseGeminiContent(content)
                totalTokensGemini += result.tokens
                totalMessages += result.messages

                // Count recent messages for velocity
                try {
                  const data = JSON.parse(content)
                  if (data.messages && Array.isArray(data.messages)) {
                    for (const msg of data.messages) {
                      const ts = msg.timestamp ? new Date(msg.timestamp).getTime() : 0
                      if (ts >= tenMinAgo && msg.type === 'user') recentMessages++
                    }
                  }
                } catch { /* skip */ }

                this.fileTrackers.set(fp, { path: fp, lastSize: stat.size })
                this.geminiPrevTotals.set(`gemini:${fp}`, result)
              } catch { /* skip */ }
            }
          } catch { /* skip */ }
        }
      }
    } catch { /* skip */ }

    // Seed stats
    if (totalTokensClaude > 0) this.stats.byTool['Claude Code'] = totalTokensClaude
    if (totalTokensGemini > 0) this.stats.byTool['Gemini CLI'] = totalTokensGemini
    this.stats.totalTokens = totalTokensClaude + totalTokensGemini
    this.stats.messageCount = totalMessages

    // Seed velocity from recent 10 min
    // Baseline = totalMessages minus recentMessages (so delta = recentMessages over 10min)
    const msgBaseline = totalMessages - recentMessages
    this.messageSnapshots.push({ time: tenMinAgo, total: msgBaseline })
    this.messageSnapshots.push({ time: now, total: totalMessages })
    this.stats.messageVelocity = recentMessages / 10

    this.snapshots.push({ time: tenMinAgo, total: this.stats.totalTokens })
    this.snapshots.push({ time: now, total: this.stats.totalTokens })
    this.stats.velocity = 0

    // Sessions
    this.stats.activeSessionCount = this.countClaudeSessions() + this.findActiveGeminiFiles().length + this.countCodexSessions()

    console.log(`[BrainBed] Bootstrap: ${totalMessages} msgs today (${recentMessages} in 10min → ${this.stats.messageVelocity.toFixed(1)} msg/min), tokens: Claude=${totalTokensClaude} Gemini=${totalTokensGemini}, sessions: ${this.stats.activeSessionCount}`)
  }

  start() {
    this.bootstrapRecentActivity()
    this.intervalId = setInterval(() => this.checkLogs(), 10_000)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  getStats(): TokenStats {
    return { ...this.stats }
  }
}
