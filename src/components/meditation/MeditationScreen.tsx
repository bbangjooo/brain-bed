import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import GradientBackground from './GradientBackground'
import Scene3D from './Scene3D'
import QuoteDisplay from './QuoteDisplay'
import CircularTimer from './CircularTimer'
import AudioPlayer from './AudioPlayer'

import BreathingCircle from './BreathingCircle'
import ExitConfirmDialog from './ExitConfirmDialog'
import CompletionScreen from './CompletionScreen'
import TimeSelector from './TimeSelector'

type Phase = 'loading' | 'selecting' | 'active' | 'completed'

export default function MeditationScreen() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [defaultMinutes, setDefaultMinutes] = useState(10)
  const [totalSeconds, setTotalSeconds] = useState(600)
  const [remainingSeconds, setRemainingSeconds] = useState(600)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [musicAutoplay, setMusicAutoplay] = useState(true)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Disable right-click
  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault()
    window.addEventListener('contextmenu', handler)
    return () => window.removeEventListener('contextmenu', handler)
  }, [])

  // IPC listeners
  useEffect(() => {
    if (!window.electronAPI) return

    const unsubSelect = window.electronAPI.onMeditationSelect((data) => {
      setDefaultMinutes(data.defaultMinutes)
      setMusicAutoplay(data.musicAutoplay)
      setPhase('selecting')
    })

    // Signal main process that listeners are ready
    window.electronAPI.meditationReady?.()

    const unsubStart = window.electronAPI.onMeditationStart((data) => {
      setTotalSeconds(data.duration)
      setRemainingSeconds(data.duration)
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

  const handleSelectDuration = useCallback((minutes: number) => {
    window.electronAPI?.selectDuration(minutes * 60)
  }, [])

  const handleComplete = useCallback(() => {
    window.electronAPI?.endMeditation(true)
  }, [])

  const handleExitConfirm = useCallback(() => {
    setShowExitDialog(false)
    window.electronAPI?.endMeditation(false)
  }, [])

  const handleContinue = useCallback(() => {
    setShowExitDialog(false)
  }, [])

  const handleAnalyserReady = useCallback((node: AnalyserNode) => {
    setAnalyser(node)
  }, [])

  // Long-press exit
  const [holdProgress, setHoldProgress] = useState(0)
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const HOLD_DURATION = 3000 // 3 seconds
  const HOLD_INTERVAL = 50

  const startHold = useCallback(() => {
    let elapsed = 0
    holdTimerRef.current = setInterval(() => {
      elapsed += HOLD_INTERVAL
      const progress = Math.min(elapsed / HOLD_DURATION, 1)
      setHoldProgress(progress)
      if (progress >= 1) {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current)
        holdTimerRef.current = null
        setShowExitDialog(true)
        setHoldProgress(0)
      }
    }, HOLD_INTERVAL)
  }, [])

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current)
      holdTimerRef.current = null
    }
    setHoldProgress(0)
  }, [])

  if (phase === 'loading') {
    return (
      <div className="meditation-window w-full h-full">
        <GradientBackground />
      </div>
    )
  }

  // Time selection
  if (phase === 'selecting') {
    return (
      <div className="meditation-window w-full h-full relative overflow-hidden">
        <GradientBackground />
        <Scene3D analyser={null} />
        <TimeSelector
          defaultMinutes={defaultMinutes}
          onSelect={handleSelectDuration}
        />
      </div>
    )
  }

  // Completed
  if (phase === 'completed') {
    return (
      <div className="meditation-window w-full h-full relative overflow-hidden">
        <GradientBackground />
        <Scene3D analyser={null} />
        <CompletionScreen
          durationMinutes={Math.round(totalSeconds / 60)}
          onClose={handleComplete}
        />
      </div>
    )
  }

  // Active meditation
  return (
    <div className="meditation-window meditation-mode w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      <GradientBackground />
      <Scene3D analyser={analyser} />

      {/* Breathing circle + quote */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 relative w-full -mt-12">
        <BreathingCircle />
        <div className="mt-6">
          <QuoteDisplay />
        </div>
      </div>

      {/* Bottom: timer + audio + guide */}
      <div className="relative z-10 pb-8 flex flex-col items-center gap-4 w-full">
        <CircularTimer
          remainingSeconds={remainingSeconds}
          totalSeconds={totalSeconds}
        />
        <AudioPlayer autoplay={musicAutoplay} onAnalyserReady={handleAnalyserReady} />
        <div className="flex flex-col items-center gap-2 mt-1">
          <button
            onPointerDown={startHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            className="relative w-11 h-11 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255, 255, 255, 0.08)' }}
          >
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
              <circle
                cx="22" cy="22" r="20" fill="none"
                stroke="#a78bfa"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - holdProgress)}`}
                style={{ transition: holdProgress === 0 ? 'stroke-dashoffset 0.15s' : 'none' }}
              />
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </button>
          <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.2)' }}>
            Hold to exit
          </p>
        </div>
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
