import { useState, useEffect } from 'react'

interface Props {
  onComplete: (settings: {
    default_meditation_minutes: number
    late_night_enabled: boolean
    launch_at_login: boolean
  }) => void
}

const REVEAL_STYLE = (visible: boolean): React.CSSProperties => ({
  opacity: visible ? 1 : 0,
  transform: visible ? 'translateY(0)' : 'translateY(30px)',
  filter: visible ? 'blur(0)' : 'blur(6px)',
  transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), filter 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
})

export default function PhaseSetup({ onComplete }: Props) {
  const [accessibilityGranted, setAccessibilityGranted] = useState(false)
  const [launchAtLogin, setLaunchAtLogin] = useState<boolean | null>(null)
  const [showTitle, setShowTitle] = useState(false)
  const [showQ1, setShowQ1] = useState(false)
  const [showQ2, setShowQ2] = useState(false)
  const [showEnter, setShowEnter] = useState(false)

  // Staggered reveal on mount
  useEffect(() => {
    const t1 = setTimeout(() => setShowTitle(true), 100)
    const t2 = setTimeout(() => setShowQ1(true), 900)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const handleAccessibility = async () => {
    const granted = await window.electronAPI?.onboardingRequestAccessibility()
    setAccessibilityGranted(granted ?? false)
    setTimeout(() => setShowQ2(true), 600)
  }

  const handleLaunch = (enabled: boolean) => {
    setLaunchAtLogin(enabled)
    setTimeout(() => setShowEnter(true), 600)
  }

  const handleComplete = () => {
    onComplete({
      default_meditation_minutes: 10,
      late_night_enabled: true,
      launch_at_login: launchAtLogin ?? false,
    })
  }

  return (
    <div className="max-w-[680px] w-full text-center flex flex-col items-center gap-8">
      {/* Title */}
      <div style={REVEAL_STYLE(showTitle)}>
        <p
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 32,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          One last thing.
        </p>
      </div>

      {/* Q1: Accessibility permission */}
      <div style={REVEAL_STYLE(showQ1)}>
        <p
          className="mb-3"
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 32,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          To protect your rest, Brain Bed needs one permission.
        </p>
        <p
          className="mb-8"
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 20,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          It lets Brain Bed gently block distractions during meditation.
        </p>
        <button
          onClick={handleAccessibility}
          className="px-10 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          style={{
            fontFamily: 'Inter, system-ui',
            fontSize: 16,
            fontWeight: 500,
            color: accessibilityGranted ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.9)',
            background: accessibilityGranted
              ? 'rgba(34, 197, 94, 0.2)'
              : 'linear-gradient(135deg, rgba(129,140,248,0.4), rgba(167,139,250,0.4))',
            border: `1px solid ${accessibilityGranted ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255,255,255,0.1)'}`,
            minWidth: 200,
          }}
        >
          {accessibilityGranted ? 'Granted' : 'Allow Accessibility'}
        </button>
      </div>

      {/* Q2: Launch at login */}
      <div style={{ ...REVEAL_STYLE(showQ2), pointerEvents: showQ2 ? 'auto' : 'none' }}>
        <p
          className="mb-3"
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 32,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          Brain Bed works best when it's always with you.
        </p>
        <p
          className="mb-8"
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 20,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          Start it automatically when you log in?
        </p>
        <div className="flex gap-4 justify-center">
          {[
            { label: 'Yes, watch over me', value: true },
            { label: 'Maybe later', value: false },
          ].map(({ label, value }) => (
            <button
              key={label}
              onClick={() => handleLaunch(value)}
              className="px-10 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
              style={{
                fontFamily: 'Inter, system-ui',
                fontSize: 16,
                fontWeight: 500,
                color: launchAtLogin === value ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
                background: launchAtLogin === value ? 'rgba(129,140,248,0.2)' : 'transparent',
                border: `1px solid ${launchAtLogin === value ? 'rgba(129,140,248,0.4)' : 'rgba(255,255,255,0.15)'}`,
                minWidth: 120,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Enter button */}
      <div
        className="mt-2"
        style={{ ...REVEAL_STYLE(showEnter), pointerEvents: showEnter ? 'auto' : 'none' }}
      >
        <p
          className="mb-6"
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 32,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          You're all set.
        </p>
        <button
          onClick={handleComplete}
          className="px-12 py-4 rounded-2xl font-medium transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          style={{
            fontFamily: 'Inter, system-ui',
            fontSize: 16,
            background: 'linear-gradient(135deg, rgba(129,140,248,0.4), rgba(167,139,250,0.4))',
            color: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: 240,
          }}
        >
          Enter Brain Bed
        </button>
      </div>
    </div>
  )
}
