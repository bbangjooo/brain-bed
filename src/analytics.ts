import * as amplitude from '@amplitude/unified'

type BfiStage = 'calm' | 'warming' | 'heating' | 'brain-fry'

// ── Event definitions ────────────────────────────────────

type Events = {
  // Onboarding
  onboarding_phase_viewed: { phase: string }
  onboarding_completed: { default_meditation_minutes: number; launch_at_login: boolean }
  onboarding_skipped: {}

  // Dashboard
  details_toggled: { expanded: boolean }
  take_break_clicked: { bfi: number; bfi_stage: BfiStage }

  // Meditation
  meditation_duration_selected: { minutes: number }
  meditation_completed: { duration_minutes: number }
  meditation_exit_attempted: { remaining_seconds: number; total_seconds: number }
  meditation_exit_confirmed: { remaining_seconds: number; total_seconds: number }
  meditation_continued: { remaining_seconds: number }

  // Context Switch (v4)
  mode_selected: { mode: string; duration_minutes: number }
  context_switch_started: { mode: string; duration_seconds: number; is_free: boolean }
  context_switch_completed: { mode: string | null; duration_seconds: number; completed_full: boolean }
  context_switch_exited: { mode: string | null; remaining_seconds: number; total_seconds: number }

  // Settings
  setting_changed: { key: string; value: string | number | boolean }
  onboarding_replayed: {}

  // BFI (from main process via IPC)
  bfi_stage_changed: { from: BfiStage; to: BfiStage; score: number }
  notification_shown: { bfi: number; stage: BfiStage; notification_count: number }
  notification_clicked: { bfi: number; stage: BfiStage }

  // Update
  update_shown: { version: string }
  update_installed: { version: string }
}

// ── Track function ───────────────────────────────────────

export function track<K extends keyof Events>(
  event: K,
  properties: Events[K],
) {
  amplitude.track(event, properties as Record<string, any>)
}
