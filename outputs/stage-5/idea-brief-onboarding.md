# Idea Brief: Brain Bed Onboarding — "Your Brain Deserves Rest"

## Problem

Brain Bed currently has **zero onboarding**. Users launch the app and land on a cold dashboard showing BFI numbers and token stats. There's no emotional connection, no explanation of why the app exists, and no moment of self-awareness. The app's core value — caring for the user's overworked brain — is completely invisible on first launch.

## Inspiration: FocusFlight

FocusFlight (4.9/5, 1M+ users) transforms a simple timer into an emotional ritual through its airport/flight metaphor. Key lesson: **the act of starting is the experience**, not a barrier to it.

We apply this principle differently: FocusFlight uses excitement (travel). Brain Bed uses **warmth (care)**.

## Core Concept: "The First Check-In"

The onboarding is not a tutorial. It's a **moment of self-awareness** — the user acknowledges their own state, experiences what rest feels like, and chooses to let the app watch over them.

## Five Phases

### Phase 1: Empathy — "Are you okay?"
- Slow-typing text on dark aurora background
- Asks: "You've been working with AI today, haven't you?"
- Culminates in: **"Is your brain okay?"**
- User responds: **[Yes, I'm fine]** or **[No, not really]**
- Both paths lead forward, but with different tonal responses:
  - Yes → "That's good to hear. But even the strongest minds need rest sometimes."
  - No → "That's okay. You're here now."
- **Why this matters**: The user's first interaction is an act of self-acknowledgment, not a button click.

### Phase 2: Awareness — "Let me show you"
- Guided breathing exercise (one cycle: 4s inhale, 4s hold, 6s exhale, 2s hold)
- Then: real-time scan of user's AI CLI usage data
- Shows personalized stats (tokens, active hours, latest activity time)
- Tone: observation, not judgment — "Your brain has been working hard."
- Falls back to general messaging if no data exists yet

### Phase 3: Promise — "What Brain Bed does"
- BFI gauge draws itself for the first time, in calm/green state
- Simple explanation: "Brain Bed quietly watches over your brain."
- Three promises: monitor, notify, provide peace
- Framing: **care, not surveillance**

### Phase 4: First Taste — "Feel it"
- 30-second mini meditation experience
- Full aurora background + breathing circle + Clair de Lune
- No timer visible — pure immersion
- Ends with: "This space is always here for you."
- "No" respondents get a slightly longer preview (~45s)

### Phase 5: Gentle Setup — "One last thing"
- Conversational settings (not a settings panel)
- "How long do you like to rest?" → duration picker
- "Should I let you know about late-night work?" → toggle
- Transitions naturally into the dashboard

## Design Principles

| Principle | Implementation |
|-----------|---------------|
| Warmth over metrics | Text-first, data-second |
| Ritual over tutorial | Each phase is an experience, not an explanation |
| Acknowledgment over instruction | User actively responds (Yes/No) |
| Immersion over description | 30s meditation preview > 10 feature bullets |
| Care over surveillance | "Watch over" not "monitor" |

## Language

All UI text in **English**. Tone: warm, gentle, minimal. No exclamation marks. No corporate speak. Think: a kind friend who notices you're tired.

## Technical Notes

- Reuse existing components: BreathingCircle, GradientBackground, Scene3D, AudioPlayer
- First-run detection via SettingsStore flag (`onboarding_completed`)
- Onboarding route: `#/onboarding` in the existing hash router
- Skip button available but subtle (small text, not a prominent button)
- Data from CliTokenTracker for personalized Phase 2

## Success Metric

A user who completes onboarding should feel: **"This app understands me."**
