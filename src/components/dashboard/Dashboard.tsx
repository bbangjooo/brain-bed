import { useEffect, useState, type ReactNode } from 'react'
import type { AppStatus, BfiStage } from '../../types/electron'

interface DashboardProps {
  onNavigate: (route: 'dashboard' | 'settings') => void
}

const STAGE_CONFIG: Record<BfiStage, { color: string; gradient: string; label: string; icon: ReactNode }> = {
  calm: {
    color: '#22c55e',
    gradient: 'rgba(34, 197, 94, 0.6)',
    label: 'Calm',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8c.7-1 1-2.2 1-3.5C18 2.5 16.5 1 14.5 1c-1.2 0-2.3.5-3 1.3C10.8 1.5 9.7 1 8.5 1 6.5 1 5 2.5 5 4.5 5 5.8 5.3 7 6 8" />
        <path d="M6 8c-1.6 1-3 3.2-3 6 0 5 4 8 8.5 8s8.5-3 8.5-8c0-2.8-1.4-5-3-6" />
        <path d="M12 22V8" />
      </svg>
    ),
  },
  warming: {
    color: '#eab308',
    gradient: 'rgba(234, 179, 8, 0.6)',
    label: 'Warming',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    ),
  },
  heating: {
    color: '#f97316',
    gradient: 'rgba(249, 115, 22, 0.6)',
    label: 'Heating',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14 0-5.5 3-7 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.5-2.25 1.5-3" />
      </svg>
    ),
  },
  'brain-fry': {
    color: '#ef4444',
    gradient: 'rgba(239, 68, 68, 0.6)',
    label: 'Brain Fry',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [status, setStatus] = useState<AppStatus>({
    elapsedMinutes: 0,
    threshold: 60,
    tokenStats: { totalTokens: 0, byTool: {}, lastUpdated: 0, velocity: 0, messageCount: 0, messageVelocity: 0 },
    isMeditating: false,
    bfi: 0,
    bfiStage: 'calm',
    tokenVelocity: 0,
    messageVelocity: 0,
    messageCount: 0,
    activeTools: [],
    activeSessionCount: 0,
  })
  const [showDetails, setShowDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    window.electronAPI?.getStatus().then((data) => {
      setStatus(data)
      setIsLoading(false)
    })
    const unsub = window.electronAPI?.onStatusUpdate((data) => {
      setStatus(data)
      setIsLoading(false)
    })
    return () => unsub?.()
  }, [])

  const stage = STAGE_CONFIG[status.bfiStage] || STAGE_CONFIG.calm
  const bfiPercent = Math.min(status.bfi, 100)
  const circumference = 2 * Math.PI * 52
  const toolEntries = Object.entries(status.tokenStats.byTool)

  return (
    <div className="h-full flex flex-col" style={{ background: '#0f0c29' }}>
      {/* Draggable title bar */}
      <div
        className="h-12 flex items-center justify-between px-4 shrink-0"
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        <span className="text-xs font-medium tracking-wider uppercase"
          style={{ color: 'rgba(255,255,255,0.35)', marginLeft: 60 }}>
          Brain Bed
        </span>
        <button
          onClick={() => onNavigate('settings')}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)', WebkitAppRegion: 'no-drag' } as any}
          title="Settings"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pb-6 gap-5 overflow-y-auto">

        {/* BFI Gauge */}
        <div className="flex flex-col items-center pt-2">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none"
                stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle cx="60" cy="60" r="52" fill="none"
                stroke={stage.gradient} strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={`${circumference * (1 - bfiPercent / 100)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isLoading ? (
                <>
                  <span className="text-lg font-medium tracking-wide animate-pulse"
                    style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans, system-ui' }}>
                    Calculating...
                  </span>
                </>
              ) : (
                <>
                  <span className="text-5xl font-bold tracking-tight transition-colors duration-500"
                    style={{ color: stage.color, fontFamily: 'DM Sans, system-ui' }}>
                    {status.bfi}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1" style={{ color: stage.color }}>
                    {stage.icon}
                    <span className="text-xs font-medium tracking-wide">
                      {stage.label}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats below gauge */}
          <div className="flex flex-col items-center gap-1 mt-3">
            <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span>{formatTokens(status.tokenStats.totalTokens)} tokens</span>
              {status.tokenVelocity > 0 && (
                <>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                  <span>{formatTokens(status.tokenVelocity)}/min</span>
                </>
              )}
            </div>
          </div>

          {/* Details toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            style={{
              color: 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              className={`transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            {showDetails ? 'Hide details' : 'Details'}
          </button>

          {/* Detail panel */}
          {showDetails && (
            <div className="w-full mt-2 rounded-xl p-4 text-xs" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="space-y-3">
                {/* Message Rate */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Message Rate</span>
                    <span className="font-mono" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {status.messageVelocity.toFixed(1)} msg/min
                    </span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((status.messageVelocity / 5) * 100, 100)}%`, background: stage.gradient }} />
                  </div>
                </div>

                {/* Sessions */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Sessions</span>
                    <span className="font-mono" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {status.activeSessionCount} active
                    </span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((status.activeSessionCount / 4) * 100, 100)}%`, background: stage.gradient }} />
                  </div>
                </div>

                {/* Late Night */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Late Night</span>
                    <span className="font-mono" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {(() => { const h = new Date().getHours(); return (h >= 22 || h < 6) ? 'Yes' : 'No' })()}
                    </span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: (() => { const h = new Date().getHours(); return (h >= 22 || h < 6) ? '100%' : '0%' })(), background: stage.gradient }} />
                  </div>
                </div>

                {/* Token Usage */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Token Usage</span>
                    <span className="font-mono" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {formatTokens(status.tokenStats.totalTokens)} ({formatTokens(status.tokenVelocity)}/min)
                    </span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((status.tokenVelocity / 2000) * 100, 100)}%`, background: stage.gradient }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Token usage breakdown */}
        {toolEntries.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                Token Usage Today
              </span>
              <span className="text-sm font-mono"
                style={{ color: 'rgba(255,255,255,0.7)' }}>
                {formatTokens(status.tokenStats.totalTokens)}
              </span>
            </div>

            <div className="space-y-2">
              {toolEntries.map(([tool, tokens]) => (
                <div key={tool} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {tool}
                      </span>
                      <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {formatTokens(tokens)}
                      </span>
                    </div>
                    <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((tokens / Math.max(status.tokenStats.totalTokens, 1)) * 100, 100)}%`,
                          background: stage.gradient,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Take a break button */}
        <button
          onClick={() => window.electronAPI?.takeBreak()}
          disabled={status.isMeditating}
          className="w-full py-3.5 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: status.isMeditating
              ? 'rgba(255,255,255,0.05)'
              : 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4))',
            color: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {status.isMeditating ? 'Meditating...' : 'Take a Break'}
        </button>
      </div>
    </div>
  )
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}
