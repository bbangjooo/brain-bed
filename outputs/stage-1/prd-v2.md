# Brain Bed v2 — PRD: Brain Fry Index & Smart Notifications

---

## 1. Feature Overview

Replace the static 90-minute timer alert with a dynamic **Brain Fry Index (BFI)** system that calculates cognitive load intensity from multiple signals and provides contextual, stage-based notifications.

---

## 2. Functional Requirements

### 2.1 BFI Calculator

**Priority**: P0

**Description**: A module that computes a 0–100 intensity score every 10 seconds.

**Inputs**:
- Token stats from `CliTokenTracker` (total tokens, by-tool breakdown, velocity)
- Elapsed minutes from `ActivityTracker`
- Alert threshold from settings
- Current time (for late-night detection)
- Notification dismiss count

**Formula**:
```
BFI = (tokenVelocityScore × 0.35)
    + (elapsedRatioScore   × 0.25)
    + (multiToolScore      × 0.20)
    + (lateNightScore      × 0.10)
    + (snoozePenaltyScore  × 0.10)
```

**Sub-scores** (each 0–100):
| Factor | 0 | 100 |
|--------|---|-----|
| Token velocity | 0 tokens/min | 2000+ tokens/min |
| Elapsed ratio | 0min / threshold | >= threshold |
| Multi-tool | 1 active tool | 3+ active tools |
| Late night | 06:00–22:00 | 22:00–06:00 |
| Snooze penalty | 0 dismissals | 3+ dismissals |

**Acceptance criteria**:
- [ ] BFI recalculated every 10 seconds
- [ ] BFI included in status updates sent to renderer
- [ ] Token velocity computed from rolling 10-minute window

### 2.2 Stage-based Notifications

**Priority**: P0

**Description**: Notifications triggered by BFI thresholds instead of fixed time.

**Stages**:
| Stage | BFI Range | Notification | Re-alert |
|-------|-----------|-------------|----------|
| Calm | 0–30 | None | — |
| Warming | 30–60 | Soft notification | realert_interval setting |
| Heating | 60–85 | Strong notification | half of realert_interval |
| Brain Fry | 85–100 | Urgent + meditation suggestion | 3 minutes |

**Acceptance criteria**:
- [ ] Notification only fires on stage transition (not every tick)
- [ ] Message is contextual based on dominant BFI factor
- [ ] "Take a Break" and "In {n} min" actions preserved
- [ ] Brain Fry stage notification suggests meditation but never forces

### 2.3 Dashboard BFI Gauge

**Priority**: P0

**Description**: Replace the existing progress ring with a BFI gauge.

**Display elements**:
- Circular gauge with stage-colored arc
- BFI number (large, center)
- Stage label + icon below number
- Below gauge: token stats (total + velocity), elapsed time, active tools

**Acceptance criteria**:
- [ ] Gauge color transitions smoothly between stages
- [ ] BFI number updates in real-time
- [ ] Stage icon matches current level (leaf/sun/flame/zap)
- [ ] Token velocity displayed as "{n}K/min"

### 2.4 Tray Menu Update

**Priority**: P1

**Description**: Show BFI info in tray context menu.

**Acceptance criteria**:
- [ ] First menu item shows "BFI: {score} — {stage}"
- [ ] Tray tooltip updates with current BFI

### 2.5 Settings

**Priority**: P1

**New settings**:
| Key | Default | Type | Description |
|-----|---------|------|-------------|
| bfi_enabled | true | boolean | Enable BFI-based alerts (false = legacy time-based) |
| late_night_start | 22 | number | Hour when late-night factor activates |
| late_night_end | 6 | number | Hour when late-night factor deactivates |

---

## 3. Data Model Changes

### AppStatus (IPC payload)

Add fields:
```typescript
interface AppStatus {
  // existing
  elapsedMinutes: number
  threshold: number
  tokenStats: TokenStats
  isMeditating: boolean
  // new
  bfi: number                    // 0–100
  bfiStage: 'calm' | 'warming' | 'heating' | 'brain-fry'
  tokenVelocity: number          // tokens per minute (rolling 10min)
  activeTools: string[]           // tools with activity in last 10min
}
```

### TokenStats

Add field:
```typescript
interface TokenStats {
  totalTokens: number
  byTool: Record<string, number>
  lastUpdated: number
  // new
  velocity: number               // tokens/min rolling average
}
```

---

## 4. Files to Modify

| File | Change |
|------|--------|
| `electron/bfi-calculator.ts` | **NEW** — BFI computation module |
| `electron/cli-token-tracker.ts` | Add velocity calculation |
| `electron/activity-tracker.ts` | Expose snooze count, integrate BFI |
| `electron/main.ts` | Wire BFI into status updates + notifications |
| `src/types/electron.d.ts` | Update AppStatus type |
| `src/components/dashboard/Dashboard.tsx` | BFI gauge UI |
| `electron/settings-store.ts` | Add new default settings |

---

*작성일: 2026-03-26*
