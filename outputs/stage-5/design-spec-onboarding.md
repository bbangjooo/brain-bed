# Design Spec: Brain Bed Onboarding

## Visual Language

The onboarding uses the existing meditation visual system but **dimmed and intimate** — like entering a quiet room before the lights fully come on.

## Typography

| Element | Font | Size | Weight | Color | Style |
|---------|------|------|--------|-------|-------|
| Main narrative text | Cormorant Garamond | 20px | 400 | rgba(255,255,255,0.85) | italic |
| Response text (after Yes/No) | Cormorant Garamond | 18px | 400 | rgba(255,255,255,0.7) | italic |
| Choice buttons | Inter | 14px | 500 | rgba(255,255,255,0.6) | normal |
| Setup questions | Inter | 16px | 500 | rgba(255,255,255,0.8) | normal |
| Setup pill buttons | Inter | 13px | 500 | rgba(255,255,255,0.6) | normal |
| Skip text | Inter | 11px | 400 | rgba(255,255,255,0.2) | normal |
| Data stats | DM Sans | 13px | 400 mono | rgba(255,255,255,0.5) | normal |
| Phase 3 promises | Cormorant Garamond | 17px | 400 | rgba(255,255,255,0.75) | italic |

## Color Palette

Uses existing CSS variables. No new colors introduced.

- Background: `#050510` (--color-bg-primary)
- Aurora: existing GradientBackground, opacity scaled per phase
- Text: white at varying alpha levels
- Accent (buttons active): `rgba(129, 140, 248, 0.4)` (indigo, matching "Take a Break" button)

## Layout

All phases share the same container:

```
┌─────────────────────────────┐
│     [drag region 48px]      │
│                             │
│                             │
│                             │
│      [centered content]     │
│       max-width: 320px      │
│       text-align: center    │
│                             │
│                             │
│                             │
│                    [Skip] ──┤ bottom-right, 24px padding
└─────────────────────────────┘

Window: 400 x 680px (existing main window)
Content area: centered, max-width 320px
Padding: 24px horizontal
```

## Phase 1: Empathy — Detailed Design

```
┌─────────────────────────────┐
│                             │
│                             │
│                             │
│   You've been working with  │  ← typewriter, line by line
│   AI today, haven't you?    │
│                             │
│   Writing prompts, reading  │
│   outputs, rewriting,       │
│   iterating...              │
│                             │
│   Is your brain okay?       │  ← slightly larger: 22px
│                             │
│  ┌──────────┐ ┌────────────┐│
│  │Yes, I'm  │ │ No, not    ││  ← fade in 500ms after text
│  │  fine     │ │  really    ││
│  └──────────┘ └────────────┘│
│                             │
│                    Skip ────┤
└─────────────────────────────┘
```

**Buttons:**
- Width: 140px each, gap: 12px, centered
- Height: 48px
- Border: 1px solid rgba(255,255,255,0.15)
- Border-radius: 12px
- Background: transparent
- Hover: background rgba(255,255,255,0.05), border rgba(255,255,255,0.25)
- Active/selected: background rgba(129,140,248,0.2), border rgba(129,140,248,0.4)
- Transition: all 200ms ease

**After selection — response text appears below buttons:**
```
┌─────────────────────────────┐
│                             │
│   Is your brain okay?       │
│                             │
│  [Yes, I'm fine] (dimmed)   │  ← selected stays, other fades
│                             │
│   That's good to hear.      │  ← typewriter
│   But even the strongest    │
│   minds need rest           │
│   sometimes.                │
│                             │
│   Let me quietly watch      │
│   over you — just in case.  │
│                             │
└─────────────────────────────┘
```

**Typewriter effect:**
- 40ms per character
- Cursor: blinking `|` at end, rgba(255,255,255,0.5), blink 530ms
- Between paragraphs: 1500ms pause
- Cursor disappears 500ms after typing completes

## Phase 2: Awareness — Detailed Design

```
┌─────────────────────────────┐
│                             │
│                             │
│   Let's take a breath       │
│   together.                 │
│                             │
│        ╭─────────╮          │  ← BreathingCircle component
│       │           │         │     240x240px
│       │ Breathe in│         │
│       │           │         │
│        ╰─────────╯          │
│                             │
│                             │
│                             │
│                    Skip ────┤
└─────────────────────────────┘

After breathing cycle completes:

┌─────────────────────────────┐
│                             │
│   Let me take a look at     │
│   how you've been           │
│   working...                │
│                             │
│       ● ● ●                 │  ← pulsing dots, 600ms interval
│                             │
│   12.8K tokens today        │  ← fade in, stagger 500ms
│   2 AI tools active         │
│   Last session at 2:14 AM   │
│                             │
│   Your brain has been       │
│   working hard.             │
│                             │
│                    Skip ────┤
└─────────────────────────────┘
```

**Scan animation:**
- Three dots: 6px circles, rgba(129,140,248,0.6)
- Pulse: scale 1→1.4→1 with 600ms stagger
- Duration: 2s total before data appears

**Data stats:**
- Each line fades in with 500ms stagger
- Font: DM Sans mono, 13px
- Small icon before each: token icon, tool icon, clock icon
- Color: rgba(255,255,255,0.5)

## Phase 3: Promise — Detailed Design

```
┌─────────────────────────────┐
│                             │
│         ┌─────┐             │
│        │  15  │             │  ← BFI gauge, 120x120px
│        │ Calm │             │     animates from 0
│         └─────┘             │
│                             │
│   This is your              │
│   Brain Fry Index.          │  ← typewriter
│                             │
│   Brain Bed quietly         │
│   watches over your brain.  │
│                             │
│   When things heat up,      │
│   I'll let you know.        │
│                             │
│   When you need peace,      │
│   I'll open a door.         │
│                             │
│                    Skip ────┤
└─────────────────────────────┘
```

**BFI Gauge animation:**
- Same SVG as Dashboard but smaller (120x120)
- Stroke animates from 0 to target over 2s, ease-out
- Number counts up from 0 to value (60fps, eased)
- Color transitions through stages as it counts up, settles on green/calm

## Phase 4: First Taste — Detailed Design

```
┌─────────────────────────────┐
│  ░░░░░ AURORA BG ░░░░░░░░░ │  ← full GradientBackground
│  ░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░ ✦ ✦   3D SCENE  ✦ ░░░ │  ← Scene3D particles
│  ░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░░░  ╭─────────╮  ░░░░░ │
│  ░░░░░ │  Breathe  │ ░░░░░ │  ← BreathingCircle
│  ░░░░░ │    in     │ ░░░░░ │
│  ░░░░░  ╰─────────╯  ░░░░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░░░ 🎵 Clair de   ░░░░░ │  ← AudioPlayer (minimal)
│  ░░░░░    Lune        ░░░░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────┘

After 30s/45s:

  "This space is always
   here for you."          ← fades in over breathing circle
```

**No skip button in this phase** — let the user fully experience it.
After the text appears, auto-advance in 3s.

## Phase 5: Setup — Detailed Design

```
┌─────────────────────────────┐
│                             │
│                             │
│   One last thing.           │
│                             │
│   How long do you like      │
│   to rest?                  │
│                             │
│  [5] [10] [15] [20] min    │  ← pill buttons
│                             │
│   Should I let you know     │  ← appears after Q1
│   about late-night          │
│   sessions?                 │
│                             │
│  [Yes, after 10pm]          │
│  [No, I'll manage]          │
│                             │
│   Launch Brain Bed when     │  ← appears after Q2
│   you start your computer?  │
│                             │
│  [Yes] [No thanks]          │
│                             │
│      ┌────────────────┐     │
│      │  Enter Brain Bed│    │  ← appears after Q3
│      └────────────────┘     │
│                             │
└─────────────────────────────┘
```

**Pill buttons (duration):**
- Height: 40px, min-width: 56px, padding: 0 16px
- Border-radius: 20px (full pill)
- Background: rgba(255,255,255,0.06)
- Border: 1px solid rgba(255,255,255,0.1)
- Selected: background rgba(129,140,248,0.25), border rgba(129,140,248,0.4), color white
- Gap: 8px
- Transition: all 200ms ease

**Choice buttons (Yes/No questions):**
- Full width (max 280px), height 44px
- Same style as Phase 1 buttons but stacked vertically
- Gap: 8px

**Enter button:**
- Same style as "Take a Break" on dashboard
- Gradient: `linear-gradient(135deg, rgba(129,140,248,0.4), rgba(167,139,250,0.4))`
- Width: 200px, centered
- Fade in with 500ms delay after last question answered

## Animations Summary

| Animation | Duration | Easing | Notes |
|-----------|----------|--------|-------|
| Typewriter | 40ms/char | linear | Cursor blinks at 530ms |
| Phase transition (out) | 800ms | ease-in | Content opacity 1→0 |
| Phase transition (gap) | 400ms | — | Hold at black |
| Phase transition (in) | 800ms | ease-out | Content opacity 0→1 |
| Button fade-in | 500ms | ease-out | After text completes |
| Staggered items | 500ms each | ease-out | Data stats, questions |
| BFI gauge fill | 2000ms | ease-out | Stroke-dashoffset animation |
| Music fade-in | 3000ms | linear | AudioContext gain ramp |
| Music fade-out | 3000ms | linear | AudioContext gain ramp |
| Breathing circle | 16s cycle | per-phase easing | Reuse existing component |
| Scan dots pulse | 600ms/dot | ease-in-out | Staggered 200ms |

## Responsive Behavior

Window is fixed at 400x680 (existing). Content adapts to height:
- Minimum height: 560px — content uses `min-h-0` and `overflow-y-auto` if needed
- All phases use `flex flex-col items-center justify-center` for vertical centering
