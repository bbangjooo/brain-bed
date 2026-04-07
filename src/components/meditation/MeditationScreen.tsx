import { useCallback, useEffect, useRef, useState } from 'react'
import GradientBackground from './GradientBackground'
import Scene3D from './Scene3D'
import CircularTimer from './CircularTimer'
import AudioPlayer from './AudioPlayer'
import ExitConfirmDialog from './ExitConfirmDialog'
import CompletionScreen from './CompletionScreen'
import RefreshMode from '../modes/RefreshMode'
import { track } from '../../analytics'

type Phase = 'loading' | 'active' | 'completed'

export default function MeditationScreen() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [totalSeconds, setTotalSeconds] = useState(600)
  const [remainingSeconds, setRemainingSeconds] = useState(600)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [musicAutoplay, setMusicAutoplay] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Disable right-click
  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault()
    window.addEventListener('contextmenu', handler)
    return () => window.removeEventListener('contextmenu', handler)
  }, [])

  // IPC listeners — use configured duration from settings
  useEffect(() => {
    if (!window.electronAPI) return

    const unsubSelect = window.electronAPI.onMeditationSelect((data) => {
      setMusicAutoplay(data.musicAutoplay)
      const duration = data.defaultMinutes * 60
      setTotalSeconds(duration)
      setRemainingSeconds(duration)
      window.electronAPI?.selectDuration(duration)
    })

    window.electronAPI.meditationReady?.()

    const unsubStart = window.electronAPI.onMeditationStart((data) => {
      const duration = data.duration
      setTotalSeconds(duration)
      setRemainingSeconds(duration)
      setMusicAutoplay(data.musicAutoplay)
      setPhase('active')
    })

    const unsubExit = window.electronAPI.onShowExitDialog(() => {
      setShowExitDialog(true)
    })

    return () => {
      unsubSelect()
      unsubStart()
      unsubExit()
    }
  }, [])

  // Timer
  useEffect(() => {
    if (phase !== 'active') return

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setPhase('completed')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase])

  const handleComplete = useCallback(() => {
    track('context_switch_completed', {
      mode: 'refresh',
      duration_seconds: totalSeconds,
      completed_full: true,
    })
    window.electronAPI?.endMeditation(true)
  }, [])

  const handleExitConfirm = useCallback(() => {
    track('context_switch_exited', {
      mode: 'refresh',
      remaining_seconds: remainingSeconds,
      total_seconds: totalSeconds,
    })
    setShowExitDialog(false)
    window.electronAPI?.endMeditation(false)
  }, [remainingSeconds])

  const handleContinue = useCallback(() => {
    setShowExitDialog(false)
  }, [])

  // Long-press exit
  const [holdProgress, setHoldProgress] = useState(0)
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startHold = useCallback(() => {
    let elapsed = 0
    holdTimerRef.current = setInterval(() => {
      elapsed += 50
      const progress = Math.min(elapsed / 1500, 1)
      setHoldProgress(progress)
      if (progress >= 1) {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current)
        holdTimerRef.current = null
        setShowExitDialog(true)
        setHoldProgress(0)
      }
    }, 50)
  }, [])

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current)
      holdTimerRef.current = null
    }
    setHoldProgress(0)
  }, [])

  // --- RENDER ---

  if (phase === 'loading') {
    return (
      <div className="meditation-window w-full h-full">
        <GradientBackground />
      </div>
    )
  }

  if (phase === 'completed') {
    return (
      <div className="meditation-window w-full h-full relative overflow-hidden">
        <GradientBackground />
        <Scene3D analyser={null} />
        <CompletionScreen
          durationMinutes={Math.round(totalSeconds / 60)}
          mode="refresh"
          onClose={handleComplete}
        />
      </div>
    )
  }

  // Active
  return (
    <div className="meditation-window meditation-mode w-full h-full relative overflow-hidden">
      <GradientBackground />
      <Scene3D analyser={null} />

      <RefreshMode />

      {/* Timer (top right) */}
      <div className="absolute top-5 right-5 z-20">
        <CircularTimer
          remainingSeconds={remainingSeconds}
          totalSeconds={totalSeconds}
        />
      </div>

      {/* Music */}
      <div className="absolute bottom-4 left-4 z-20">
        <AudioPlayer autoplay={musicAutoplay} />
      </div>

      {/* Hold-to-exit */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <span className="text-[10px]" style={{ color: 'rgba(255, 255, 255, 0.15)' }}>
          hold to exit
        </span>
        <button
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          className="relative w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255, 255, 255, 0.06)' }}
        >
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
            <circle
              cx="18" cy="18" r="16" fill="none"
              stroke="#a78bfa"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - holdProgress)}`}
              style={{ transition: holdProgress === 0 ? 'stroke-dashoffset 0.15s' : 'none' }}
            />
          </svg>
          <span className="text-sm" style={{ lineHeight: 1 }}>
            {'\uD83D\uDEAA'}
          </span>
        </button>
      </div>

      {showExitDialog && (
        <ExitConfirmDialog
          remainingMinutes={Math.ceil(remainingSeconds / 60)}
          onContinue={handleContinue}
          onExit={handleExitConfirm}
        />
      )}
    </div>
  )
}
