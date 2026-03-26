import { useEffect, useState } from 'react'

const GRADIENT_SETS = [
  ['#0f0c29', '#302b63', '#24243e'],
  ['#0d1b2a', '#1b2838', '#2c3e50'],
  ['#1a1a2e', '#16213e', '#0f3460'],
  ['#1b1b1b', '#2d2d2d', '#1b1b1b'],
  ['#0a0a23', '#1a1a3e', '#2a1a3e'],
]

export default function GradientBackground() {
  const [setIndex, setSetIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSetIndex((prev) => (prev + 1) % GRADIENT_SETS.length)
    }, 15_000)
    return () => clearInterval(interval)
  }, [])

  const colors = GRADIENT_SETS[setIndex]

  return (
    <div
      className="fixed inset-0 -z-10"
      style={{
        background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]})`,
        backgroundSize: '400% 400%',
        animation: 'gradient-shift 10s ease infinite',
        transition: 'background 3s var(--transition-gentle)',
      }}
    />
  )
}
