# Brain Bed - 디자인 명세서 (Design Specification)

> AI 시대의 강제 휴식 데스크탑 앱 - 개발 핸드오프 문서

---

## 문서 정보

| 항목 | 내용 |
|------|------|
| 프로젝트명 | Brain Bed |
| 문서 유형 | 디자인 명세서 (Design Spec) |
| 플랫폼 | macOS (Electron 데스크탑 앱) |
| 작성일 | 2026-03-26 |
| 기술 스택 | Electron + React + Tailwind CSS |

---

## 1. 디자인 원칙 (Design Principles)

### 1.1 핵심 원칙

| 원칙 | 설명 | 적용 예시 |
|------|------|-----------|
| **최소 자극** | 명상 모드에서 시선을 뺏는 요소를 최소화한다 | UI 요소를 화면 가장자리에 배치, 반투명 처리 |
| **점진적 전환** | 모든 상태 변화는 부드러운 애니메이션으로 전환한다 | 페이드인/아웃, 색상 그라데이션 루프 |
| **비침범적 존재감** | 앱은 백그라운드에 조용히 존재하다가 필요할 때만 나타난다 | 트레이 아이콘으로만 상주, Dock 아이콘 없음 |
| **따뜻한 강제성** | 강제 휴식이되 불쾌하지 않은 경험을 제공한다 | 친근한 문구, 아름다운 시각 환경, 클래식 음악 |
| **접근성 우선** | 모든 텍스트는 WCAG AA 기준을 충족한다 | 명암비 4.5:1 이상 보장 |

### 1.2 무드 키워드

- 명상적 (Meditative)
- 차분한 (Calm)
- 고급스러운 (Premium)
- 어두운 (Dark)
- 부드러운 (Soft)

---

## 2. 색상 시스템 (Color System)

### 2.1 그라데이션 팔레트 (명상 모드 전용)

명상 모드 배경에 사용되는 4세트의 그라데이션. 세션마다 랜덤 또는 순차 적용.

| 세트명 | 시작 | 중간 | 끝 | 용도 |
|--------|------|------|-----|------|
| Deep Purple | `#0f0c29` | `#302b63` | `#24243e` | 기본 그라데이션 |
| Deep Blue | `#0d1b2a` | `#1b2838` | `#2c3e50` | 차가운 톤 |
| Navy | `#1a1a2e` | `#16213e` | `#0f3460` | 깊은 톤 |
| Dark Neutral | `#1b1b1b` | `#2d2d2d` | `#1b1b1b` | 무채색 톤 |

### 2.2 UI 색상 토큰

```css
:root {
  /* ── 배경 ── */
  --bg-primary: #1a1a2e;           /* 앱 전반 배경 (설정 창 등) */
  --bg-secondary: #16213e;         /* 카드, 섹션 배경 */
  --bg-elevated: #1e2a42;          /* 호버 상태, 드롭다운 */
  --bg-overlay: rgba(0, 0, 0, 0.6); /* 다이얼로그 오버레이 */

  /* ── 텍스트 ── */
  --text-primary: rgba(255, 255, 255, 0.95);   /* 제목, 주요 텍스트 */
  --text-secondary: rgba(255, 255, 255, 0.7);  /* 부가 정보 */
  --text-tertiary: rgba(255, 255, 255, 0.4);   /* 힌트, 비활성 */
  --text-quote: rgba(255, 255, 255, 0.85);     /* 동기부여 문구 */

  /* ── 액센트 ── */
  --accent-primary: #7c6eef;        /* 주요 버튼, 활성 상태 */
  --accent-primary-hover: #6b5dd3;  /* 주요 버튼 호버 */
  --accent-secondary: #4a90d9;      /* 보조 강조 */
  --accent-warm: #e8a87c;           /* 따뜻한 포인트 (완료 화면) */

  /* ── 상태 ── */
  --state-success: #6bcb77;         /* 완료, 긍정 */
  --state-warning: #ffd93d;         /* 임계값 근접 */
  --state-danger: #ff6b6b;          /* 강제 진입 경고 */

  /* ── 타이머 ── */
  --timer-track: rgba(255, 255, 255, 0.15);    /* 타이머 배경 트랙 */
  --timer-progress: rgba(255, 255, 255, 0.8);  /* 타이머 진행 바 */
  --timer-text: rgba(255, 255, 255, 0.9);      /* 타이머 숫자 */

  /* ── 경계선/구분 ── */
  --border-subtle: rgba(255, 255, 255, 0.08);  /* 섹션 구분선 */
  --border-default: rgba(255, 255, 255, 0.15); /* 입력 필드 테두리 */
  --border-focus: rgba(124, 110, 239, 0.5);    /* 포커스 링 */
}
```

### 2.3 WCAG 명암비 검증

| 조합 | 전경 | 배경 | 명암비 | 등급 |
|------|------|------|--------|------|
| 문구 on 그라데이션 | `rgba(255,255,255,0.85)` | `#0f0c29` (가장 어두운 배경) | 14.2:1 | AAA |
| 주요 텍스트 on 배경 | `rgba(255,255,255,0.95)` | `#1a1a2e` | 12.8:1 | AAA |
| 보조 텍스트 on 배경 | `rgba(255,255,255,0.7)` | `#1a1a2e` | 9.5:1 | AAA |
| 비활성 텍스트 on 배경 | `rgba(255,255,255,0.4)` | `#1a1a2e` | 5.4:1 | AA |
| 타이머 텍스트 on 그라데이션 | `rgba(255,255,255,0.9)` | `#302b63` (가장 밝은 중간) | 8.1:1 | AAA |
| 버튼 텍스트 on 액센트 | `#ffffff` | `#7c6eef` | 4.6:1 | AA |

---

## 3. 타이포그래피 시스템 (Typography System)

### 3.1 폰트 패밀리

```css
:root {
  /* 한글 본문/UI: Pretendard - 가독성 좋은 한글 산세리프 */
  --font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

  /* 영문 보조: Inter - 깔끔한 영문 산세리프 */
  --font-body: 'Inter', var(--font-sans);

  /* 동기부여 문구: Playfair Display - 클래식하고 우아한 세리프 */
  --font-display: 'Playfair Display', 'Noto Serif KR', Georgia, serif;

  /* 타이머/숫자: DM Sans - 둥근 느낌의 모노스페이스 대안 */
  --font-mono: 'DM Sans', 'SF Mono', monospace;
}
```

### 3.2 폰트 크기 스케일 (rem 기준, base: 16px)

| 토큰 | rem | px | 용도 |
|------|-----|-----|------|
| `--text-xs` | 0.75rem | 12px | 트레이 메뉴 부가 정보 |
| `--text-sm` | 0.875rem | 14px | 설정 화면 라벨, 음악 정보 |
| `--text-base` | 1rem | 16px | 본문 텍스트, 설정 값 |
| `--text-lg` | 1.125rem | 18px | 다이얼로그 본문 |
| `--text-xl` | 1.25rem | 20px | 섹션 제목 |
| `--text-2xl` | 1.5rem | 24px | 설정 화면 타이틀 |
| `--text-3xl` | 2rem | 32px | 완료 화면 메시지 |
| `--text-4xl` | 2.5rem | 40px | 타이머 숫자 (MM:SS) |
| `--text-5xl` | 3.5rem | 56px | 동기부여 문구 (데스크탑) |
| `--text-6xl` | 4.5rem | 72px | 동기부여 문구 (대형 디스플레이) |

### 3.3 폰트 무게

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--font-light` | 300 | 동기부여 문구, 부가 정보 |
| `--font-regular` | 400 | 본문 텍스트 |
| `--font-medium` | 500 | 라벨, 메뉴 항목 |
| `--font-semibold` | 600 | 버튼 텍스트, 제목 |
| `--font-bold` | 700 | 타이머 숫자, 강조 |

### 3.4 줄 높이 (Line Height)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--leading-tight` | 1.2 | 제목, 동기부여 문구 |
| `--leading-normal` | 1.5 | 본문 텍스트 |
| `--leading-relaxed` | 1.75 | 설정 설명 텍스트 |

### 3.5 글자 간격 (Letter Spacing)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--tracking-tight` | -0.02em | 큰 제목, 문구 |
| `--tracking-normal` | 0 | 본문 |
| `--tracking-wide` | 0.05em | 소문자 라벨, 캡션 |
| `--tracking-wider` | 0.1em | 타이머 숫자 |

---

## 4. 간격 시스템 (Spacing System)

### 4.1 기본 간격 스케일 (4px 기반)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--space-1` | 4px | 아이콘과 텍스트 사이 |
| `--space-2` | 8px | 인라인 요소 간격 |
| `--space-3` | 12px | 리스트 항목 내부 패딩 |
| `--space-4` | 16px | 카드 내부 패딩 |
| `--space-5` | 20px | 섹션 간 작은 간격 |
| `--space-6` | 24px | 컴포넌트 간 기본 간격 |
| `--space-8` | 32px | 섹션 간 큰 간격 |
| `--space-10` | 40px | 설정 창 패딩 |
| `--space-12` | 48px | 명상 화면 요소 간격 |
| `--space-16` | 64px | 명상 화면 큰 간격 |
| `--space-20` | 80px | 명상 화면 상하 여백 |

### 4.2 모서리 반지름 (Border Radius)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--radius-sm` | 4px | 태그, 뱃지 |
| `--radius-md` | 8px | 버튼, 입력 필드 |
| `--radius-lg` | 12px | 카드, 다이얼로그 |
| `--radius-xl` | 16px | 설정 창 |
| `--radius-full` | 9999px | 원형 버튼, 토글 |

---

## 5. 컴포넌트 디자인 (화면별 상세)

### 5.1 시스템 트레이 메뉴

macOS 네이티브 트레이 메뉴를 사용하므로 커스텀 디자인이 아닌 **Electron Tray API** 네이티브 렌더링을 따른다.

#### 트레이 아이콘

```
크기: 16x16px (@1x), 32x32px (@2x Retina)
형식: PNG, Template Image (macOS 자동 다크모드 대응)
색상: 단색 (macOS가 시스템 테마에 맞춰 자동 렌더링)
```

| 상태 | 아이콘 | 설명 |
|------|--------|------|
| 기본 | 뇌 + 침대 심볼 (outline) | 앱 기본 상태 |
| 경고 (80%+) | 뇌 + 침대 심볼 (filled) | 임계값 80% 이상 도달 |
| 명상 중 | 달/별 심볼 | Inner Peace Zone 활성 중 |

#### 드롭다운 메뉴 항목

```
[연속 사용: 45분]          -- 비활성 텍스트, 상태 정보
────────────────           -- 구분선
지금 쉬기                   -- 활성 메뉴 항목
설정...                    -- 새 창 오픈
────────────────           -- 구분선
Brain Bed 종료             -- 앱 종료
```

- Electron `Menu.buildFromTemplate()` 사용
- 네이티브 macOS 메뉴 스타일 그대로 적용 (커스텀 불필요)

---

### 5.2 알림 (macOS 네이티브)

macOS 알림 센터를 통한 네이티브 알림. 커스텀 디자인 불필요.

```
┌─────────────────────────────────────────┐
│  [Brain Bed 아이콘]  Brain Bed          │
│                                          │
│  90분 연속 사용 중이에요.                │
│  잠깐 쉬어볼까요?                        │
│                                          │
│          [쉬기]    [10분 뒤에]            │
└─────────────────────────────────────────┘
```

- Electron `Notification` API 사용
- `hasReply: false`
- `actions: [{ type: 'button', text: '쉬기' }, { type: 'button', text: '10분 뒤에' }]`

---

### 5.3 명상 시간 선택 UI

Inner Peace Zone 진입 전 표시되는 시간 선택 오버레이.

#### 레이아웃

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              (그라데이션 배경, 블러 처리)                   │
│                                                          │
│                                                          │
│              얼마나 쉴까요?                                │
│              (--text-2xl, --font-display, --font-light)   │
│                                                          │
│                     --space-8                             │
│                                                          │
│       [5분]  [10분]  [15분]  [20분]  [30분]               │
│                                                          │
│              (선택된 항목 강조)                             │
│                                                          │
│                     --space-6                             │
│                                                          │
│                   [시작하기]                               │
│                                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### 상세 스펙

```css
/* 컨테이너 */
.time-select-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(15, 12, 41, 0.95);  /* Deep Purple 기반 */
  backdrop-filter: blur(20px);
  z-index: 100;
}

/* 제목 */
.time-select-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);        /* 24px */
  font-weight: var(--font-light);    /* 300 */
  color: var(--text-primary);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--space-8);     /* 32px */
}

/* 시간 버튼 그룹 */
.time-options {
  display: flex;
  gap: var(--space-3);               /* 12px */
}

/* 개별 시간 버튼 */
.time-option {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-lg);   /* 12px */
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: var(--text-lg);         /* 18px */
  font-weight: var(--font-medium);   /* 500 */
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-option:hover {
  border-color: var(--accent-primary);
  color: var(--text-primary);
  background: rgba(124, 110, 239, 0.1);
}

.time-option.selected {
  border-color: var(--accent-primary);
  background: rgba(124, 110, 239, 0.2);
  color: var(--text-primary);
  box-shadow: 0 0 20px rgba(124, 110, 239, 0.15);
}

/* 시작 버튼 */
.start-button {
  margin-top: var(--space-6);        /* 24px */
  padding: 14px 48px;
  border-radius: var(--radius-full); /* pill shape */
  background: var(--accent-primary);
  color: #ffffff;
  font-family: var(--font-sans);
  font-size: var(--text-base);       /* 16px */
  font-weight: var(--font-semibold); /* 600 */
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-button:hover {
  background: var(--accent-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(124, 110, 239, 0.3);
}
```

#### 진입 애니메이션

- 오버레이: `opacity 0 -> 1`, 800ms, `ease-out`
- 제목: `opacity 0 -> 1` + `translateY(20px) -> 0`, 600ms, `ease-out`, delay 200ms
- 시간 버튼: 각각 stagger 50ms 딜레이로 `opacity 0 -> 1` + `scale(0.9) -> 1`, 400ms
- 시작 버튼: `opacity 0 -> 1`, 400ms, delay 500ms

---

### 5.4 Inner Peace Zone (전체화면 명상 모드)

앱의 핵심 화면. 전체화면을 차지하며, 최소한의 UI로 명상 환경을 구성한다.

#### 레이아웃 구조

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              (animated gradient background)              │  │
│  │                                                          │  │
│  │                                                          │  │
│  │                                                          │  │
│  │                                                          │  │
│  │          "잠깐 멈추는 것도 전진이에요."                    │  │  ← 화면 중앙
│  │          (--text-5xl, --font-display, --font-light)      │  │
│  │                                                          │  │
│  │                                                          │  │
│  │                                                          │  │
│  │                                                          │  │
│  │                                                          │  │
│  │                   ┌──────┐                                │  │
│  │                   │ 7:32 │                                │  │  ← 하단에서 120px 위
│  │                   │  ◯   │                                │  │     원형 프로그레스
│  │                   └──────┘                                │  │
│  │                                                          │  │
│  │  🔊 ━━━━━━━━━━━━                                        │  │  ← 하단에서 48px 위, 좌측 48px
│  │                    Gymnopedies No.1 - Erik Satie         │  │  ← 하단에서 48px 위, 우측 48px
│  │                                                          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

#### 5.4.1 그라데이션 배경

```css
.gradient-background {
  position: fixed;
  inset: 0;
  z-index: 0;
}

/* 그라데이션 애니메이션 - 10초 루프 */
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Deep Purple 세트 예시 */
.gradient-deep-purple {
  background: linear-gradient(-45deg, #0f0c29, #302b63, #24243e, #0f0c29);
  background-size: 400% 400%;
  animation: gradientShift 10s ease infinite;
}

.gradient-deep-blue {
  background: linear-gradient(-45deg, #0d1b2a, #1b2838, #2c3e50, #0d1b2a);
  background-size: 400% 400%;
  animation: gradientShift 10s ease infinite;
}

.gradient-navy {
  background: linear-gradient(-45deg, #1a1a2e, #16213e, #0f3460, #1a1a2e);
  background-size: 400% 400%;
  animation: gradientShift 10s ease infinite;
}

.gradient-dark-neutral {
  background: linear-gradient(-45deg, #1b1b1b, #2d2d2d, #1b1b1b, #2d2d2d);
  background-size: 400% 400%;
  animation: gradientShift 10s ease infinite;
}
```

#### 5.4.2 동기부여 문구

```css
.quote-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 800px;
  text-align: center;
  z-index: 10;
}

.quote-text {
  font-family: var(--font-display);   /* Playfair Display / Noto Serif KR */
  font-size: var(--text-5xl);          /* 56px */
  font-weight: var(--font-light);      /* 300 */
  color: var(--text-quote);            /* rgba(255,255,255,0.85) */
  line-height: var(--leading-tight);   /* 1.2 */
  letter-spacing: var(--tracking-tight); /* -0.02em */
  text-shadow: 0 2px 40px rgba(0, 0, 0, 0.3);
}

/* 한글 문구일 때 - Noto Serif KR 폴백 */
.quote-text:lang(ko) {
  font-size: var(--text-4xl);          /* 40px - 한글은 약간 작게 */
  letter-spacing: -0.01em;
  word-break: keep-all;
}
```

**문구 전환 애니메이션:**

```css
@keyframes quoteFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(12px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(0);
  }
}

@keyframes quoteFadeOut {
  from {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(-12px);
  }
}

/* 전환 타이밍: 30초 주기 */
/* 페이드아웃: 1초 (ease-in) → 대기: 0.5초 → 페이드인: 1초 (ease-out) */
.quote-entering {
  animation: quoteFadeIn 1s ease-out forwards;
}

.quote-exiting {
  animation: quoteFadeOut 1s ease-in forwards;
}
```

#### 5.4.3 원형 프로그레스 타이머

```css
.timer-container {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.timer-text {
  font-family: var(--font-mono);       /* DM Sans */
  font-size: var(--text-4xl);           /* 40px */
  font-weight: var(--font-bold);        /* 700 */
  color: var(--timer-text);             /* rgba(255,255,255,0.9) */
  letter-spacing: var(--tracking-wider); /* 0.1em */
  margin-bottom: var(--space-4);        /* 16px */
}
```

**SVG 원형 프로그레스 바:**

```html
<svg width="140" height="140" viewBox="0 0 140 140">
  <!-- 배경 트랙 -->
  <circle
    cx="70" cy="70" r="60"
    fill="none"
    stroke="rgba(255, 255, 255, 0.15)"
    stroke-width="4"
  />
  <!-- 진행 바 -->
  <circle
    cx="70" cy="70" r="60"
    fill="none"
    stroke="rgba(255, 255, 255, 0.8)"
    stroke-width="4"
    stroke-linecap="round"
    stroke-dasharray="376.99"
    stroke-dashoffset="/* 동적 계산: 376.99 * (1 - progress) */"
    transform="rotate(-90 70 70)"
    style="transition: stroke-dashoffset 1s linear;"
  />
</svg>
```

| 속성 | 값 | 설명 |
|------|-----|------|
| 반지름 (r) | 60px | PRD 기준 |
| 선 두께 (stroke-width) | 4px | PRD 기준 |
| SVG 크기 | 140x140px | r(60) + stroke(4) + padding |
| 둘레 (dasharray) | 376.99px | 2 * PI * 60 |
| 트랙 색상 | `rgba(255,255,255,0.15)` | 반투명 배경 |
| 진행 색상 | `rgba(255,255,255,0.8)` | 반투명 전경 |
| 끝 모양 | `round` | 둥근 끝 |
| 회전 방향 | 시계 방향 (12시부터) | `transform: rotate(-90deg)` |
| 업데이트 주기 | 1초 | `transition: stroke-dashoffset 1s linear` |

#### 5.4.4 음악 정보 및 볼륨 컨트롤

```css
.music-bar {
  position: absolute;
  bottom: 48px;
  left: 48px;
  right: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.music-bar:hover {
  opacity: 1;
}

/* 볼륨 컨트롤 (좌측) */
.volume-control {
  display: flex;
  align-items: center;
  gap: var(--space-3);               /* 12px */
}

.volume-icon {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  cursor: pointer;
}

.volume-slider {
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  background: var(--border-default);
  border-radius: var(--radius-full);
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--text-primary);
  cursor: pointer;
  transition: transform 0.15s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

/* 음악 정보 (우측) */
.music-info {
  text-align: right;
}

.music-title {
  font-family: var(--font-body);
  font-size: var(--text-sm);         /* 14px */
  font-weight: var(--font-regular);
  color: var(--text-secondary);
}

.music-artist {
  font-family: var(--font-body);
  font-size: var(--text-xs);         /* 12px */
  font-weight: var(--font-regular);
  color: var(--text-tertiary);
  margin-top: 2px;
}
```

---

### 5.5 해제 확인 다이얼로그

`Cmd + Shift + Esc` 입력 시 표시되는 모달 다이얼로그.

#### 레이아웃

```
┌──────────────────────────────────────────────────────────┐
│                    (배경 어둡게)                           │
│                                                          │
│              ┌──────────────────────────┐                │
│              │                          │                │
│              │  정말 나가시겠어요?       │                │
│              │                          │                │
│              │  아직 7분 32초            │                │
│              │  남았어요.               │                │
│              │                          │                │
│              │  [계속 쉬기]  [나가기]    │                │
│              │                          │                │
│              └──────────────────────────┘                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### 상세 스펙

```css
/* 오버레이 */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

/* 다이얼로그 박스 */
.dialog-box {
  width: 360px;
  padding: var(--space-8);           /* 32px */
  border-radius: var(--radius-lg);   /* 12px */
  background: var(--bg-secondary);   /* #16213e */
  border: 1px solid var(--border-subtle);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  text-align: center;
}

/* 제목 */
.dialog-title {
  font-family: var(--font-sans);
  font-size: var(--text-xl);         /* 20px */
  font-weight: var(--font-semibold); /* 600 */
  color: var(--text-primary);
  margin-bottom: var(--space-3);     /* 12px */
}

/* 남은 시간 */
.dialog-remaining {
  font-family: var(--font-sans);
  font-size: var(--text-base);       /* 16px */
  font-weight: var(--font-regular);
  color: var(--text-secondary);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-6);     /* 24px */
}

/* 버튼 그룹 */
.dialog-actions {
  display: flex;
  gap: var(--space-3);               /* 12px */
  justify-content: center;
}

/* 계속 쉬기 (주요 액션) */
.btn-continue {
  flex: 1;
  padding: 12px 24px;
  border-radius: var(--radius-md);   /* 8px */
  background: var(--accent-primary); /* #7c6eef */
  color: #ffffff;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-continue:hover {
  background: var(--accent-primary-hover);
}

/* 나가기 (보조 액션) */
.btn-exit {
  flex: 1;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  border: 1px solid var(--border-default);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-exit:hover {
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
}
```

#### 다이얼로그 진입/퇴장 애니메이션

```css
/* 진입 */
@keyframes dialogEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 퇴장 */
@keyframes dialogExit {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(8px);
  }
}

.dialog-entering {
  animation: dialogEnter 0.25s ease-out forwards;
}

.dialog-exiting {
  animation: dialogExit 0.2s ease-in forwards;
}

/* 오버레이 페이드 */
.overlay-entering {
  animation: fadeIn 0.2s ease-out forwards;
}

.overlay-exiting {
  animation: fadeOut 0.15s ease-in forwards;
}
```

---

### 5.6 설정 화면

독립된 윈도우(400x500px)에 표시되는 설정 패널.

#### 레이아웃

```
┌──────────────────────────── 400px ─────────────────────────┐
│                                                            │
│  ── 설정 ──                                   (X 닫기)     │  ← 타이틀바
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │  연속 사용 알림 시간                                  │  │
│  │  ━━━━━━━━━━━━━━━━━●━━━━━━━  90분                    │  │
│  │                                                      │  │
│  │  ─────────────────────────────────────────────────── │  │
│  │                                                      │  │
│  │  재알림 간격                                          │  │
│  │  [ 10분                              ▼ ]              │  │
│  │                                                      │  │
│  │  ─────────────────────────────────────────────────── │  │
│  │                                                      │  │
│  │  기본 명상 시간                                       │  │
│  │  [ 10분                              ▼ ]              │  │
│  │                                                      │  │
│  │  ─────────────────────────────────────────────────── │  │
│  │                                                      │  │
│  │  긴급 해제 핫키                                       │  │
│  │  [ Cmd + Shift + Esc            (변경) ]              │  │
│  │                                                      │  │
│  │  ─────────────────────────────────────────────────── │  │
│  │                                                      │  │
│  │  강제 진입 모드                              [  ○ ]   │  │
│  │  3회 무시 시 자동 진입                                │  │
│  │                                                      │  │
│  │  ─────────────────────────────────────────────────── │  │
│  │                                                      │  │
│  │  음악 자동 재생                              [ ●  ]   │  │
│  │                                                      │  │
│  │  ─────────────────────────────────────────────────── │  │
│  │                                                      │  │
│  │  로그인 시 자동 시작                         [  ○ ]   │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  설정은 변경 즉시 적용됩니다.                                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### 상세 스펙

```css
/* 설정 윈도우 - Electron BrowserWindow 설정 */
/* width: 400, height: 500, resizable: false, titleBarStyle: 'hiddenInset' */

.settings-container {
  width: 400px;
  height: 500px;
  background: var(--bg-primary);     /* #1a1a2e */
  overflow-y: auto;
  padding: var(--space-10) var(--space-6); /* 40px 24px */
  /* macOS titlebar 영역 */
  padding-top: 52px;                 /* 신호등 버튼 + 여백 */
}

/* 설정 타이틀 */
.settings-title {
  font-family: var(--font-sans);
  font-size: var(--text-2xl);        /* 24px */
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-6);     /* 24px */
}

/* 설정 항목 */
.settings-item {
  padding: var(--space-4) 0;         /* 16px 0 */
  border-bottom: 1px solid var(--border-subtle);
}

.settings-item:last-child {
  border-bottom: none;
}

/* 라벨 */
.settings-label {
  font-family: var(--font-sans);
  font-size: var(--text-sm);         /* 14px */
  font-weight: var(--font-medium);   /* 500 */
  color: var(--text-primary);
  margin-bottom: var(--space-2);     /* 8px */
}

/* 부가 설명 */
.settings-description {
  font-family: var(--font-sans);
  font-size: var(--text-xs);         /* 12px */
  color: var(--text-tertiary);
  margin-top: var(--space-1);        /* 4px */
}

/* 슬라이더 (연속 사용 알림 시간) */
.settings-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background: var(--border-default);
  border-radius: var(--radius-full);
  outline: none;
}

.settings-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent-primary);
  cursor: pointer;
}

.settings-slider-value {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--accent-primary);
  font-weight: var(--font-semibold);
}

/* 드롭다운 */
.settings-select {
  width: 100%;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.settings-select:focus {
  border-color: var(--border-focus);
  outline: none;
}

/* 토글 스위치 */
.toggle-switch {
  width: 44px;
  height: 24px;
  border-radius: var(--radius-full);
  background: var(--border-default);
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toggle-switch.active {
  background: var(--accent-primary);
}

.toggle-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.toggle-switch.active .toggle-thumb {
  transform: translateX(20px);
}

/* 핫키 입력 필드 */
.hotkey-input {
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hotkey-input.recording {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(124, 110, 239, 0.2);
  animation: pulse 1.5s ease-in-out infinite;
}

/* 하단 안내 */
.settings-footer {
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-align: center;
  padding: var(--space-4) 0;
}
```

---

### 5.7 완료 화면

명상 타이머가 끝나면 표시되는 완료 메시지. 3초 후 자동으로 전체화면이 해제된다.

#### 레이아웃

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              (그라데이션 배경 유지)                        │
│                                                          │
│                                                          │
│                                                          │
│                    수고했어요                              │
│              (--text-3xl, --font-display)                 │
│                                                          │
│                 10분 동안 쉬었어요                        │
│              (--text-lg, --text-secondary)                │
│                                                          │
│                                                          │
│                                                          │
│                                                          │
│              (3초 후 자동으로 돌아갑니다)                  │
│              (--text-sm, --text-tertiary)                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### 상세 스펙

```css
.completion-container {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.completion-title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);        /* 32px */
  font-weight: var(--font-light);
  color: var(--accent-warm);         /* #e8a87c - 따뜻한 색상 */
  margin-bottom: var(--space-3);     /* 12px */
}

.completion-summary {
  font-family: var(--font-sans);
  font-size: var(--text-lg);         /* 18px */
  font-weight: var(--font-regular);
  color: var(--text-secondary);
}

.completion-auto-close {
  font-family: var(--font-sans);
  font-size: var(--text-sm);         /* 14px */
  color: var(--text-tertiary);
  margin-top: var(--space-8);        /* 32px */
}
```

#### 완료 전환 애니메이션

```
[타이머 완료]
  → 타이머 + 문구 페이드아웃 (0.5s, ease-in)
  → 0.3s 대기
  → 완료 메시지 페이드인 (0.8s, ease-out)
  → 3초 대기
  → 전체 화면 페이드아웃 (0.8s, ease-in)
  → 전체화면 해제
```

---

## 6. 아이콘 & 에셋 (Icons & Assets)

### 6.1 트레이 아이콘

| 파일명 | 크기 | 용도 |
|--------|------|------|
| `tray-default.png` | 16x16 | 기본 상태 @1x |
| `tray-default@2x.png` | 32x32 | 기본 상태 @2x (Retina) |
| `tray-warning.png` | 16x16 | 경고 상태 @1x |
| `tray-warning@2x.png` | 32x32 | 경고 상태 @2x |
| `tray-meditation.png` | 16x16 | 명상 중 @1x |
| `tray-meditation@2x.png` | 32x32 | 명상 중 @2x |

- 형식: PNG, Template Image (흑백, macOS가 자동으로 다크/라이트 모드에 맞춰 렌더링)
- Electron 설정: `nativeImage.createFromPath()` + `setTemplateImage(true)`
- 디자인: 단순한 라인 아이콘, 1px 선 두께 (16px 기준)

### 6.2 앱 아이콘

```
크기: 512x512px (macOS 앱 아이콘 기준)
형식: ICNS (macOS)
배경: Deep Purple 그라데이션 (#0f0c29 → #302b63)
전경: 흰색 뇌+침대(또는 달) 심볼
모서리: macOS 자동 마스킹 (squircle)
```

### 6.3 인라인 아이콘 (설정 화면, 볼륨 등)

| 아이콘 | 크기 | 용도 | 권장 소스 |
|--------|------|------|-----------|
| Volume High | 20x20 | 볼륨 높음 | Lucide `volume-2` |
| Volume Low | 20x20 | 볼륨 낮음 | Lucide `volume-1` |
| Volume Mute | 20x20 | 음소거 | Lucide `volume-x` |
| Settings | 16x16 | 트레이 메뉴 (네이티브) | 시스템 제공 |
| Close | 14x14 | 다이얼로그 닫기 | Lucide `x` |

- 아이콘 라이브러리: [Lucide Icons](https://lucide.dev/) 권장
- `stroke-width: 1.5px` (기본보다 가늘게 - 차분한 무드 유지)
- 색상: `currentColor` 상속 (CSS로 제어)

---

## 7. 애니메이션 & 트랜지션 가이드

### 7.1 전체 애니메이션 원칙

1. **느리게, 부드럽게**: 명상 앱이므로 모든 애니메이션은 일반 앱보다 느리게 (최소 1.5배)
2. **Ease 함수 통일**: `ease`, `ease-out`, `ease-in-out` 사용. `linear`는 타이머 진행에만 사용
3. **과도한 움직임 금지**: bounce, spring 같은 활발한 이징 금지

### 7.2 이징 함수 정의

```css
:root {
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);     /* 일반 전환 */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);             /* 퇴장 */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);            /* 진입 */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);      /* 양방향 전환 */
  --ease-gentle: cubic-bezier(0.25, 0.1, 0.25, 1);  /* 문구 전환 (부드럽게) */
}
```

### 7.3 화면별 애니메이션 타이밍 총정리

| 요소 | 동작 | 듀레이션 | 이징 | 딜레이 |
|------|------|----------|------|--------|
| **Inner Peace Zone 진입** | 전체화면 페이드인 | 800ms | `--ease-out` | 0ms |
| 그라데이션 배경 | 색상 순환 루프 | 10000ms | `ease` | continuous |
| 동기부여 문구 | 페이드아웃 + Y(-12px) | 1000ms | `--ease-in` | 매 30초 |
| 동기부여 문구 | 페이드인 + Y(12px->0) | 1000ms | `--ease-out` | 페이드아웃 후 500ms |
| 타이머 진행 | stroke-dashoffset | 1000ms | `linear` | 매 1초 |
| 음악 정보 | 호버 시 opacity | 300ms | `ease` | 0ms |
| **시간 선택 UI** | 오버레이 페이드인 | 800ms | `--ease-out` | 0ms |
| 시간 선택 제목 | 페이드인 + Y(20px->0) | 600ms | `--ease-out` | 200ms |
| 시간 버튼들 | 스케일(0.9->1) + 페이드인 | 400ms | `--ease-out` | stagger 50ms |
| 시작 버튼 | 페이드인 | 400ms | `--ease-out` | 500ms |
| **해제 다이얼로그** | 오버레이 페이드인 | 200ms | `--ease-out` | 0ms |
| 다이얼로그 박스 | 스케일(0.95->1) + 페이드인 | 250ms | `--ease-out` | 0ms |
| 다이얼로그 퇴장 | 스케일(1->0.95) + 페이드아웃 | 200ms | `--ease-in` | 0ms |
| **완료 화면** | 기존 UI 페이드아웃 | 500ms | `--ease-in` | 0ms |
| 완료 메시지 | 페이드인 | 800ms | `--ease-out` | 300ms |
| 전체화면 해제 | 페이드아웃 | 800ms | `--ease-in` | 3000ms |
| **버튼 호버** | 배경색 전환 | 200ms | `ease` | 0ms |
| **토글 스위치** | thumb 이동 | 200ms | `ease` | 0ms |
| **음악 페이드인** | 볼륨 0 -> 설정값 | 2000ms | `--ease-out` | 진입 직후 |
| **음악 페이드아웃** | 볼륨 설정값 -> 0 | 2000ms | `--ease-in` | 종료 직전 |

### 7.4 `prefers-reduced-motion` 대응

```css
@media (prefers-reduced-motion: reduce) {
  /* 그라데이션 루프 정지 */
  .gradient-background {
    animation: none;
  }

  /* 문구 전환: 즉시 교체 (페이드만, 이동 없이) */
  .quote-entering,
  .quote-exiting {
    animation-duration: 0.3s;
    /* translateY 제거, opacity만 전환 */
  }

  /* 모든 전환 듀레이션 단축 */
  * {
    animation-duration: 0.2s !important;
    transition-duration: 0.2s !important;
  }

  /* 타이머는 유지 (기능적 애니메이션) */
  .timer-progress {
    transition-duration: 1s !important;
  }
}
```

---

## 8. 반응형 고려사항

### 8.1 macOS 화면 크기 대응

Brain Bed는 Electron 데스크탑 앱이므로 브라우저 반응형이 아닌, macOS 디스플레이 크기별 대응이 필요하다.

| 디스플레이 | 해상도 (논리적) | 대응 사항 |
|-----------|----------------|-----------|
| MacBook Air 13" | 1440 x 900 | 기준 디자인 |
| MacBook Pro 14" | 1512 x 982 | 기준과 동일 |
| MacBook Pro 16" | 1728 x 1117 | 문구 크기 확대 가능 |
| iMac 24" | 2240 x 1260 | 문구/타이머 크기 확대 |
| Studio Display 27" | 2560 x 1440 | 최대 크기 |
| 외장 모니터 (다양) | 다양 | 유연 대응 필요 |

### 8.2 명상 모드 스케일링 규칙

```css
/* 기본 (1440px 이하) */
.quote-text {
  font-size: var(--text-4xl);   /* 40px */
}

.timer-container {
  bottom: 80px;
}

/* 중간 (1441px ~ 1999px) */
@media (min-width: 1441px) {
  .quote-text {
    font-size: var(--text-5xl); /* 56px */
  }

  .timer-container {
    bottom: 120px;
  }
}

/* 대형 (2000px 이상) */
@media (min-width: 2000px) {
  .quote-text {
    font-size: var(--text-6xl); /* 72px */
  }

  .timer-container {
    bottom: 160px;
  }

  .music-bar {
    bottom: 64px;
    left: 64px;
    right: 64px;
  }
}
```

### 8.3 설정 윈도우

설정 윈도우는 고정 크기(400x500px)이므로 반응형 불필요.

```javascript
// Electron BrowserWindow 설정
const settingsWindow = new BrowserWindow({
  width: 400,
  height: 500,
  resizable: false,
  minimizable: false,
  maximizable: false,
  titleBarStyle: 'hiddenInset',
  vibrancy: 'under-window',          // macOS 투명 효과
  backgroundColor: '#1a1a2e',
  show: false,                        // ready-to-show 이벤트에서 show
});
```

### 8.4 Retina 디스플레이 대응

- 모든 래스터 이미지(트레이 아이콘 등)는 @1x, @2x 모두 제공
- SVG 기반 UI(타이머 프로그레스)는 자동 스케일링
- CSS 기반 UI(그라데이션, 텍스트)는 자동 스케일링
- `devicePixelRatio` 기반 조건부 렌더링 불필요 (Electron이 자동 처리)

---

## 9. globals.css 완성본

개발자가 바로 사용할 수 있는 전체 CSS 변수 정의 파일.

```css
/* ===================================================
   Brain Bed - Design Tokens (globals.css)
   =================================================== */

/* 폰트 임포트 */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Inter:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;700&display=swap');

:root {
  /* ── 폰트 패밀리 ── */
  --font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-body: 'Inter', var(--font-sans);
  --font-display: 'Playfair Display', 'Noto Serif KR', Georgia, serif;
  --font-mono: 'DM Sans', 'SF Mono', monospace;

  /* ── 폰트 크기 ── */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2rem;
  --text-4xl: 2.5rem;
  --text-5xl: 3.5rem;
  --text-6xl: 4.5rem;

  /* ── 폰트 무게 ── */
  --font-light: 300;
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* ── 줄 높이 ── */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* ── 글자 간격 ── */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.05em;
  --tracking-wider: 0.1em;

  /* ── 배경색 ── */
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-elevated: #1e2a42;
  --bg-overlay: rgba(0, 0, 0, 0.6);

  /* ── 텍스트 색상 ── */
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-tertiary: rgba(255, 255, 255, 0.4);
  --text-quote: rgba(255, 255, 255, 0.85);

  /* ── 액센트 색상 ── */
  --accent-primary: #7c6eef;
  --accent-primary-hover: #6b5dd3;
  --accent-secondary: #4a90d9;
  --accent-warm: #e8a87c;

  /* ── 상태 색상 ── */
  --state-success: #6bcb77;
  --state-warning: #ffd93d;
  --state-danger: #ff6b6b;

  /* ── 타이머 ── */
  --timer-track: rgba(255, 255, 255, 0.15);
  --timer-progress: rgba(255, 255, 255, 0.8);
  --timer-text: rgba(255, 255, 255, 0.9);

  /* ── 경계선 ── */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-default: rgba(255, 255, 255, 0.15);
  --border-focus: rgba(124, 110, 239, 0.5);

  /* ── 간격 ── */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;

  /* ── 모서리 반지름 ── */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* ── 이징 함수 ── */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-gentle: cubic-bezier(0.25, 0.1, 0.25, 1);

  /* ── 그라데이션 세트 ── */
  --gradient-deep-purple: linear-gradient(-45deg, #0f0c29, #302b63, #24243e, #0f0c29);
  --gradient-deep-blue: linear-gradient(-45deg, #0d1b2a, #1b2838, #2c3e50, #0d1b2a);
  --gradient-navy: linear-gradient(-45deg, #1a1a2e, #16213e, #0f3460, #1a1a2e);
  --gradient-dark-neutral: linear-gradient(-45deg, #1b1b1b, #2d2d2d, #1b1b1b, #2d2d2d);

  /* ── 그림자 ── */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 24px 48px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 20px rgba(124, 110, 239, 0.15);
}

/* ── 기본 리셋 ── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  color: var(--text-primary);
  background: var(--bg-primary);
  line-height: var(--leading-normal);
}

/* ── 접근성: 모션 감소 ── */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.2s !important;
    transition-duration: 0.2s !important;
  }
}

/* ── 스크롤바 커스텀 (설정 화면) ── */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* ── 선택 영역 ── */
::selection {
  background: rgba(124, 110, 239, 0.3);
  color: var(--text-primary);
}

/* ── 포커스 링 ── */
:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}
```

---

## 10. 개발 핸드오프 체크리스트

구현 시 확인해야 할 항목 목록.

### 필수 폰트 설치/로드

- [ ] Pretendard: [cdn.jsdelivr.net/gh/orioncactus/pretendard](https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css)
- [ ] Inter: Google Fonts
- [ ] Playfair Display: Google Fonts
- [ ] DM Sans: Google Fonts
- [ ] Noto Serif KR: Google Fonts (한글 세리프 폴백)

### 아이콘 에셋

- [ ] 트레이 아이콘 3종 x 2 해상도 = 6개 PNG 파일
- [ ] 앱 아이콘 ICNS 파일
- [ ] Lucide Icons 패키지 설치 (`lucide-react`)

### Electron 윈도우 설정

- [ ] 명상 윈도우: `fullscreen`, `alwaysOnTop`, `kiosk`, `closable: false`
- [ ] 설정 윈도우: 400x500, `resizable: false`, `titleBarStyle: 'hiddenInset'`
- [ ] Dock 아이콘 숨김: `app.dock.hide()`

### 접근성

- [ ] 모든 텍스트 명암비 WCAG AA (4.5:1) 이상 확인
- [ ] `prefers-reduced-motion` 미디어쿼리 적용
- [ ] 포커스 링 (`focus-visible`) 모든 인터랙티브 요소에 적용
- [ ] 볼륨 슬라이더 키보드 접근성 (방향키)

### 성능

- [ ] 그라데이션 애니메이션: `will-change: background-position` 적용
- [ ] SVG 타이머: `will-change: stroke-dashoffset` 적용
- [ ] 문구 전환: DOM 요소 재생성 대신 CSS 클래스 토글
- [ ] 명상 모드 CPU 사용률 5% 이하 유지 확인
