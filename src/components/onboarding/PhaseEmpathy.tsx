import { useState, useEffect, useRef, useCallback } from 'react'

interface Props {
  onResponse: (response: 'yes' | 'no') => void
  onAdvance: () => void
}

const LINES = [
  "You've been working with AI today, haven't you?",
  'Prompts, outputs, context switches — one tool to the next, without a pause.',
  'Could you use a quiet moment?',
]

const RESPONSES = {
  yes: [
    "Then you're in the right place.",
    "First, a quick look at your day.",
  ],
  no: [
    "That's okay.",
    'Even the strongest minds need rest sometimes.',
  ],
}

export default function PhaseEmpathy({ onResponse, onAdvance }: Props) {
  const [visibleChars, setVisibleChars] = useState(0)
  const [currentLineIdx, setCurrentLineIdx] = useState(0)
  const [showButtons, setShowButtons] = useState(false)
  const [selected, setSelected] = useState<'yes' | 'no' | null>(null)
  const [responseLineIdx, setResponseLineIdx] = useState(0)
  const [responseChars, setResponseChars] = useState(0)
  const [responseComplete, setResponseComplete] = useState(false)
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Typewriter for main lines
  useEffect(() => {
    if (currentLineIdx >= LINES.length) {
      setTimeout(() => setShowButtons(true), 500)
      return
    }

    const line = LINES[currentLineIdx]
    setVisibleChars(0)

    const startTyping = () => {
      let chars = 0
      typingRef.current = setInterval(() => {
        chars++
        setVisibleChars(chars)
        if (chars >= line.length) {
          if (typingRef.current) clearInterval(typingRef.current)
          setTimeout(() => setCurrentLineIdx((i) => i + 1), 1500)
        }
      }, 40)
    }

    const delay = currentLineIdx === 0 ? 800 : 300
    const timer = setTimeout(startTyping, delay)

    return () => {
      clearTimeout(timer)
      if (typingRef.current) clearInterval(typingRef.current)
    }
  }, [currentLineIdx])

  // Typewriter for response lines
  useEffect(() => {
    if (!selected) return
    const lines = RESPONSES[selected]
    if (responseLineIdx >= lines.length) {
      setResponseComplete(true)
      setTimeout(onAdvance, 3000)
      return
    }

    const line = lines[responseLineIdx]
    setResponseChars(0)

    const timer = setTimeout(() => {
      let chars = 0
      const interval = setInterval(() => {
        chars++
        setResponseChars(chars)
        if (chars >= line.length) {
          clearInterval(interval)
          setTimeout(() => setResponseLineIdx((i) => i + 1), 1200)
        }
      }, 40)

      return () => clearInterval(interval)
    }, responseLineIdx === 0 ? 600 : 300)

    return () => clearTimeout(timer)
  }, [selected, responseLineIdx, onAdvance])

  const handleSelect = useCallback((choice: 'yes' | 'no') => {
    setSelected(choice)
    onResponse(choice)
  }, [onResponse])

  const renderLine = (text: string, chars: number, isLast: boolean) => {
    const visible = text.slice(0, chars)
    const showCursor = chars < text.length || (isLast && chars === text.length)
    return (
      <>
        {visible}
        {showCursor && (
          <span className="animate-pulse" style={{ color: 'rgba(255,255,255,0.5)' }}>|</span>
        )}
      </>
    )
  }

  return (
    <div className="max-w-[680px] text-center flex flex-col items-center gap-10">
      {/* Main narrative lines */}
      <div className="space-y-8">
        {LINES.map((line, idx) => {
          if (idx > currentLineIdx) return null
          const isCurrentLine = idx === currentLineIdx
          const chars = isCurrentLine ? visibleChars : line.length
          const isQuestion = idx === LINES.length - 1

          return (
            <p
              key={idx}
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: isQuestion ? 38 : 32,
                fontStyle: 'italic',
                color: selected && !isQuestion
                  ? 'rgba(255,255,255,0.3)'
                  : 'rgba(255,255,255,0.85)',
                lineHeight: 1.5,
                transition: 'color 800ms ease',
              }}
            >
              {renderLine(line, chars, isCurrentLine && currentLineIdx < LINES.length)}
            </p>
          )
        })}
      </div>

      {/* Yes/No buttons */}
      {showButtons && !selected && (
        <div
          className="flex gap-5 mt-4"
          style={{ animation: 'fadeIn 500ms ease-out' }}
        >
          <button
            onClick={() => handleSelect('yes')}
            className="px-10 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            style={{
              fontFamily: 'Inter, system-ui',
              fontSize: 16,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.6)',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              minWidth: 180,
            }}
          >
            Yes, I'm fine
          </button>
          <button
            onClick={() => handleSelect('no')}
            className="px-10 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            style={{
              fontFamily: 'Inter, system-ui',
              fontSize: 16,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.6)',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              minWidth: 180,
            }}
          >
            No, not really
          </button>
        </div>
      )}

      {/* Selected indicator */}
      {selected && (
        <div className="mt-2" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15, fontFamily: 'Inter, system-ui' }}>
          {selected === 'yes' ? 'Yes, I\'m fine' : 'No, not really'}
        </div>
      )}

      {/* Response text */}
      {selected && (
        <div className="space-y-6 mt-2">
          {RESPONSES[selected].map((line, idx) => {
            if (idx > responseLineIdx) return null
            const isCurrentLine = idx === responseLineIdx
            const chars = isCurrentLine ? responseChars : line.length

            return (
              <p
                key={idx}
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: 28,
                  fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.5,
                }}
              >
                {renderLine(line, chars, isCurrentLine && !responseComplete)}
              </p>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
