import { useState, useEffect } from 'react'
import BreathingCircle from '../meditation/BreathingCircle'
import Scene3D from '../meditation/Scene3D'

interface Props {
  userResponse: 'yes' | 'no' | null
  analyser: AnalyserNode | null
  onAdvance: () => void
}

export default function PhaseFirstTaste({ userResponse, analyser, onAdvance }: Props) {
  const [showGuide, setShowGuide] = useState(true)
  const [showText, setShowText] = useState(false)
  const duration = userResponse === 'no' ? 45 : 30

  useEffect(() => {
    // Hide tutorial guide after 6s
    const guideTimer = setTimeout(() => setShowGuide(false), 6000)
    // Show closing text after duration
    const textTimer = setTimeout(() => setShowText(true), duration * 1000)
    // Advance after text + 3s
    const advanceTimer = setTimeout(onAdvance, (duration + 3) * 1000)

    return () => {
      clearTimeout(guideTimer)
      clearTimeout(textTimer)
      clearTimeout(advanceTimer)
    }
  }, [duration, onAdvance])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
      <Scene3D analyser={analyser} />

      {/* Tutorial guide text — fades out after 6s */}
      <div
        className="absolute top-24 left-0 right-0 z-20 text-center"
        style={{
          opacity: showGuide && !showText ? 1 : 0,
          transition: 'opacity 1.5s ease',
          pointerEvents: 'none',
        }}
      >
        <p
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 24,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.5,
          }}
        >
          Follow the circle. Breathe in as it grows, out as it shrinks.
        </p>
      </div>

      {/* Breathing circle / closing text */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 relative">
        {!showText ? (
          <div className="flex items-center justify-center" style={{ animation: 'fadeIn 1500ms ease-out', width: 400, height: 400 }}>
            <BreathingCircle />
          </div>
        ) : (
          <p
            style={{
              animation: 'fadeIn 1500ms ease-out',
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 36,
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.5,
              textAlign: 'center',
              maxWidth: 480,
            }}
          >
            This space is always here for you.
          </p>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
