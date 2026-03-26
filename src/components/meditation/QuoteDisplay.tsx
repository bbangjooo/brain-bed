import { useEffect, useState } from 'react'
import quotes from '../../data/quotes.json'

interface Quote {
  text: string
  author: string | null
}

const typedQuotes = quotes as Quote[]

export default function QuoteDisplay() {
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * typedQuotes.length)
  )
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex((prev) => {
          let next = prev
          while (next === prev) {
            next = Math.floor(Math.random() * typedQuotes.length)
          }
          return next
        })
        setIsVisible(true)
      }, 2000)
    }, 12_000)
    return () => clearInterval(interval)
  }, [])

  const quote = typedQuotes[currentIndex]

  return (
    <div className="flex flex-col items-center justify-center text-center px-12 w-full" style={{ minHeight: '160px' }}>
      <div
        className={`transition-all duration-[2000ms] ease-[var(--transition-breathe)] ${
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-[8px]'
        }`}
      >
        <p
          className="text-3xl leading-relaxed tracking-wide"
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 600,
            fontStyle: 'italic',
            color: 'rgba(255, 255, 255, 0.75)',
            textShadow: '0 0 30px rgba(139, 92, 246, 0.12)',
          }}
        >
          {quote.text}
        </p>
        {quote.author && (
          <p
            className="mt-4 text-lg tracking-widest"
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.45)',
            }}
          >
            — {quote.author}
          </p>
        )}
      </div>
    </div>
  )
}
