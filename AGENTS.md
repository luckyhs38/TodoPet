# AGENTS.md

## 기술 스택

- Windows 전용 MVP: Electron, Electron Forge, React, TypeScript
- 로컬 저장소: `electron-store`
- 스타일: 일반 CSS 또는 CSS Modules
- 요구사항 원본: `desktop-pet-todo-PRD.md`, `desktop-pet-todo-project-plan.md`, `ARCHITECTURE.md`

## 주요 폴더 역할

- `src/main/`: Electron Main, 창·트레이·저장소·IPC 관리
- `src/renderer/`: React UI, 컴포넌트와 UI 상태
- `src/shared/`: Main·Renderer 공통 타입
- `assets/`: 스프라이트, 아이콘, 폰트
- `out/`: Electron Forge 생성물; 버전 관리 제외

## 실행·검사·빌드 명령

- 개발 실행: `npm start`
- 정적 검사: `npm run lint`
- 테스트: `npm test`
- 패키징: `npm run package`
- Windows 설치물 생성: `npm run make`

## 보안 규칙

- BrowserWindow는 `contextIsolation: true`, `nodeIntegration: false`를 유지한다.
- Renderer에서 Node.js API를 직접 사용하지 않는다.
- Renderer와 Main은 preload API와 IPC로만 통신한다.
- preload는 필요한 API만 제한적으로 노출한다.
- 모든 IPC 입력값을 Main에서 검증한다.

## MVP 제외 범위

- 캐릭터·테마 커스터마이징, 클라우드 동기화, 계정·로그인
- 모바일 연동, macOS·Linux 지원, SQLite
- 자동 업데이트와 Tauri 이전은 MVP 이후 검토한다.

## 코드 수정 원칙

- PRD 범위를 벗어난 기능을 추가하지 않는다.
- 확정된 기술 스택과 문서의 폴더 구조를 임의로 변경하지 않는다.
- 무료 도구와 무료 라이브러리만 사용하고 불필요한 패키지를 설치하지 않는다.
- Main, Renderer, preload의 책임을 분리하고 공통 타입은 `src/shared/`에 둔다.
- 필요한 파일만 최소 수정하며 요구사항 문서를 다른 파일에 복제하지 않는다.

## 완료 검증 방법

- 변경 범위에 맞게 lint와 테스트를 실행한다.
- `npm start`로 주요 MVP 흐름과 IPC 동작을 확인한다.
- `npm run make`가 Windows 설치 실행 파일을 만드는지 확인한다.
- PRD의 Definition of Done과 `ARCHITECTURE.md`의 보안 경계를 점검한다.

## 학습형 개발 방식

- 사용자는 개발 초보자이므로 Codex가 모든 기능을 한 번에 대신 구현하지 않는다.
- 각 단계에서 배우는 개념을 초보자 기준 5줄 이내로 설명하고 관련 파일과 역할을 알린다.
- 작업을 사용자 부분과 Codex 부분으로 나누고, 사용자가 할 작은 작업을 먼저 제시한 뒤 대신 수행하지 않고 종료한다.
- 사용자가 작성 후 검토를 요청하면 diff를 확인해 오류와 개선점을 설명한다.
- 복잡하거나 보안에 영향을 주는 부분만 Codex가 구현하며, 한 번에 개념 하나와 작은 기능 하나만 진행한다.

### 작업 분담

- 사용자: 파일·폴더 생성, 간단한 TypeScript 타입·조건문·함수, React 기본 구조, HTML 요소, CSS 변경, npm 명령, 화면 확인.
- Codex: Electron Main 설정, preload·IPC 보안 연결, 격리 설정, 클릭 투과·BrowserWindow 제어, 트레이·자동 실행, 복잡한 타입·빌드 오류, 여러 파일의 구조 변경.

### 설명 규칙

- 전문용어 바로 뒤에 쉬운 뜻을 적고, 전체 코드보다 필요한 코드 조각을 먼저 제공한다.
- 코드가 필요한 이유와 사용자가 작성할 파일·위치를 알려준다.
- 설명은 반복 없이 10줄 이내로 쓰고, 단계 끝에 사용자가 확인할 결과를 한 문장으로 적는다.

### 토큰 절약 규칙

- PRD·ARCHITECTURE를 다시 출력하지 않고 관련 파일만 읽으며 매 단계 전체 프로젝트를 재분석하지 않는다.
- 완료 보고는 6줄 이내로 하고 다음 기능을 미리 구현하지 않는다.
