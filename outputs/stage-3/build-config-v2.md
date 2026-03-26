# Brain Bed v2 — Build Config

## Files Created
- `electron/bfi-calculator.ts` — BFI computation engine + contextual message pool

## Files Modified
- `electron/cli-token-tracker.ts` — Added velocity tracking (rolling 10-min window)
- `electron/activity-tracker.ts` — Exposed snooze count
- `electron/settings-store.ts` — Added bfi_enabled, late_night_start, late_night_end defaults
- `electron/main.ts` — BFI integration: computeBfi(), stage-based notifications, tray menu, status IPC
- `src/types/electron.d.ts` — Added BfiStage, bfi, bfiStage, tokenVelocity, activeTools to AppStatus
- `src/components/dashboard/Dashboard.tsx` — BFI gauge UI with stage colors/icons

## Architecture
```
CliTokenTracker (velocity) ──┐
ActivityTracker (elapsed) ───┤
Settings (threshold, late) ──┼── computeBfi() ── BfiResult { score, stage, dominant }
Current hour ────────────────┤        │
Snooze count ────────────────┘        ├── sendStatusToMain() → Dashboard gauge
                                      ├── sendNotification() → contextual message
                                      └── updateTrayMenu() → BFI in tray
```

*Built: 2026-03-26*
