export type BfiStage = 'calm' | 'warming' | 'heating' | 'brain-fry'

export interface BfiResult {
  score: number        // 0–100
  stage: BfiStage
  dominant: string     // which factor contributed most
}

interface BfiInputs {
  messageVelocity: number       // messages per minute (rolling average)
  activeToolCount: number       // number of tools with recent activity
  activeSessionCount: number    // number of recently active log files (sessions)
  currentHour: number           // 0–23
  snoozeCount: number
  lateNightStart: number        // hour, e.g. 22
  lateNightEnd: number          // hour, e.g. 6
}

const WEIGHTS = {
  messageVelocity: 0.45,
  multiTool: 0.25,
  lateNight: 0.15,
  snoozePenalty: 0.15,
} as const

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function scoreMessageVelocity(messagesPerMin: number): number {
  // 0 → 0, 5+ → 100, linear
  return clamp((messagesPerMin / 5) * 100, 0, 100)
}

function scoreMultiTool(toolCount: number, sessionCount: number): number {
  // Consider both different tools AND multiple sessions of the same tool
  const effectiveCount = Math.max(toolCount, sessionCount)
  if (effectiveCount <= 1) return 0
  if (effectiveCount === 2) return 50
  if (effectiveCount === 3) return 75
  return 100
}

function scoreLateNight(hour: number, start: number, end: number): number {
  // Handle wrap-around (e.g. 22–6)
  if (start > end) {
    return (hour >= start || hour < end) ? 100 : 0
  }
  return (hour >= start && hour < end) ? 100 : 0
}

function scoreSnoozePenalty(count: number): number {
  if (count <= 0) return 0
  if (count === 1) return 30
  if (count === 2) return 60
  return 100
}

export function calculateBfi(inputs: BfiInputs): BfiResult {
  const scores: Record<string, number> = {
    messageVelocity: scoreMessageVelocity(inputs.messageVelocity),
    multiTool: scoreMultiTool(inputs.activeToolCount, inputs.activeSessionCount),
    lateNight: scoreLateNight(inputs.currentHour, inputs.lateNightStart, inputs.lateNightEnd),
    snoozePenalty: scoreSnoozePenalty(inputs.snoozeCount),
  }

  const weighted =
    scores.messageVelocity * WEIGHTS.messageVelocity +
    scores.multiTool * WEIGHTS.multiTool +
    scores.lateNight * WEIGHTS.lateNight +
    scores.snoozePenalty * WEIGHTS.snoozePenalty

  const score = Math.round(clamp(weighted, 0, 100))

  // Find dominant factor (highest weighted contribution)
  let dominant = 'messageVelocity'
  let maxContribution = 0
  for (const [key, raw] of Object.entries(scores)) {
    const contribution = raw * WEIGHTS[key as keyof typeof WEIGHTS]
    if (contribution > maxContribution) {
      maxContribution = contribution
      dominant = key
    }
  }

  const stage: BfiStage =
    score < 30 ? 'calm' :
    score < 60 ? 'warming' :
    score < 85 ? 'heating' :
    'brain-fry'

  return { score, stage, dominant }
}

// Notification messages keyed by [dominant][stage]
const MESSAGES: Record<string, Partial<Record<BfiStage, string[]>>> = {
  messageVelocity: {
    warming: [
      'You\'ve been sending prompts at a rapid pace. A short pause helps your brain catch up.',
    ],
    heating: [
      'High interaction frequency detected. Your judgment accuracy drops with sustained back-and-forth.',
    ],
    'brain-fry': [
      'Intense AI interaction detected. Your brain deserves a reset.',
    ],
  },
  lateNight: {
    warming: [
      'It\'s getting late. Wrapping up soon would do you good.',
    ],
    heating: [
      'Late-night sessions often create tomorrow\'s bugs.',
    ],
    'brain-fry': [
      'Sleep is the best debugger. The code will be here tomorrow.',
    ],
  },
  multiTool: {
    warming: [
      'Multiple AI tools active — that\'s a lot of context switching.',
    ],
    heating: [
      'Running multiple tools at once. Your brain is juggling hard.',
    ],
    'brain-fry': [
      'Heavy multi-tool usage detected. Your cognitive load is at its peak.',
    ],
  },
  snoozePenalty: {
    warming: [
      'You\'ve dismissed a few alerts. Just a gentle reminder to check in with yourself.',
    ],
    heating: [
      'Pushing through is exactly when breaks matter most.',
    ],
    'brain-fry': [
      'You keep going. That persistence is admirable — but your brain is asking for a pause.',
    ],
  },
}

export function getBfiMessage(result: BfiResult): string {
  const pool = MESSAGES[result.dominant]?.[result.stage]
  if (pool && pool.length > 0) {
    return pool[Math.floor(Math.random() * pool.length)]
  }
  return 'Time for a break. Your brain will thank you.'
}
