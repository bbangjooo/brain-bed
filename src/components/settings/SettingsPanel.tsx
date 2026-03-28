import { useEffect, useState } from 'react'

interface Settings {
  default_meditation_minutes: number
  emergency_hotkey: string
  force_entry_enabled: boolean
  music_autoplay: boolean
}

const DEFAULT_SETTINGS: Settings = {
  default_meditation_minutes: 10,
  emergency_hotkey: 'CommandOrControl+Shift+Escape',
  force_entry_enabled: false,
  music_autoplay: true,
}

interface SettingsPanelProps {
  onBack?: () => void
}

export default function SettingsPanel({ onBack }: SettingsPanelProps) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    window.electronAPI?.getSettings().then((data) => {
      setSettings({ ...DEFAULT_SETTINGS, ...data })
      setLoaded(true)
    })
  }, [])

  async function updateSetting(key: keyof Settings, value: any) {
    setSettings((prev) => ({ ...prev, [key]: value }))
    await window.electronAPI?.updateSetting(key, String(value))
  }

  if (!loaded) {
    return (
      <div className="settings-mode h-full flex items-center justify-center">
        <p style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="settings-mode h-full overflow-y-auto p-6 pt-10"
      style={{ background: '#0f0c29' }}>
      <div className="fixed top-0 left-0 right-0 h-12" style={{ WebkitAppRegion: 'drag' } as any} />

      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          Settings
        </h1>
      </div>

      <div className="space-y-6">
        <SettingItem label="Default meditation duration">
          <select
            value={settings.default_meditation_minutes}
            onChange={(e) => updateSetting('default_meditation_minutes', Number(e.target.value))}
            className="w-full rounded-lg px-3 py-2 text-sm cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <option value={5}>5 min</option>
            <option value={10}>10 min</option>
            <option value={15}>15 min</option>
            <option value={20}>20 min</option>
            <option value={30}>30 min</option>
          </select>
        </SettingItem>

        <SettingItem label="Music autoplay" description="Automatically play classical music when entering meditation">
          <Toggle
            checked={settings.music_autoplay}
            onChange={(v) => updateSetting('music_autoplay', v)}
          />
        </SettingItem>

        <SettingItem label="Force entry mode" description="Automatically start meditation after 3 dismissed alerts">
          <Toggle
            checked={settings.force_entry_enabled}
            onChange={(v) => updateSetting('force_entry_enabled', v)}
          />
        </SettingItem>


      </div>

      <div className="mt-8 pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
        <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.25)' }}>
          Brain Bed v{__APP_VERSION__} · Emergency exit: ⌘⇧⎋
        </p>
        <a
          href="mailto:airmancho@gmail.com?subject=Brain%20Bed%20Feedback"
          className="inline-flex items-center gap-1.5 mt-3 text-xs transition-colors hover:underline"
          style={{ color: 'rgba(255, 255, 255, 0.35)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          Contact: airmancho@gmail.com
        </a>
      </div>
    </div>
  )
}

function SettingItem({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
        {label}
      </label>
      {description && (
        <p className="text-xs mb-2" style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
          {description}
        </p>
      )}
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-10 h-5 rounded-full transition-colors duration-200"
      style={{
        background: checked ? 'rgba(120, 120, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)',
      }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          transform: checked ? 'translateX(22px)' : 'translateX(2px)',
        }}
      />
    </button>
  )
}
