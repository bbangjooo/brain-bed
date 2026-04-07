import { useCallback, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Footprints,
  PersonStanding,
  Coffee,
  Leaf,
  Wind,
  Trash2,
  ShowerHead,
  PenLine,
  Headphones,
  Sun,
  Piano,
} from 'lucide-react'

interface Activity {
  id: string
  icon: LucideIcon
  title: string
  description: string
}

const ACTIVITIES: Activity[] = [
  { id: 'walk', icon: Footprints, title: 'Go for a walk', description: 'Step outside. Walk with no destination. Notice 3 things you can see and 2 things you can hear.' },
  { id: 'stretch', icon: PersonStanding, title: 'Full body stretch', description: 'Head left, hold. Head right, hold. Roll shoulders back, then forward. Arms up, palms to the ceiling. Bend forward, touch your toes. Finish with 3 deep breaths.' },
  { id: 'drink', icon: Coffee, title: 'Make a warm drink', description: 'Boil water. Watch it boil \u2014 don\u2019t check your phone. Pour slowly. Sit somewhere that isn\u2019t your desk. Sip and feel the warmth.' },
  { id: 'window', icon: Leaf, title: 'Sit by a window', description: 'Open a window. Feel the air on your face. Look at the farthest thing you can see. Close your eyes and just listen to the outside.' },
  { id: 'breathe', icon: Wind, title: 'Breathing exercise', description: 'Sit comfortably. Breathe in for 4 seconds, hold for 4, out for 6. Keep repeating. Let each exhale be longer than the inhale.' },
  { id: 'tidy', icon: Trash2, title: 'Tidy your space', description: 'Throw away trash. Put things back. Wipe your desk. Organize cables. Adjust your chair. Step back and look at your clean space.' },
  { id: 'face', icon: ShowerHead, title: 'Wash your face', description: 'Go to the bathroom. Splash cold water on your face three times. Pat dry. Look in the mirror. Drink a glass of water. Walk back slowly.' },
  { id: 'doodle', icon: PenLine, title: 'Doodle on paper', description: 'Grab any pen, any paper. Draw circles, patterns, anything. Try your non-dominant hand. Fill the whole page. No rules, no judgement.' },
  { id: 'music', icon: Headphones, title: 'Listen to a song', description: 'Put on headphones. Pick a song you love \u2014 not something new. Press play, close your eyes. Listen without doing anything else.' },
  { id: 'stand', icon: Sun, title: 'Stand outside', description: 'Go outside. Stand still. Feel the ground, the temperature, the air. Look at the sky. Just be here. No phone, no plan.' },
  { id: 'classical', icon: Piano, title: 'Listen to classical music', description: 'Close your eyes right here. Let the music wash over you. Don\u2019t think about anything. Just listen to each note.' },
]

function shuffled(): Activity[] {
  const pool = [...ACTIVITIES]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool
}

const CARD_ACCENTS = [
  { bg: 'rgba(199, 125, 255, 0.06)', border: 'rgba(199, 125, 255, 0.12)' },
  { bg: 'rgba(76, 201, 240, 0.06)', border: 'rgba(76, 201, 240, 0.12)' },
  { bg: 'rgba(128, 185, 24, 0.06)', border: 'rgba(128, 185, 24, 0.12)' },
  { bg: 'rgba(244, 162, 97, 0.06)', border: 'rgba(244, 162, 97, 0.12)' },
  { bg: 'rgba(232, 168, 124, 0.06)', border: 'rgba(232, 168, 124, 0.12)' },
  { bg: 'rgba(167, 139, 250, 0.06)', border: 'rgba(167, 139, 250, 0.12)' },
]

const VISIBLE = 4

type Phase = 'picking' | 'active'

interface RefreshModeProps {
  className?: string
}

export default function RefreshMode({ className }: RefreshModeProps) {
  const [phase, setPhase] = useState<Phase>('picking')
  const [deck] = useState(shuffled)
  const [topIndex, setTopIndex] = useState(0)
  const [chosen, setChosen] = useState<Activity | null>(null)

  // Drag
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)

  // Dismissed card: flies out via CSS, then removed
  const [dismissed, setDismissed] = useState(false)
  const [dismissDir, setDismissDir] = useState(0)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (dismissed) return
    setIsDragging(true)
    startXRef.current = e.clientX
    setDragX(0)
  }, [dismissed])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    setDragX(e.clientX - startXRef.current)
  }, [isDragging])

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    if (dragX < -80) {
      // Swipe left only = next card
      setDismissDir(-1)
      setDismissed(true)

      setTimeout(() => {
        setTopIndex(prev => (prev + 1) % deck.length)
        setDismissed(false)
        setDismissDir(0)
        setDragX(0)
      }, 350)
    } else {
      setDragX(0)
    }
  }, [isDragging, dragX, deck.length])

  const handleUndo = useCallback(() => {
    if (dismissed) return
    setTopIndex(prev => (prev - 1 + deck.length) % deck.length)
  }, [dismissed, deck.length])

  const handlePick = useCallback(() => {
    setChosen(deck[topIndex])
    setPhase('active')
  }, [deck, topIndex])

  // ── RENDER: Picking ──

  if (phase === 'picking') {
    return (
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center ${className || ''}`}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => { if (isDragging) { setIsDragging(false); setDragX(0) } }}
      >
        <p
          className="text-xs mb-10"
          style={{ color: 'rgba(255, 255, 255, 0.25)' }}
        >
          Swipe to browse, pick one
        </p>

        <div className="relative w-[320px] h-[380px]">
          {/* Render VISIBLE cards, back to front */}
          {Array.from({ length: VISIBLE }, (_, i) => VISIBLE - 1 - i).map(depth => {
            const idx = (topIndex + depth) % deck.length
            const activity = deck[idx]
            const isTop = depth === 0
            const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length]

            // Compute visual position
            let visualDepth = depth
            let flyOut = false

            if (dismissed) {
              if (isTop) {
                // Top card flies away
                flyOut = true
              } else {
                // Others slide one position forward
                visualDepth = depth - 1
              }
            }

            let tx: number, ty: number, sc: number, rot: number, op: number

            if (flyOut) {
              tx = dismissDir * 500
              ty = -30
              sc = 0.95
              rot = dismissDir * 18
              op = 0
            } else if (isTop && !dismissed) {
              // Top card follows drag
              tx = dragX
              ty = 0
              sc = 1
              rot = dragX * 0.04
              op = 1
            } else {
              // Stack position based on visualDepth
              tx = visualDepth * 20
              ty = visualDepth * 10
              sc = 1 - visualDepth * 0.04
              rot = 0
              op = 1 - visualDepth * 0.12
            }

            const useTransition = !isDragging || !isTop

            return (
              <div
                key={activity.id}
                className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center px-7 select-none overflow-hidden"
                style={{
                  background: accent.bg,
                  border: `1px solid ${accent.border}`,
                  backdropFilter: 'blur(16px)',
                  transform: `translateX(${tx}px) translateY(${ty}px) scale(${sc}) rotate(${rot}deg)`,
                  opacity: Math.max(0, op),
                  transition: useTransition ? 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease' : 'none',
                  zIndex: flyOut ? 0 : 20 - depth,
                  cursor: isTop && !dismissed ? 'grab' : 'default',
                  touchAction: 'none',
                  willChange: 'transform, opacity',
                  pointerEvents: isTop && !dismissed ? 'auto' : 'none',
                }}
                onPointerDown={isTop && !dismissed ? handlePointerDown : undefined}
              >
                <activity.icon size={44} strokeWidth={1.5} style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="mb-4" />

                <p
                  className="text-xl font-light text-center mb-2"
                  style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                >
                  {activity.title}
                </p>

                <p
                  className="text-[13px] text-center leading-relaxed mb-5 px-1"
                  style={{ color: 'rgba(255, 255, 255, 0.35)' }}
                >
                  {activity.description}
                </p>

                <button
                  onClick={(e) => { e.stopPropagation(); handlePick() }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="px-8 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    background: 'rgba(128, 185, 24, 0.15)',
                    border: '1px solid rgba(128, 185, 24, 0.3)',
                    color: 'rgba(128, 185, 24, 0.9)',
                    visibility: isTop && !dismissed ? 'visible' : 'hidden',
                  }}
                >
                  I'll do this
                </button>
              </div>
            )
          })}
        </div>

        {/* Undo + Dots */}
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={handleUndo}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/5 active:scale-90"
            style={{ color: 'rgba(255, 255, 255, 0.25)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-1.5">
            {deck.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === topIndex ? 12 : 6,
                  height: 6,
                  background: i === topIndex
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'rgba(255, 255, 255, 0.1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── RENDER: Active ──

  if (phase === 'active' && chosen) {
    return (
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${className || ''}`}>
        <div className="flex flex-col items-center gap-5 max-w-md px-8">
          <chosen.icon size={56} strokeWidth={1.5} style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="mb-2" />

          <p
            className="text-2xl font-light text-center"
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
          >
            {chosen.title}
          </p>

          <p
            className="text-sm text-center leading-relaxed"
            style={{ color: 'rgba(255, 255, 255, 0.45)' }}
          >
            {chosen.description}
          </p>

          <p
            className="text-xs mt-6"
            style={{ color: 'rgba(255, 255, 255, 0.2)' }}
          >
            Take your time. The timer is running.
          </p>
        </div>
      </div>
    )
  }

  return null
}
