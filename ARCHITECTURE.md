# ARCHITECTURE: 데스크톱 펫 투두리스트

> Version: v1.0 (MVP)

---

# 1. 개요

Electron은 **Main Process(Node.js)** 와 **Renderer Process(Chromium)** 가 서로 독립적으로 실행되는 구조이다.

이 문서는 각 계층의 역할과 데이터 흐름, 프로세스 간 통신(IPC), 설계 원칙을 정의한다.

**핵심 목표**

- 역할을 명확하게 분리한다.
- UI와 OS 기능을 분리한다.
- 유지보수가 쉬운 구조를 만든다.
- 향후 SQLite, Tauri 등으로 확장 가능하도록 설계한다.

---

# 2. 전체 구조 (Context Diagram)

```
                     Windows

                        │

         ┌──────────────┴──────────────┐

         │                             │

   Main Process                  Renderer Process

(Node.js / Electron)           (React + TypeScript)

         │                             │

         │ IPC (preload)

         ▼

  electron-store               Components / Hooks

         │

         ▼

     config.json
```

---

# 3. 프로젝트 구조

```
desktop-pet-todo/

src/

├── main/
│
│   main.ts
│   windowManager.ts
│   ipcHandlers.ts
│   preload.ts
│   store.ts
│
├── renderer/
│
│   components/
│   hooks/
│   App.tsx
│   index.tsx
│
├── shared/
│
│   types.ts

assets/

out/
```

---

# 4. 폴더 책임

| 폴더 | 책임 |
|------|------|
| `main/` | Electron, Window, Tray, IPC, 파일 저장 |
| `renderer/` | React 화면(UI) |
| `components/` | 화면 표시 전담 |
| `hooks/` | 비즈니스 로직 |
| `shared/` | 공통 타입 |
| `assets/` | 이미지, 아이콘, 폰트 |

---

# 5. 프로세스별 책임

## Main Process

Main Process는 운영체제와 직접 통신한다.

### 담당

- BrowserWindow 생성
- Tray 생성
- Click Through
- Always On Top
- electron-store 저장
- IPC 처리

### 담당하지 않는 것

- React UI
- Todo 화면 출력
- 캐릭터 렌더링

---

## Renderer Process

Renderer는 사용자 화면만 담당한다.

### 담당

- React UI
- 애니메이션
- 사용자 입력
- 상태(State)

### 담당하지 않는 것

- 파일 저장
- Windows API
- BrowserWindow

---

# 6. IPC 구조

Renderer는 Main을 직접 호출하지 않는다.

반드시 preload를 통해 통신한다.

```
React

↓

window.electronAPI

↓

IPC

↓

Main Process
```

---

## IPC 채널

| 채널 | 설명 |
|-------|------|
| `todo:getAll` | Todo 조회 |
| `todo:add` | Todo 추가 |
| `todo:update` | Todo 수정 |
| `todo:delete` | Todo 삭제 |
| `window:setIgnoreMouseEvents` | 클릭 투과 |
| `app:quit` | 종료 |

### 규칙

- 채널명은 `도메인:동작` 형식 사용
- Renderer는 preload API만 사용
- Node.js API는 Renderer에 직접 노출하지 않는다.
- `contextIsolation: true` 유지
- `nodeIntegration: false` 유지

---

# 7. preload 역할

preload는 Renderer와 Main 사이의 보안 브리지 역할을 한다.

Renderer는

```
window.electronAPI
```

만 사용할 수 있다.

예시

```
window.electronAPI.getTodos()

↓

ipcRenderer.invoke()

↓

Main
```

Renderer는

- fs
- path
- electron-store

등에 직접 접근하지 않는다.

---

# 8. 데이터 모델

```ts
type PetStatus =
  | "idle"
  | "walk"
  | "talk";

interface PetState {
  x: number;
  status: PetStatus;
  direction: "left" | "right";
}

interface Todo {
  id: string;
  content: string;
  remindAt: string;
  isDone: boolean;
  createdAt: string;
}
```

공통 타입은

```
shared/types.ts
```

에서 관리한다.

---

# 9. 캐릭터 상태

```
Idle

↓

Walk

↓

Talk

↓

Idle
```

상태 변경은

```
usePetMovement
```

에서만 수행한다.

다른 컴포넌트는

status를 직접 수정하지 않는다.

---

# 10. 데이터 흐름

## Todo 등록

```
TodoInput

↓

useTodoStorage

↓

window.electronAPI

↓

IPC

↓

store.ts

↓

electron-store
```

---

## Todo 조회

```
Program Start

↓

electron-store

↓

IPC

↓

React

↓

TodoList
```

---

## 알림

```
현재 시간

↓

useReminder

↓

Todo 확인

↓

status = talk

↓

SpeechBubble
```

---

# 11. 창(Window) 설정

| 옵션 | 값 |
|-------|-----|
| transparent | true |
| frame | false |
| alwaysOnTop | true |
| skipTaskbar | true |
| resizable | false |

클릭 투과는

```
setIgnoreMouseEvents()
```

를 사용한다.

DPI(100%,125%) 환경에서도

마우스 좌표가 어긋나지 않도록

scaleFactor를 항상 고려한다.

---

# 12. 저장 구조

저장 방식

```
electron-store

↓

JSON

↓

AppData
```

예시

```json
{
  "todos": [],
  "settings": {
    "autoLaunch": true
  }
}
```

v2에서는

SQLite로 교체 가능하도록

Renderer는 IPC만 사용한다.

---

# 13. Error Handling

오류는 반드시 Main에서 처리하고

Renderer에는 결과만 전달한다.

예시

```
Todo 저장 실패

↓

Main

↓

Error 반환

↓

Renderer

↓

오류 메시지 출력
```

Renderer는

try/catch 없이

OS 오류를 직접 처리하지 않는다.

---

# 14. 설계 원칙

## Single Responsibility

파일 하나는

하나의 책임만 가진다.

---

## Separation of Concerns

UI

↓

Business

↓

OS

를 명확히 분리한다.

---

## Low Coupling

React는

Electron을 모른다.

IPC만 안다.

---

## High Cohesion

관련된 기능은

같은 모듈 안에서 관리한다.

---

# 15. Architecture Decision Records (ADR)

## ADR-001

Electron 선택

이유

- 자료가 많음
- 클릭 투과 구현 안정성
- MVP 완성이 가장 중요

---

## ADR-002

React 선택

이유

- 컴포넌트 구조
- 상태 관리
- 유지보수 용이

---

## ADR-003

electron-store 선택

이유

- JSON이면 충분
- DB 설치 불필요
- SQLite는 과한 설계

---

## ADR-004

IPC 구조 선택

이유

- UI와 OS 분리
- SQLite 전환 용이
- Tauri 이전 용이

---

# 16. AI 개발 규칙

Codex 및 AI는 아래 규칙을 반드시 따른다.

- 프로젝트 구조를 변경하지 않는다.
- 기술 스택을 변경하지 않는다.
- PRD 범위를 벗어난 기능을 추가하지 않는다.
- 수정이 필요한 파일만 변경한다.
- 변경 후 실행 가능한 상태를 유지한다.
- 변경 이유를 함께 작성한다.
- 테스트 방법을 함께 작성한다.

---

# 17. 향후 확장

v1

- Electron
- electron-store

v2

- SQLite
- Auto Update
- Tauri 검토

단,

실사용 중 불편함이 확인되기 전까지는 구조를 변경하지 않는다.
