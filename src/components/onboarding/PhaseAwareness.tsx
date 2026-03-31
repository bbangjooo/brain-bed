import { useState, useEffect, useCallback } from 'react'
import type { BfiStage } from '../../types/electron'

interface ScanData {
  totalTokens: number
  activeToolCount: number
  latestTime: string | null
  bfiStage: BfiStage
}

type Step = 'scanning' | 'results'

export default function PhaseAwareness({ onAdvance }: { onAdvance: () => void }) {
  const [step, setStep] = useState<Step>('scanning')
  const [scanData, setScanData] = useState<ScanData | null>(null)
  const [visibleStats, setVisibleStats] = useState(0)
  const [showClosing, setShowClosing] = useState(false)

  // Scan: fetch data, then show results
  useEffect(() => {
    if (step !== 'scanning') return

    const fetchData = async () => {
      try {
        const data = await window.electronAPI?.onboardingGetScanData()
        setScanData(data || null)
      } catch {
        setScanData(null)
      }
      setTimeout(() => setStep('results'), 2500)
    }

    fetchData()
  }, [step])

  // Results step: stagger stats, then closing text
  useEffect(() => {
    if (step !== 'results') return

    const hasData = scanData && scanData.totalTokens > 0

    if (hasData) {
      const statCount = 3
      let shown = 0
      const interval = setInterval(() => {
        shown++
        setVisibleStats(shown)
        if (shown >= statCount) {
          clearInterval(interval)
          setTimeout(() => setShowClosing(true), 800)
          setTimeout(onAdvance, 4000)
        }
      }, 600)
      return () => clearInterval(interval)
    } else {
      setShowClosing(true)
      setTimeout(onAdvance, 4000)
    }
  }, [step, scanData, onAdvance])

  const closingMessage = useCallback((stage: BfiStage | undefined): string => {
    switch (stage) {
      case 'brain-fry': return 'Your brain is running hot. You need this.'
      case 'heating': return 'Your brain has been working hard.'
      case 'warming': return "You're getting warmed up. Good to stay aware."
      case 'calm':
      default: return "All quiet for now. I'll be here when it's not."
    }
  }, [])

  const formatTokens = useCallback((n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return String(n)
  }, [])

  return (
    <div className="max-w-[520px] text-center flex flex-col items-center">
      {/* Scanning step */}
      {step === 'scanning' && (
        <div style={{ animation: 'fadeIn 800ms ease-out' }}>
          <p
            className="mb-12"
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 28,
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.5,
            }}
          >
            Let me take a look at how you've been working...
          </p>
          <div className="flex gap-4 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: 'rgba(129, 140, 248, 0.6)',
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results step */}
      {step === 'results' && (
        <div style={{ animation: 'fadeIn 800ms ease-out' }}>
          {scanData && scanData.totalTokens > 0 ? (
            <>
              <div className="space-y-5 mb-12">
                {visibleStats >= 1 && (
                  <div
                    className="flex items-center justify-center gap-3"
                    style={{
                      animation: 'fadeInUp 500ms ease-out',
                      fontFamily: '"DM Sans", system-ui',
                      fontSize: 16,
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    {formatTokens(scanData.totalTokens)} tokens processed today
                  </div>
                )}
                {visibleStats >= 2 && (
                  <div
                    className="flex items-center justify-center gap-3"
                    style={{
                      animation: 'fadeInUp 500ms ease-out',
                      fontFamily: '"DM Sans", system-ui',
                      fontSize: 16,
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                    {scanData.activeToolCount} AI tool{scanData.activeToolCount !== 1 ? 's' : ''} active
                  </div>
                )}
                {visibleStats >= 3 && scanData.latestTime && (
                  <div
                    className="flex items-center justify-center gap-3"
                    style={{
                      animation: 'fadeInUp 500ms ease-out',
                      fontFamily: '"DM Sans", system-ui',
                      fontSize: 16,
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 20V10M12 20V4M6 20v-6" />
                    </svg>
                    Latest session at {scanData.latestTime}
                  </div>
                )}
              </div>
              {showClosing && (
                <p
                  style={{
                    animation: 'fadeIn 800ms ease-out',
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontSize: 32,
                    fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.5,
                  }}
                >
                  {closingMessage(scanData?.bfiStage)}
                </p>
              )}
            </>
          ) : (
            <div className="space-y-8">
              <p
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: 28,
                  fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.5,
                }}
              >
                I don't see any data yet — but I'll start watching once you begin.
              </p>
              {showClosing && (
                <p
                  style={{
                    animation: 'fadeIn 800ms ease-out',
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontSize: 32,
                    fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.5,
                  }}
                >
                  When things get intense, I'll be here.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.5); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
