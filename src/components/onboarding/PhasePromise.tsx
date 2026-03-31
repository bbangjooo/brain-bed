import { useState, useEffect, useRef } from 'react'
import type { BfiStage } from '../../types/electron'

const PROMISES = [
  'This is your Brain Fry Index.',
  'When things heat up, I\'ll let you know.',
  'When you need peace, I\'ll open a door.',
]

const STAGE_CONFIG: Record<BfiStage, { color: string; label: string }> = {
  calm: { color: '#22c55e', label: 'Calm' },
  warming: { color: '#eab308', label: 'Warming' },
  heating: { color: '#f97316', label: 'Heating' },
  'brain-fry': { color: '#ef4444', label: 'Brain Fry' },
}

function getStage(score: number): BfiStage {
  if (score >= 85) return 'brain-fry'
  if (score >= 60) return 'heating'
  if (score >= 30) return 'warming'
  return 'calm'
}

export default function PhasePromise({ onAdvance }: { onAdvance: () => void }) {
  const [bfiValue, setBfiValue] = useState(0)
  const [targetBfi, setTargetBfi] = useState(0)
  const [lineIdx, setLineIdx] = useState(-1)
  const [lineChars, setLineChars] = useState(0)
  const animRef = useRef<number>(0)

  // Fetch real BFI
  useEffect(() => {
    window.electronAPI?.getStatus().then((status) => {
      setTargetBfi(Math.max(status.bfi, 1))
    }).catch(() => {
      setTargetBfi(5)
    })
  }, [])

  // Animate BFI gauge from 0 to target
  useEffect(() => {
    if (targetBfi === 0) return
    const start = performance.now()
    const duration = 2000

    function animate(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - (1 - progress) * (1 - progress)
      setBfiValue(Math.round(eased * targetBfi))

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setTimeout(() => setLineIdx(0), 500)
      }
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [targetBfi])

  // Typewriter for promise lines
  useEffect(() => {
    if (lineIdx < 0 || lineIdx >= PROMISES.length) {
      if (lineIdx >= PROMISES.length) {
        setTimeout(onAdvance, 3000)
      }
      return
    }

    const line = PROMISES[lineIdx]
    setLineChars(0)
    let chars = 0

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        chars++
        setLineChars(chars)
        if (chars >= line.length) {
          clearInterval(interval)
          setTimeout(() => setLineIdx((i) => i + 1), 1200)
        }
      }, 40)

      return () => clearInterval(interval)
    }, lineIdx === 0 ? 200 : 300)

    return () => clearTimeout(timer)
  }, [lineIdx, onAdvance])

  const stage = getStage(bfiValue)
  const config = STAGE_CONFIG[stage]
  const circumference = 2 * Math.PI * 42
  const strokeOffset = circumference * (1 - bfiValue / 100)

  return (
    <div className="max-w-[520px] text-center flex flex-col items-center gap-10">
      {/* BFI Gauge */}
      <div
        className="relative w-[180px] h-[180px]"
        style={{ animation: 'fadeIn 800ms ease-out' }}
      >
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth="4"
          />
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke={config.color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${strokeOffset}`}
            style={{ transition: 'stroke-dashoffset 100ms linear, stroke 500ms ease' }}
            opacity={0.6}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-bold tracking-tight transition-colors duration-500"
            style={{ color: config.color, fontFamily: '"DM Sans", system-ui' }}
          >
            {bfiValue}
          </span>
          <div className="flex items-center gap-1.5 mt-1 transition-colors duration-500" style={{ color: config.color }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{config.label}</span>
          </div>
        </div>
      </div>

      {/* Promise lines */}
      <div className="space-y-6">
        {PROMISES.map((line, idx) => {
          if (idx > lineIdx || lineIdx < 0) return null
          const isCurrentLine = idx === lineIdx
          const chars = isCurrentLine ? lineChars : line.length
          const visible = line.slice(0, chars)

          return (
            <p
              key={idx}
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: idx === 0 ? 28 : 26,
                fontStyle: 'italic',
                color: idx === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.75)',
                lineHeight: 1.5,
              }}
            >
              {visible}
              {isCurrentLine && chars < line.length && (
                <span className="animate-pulse" style={{ color: 'rgba(255,255,255,0.5)' }}>|</span>
              )}
            </p>
          )
        })}
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
