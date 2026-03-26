import { useEffect, useState } from 'react'

interface Settings {
  alert_threshold_minutes: number
  realert_interval_minutes: number
  default_meditation_minutes: number
  emergency_hotkey: string
  force_entry_enabled: boolean
  music_autoplay: boolean
  launch_at_login: boolean
}

const DEFAULT_SETTINGS: Settings = {
  alert_threshold_minutes: 90,
  realert_interval_minutes: 10,
  default_meditation_minutes: 10,
  emergency_hotkey: 'CommandOrControl+Shift+Escape',
  force_entry_enabled: false,
  music_autoplay: true,
  launch_at_login: false,
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
        <SettingItem label="Break alert threshold" description="Get a notification after this many minutes of continuous use">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={30}
              max={180}
              step={10}
              value={settings.alert_threshold_minutes}
              onChange={(e) => updateSetting('alert_threshold_minutes', Number(e.target.value))}
              className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgba(255,255,255,0.5) ${((settings.alert_threshold_minutes - 30) / 150) * 100}%, rgba(255,255,255,0.1) ${((settings.alert_threshold_minutes - 30) / 150) * 100}%)`,
              }}
            />
            <span className="text-sm font-mono w-16 text-right" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {settings.alert_threshold_minutes} min
            </span>
          </div>
        </SettingItem>

        <SettingItem label="Snooze interval" description="How long to wait before reminding you again">
          <select
            value={settings.realert_interval_minutes}
            onChange={(e) => updateSetting('realert_interval_minutes', Number(e.target.value))}
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
            <option value={30}>30 min</option>
          </select>
        </SettingItem>

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

        <SettingItem label="Launch at login">
          <Toggle
            checked={settings.launch_at_login}
            onChange={(v) => updateSetting('launch_at_login', v)}
          />
        </SettingItem>
      </div>

      <div className="mt-8 pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
        <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.25)' }}>
          Brain Bed v0.2.0 · Emergency exit: ⌘⇧⎋
        </p>
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
