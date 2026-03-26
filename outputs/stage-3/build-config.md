# Brain Bed - Build Configuration

> Stage 3: Development 완료

---

## 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 런타임 | Electron | 33.x |
| UI 프레임워크 | React | 19.x |
| 빌드 도구 | Vite + vite-plugin-electron | 6.x |
| 스타일링 | Tailwind CSS | 3.4.x |
| 데이터베이스 | better-sqlite3 | 11.x |
| 언어 | TypeScript | 5.7.x |
| 패키징 | electron-builder | 25.x |

---

## 프로젝트 구조

```
brain-bed/
├── electron/                    # Electron Main Process
│   ├── main.ts                  # 앱 엔트리포인트 + IPC 핸들러
│   ├── preload.ts               # Context Bridge (보안 IPC)
│   ├── activity-tracker.ts      # 사용 시간 추적 모듈
│   └── settings-store.ts        # SQLite 설정 저장소
├── src/                         # React Renderer
│   ├── main.tsx                 # React 엔트리포인트
│   ├── App.tsx                  # 라우팅 (meditation/settings)
│   ├── components/
│   │   ├── meditation/
│   │   │   ├── MeditationScreen.tsx    # 명상 메인 화면
│   │   │   ├── GradientBackground.tsx  # 그라데이션 배경
│   │   │   ├── QuoteDisplay.tsx        # 동기부여 문구
│   │   │   ├── CircularTimer.tsx       # SVG 원형 타이머
│   │   │   ├── AudioPlayer.tsx         # 클래식 음악 플레이어
│   │   │   ├── ExitConfirmDialog.tsx   # 해제 확인
│   │   │   └── CompletionScreen.tsx    # 완료 화면
│   │   └── settings/
│   │       └── SettingsPanel.tsx       # 설정 화면
│   ├── data/
│   │   └── quotes.json                # 동기부여 문구 20개
│   ├── styles/
│   │   └── globals.css                # 글로벌 스타일 + 디자인 토큰
│   └── types/
│       └── electron.d.ts              # Electron API 타입
├── resources/
│   ├── audio/                         # 클래식 음원 (별도 준비 필요)
│   └── icons/                         # 트레이 아이콘
├── outputs/                           # 프로젝트 산출물
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

---

## 구현된 기능

### P0 (필수)
- [x] **시스템 트레이 앱** - macOS 메뉴바 상주, 사용 시간 표시, 메뉴
- [x] **사용 시간 추적** - 연속 사용 시간 추적, 유휴 감지(5분), 임계값 알림
- [x] **Inner Peace Zone** - 전체화면 명상 모드, kiosk 모드
- [x] **키보드 차단** - Level 1 (globalShortcut + renderer preventDefault)
- [x] **명상 UI** - 그라데이션 배경, 동기부여 문구(20개), SVG 원형 타이머
- [x] **완료 화면** - 수고했어요 + 3초 카운트다운

### P1 (중요)
- [x] **음악 플레이어** - Web Audio API, 5곡 트랙 구조, 볼륨/음소거
- [x] **설정 화면** - 7개 설정 항목, SQLite 영구 저장, 즉시 적용

### 미구현 (Phase 2)
- [ ] 실제 클래식 음원 파일 (퍼블릭 도메인에서 다운로드 필요)
- [ ] CLI 토큰 사용량 추적
- [ ] 3D UI (Three.js/Spline)
- [ ] Audio Visualizer
- [ ] 통계 대시보드
- [ ] 로그인 시 자동 시작 구현
- [ ] macOS 접근성 API 키보드 차단 (Level 2)

---

## 실행 방법

```bash
# 개발 모드
npm run dev

# 빌드
npm run build
```

---

## 빌드 결과

```
dist/index.html           0.71 kB
dist/assets/index.css    11.77 kB
dist/assets/index.js    209.24 kB
dist-electron/main.js     7.43 kB
dist-electron/preload.js  0.72 kB
```

---

## 음원 준비 가이드

앱에 포함할 클래식 음원은 별도로 다운로드해야 합니다:

1. [Musopen](https://musopen.org/) 에서 퍼블릭 도메인 음원 다운로드
2. `resources/audio/` 디렉토리에 다음 파일명으로 저장:
   - `gymnopedies-no1.mp3`
   - `clair-de-lune.mp3`
   - `prelude-e-minor.mp3`
   - `air-on-g-string.mp3`
   - `nocturne-op9-no2.mp3`
3. 128kbps 이상 MP3, 곡당 10MB 이내 권장

---

*작성일: 2026-03-26*
