# PRD: Brain Bed Onboarding — "Your Brain Deserves Rest"

## Overview

Add a 5-phase onboarding experience that transforms the first-launch from a cold dashboard into an emotionally resonant moment of self-awareness. All text in English.

## Architecture

### Routing

Add `onboarding` route to `App.tsx`:

```
App.tsx routes:
  'onboarding' → OnboardingScreen (NEW)
  'dashboard'  → Dashboard (existing)
  'meditation' → MeditationScreen (existing)
  'settings'   → SettingsPanel (existing)
```

First-run detection: `settingsStore.get('onboarding_completed')` → if falsy, main window loads `#/onboarding` instead of `#/dashboard`.

### New Files

```
src/components/onboarding/
├── OnboardingScreen.tsx      # State machine controller
├── PhaseEmpathy.tsx          # Phase 1: typing text + Yes/No
├── PhaseAwareness.tsx        # Phase 2: breathing + data scan
├── PhasePromise.tsx          # Phase 3: BFI gauge introduction
├── PhaseFirstTaste.tsx       # Phase 4: mini meditation
└── PhaseSetup.tsx            # Phase 5: conversational settings
```

### Reused Components

- `GradientBackground` — aurora backdrop (all phases)
- `BreathingCircle` — breathing exercise (Phase 2 & 4)
- `AudioPlayer` — music preview (Phase 4)
- `Scene3D` — 3D particles (Phase 4)

### IPC Changes

**New channels:**

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `onboarding:get-status` | invoke | Returns `{ isFirstRun: boolean }` |
| `onboarding:get-scan-data` | invoke | Returns token stats for personalized Phase 2 |
| `onboarding:complete` | send | Saves settings from Phase 5, sets `onboarding_completed=true` |

**Main process changes (`electron/main.ts`):**

- `createMainWindow()`: check `onboarding_completed` setting. If false, load `#/onboarding` instead of `#/dashboard`.
- New IPC handlers for the 3 channels above.

### Settings Store Changes

New settings key:

| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `onboarding_completed` | boolean | false | First-run gate |

## Phase Specifications

### Phase 1: Empathy

**State:** `empathy`

**Flow:**
1. Dark screen with subtle aurora background (GradientBackground at reduced opacity)
2. Text appears with typewriter effect (40ms per character, 1.5s pause between lines)
3. Lines:
   - "You've been working with AI today, haven't you?"
   - [2s pause]
   - "Writing prompts, reading outputs, rewriting, iterating..."
   - [2s pause]
   - "Is your brain okay?"
4. Two buttons fade in (500ms delay after last text):
   - **[Yes, I'm fine]** — outlined style, subtle
   - **[No, not really]** — outlined style, subtle
5. On selection:
   - Yes → "That's good to hear.\nBut even the strongest minds need rest sometimes.\n\nLet me quietly watch over you — just in case."
   - No → "That's okay. You're here now.\n\nLet me show you a place where your brain can rest."
6. After response text completes → auto-advance to Phase 2 (3s delay)

**State stored:** `userResponse: 'yes' | 'no'` (affects Phase 4 duration)

**Typography:**
- Main text: `Cormorant Garamond`, italic, 20px, `rgba(255,255,255,0.85)`
- Buttons: `Inter`, 14px, `rgba(255,255,255,0.6)`, border `rgba(255,255,255,0.15)`

**Skip:** Small "Skip" text at bottom-right, `rgba(255,255,255,0.2)`, 11px

### Phase 2: Awareness

**State:** `awareness`

**Flow:**
1. Breathing circle fades in (center screen)
2. Text: "Let's take a breath together."
3. One full breathing cycle (16 seconds): inhale 4s → hold 4s → exhale 6s → hold 2s
4. Breathing circle shrinks away
5. "Scan" animation: 
   - Text: "Let me take a look at how you've been working..."
   - Animated dots/pulse effect (2s)
6. If token data exists:
   - Show personalized stats with fade-in (staggered 500ms):
     - "{totalTokens} tokens processed today"
     - "{activeTools} AI tools active"  
     - "Latest session at {time}"
   - Text: "Your brain has been working hard."
7. If no data:
   - "I don't see any data yet — but I'll start watching once you begin."
   - Text: "When things get intense, I'll be here."
8. Auto-advance to Phase 3 (3s delay after last text)

**Data source:** `window.electronAPI.onboardingGetScanData()` → returns `{ totalTokens, activeTools, latestTime } | null`

### Phase 3: Promise

**State:** `promise`

**Flow:**
1. BFI gauge draws itself from 0 to current value (or demo value of 15 if no data)
2. Gauge settles in calm/green state
3. Text appears below gauge (typewriter, staggered):
   - "This is your Brain Fry Index."
   - [1s]
   - "Brain Bed quietly watches over your brain."
   - [1s]
   - "When things heat up, I'll let you know."
   - [1s]  
   - "When you need peace, I'll open a door."
4. Auto-advance to Phase 4 (3s delay)

**Visual:** Reuse the BFI gauge SVG from Dashboard but animated from 0 with `ease-out` curve over 2s.

### Phase 4: First Taste

**State:** `firstTaste`

**Flow:**
1. Full meditation experience preview
2. GradientBackground at full intensity
3. Scene3D particles
4. BreathingCircle (center)
5. Music: Clair de Lune, fade-in over 3s
6. Duration: 30s (if user said "Yes") or 45s (if user said "No")
7. No timer visible — pure immersion
8. After duration, text fades in over breathing circle:
   - "This space is always here for you."
9. Music fades out over 3s
10. Auto-advance to Phase 5 (2s after text appears)

### Phase 5: Gentle Setup

**State:** `setup`

**Flow:**
1. Clean screen, aurora background dimmed
2. Conversational prompts (not a settings panel):

**Question 1:** 
- "One last thing."
- "How long do you like to rest?"
- Pill buttons: [5 min] [10 min] [15 min] [20 min]
- Default highlighted: 10 min
- Selecting updates `default_meditation_minutes`

**Question 2:** (appears after Q1 selection, 500ms delay)
- "Should I let you know about late-night sessions?"
- [Yes, after 10pm] [No, I'll manage]
- Yes → sets `late_night_start: 22`, `late_night_end: 6`
- No → keeps defaults but noted

**Question 3:** (appears after Q2, 500ms delay)
- "Launch Brain Bed when you start your computer?"
- [Yes] [No thanks]
- Sets `launch_at_login`

3. Final: "You're all set." + subtle button "Enter Brain Bed"
4. On click → calls `onboarding:complete` IPC → navigates to `#/dashboard`

## Transition Design

All phase transitions use:
- Content fade-out: 800ms, ease-in
- 400ms black gap
- Content fade-in: 800ms, ease-out

## Accessibility

- `prefers-reduced-motion`: disable typewriter effect (show text immediately), reduce animation durations
- All interactive elements keyboard-accessible
- Minimum touch targets: 44x44px

## Edge Cases

- **App killed during onboarding:** `onboarding_completed` stays false → restarts from Phase 1
- **No CLI data available:** Phase 2 gracefully falls back to generic messaging
- **User clicks Skip:** Sets `onboarding_completed=true` with default settings, jumps to dashboard
- **Window resize during onboarding:** All phases use flex centering, responsive

## Success Criteria

- Onboarding completes without errors
- Settings are correctly saved
- Dashboard loads after completion
- Subsequent launches skip onboarding
- Skip works at any phase
