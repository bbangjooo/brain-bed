import { useState, useCallback, useEffect, useRef } from 'react'
import GradientBackground from '../meditation/GradientBackground'
import PhaseEmpathy from './PhaseEmpathy'
import PhaseAwareness from './PhaseAwareness'
import PhasePromise from './PhasePromise'
import PhaseFirstTaste from './PhaseFirstTaste'
import PhaseSetup from './PhaseSetup'

type Phase = 'empathy' | 'awareness' | 'promise' | 'firstTaste' | 'setup'

const PHASE_ORDER: Phase[] = ['empathy', 'awareness', 'promise', 'firstTaste', 'setup']

export default function OnboardingScreen() {
  const [phase, setPhase] = useState<Phase>('empathy')
  const [transitioning, setTransitioning] = useState(false)
  const [userResponse, setUserResponse] = useState<'yes' | 'no' | null>(null)
  const [exiting, setExiting] = useState(false)
  const [volume, setVolume] = useState(0.4)
  const [showSoundHint, setShowSoundHint] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const targetVolRef = useRef(0.4)

  // Play Le Cygne on mount, fade in
  useEffect(() => {
    const audio = new Audio('media:///le-cygne.mp3')
    audio.loop = true
    audio.volume = 0
    audioRef.current = audio

    audio.addEventListener('canplay', () => {
      audio.play().catch(() => {})
      let vol = 0
      const interval = setInterval(() => {
        vol += 0.02
        if (vol >= targetVolRef.current) {
          audio.volume = targetVolRef.current
          clearInterval(interval)
        } else {
          audio.volume = vol
        }
      }, 60)
    }, { once: true })

    // Hide sound hint after 8s
    const hintTimer = setTimeout(() => setShowSoundHint(false), 8000)

    return () => {
      audio.pause()
      audio.src = ''
      clearTimeout(hintTimer)
    }
  }, [])

  // Fade out music when exiting
  useEffect(() => {
    if (!exiting || !audioRef.current) return
    const audio = audioRef.current
    let vol = audio.volume
    const interval = setInterval(() => {
      vol -= 0.02
      if (vol <= 0) {
        audio.volume = 0
        audio.pause()
        clearInterval(interval)
      } else {
        audio.volume = vol
      }
    }, 60)
    return () => clearInterval(interval)
  }, [exiting])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    targetVolRef.current = v
    if (audioRef.current) {
      audioRef.current.volume = v
    }
  }, [])

  const advancePhase = useCallback(() => {
    const idx = PHASE_ORDER.indexOf(phase)
    if (idx >= PHASE_ORDER.length - 1) return

    setTransitioning(true)
    setTimeout(() => {
      setPhase(PHASE_ORDER[idx + 1])
      setTimeout(() => setTransitioning(false), 50)
    }, 800)
  }, [phase])

  const handleSkip = useCallback(() => {
    setExiting(true)
    setTimeout(() => {
      window.electronAPI?.onboardingComplete({
        default_meditation_minutes: 10,
        late_night_enabled: true,
        launch_at_login: false,
      })
    }, 2500)
  }, [])

  const handleComplete = useCallback((settings: {
    default_meditation_minutes: number
    late_night_enabled: boolean
    launch_at_login: boolean
  }) => {
    setExiting(true)
    setTimeout(() => {
      window.electronAPI?.onboardingComplete(settings)
    }, 2500)
  }, [])

  const handleEmpathyResponse = useCallback((response: 'yes' | 'no') => {
    setUserResponse(response)
  }, [])

  return (
    <div
      className="h-full w-full relative overflow-hidden"
      style={{
        background: '#050510',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 2.5s ease',
      }}
    >
      <GradientBackground />

      {/* Drag region */}
      <div
        className="absolute top-0 left-0 right-0 h-12 z-50"
        style={{ WebkitAppRegion: 'drag' } as any}
      />

      {/* Phase content */}
      <div
        className="h-full w-full flex flex-col items-center justify-center relative z-10 px-12"
        style={{
          opacity: transitioning ? 0 : 1,
          transition: 'opacity 800ms ease',
        }}
      >
        {phase === 'empathy' && (
          <PhaseEmpathy
            onResponse={handleEmpathyResponse}
            onAdvance={advancePhase}
          />
        )}
        {phase === 'awareness' && (
          <PhaseAwareness onAdvance={advancePhase} />
        )}
        {phase === 'promise' && (
          <PhasePromise onAdvance={advancePhase} />
        )}
        {phase === 'firstTaste' && (
          <PhaseFirstTaste
            userResponse={userResponse}
            analyser={null}
            onAdvance={advancePhase}
          />
        )}
        {phase === 'setup' && (
          <PhaseSetup onComplete={handleComplete} />
        )}
      </div>

      {/* Sound hint — appears at start, fades after 8s */}
      <div
        className="absolute top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2"
        style={{
          opacity: showSoundHint ? 1 : 0,
          transition: 'opacity 1.5s ease',
          pointerEvents: 'none',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
        <span
          style={{
            fontFamily: 'Inter, system-ui',
            fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          Turn your sound on for the best experience
        </span>
      </div>

      {/* Bottom bar: volume + skip */}
      {!exiting && (
        <div className="absolute bottom-8 left-0 right-0 z-50 flex items-center justify-between px-8">
          {/* Volume slider */}
          <div className="flex items-center gap-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgba(255,255,255,0.4) ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`,
              }}
            />
          </div>

          {/* Skip */}
          <button
            onClick={handleSkip}
            className="transition-opacity hover:opacity-60"
            style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, fontFamily: 'Inter, system-ui' }}
          >
            Skip
          </button>
        </div>
      )}
    </div>
  )
}
