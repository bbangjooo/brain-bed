import { useEffect, useState } from 'react'

const MODE_LABELS: Record<string, string> = {
  refresh: 'Refresh',
  rhythm: 'Rhythm',
}

const MODE_ICONS: Record<string, string> = {
  refresh: '\u2705',
  rhythm: '\uD83C\uDFB9',
}

interface CompletionScreenProps {
  durationMinutes: number
  mode?: string | null
  onClose: () => void
}

export default function CompletionScreen({ durationMinutes, mode, onClose }: CompletionScreenProps) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [onClose])

  const icon = mode ? MODE_ICONS[mode] || '' : ''
  const label = mode ? MODE_LABELS[mode] || '' : ''

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center animate-fade-in">
      <p
        className="font-display text-4xl md:text-5xl mb-4"
        style={{ color: 'rgba(255, 255, 255, 0.9)' }}
      >
        Context switched.
      </p>
      {mode && (
        <p
          className="text-base mb-2"
          style={{ color: 'rgba(255, 255, 255, 0.5)' }}
        >
          {icon} {label}
        </p>
      )}
      <p
        className="text-lg mb-12"
        style={{ color: 'rgba(255, 255, 255, 0.5)' }}
      >
        {durationMinutes} min break complete.
      </p>
      <p
        className="text-sm"
        style={{ color: 'rgba(255, 255, 255, 0.3)' }}
      >
        Returning in {countdown}s...
      </p>
    </div>
  )
}
