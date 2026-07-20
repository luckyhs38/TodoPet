# 데스크톱 펫 + 투두리스트 프로젝트 설계서

## 1. 기술 스택 (최종 확정)

| 영역 | 선택 | 비고 |
|---|---|---|
| Desktop | Electron | Windows MVP 최적 |
| UI | React | 상태 관리(캐릭터/투두/알림) 용이 |
| Language | TypeScript | IPC 통신 시 타입 안정성 |
| Styling | CSS Modules 또는 일반 CSS | 별도 학습 불필요 |
| Animation | CSS (background-position 스프라이트 애니메이션) | Canvas 불필요, 정해진 프레임 전환에 최적 |
| Storage | electron-store (v1) → SQLite (v2, 검토) | JSON 기반, DB 설치 불필요 |
| Build | Electron Forge | Windows 설치 실행 파일 생성 |
| Version | Git + GitHub | 무료, 백업/이력관리 |
| Distribution | GitHub Releases | 무료 배포 |
| Icon | Inkscape | 트레이/앱 아이콘 |
| Character | LibreSprite | 무료 픽셀 아트 툴 |
| Auto Update | Electron Updater (v2, 선택) | MVP 이후 검토 |

---

## 2. 폴더 구조

```
desktop-pet-todo/
├── src/
│   ├── main/                       # Electron 메인 프로세스 (OS 제어 및 창 관리)
│   │   ├── main.ts                 # 앱 진입점, 초기 환경 설정
│   │   ├── windowManager.ts        # 투명 창, 트레이 아이콘, 클릭 투과 제어
│   │   ├── ipcHandlers.ts          # 렌더러(화면)와 메인(OS) 간의 통신
│   │   └── store.ts                # electron-store 초기화 및 로컬 데이터 저장
│   │
│   ├── renderer/                   # React 화면 프로세스 (사용자 인터페이스)
│   │   ├── components/             # 화면을 구성하는 재사용 가능한 조각들
│   │   │   ├── Pet.tsx             # 캐릭터 렌더링 및 애니메이션 적용
│   │   │   ├── Pet.module.css      # 캐릭터 전용 스타일
│   │   │   ├── TodoList.tsx        # 할 일 목록 화면
│   │   │   ├── TodoInput.tsx       # 할 일 입력 창
│   │   │   └── SpeechBubble.tsx    # 알림 발생 시 나타나는 말풍선
│   │   ├── hooks/                  # 비즈니스 로직 분리 (재사용성 목적)
│   │   │   ├── usePetMovement.ts   # 캐릭터 이동 및 상태 변경 로직
│   │   │   ├── useTodoStorage.ts   # 데이터 저장/불러오기 로직
│   │   │   └── useReminder.ts      # 1분 단위 알림 체크 타이머
│   │   ├── App.tsx                 # 전체 컴포넌트를 조립하는 최상위 부모
│   │   └── index.tsx               # React 앱 진입점
│   │
│   └── shared/                     # 두 프로세스가 공유하는 자원
│       └── types.ts                # PetState, Todo 등 공통 타입
│
├── assets/                         # 정적 리소스
│   ├── sprites/                    # 캐릭터 애니메이션용 이미지 조각
│   │   ├── idle/                   # 대기 상태 이미지 폴더
│   │   ├── walk/                   # 걷기 상태 이미지 폴더
│   │   └── talk/                   # 말하기/알림 상태 이미지 폴더
│   ├── icons/                      # 작업표시줄 트레이 및 실행 파일 아이콘 (.ico)
│   └── fonts/                      # 앱에서 사용할 커스텀 폰트 파일
│
├── out/                            # Electron Forge 패키징 및 make 결과물 저장
├── package.json                    # 프로젝트 의존성 패키지 및 스크립트 관리
├── tsconfig.json                   # TypeScript 컴파일 옵션 설정
├── forge.config.ts                 # Electron Forge 패키징 및 maker 설정
├── .gitignore                      # Git 버전 관리에서 제외할 파일 목록
└── README.md                       # 프로젝트 설명 문서
```

**설계 의도**: `main/`(OS 연결)과 `renderer/`(화면)를 명확히 분리. 저장/이동 로직은 hooks로 별도 분리해 나중 유지보수·이전 시 영향 범위를 최소화. 스프라이트는 상태별(`idle`/`walk`/`talk`)로 폴더를 나눠 애니메이션 프레임을 관리하기 쉽게 구성.

> ⚠️ **참고**: Electron Forge 결과물은 `out/`에 생성하므로 `.gitignore`에 `out/`을 추가합니다(빌드 결과물은 Git에 올리지 않음).

---

## 3. Git 관리 전략

- 브랜치: `main`(항상 실행 가능한 안정 버전) / `dev`(작업 브랜치, 기능 완성 시 merge)
- 커밋 규칙: `feat:`, `fix:`, `chore:` 접두어 사용
- `.gitignore` 필수: `node_modules/`, `dist/`, `out/`

---

## 4. 개발 로드맵 (1인 개발자 기준, 주 단위)

### Week 1 — 환경 세팅 + 캐릭터 뼈대
- Node.js, Git 설치 확인
- `npx create-electron-app` (React+TS 템플릿)
- GitHub 리포 생성, 첫 커밋
- 투명창 + `alwaysOnTop` 설정
- 무료 스프라이트 정적 표시
- **목표**: 캐릭터 그림이 투명 배경 위에 뜬다

### Week 2 — 이동 + 클릭 투과 (최대 고비 구간)
- `usePetMovement.ts` — 화면 하단 좌우 이동
- CSS `background-position`으로 걷기 애니메이션 프레임 전환
- `setIgnoreMouseEvents()`로 빈 공간 클릭 투과
- **목표**: 캐릭터가 걸어다니고 다른 창 작업을 방해하지 않는다

### Week 3 — 투두리스트 기능
- `TodoInput.tsx` — 할일 + 시간 입력
- `useTodoStorage.ts` + `electron-store` — 저장/불러오기
- `TodoList.tsx` — 캐릭터 클릭 시 목록 토글
- **목표**: 앱을 껐다 켜도 할일 목록이 유지된다

### Week 4 — 알림(말풍선) 기능
- `useReminder.ts` — 등록 시간 체크 타이머
- `SpeechBubble.tsx` — 조건부 렌더링
- 알림 확인/닫기 인터랙션
- **목표**: 설정한 시간에 캐릭터가 말풍선으로 알려준다

### Week 5 — 마무리 + 배포
- 트레이 아이콘 + 우클릭 메뉴(설정/종료)
- 자동 실행 옵션(선택)
- `npm run make`로 Electron Forge 빌드 테스트
- GitHub Releases 업로드, README 작성
- 본인 PC 1주일 실사용 테스트
- **목표**: v1.0.0 실제 배포

---

## 5. 배포 방식

1. `npm run make` → `out/make/` 아래에 Windows 설치 실행 파일 생성
2. GitHub 리포 → Releases → 새 릴리즈 → exe 첨부
3. README에 다운로드 링크 + 스크린샷 + 사용법 작성
4. (선택) itch.io 업로드로 포트폴리오 노출

---

## 6. v2 이후 검토 항목 (지금은 손대지 않음)

- Storage: electron-store → SQLite (데이터 많아지고 검색/필터 필요해질 때)
- Electron Updater 도입 (자동 업데이트)
- Tauri 이전 검토 — **용량/성능 문제가 아니라, 실사용 중 본인이 느끼는 불편함이 기준**

## 개발 원칙

- MVP 범위를 벗어나는 기능은 추가하지 않는다.
- 새로운 기능보다 버그 수정과 사용성 개선을 우선한다.
- 기술 스택은 특별한 이유가 없는 한 변경하지 않는다.
- Electron → Tauri 이전은 실제 사용 중 불편함이 확인된 경우에만 검토한다.
- 모든 기능은 "내가 매일 사용할 수 있는가?"를 기준으로 판단한다.
