# Brain Bed v2 — Design Spec: BFI Dashboard & Notifications

---

## 1. BFI Gauge Component

### Layout
```
     ╭──── circular arc (stage color) ────╮
     │                                     │
     │         BFI number (48px)           │
     │            "72"                      │
     │      stage icon + label             │
     │       🔥 Heating                    │
     │                                     │
     ╰─────────────────────────────────────╯

     Token: 45.2K  ·  3.2K/min
     Active: 78min
     Tools: Claude, Codex
```

### Stage Colors & Icons

| Stage | Arc color | Text color | Icon (inline SVG) |
|-------|-----------|------------|-------------------|
| Calm | #22c55e → #4ade80 | #22c55e | Leaf — path with two curves |
| Warming | #eab308 → #facc15 | #eab308 | Sun — circle + rays |
| Heating | #f97316 → #fb923c | #f97316 | Flame — fire shape path |
| Brain Fry | #ef4444 → #f87171 | #ef4444 | Zap — lightning bolt path |

### Gauge Specs
- Size: 160×160px (same as existing ring)
- Stroke width: 8px
- Background track: rgba(255,255,255,0.06)
- Arc: 0° to (bfi/100 × 360°), stage gradient
- BFI number: font-size 48px, font-weight 700, stage color
- Stage label: font-size 13px, font-weight 500, rgba(255,255,255,0.5)
- Icon: 16×16px inline SVG, stage color, next to label

### Stats Below Gauge
- Token total + velocity: "45.2K · 3.2K/min"
- Elapsed: "Active: 78min"
- Tools: "Claude, Codex" (from activeTools array)
- All text: font-size 12px, rgba(255,255,255,0.4)

---

## 2. Notification Messages

### Message Selection Logic
Pick message based on the highest-scoring BFI factor:

```
dominant = factor with max sub-score
message = random from messages[dominant][stage]
```

### Message Pool (English)

**Token velocity dominant**:
- warming: "You've been processing tokens at a high rate. A short pause helps your brain catch up."
- heating: "Token velocity is climbing fast. Your review accuracy drops with sustained load."
- brain-fry: "You've burned through {n}K tokens. Your brain deserves a reset."

**Elapsed time dominant**:
- warming: "You've been at it for {n} minutes. A quick break refreshes focus."
- heating: "{n} minutes straight — that's a marathon session. Consider pausing."
- brain-fry: "Over {n} minutes without rest. Even a 5-minute break helps more than you think."

**Late night dominant**:
- warming: "It's getting late. Wrapping up soon would do you good."
- heating: "It's {time}. Late-night sessions often create tomorrow's bugs."
- brain-fry: "It's {time}. Sleep is the best debugger. The code will be here tomorrow."

**Multi-tool dominant**:
- warming: "Multiple AI tools active — that's a lot of context switching."
- heating: "Running {tools} at once. Your brain is juggling hard."
- brain-fry: "Heavy multi-tool usage detected. Your cognitive load is at its peak."

**Snooze dominant**:
- warming: "You've dismissed a few alerts. Just a gentle reminder to check in with yourself."
- heating: "Dismissal #{n}. Pushing through is exactly when breaks matter most."
- brain-fry: "You keep going. That persistence is admirable — but your brain is asking for a pause."

---

## 3. Tray Menu

```
BFI: 72 — Heating          (disabled, info only)
Token: 45.2K (3.2K/min)    (disabled, info only)
──────────────────
Take a Break                (click → showTimeSelection)
──────────────────
Show Dashboard              (click → showMainWindow)
──────────────────
Quit
```

---

*작성일: 2026-03-26*
