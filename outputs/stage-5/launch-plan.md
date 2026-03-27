# Brain Bed — Launch Plan

## Launch Platforms

### 1. Product Hunt (Primary)

**Target**: Top 5 of the day

**Title options** (pick one):
1. "Brain Bed — Your AI is working. Your brain needs to stop."
2. "Brain Bed — Forced meditation for developers who can't stop prompting"
3. "Brain Bed — The app that locks your keyboard when AI fries your brain"

**Tagline**: "Monitors Claude, Gemini & Codex usage. Forces meditation breaks based on cognitive load."

**Timing**: Tuesday or Wednesday, 12:01 AM PT

**Launch day checklist**:
| Time (PT) | Action |
|-----------|--------|
| 12:01 AM | Product Hunt goes live |
| 12:05 AM | Tweet announcement with PH link |
| 6:00 AM | Post to IndieHackers, Dev.to |
| 8:00 AM | Reddit posts (r/ClaudeAI, r/programming) |
| 9:00 AM | Email waitlist: "We launched on Product Hunt!" |
| 12:00 PM | Mid-day engagement — reply to every comment on PH |
| 3:00 PM | Share milestone update on Twitter ("Top X on PH!") |
| 6:00 PM | Thank you tweet + behind-the-scenes thread |

**Maker comment template**:
> Hi! I built Brain Bed because I kept burning out from multi-hour Claude Code sessions. The app reads your CLI logs locally (no cloud, no API keys), calculates a "Brain Fry Index" from your message velocity, session count, and time of day, then locks your keyboard and plays classical music when you need to stop. It's free, open source, and macOS only for now. I'd love your feedback!

### 2. Show HN

**Title**: "Show HN: Brain Bed – Forced meditation breaks for AI-fried developers"

**Post body**:
```
Brain Bed is a macOS menu bar app that monitors your AI CLI tool usage
(Claude Code, Gemini CLI, Codex CLI) and forces you to take meditation
breaks when your cognitive load gets too high.

It calculates a Brain Fry Index (0-100) from:
- Message velocity (how fast you're prompting)
- Active sessions (how many AI tools are running)
- Late-night usage
- Dismissed alert count

When BFI hits "Heating" (60+), you get a contextual notification.
The meditation mode locks your keyboard, shows a breathing circle,
plays classical music, and displays quotes.

Everything runs locally — it reads ~/.claude, ~/.gemini, ~/.codex
session files. No cloud, no accounts, no tracking.

Free, open source: https://github.com/bbangjooo/brain-bed
Landing page: [vercel URL]

Built with Electron, React, Three.js, Web Audio API, SQLite.
Would love feedback on the BFI formula and meditation experience.
```

### 3. Reddit Strategy

| Subreddit | Angle | Timing |
|-----------|-------|--------|
| r/ClaudeAI (180K) | "I track my Claude usage and force myself to take breaks" | Day 1 |
| r/ChatGPTPro (50K) | "Tool for preventing AI-assisted burnout" | Day 1 |
| r/programming (6M) | "Brain Fry: the hidden cost of AI pair programming" | Day 2 |
| r/macapps (200K) | "Menu bar app for forced meditation breaks" | Day 2 |
| r/ExperiencedDevs (300K) | "How do you manage fatigue from AI tools?" (discussion, not promo) | Day 3 |
| r/sideproject (100K) | "Built and shipped Brain Bed in one session with Claude Code" | Day 3 |

### 4. Community Cross-posting

| Platform | Content |
|----------|---------|
| IndieHackers | Product launch + story |
| Dev.to | "I Built a Brain Fry Detector for AI Developers" article |
| Lobste.rs | Cross-post Show HN |
| GeekNews (Korean) | Korean-angle: "AI 도구 과다 사용 방지 앱" |

---

*Created: 2026-03-26*
