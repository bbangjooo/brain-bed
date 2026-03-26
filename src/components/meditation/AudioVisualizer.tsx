import { useEffect, useRef } from 'react'

interface AudioVisualizerProps {
  analyser: AnalyserNode | null
}

export default function AudioVisualizer({ analyser }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    if (!analyser || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      ctx!.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    function draw() {
      if (!ctx || !analyser) return
      animFrameRef.current = requestAnimationFrame(draw)

      analyser.getByteTimeDomainData(dataArray)

      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const centerY = h / 2

      ctx.clearRect(0, 0, w, h)

      ctx.beginPath()
      ctx.lineWidth = 1.5
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'

      const sliceWidth = w / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = v * centerY

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        x += sliceWidth
      }

      ctx.lineTo(w, centerY)
      ctx.stroke()
    }

    draw()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [analyser])

  if (!analyser) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute left-0 right-0 pointer-events-none"
      style={{ width: '100%', height: '48px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}
    />
  )
}
