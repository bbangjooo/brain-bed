import { useEffect, useState } from 'react'

interface CompletionScreenProps {
  durationMinutes: number
  onClose: () => void
}

export default function CompletionScreen({ durationMinutes, onClose }: CompletionScreenProps) {
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

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center animate-fade-in">
      <p
        className="font-display text-4xl md:text-5xl mb-4"
        style={{ color: 'rgba(255, 255, 255, 0.9)' }}
      >
        Well done.
      </p>
      <p
        className="text-lg mb-12"
        style={{ color: 'rgba(255, 255, 255, 0.5)' }}
      >
        You rested for {durationMinutes} minutes.
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
