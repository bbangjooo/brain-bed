import { useCallback, useEffect, useRef, useState } from 'react'
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
        <div className="text-center mt-1">
          <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
            Your keyboard is locked. Press Cmd+Shift+Escape to exit early.
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
