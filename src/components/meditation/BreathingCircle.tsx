import { useEffect, useRef } from 'react'

export default function BreathingCircle() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    let w: number, h: number

    function resize() {
      const dpr = window.devicePixelRatio || 1
      w = canvas!.clientWidth
      h = canvas!.clientHeight
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    // Breathing cycle: 4s inhale, 4s hold, 6s exhale, 2s hold = 16s
    const INHALE = 4, HOLD1 = 4, EXHALE = 6, HOLD2 = 2
    const CYCLE = INHALE + HOLD1 + EXHALE + HOLD2

    function getBreathPhase(t: number): { scale: number; label: string } {
      const phase = t % CYCLE
      if (phase < INHALE) {
        // Inhale — ease out (fast start, slow end)
        const p = phase / INHALE
        const eased = 1 - (1 - p) * (1 - p)
        return { scale: 0.45 + eased * 0.55, label: 'Breathe in' }
      }
      if (phase < INHALE + HOLD1) {
        return { scale: 1, label: 'Hold' }
      }
      if (phase < INHALE + HOLD1 + EXHALE) {
        // Exhale — ease in (slow start, fast end)
        const p = (phase - INHALE - HOLD1) / EXHALE
        const eased = p * p
        return { scale: 1 - eased * 0.55, label: 'Breathe out' }
      }
      return { scale: 0.45, label: 'Hold' }
    }

    let startTime = performance.now()

    function draw(now: number) {
      animRef.current = requestAnimationFrame(draw)
      const elapsed = (now - startTime) / 1000
      const { scale, label } = getBreathPhase(elapsed)

      ctx.clearRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2
      const maxR = Math.min(w, h) * 0.35
      const r = maxR * scale

      // Outer aurora glow
      for (let i = 4; i >= 0; i--) {
        const glowR = r + i * 12
        const alpha = 0.04 - i * 0.007
        ctx.beginPath()
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180, 100, 220, ${Math.max(0, alpha * scale)})`
        ctx.fill()
      }

      // Main circle — aurora gradient
      const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r)
      grad.addColorStop(0, `rgba(200, 160, 255, ${0.06 + scale * 0.08})`)
      grad.addColorStop(0.4, `rgba(140, 80, 220, ${0.04 + scale * 0.05})`)
      grad.addColorStop(0.7, `rgba(80, 140, 200, ${0.02 + scale * 0.03})`)
      grad.addColorStop(1, 'rgba(60, 120, 180, 0)')
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      // Ring border — soft white with aurora tint
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(200, 180, 255, ${0.08 + scale * 0.06})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Inner ring — subtle second border
      ctx.beginPath()
      ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(180, 140, 240, ${0.03 + scale * 0.02})`
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Label
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `italic ${Math.max(14, Math.round(maxR * 0.16))}px "Cormorant Garamond", Georgia, serif`
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + scale * 0.15})`
      ctx.fillText(label, cx, cy)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none"
      style={{ width: '280px', height: '280px' }}
    />
  )
}
