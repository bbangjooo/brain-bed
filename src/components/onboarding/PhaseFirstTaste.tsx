import { useState, useEffect } from 'react'
import Scene3D from '../meditation/Scene3D'

interface Props {
  userResponse: 'yes' | 'no' | null
  analyser: AnalyserNode | null
  onAdvance: () => void
}

export default function PhaseFirstTaste({ userResponse, analyser, onAdvance }: Props) {
  const [showText, setShowText] = useState(false)
  const [showClosing, setShowClosing] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowText(true), 800)
    const t2 = setTimeout(() => setShowClosing(true), 8000)
    const t3 = setTimeout(onAdvance, 12000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onAdvance])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
      <Scene3D analyser={analyser} />

      <div className="flex-1 flex flex-col items-center justify-center z-10 relative">
        {!showClosing ? (
          <div
            className="flex flex-col items-center gap-6 px-8"
            style={{
              opacity: showText ? 1 : 0,
              transition: 'opacity 1.5s ease',
            }}
          >
            <p
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: 28,
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.5,
                textAlign: 'center',
                maxWidth: 480,
              }}
            >
              When your brain needs a break, we'll show you real things to do.
            </p>
            <p
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: 22,
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.4)',
                lineHeight: 1.5,
                textAlign: 'center',
                maxWidth: 420,
              }}
            >
              A walk. A stretch. A cup of tea. Something away from the screen.
            </p>
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
            The real world is always here for you.
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
