# Brain Bed v2 — Brain Fry Index & Smart Notifications

> Iteration 2: 시간 기반 단순 알림 → 강도 기반 스마트 감지 + UI 시각화

---

## 1. 문제 재정의

### 현재 시스템 한계

| 현재 | 문제 |
|------|------|
| 90분 고정 타이머 | 가볍게 쓰든 폭풍 사용하든 동일한 알림 |
| 토큰 추적 데이터 미활용 | 수집만 하고 알림 로직과 분리 |
| Idle 5분 → 완전 리셋 | 화장실 한번으로 누적 피로 무시 |
| 단일 알림 메시지 | 상황과 무관한 일률적 안내 |

### 핵심 인사이트

Brain Fry는 **시간이 아닌 강도(intensity)**의 함수다. 10분 만에 30K 토큰을 소비하는 것이 2시간 동안 조용히 코딩하는 것보다 위험하다.

---

## 2. 솔루션: Brain Fry Index (BFI)

### 2.1 BFI 산출 공식

```
BFI (0~100) =
    token_velocity_score  × 0.35
  + elapsed_ratio_score   × 0.25
  + multi_tool_score      × 0.20
  + late_night_score      × 0.10
  + snooze_penalty_score  × 0.10
```

| 요소 | 측정 | 점수 산출 (0~100) |
|------|------|-------------------|
| Token velocity | 최근 10분 tokens/min | 0~2K/m=선형, 2K+=100 |
| Elapsed ratio | elapsed / threshold | 0~1.0=선형, 1.0+=100 |
| Multi-tool | byTool 활성 도구 수 | 1개=0, 2개=70, 3개+=100 |
| Late night | 22:00~06:00 | 해당=100, 아니면=0 |
| Snooze count | 알림 무시 횟수 | 0=0, 1=30, 2=60, 3+=100 |

### 2.2 4단계 상태

| 단계 | BFI | 색상 | 아이콘 | 행동 |
|------|-----|------|--------|------|
| **Calm** | 0-30 | `#22c55e` green | leaf/check | 알림 없음 |
| **Warming** | 30-60 | `#eab308` yellow | sun | 부드러운 notification |
| **Heating** | 60-85 | `#f97316` orange | flame | 강한 알림 + 짧은 re-alert |
| **Brain Fry** | 85-100 | `#ef4444` red | zap/alert | 긴급 알림 + 명상 제안 |

### 2.3 맥락적 알림 메시지

원인별로 다른 메시지를 표시:

**Token 기반**:
- "You've processed {n}K tokens. Sustained review erodes judgment accuracy."
- "Token velocity is spiking. Your brain is working harder than you think."

**시간 기반**:
- "You've been going for {n} hours straight. A short break goes a long way."
- "{n} minutes past your threshold. Even 5 minutes of rest helps."

**야간**:
- "It's {time}. Sleep solves more bugs than caffeine."
- "Late-night sessions correlate with tomorrow's debugging sessions."

**Snooze 반복**:
- "This is dismissal #{n}. The code will still be here after a break."
- "You keep pushing through. That's exactly when breaks matter most."

**멀티 도구**:
- "Running {tools} simultaneously — that's heavy context switching."

---

## 3. UI 변경사항

### 3.1 대시보드 — BFI 게이지

기존 진행률 원을 BFI 게이지로 교체:

- 중앙: BFI 숫자 (큰 텍스트) + 단계 라벨
- 원형 게이지: 단계별 색상 그라데이션
- 아래: Token 사용량 (총량 + 속도), 경과 시간, 활성 도구 목록

### 3.2 트레이 아이콘

- BFI 단계에 따라 트레이 아이콘 색상/형태 변경
- 컨텍스트 메뉴에 BFI 점수 표시

### 3.3 Notification

- macOS native notification 유지
- 단계에 따른 메시지 + "Take a Break" / "In {n} min" 버튼
- Brain Fry 단계에서는 "Your brain needs this" 추가 강조

---

## 4. 설정 추가

| 설정 | 기본값 | 설명 |
|------|--------|------|
| bfi_enabled | true | BFI 기반 알림 활성화 (false면 기존 시간 기반) |
| late_night_start | 22:00 | 야간 모드 시작 시간 |
| late_night_end | 06:00 | 야간 모드 종료 시간 |

기존 설정 유지: alert_threshold_minutes, realert_interval_minutes 등

---

## 5. 구현 범위

### 포함

- BFI 계산 엔진 (ActivityTracker 확장 또는 별도 모듈)
- 대시보드 BFI 게이지 UI
- 단계별 맥락적 알림 메시지
- 트레이 아이콘 단계별 변경
- Token velocity 계산 (기존 cli-token-tracker 활용)

### 미포함

- 강제 명상 진입 (제안만)
- 통계/히스토리 대시보드 (후속 iteration)
- BFI 예측/추세 분석

---

*작성일: 2026-03-26*
*Iteration 2 of Brain Bed*
