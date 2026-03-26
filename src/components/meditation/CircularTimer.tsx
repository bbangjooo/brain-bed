interface CircularTimerProps {
  remainingSeconds: number
  totalSeconds: number
}

export default function CircularTimer({
  remainingSeconds,
  totalSeconds,
}: CircularTimerProps) {
  const radius = 54
  const strokeWidth = 3
  const circumference = 2 * Math.PI * radius
  const progress = 1 - remainingSeconds / totalSeconds
  const offset = circumference * (1 - progress)

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 120 120"
        >
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        {/* Time text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-mono text-2xl font-light tracking-widest"
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  )
}
