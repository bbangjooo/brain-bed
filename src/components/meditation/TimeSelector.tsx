import { useRef, useState } from 'react'

const DURATIONS = [5, 10, 15, 20, 30]

interface TimeSelectorProps {
  defaultMinutes: number
  onSelect: (minutes: number) => void
}

export default function TimeSelector({ defaultMinutes, onSelect }: TimeSelectorProps) {
  const [selected, setSelected] = useState(defaultMinutes)
  const [isCustom, setIsCustom] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const customInputRef = useRef<HTMLInputElement>(null)

  function handleCustomClick() {
    setIsCustom(true)
    setSelected(0)
    setTimeout(() => customInputRef.current?.focus(), 0)
  }

  function handleCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    if (raw === '') {
      setCustomValue('')
      setSelected(0)
      return
    }
    const num = Math.min(Number(raw), 180)
    setCustomValue(String(num))
    setSelected(num)
  }

  function handlePresetClick(min: number) {
    setIsCustom(false)
    setCustomValue('')
    setSelected(min)
  }

  return (
    <div className="relative z-10 h-full flex flex-col items-center justify-center px-10">
      {/* Close button */}
      <button
        onClick={() => window.electronAPI?.cancelMeditation()}
        className="absolute top-5 right-5 p-2 rounded-full transition-colors hover:bg-white/10"
        style={{ color: 'rgba(255, 255, 255, 0.4)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <p
        className="font-display text-2xl mb-2"
        style={{ color: 'rgba(255, 255, 255, 0.9)' }}
      >
        How long?
      </p>
      <p
        className="text-sm mb-10"
        style={{ color: 'rgba(255, 255, 255, 0.4)' }}
      >
        Choose your meditation duration
      </p>

      {/* Duration pills + Custom */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {DURATIONS.map((min) => (
          <button
            key={min}
            onClick={() => handlePresetClick(min)}
            className="px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-200"
            style={{
              background: !isCustom && selected === min
                ? 'rgba(167, 139, 250, 0.4)'
                : 'rgba(255, 255, 255, 0.06)',
              color: !isCustom && selected === min
                ? 'rgba(255, 255, 255, 0.95)'
                : 'rgba(255, 255, 255, 0.5)',
              border: !isCustom && selected === min
                ? '1px solid rgba(167, 139, 250, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.08)',
              transform: !isCustom && selected === min ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {min} min
          </button>
        ))}
        {isCustom ? (
          <div
            className="flex items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-200"
            style={{
              background: 'rgba(167, 139, 250, 0.4)',
              border: '1px solid rgba(167, 139, 250, 0.5)',
            }}
          >
            <input
              ref={customInputRef}
              type="text"
              inputMode="numeric"
              value={customValue}
              onChange={handleCustomChange}
              placeholder="0"
              className="w-12 bg-transparent text-center text-sm font-medium outline-none"
              style={{ color: 'rgba(255, 255, 255, 0.95)' }}
            />
            <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>min</span>
          </div>
        ) : (
          <button
            onClick={handleCustomClick}
            className="px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            Custom
          </button>
        )}
      </div>

      {/* Start button */}
      <button
        onClick={() => selected > 0 && onSelect(selected)}
        disabled={selected <= 0}
        className="w-48 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        style={{
          background: 'linear-gradient(135deg, rgba(129,140,248,0.5), rgba(139,92,246,0.5))',
          color: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        Begin
      </button>
    </div>
  )
}
