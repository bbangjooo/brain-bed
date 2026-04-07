# Brain Bed v5 - Idea Brief + PRD

> 2가지 모드: Refresh Process (리얼월드 투두) + Rhythm Game (리듬게임)

작성일: 2026-04-07

---

## 1. 컨셉 진화

### v4 → v5 변경 이유

v4는 4가지 모드를 제공했지만, 핵심 인사이트를 더 날카롭게 반영하면 **2가지 모드**로 충분하다:

| 인사이트 | 대응 모드 |
|----------|----------|
| 사람들은 **실제 세계에서** 회복한다 (산책, 물 마시기, 스트레칭, 창밖 보기) | **Refresh Process** — 리얼월드 행동을 투두리스트로 안내 |
| 사람들은 **"다른 것을 하면서"** 회복한다 ("do something different") | **Rhythm Game** — 음악에 맞춰 키보드 치는 능동적 놀이 |

### 왜 2가지인가

- **Refresh Process**: 화면 밖으로 나가게 하는 모드. "진짜 쉬기"
- **Rhythm Game**: 화면 안에서 완전히 다른 걸 하는 모드. "뇌 컨텍스트 스위칭"

이 두 가지가 Reddit에서 발견한 모든 패턴을 커버한다:
- 환경 전환 → Refresh Process (물 마시기, 창문 열기, 산책)
- 감각 전환 → Refresh Process (손으로 뭔가 만지기, 먼 곳 보기)
- 무의식 활용 → Refresh Process (심호흡, 멍 때리기)
- "다른 것 하기" → Rhythm Game (코딩과 완전히 다른 활동)

---

## 2. 모드 상세

### 2.1 Refresh Process

**컨셉**: 실제로 사람들이 하는 리프레시 활동을 투두 리스트처럼 보여주고, 하나씩 체크하게 한다.

**왜 투두 리스트인가**:
- 개발자는 체크리스트에 익숙하다
- 하나씩 완료하는 성취감이 있다
- "뭘 해야 할지 모르겠어" → 앱이 알려준다
- 체크 완료 = 진짜 쉰 증거

**프로세스 풀 (랜덤 조합)**:

| 카테고리 | 활동 | 시간 |
|----------|------|------|
| 수분 | Stand up and drink a glass of water | 30s |
| 눈 | Look at something 20 feet away for 20 seconds | 20s |
| 움직임 | Stretch your neck left and right | 20s |
| 움직임 | Roll your shoulders backward 5 times | 15s |
| 움직임 | Stretch your wrists | 15s |
| 감각 | Open a window and listen to outside sounds | 30s |
| 감각 | Touch something that isn't your keyboard | 15s |
| 호흡 | Take 3 deep breaths | 20s |
| 전환 | Look around the room slowly | 15s |
| 전환 | Stand up and walk 10 steps | 30s |

**프로세스 생성 규칙**:
- 선택한 시간에 맞춰 활동 3~7개를 랜덤 조합
- 카테고리별 최대 2개 (다양성 보장)
- 순서: 움직임 → 감각 → 호흡 (점점 차분하게)
- 마지막은 항상 호흡 or 전환 (복귀 준비)

**UX 흐름**:
```
[모드 선택] → [프로세스 리스트 표시]
                    ↓
           □ Stand up and drink water (30s)
           □ Look at something far away (20s)
           □ Stretch your neck (20s)
           □ Take 3 deep breaths (20s)
                    ↓
        [각 항목 탭/클릭으로 시작]
        [타이머 돌아가며 자동 체크]
                    ↓
           ✓ 모두 완료 → 완료 화면
```

### 2.2 Rhythm Game

**컨셉**: 배경 음악(기존 클래식 곡)에 맞춰 화면에 떨어지는 노트를 키보드로 치는 간단한 리듬게임.

**왜 리듬게임인가**:
- **키보드 차단 역발상**: 기존엔 키보드를 차단했지만, 리듬게임은 키보드를 "다른 용도"로 사용
- **능동적 참여**: MindMax 연구 — "능동적 참여 활동이 명상보다 선호됨"
- **인지 전환**: 코딩과 완전히 다른 인지 활동 (타이밍 + 리듬 = 우뇌)
- **기존 음원 활용**: 이미 11곡의 클래식 음원 보유
- **flow state**: 적절한 난이도의 리듬게임은 flow state 유도에 효과적

**게임 메커니즘**:

```
키 레인: D  F  J  K  (4개 레인)

      D    F    J    K
      |    |    |    |
      |    ●    |    |     ← 노트 떨어짐
      |    |    |    ●
      ●    |    |    |
      |    |    ●    |
   ───●────●────●────●───  ← 히트 라인
```

- **4레인**: D, F, J, K 키 (홈 포지션 기반)
- **노트**: 위에서 아래로 떨어짐
- **히트 라인**: 하단 고정
- **판정**: Perfect / Good / Miss (시각적 피드백만, 점수 없음)
- **난이도**: BFI에 따라 자동 조절
  - BFI 높음: 느리고 단순한 패턴
  - BFI 낮음: 빠르고 복잡한 패턴
- **점수 없음**: "판단 없는 공간" 원칙 유지. 콤보 이펙트는 있되 숫자 없음.
- **음악**: 기존 클래식 11곡 중 랜덤 선택

**노트 생성 방식**:
- 사전에 비트맵을 만들지 않음 (곡마다 만들면 유지보수 불가)
- 대신 **절차적 생성**: 오디오 분석 없이, 일정 BPM에 맞춰 패턴 생성
  - BPM은 곡별로 대략적으로 설정 (Satie: 60 BPM, Canon: 80 BPM 등)
  - 패턴 유형: 단일 노트, 동시 노트 2개, 계단식 연속
  - 빈 구간 랜덤 삽입 (쉬는 타임)

**키보드 차단 변경**:
- 리듬게임 모드에서는 D, F, J, K + ESC(종료)만 허용
- 나머지 키는 기존처럼 차단

---

## 3. 모드 선택 화면

```
┌──────────────────────────────────────────┐
│                                          │
│      Switch your context                 │
│                                          │
│   ┌────────────────┐ ┌────────────────┐  │
│   │                │ │                │  │
│   │  ✅ Refresh    │ │  🎹 Rhythm     │  │
│   │                │ │                │  │
│   │  Real-world    │ │  Play music    │  │
│   │  checklist     │ │  with keys     │  │
│   │                │ │                │  │
│   └────────────────┘ └────────────────┘  │
│                                          │
│      [3m] [5m] [10m] [15m] [Free]       │
│                                          │
└──────────────────────────────────────────┘
```

---

## 4. 기술 변경 사항

### 삭제
- `src/components/modes/PlayMode.tsx` (Particle Art → Rhythm Game으로 교체)
- `src/components/modes/ListenMode.tsx` (별도 모드 불필요)
- `src/components/modes/MoveMode.tsx` (Refresh Process에 통합)
- `src/components/modes/CreateMode.tsx` (삭제)

### 수정
- `src/components/modes/ModeSelector.tsx` — 2가지 모드로 변경
- `src/components/meditation/MeditationScreen.tsx` — 모드 라우팅 수정

### 신규
- `src/components/modes/RefreshMode.tsx` — 리프레시 투두 리스트
- `src/components/modes/RhythmMode.tsx` — 리듬게임

### 키보드 차단
- `electron/main.ts` — 리듬게임 모드에서 D/F/J/K 키 허용 필요
  - 현재: 전체 키보드 차단
  - 변경: 모드에 따라 허용 키 다르게 설정

---

*작성일: 2026-04-07*
