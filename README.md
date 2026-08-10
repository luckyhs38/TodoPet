# TodoPet

TodoPet은 Windows 작업표시줄 위를 돌아다니는 픽셀 캐릭터와 함께 일정을 관리하는 데스크톱 애플리케이션입니다. 캐릭터를 클릭해 날짜별 Todo를 관리하고, 지정한 시간이 되면 캐릭터 위 말풍선으로 알림을 확인할 수 있습니다. 로컬 저장, System Tray, Windows 로그인 자동 실행을 지원합니다.

> 지원 플랫폼: Windows

## Preview

<img width="106" height="111" alt="image" src="https://github.com/user-attachments/assets/cac705e3-7630-4f3e-b57b-1914e6a57d10" />

<img width="257" height="150" alt="image" src="https://github.com/user-attachments/assets/12ca6948-9d9b-44da-a7eb-10fd052ee408" />

<img width="239" height="147" alt="image" src="https://github.com/user-attachments/assets/ebf2b51b-0a74-4487-afdb-1c2baa706953" />

<img width="191" height="182" alt="image" src="https://github.com/user-attachments/assets/46f41e45-1f77-4abc-83e7-88d77f0d2395" />

<img width="272" height="197" alt="image" src="https://github.com/user-attachments/assets/4cca2e27-b978-4ab3-b1f0-e14f3284a077" />



## 주요 기능

### Desktop Pet

- 작업표시줄 바로 위에 표시되는 투명하고 프레임 없는 창
- 다른 창 위에 유지되는 픽셀 캐릭터
- Idle / Walk 스프라이트 애니메이션과 랜덤 좌우 이동
- 캐릭터와 패널을 제외한 투명 영역의 마우스 클릭 투과
- 캐릭터 클릭으로 Todo 패널 열기 / 닫기
- 캐릭터 우클릭 메뉴에서 숨기기 / 종료

### Todo와 Calendar

- 날짜별 Todo 추가, 조회, 수정, 삭제
- `할 일 → 진행 중 → 완료` 상태 변경
- 기본 / 높음 중요도 설정
- 일정 내용과 시간 인라인 수정
- 이전·다음 날짜 이동과 월간 Calendar
- 일정이 등록된 날짜를 점으로 표시

### Reminder와 로컬 저장

- 지정한 날짜와 시간에 캐릭터 위 SpeechBubble 알림 표시
- 말풍선에서 Todo 완료 처리 또는 닫기
- 앱 재실행 후에도 동일 알림이 반복되지 않도록 발송 기록 저장
- `electron-store` 기반 Todo와 알림 기록 영구 저장

### Windows 앱 기능

- System Tray에서 앱 열기 / 종료 및 더블 클릭으로 열기
- 패키징된 Windows 앱 최초 실행 시 로그인 자동 실행 등록
- Squirrel.Windows 기반 설치 프로그램과 바탕화면·시작 메뉴 바로가기

## Tech Stack

| Category | Technology |
| --- | --- |
| Desktop | Electron 43 |
| UI | React 19 / CSS |
| Language | TypeScript |
| Build | Vite / Electron Forge 7 |
| Storage | electron-store |
| Installer | Squirrel.Windows |

## 프로젝트 구조

```text
DesktopPet/
├─ assets/
│  ├─ icons/                 # 앱·Tray 아이콘
│  └─ sprites/               # Idle·Walk 캐릭터 스프라이트
├─ src/
│  ├─ main/
│  │  ├─ main.ts             # 앱 시작과 종료 흐름
│  │  ├─ windowManager.ts    # Desktop Pet BrowserWindow
│  │  ├─ preload.ts          # 제한된 Renderer API 노출
│  │  ├─ ipcHandlers.ts      # IPC 검증과 요청 처리
│  │  ├─ store.ts            # Todo·알림 기록 저장
│  │  ├─ reminderScheduler.ts
│  │  ├─ trayManager.ts
│  │  └─ autoLaunch.ts
│  ├─ renderer/
│  │  ├─ components/         # TodoPanel·Calendar·SpeechBubble
│  │  ├─ hooks/              # 클릭 투과·캐릭터 이동
│  │  └─ App.tsx
│  └─ shared/
│     ├─ types.ts
│     └─ ipcChannels.ts
├─ forge.config.ts
└─ package.json
```

## 동작 구조

Electron의 Main, Preload, Renderer 역할을 분리했습니다. Renderer는 Node.js나 Electron API에 직접 접근하지 않고 `window.desktopPet` API를 통해서만 Main Process에 요청합니다.

```text
Renderer (React UI)
        ↓ window.desktopPet
Preload (허용된 API만 노출)
        ↓ IPC
Main (창·Tray·저장·Reminder·자동 실행)
```

`BrowserWindow`는 `contextIsolation: true`, `nodeIntegration: false`로 실행됩니다. Main Process는 IPC 송신자와 입력값을 검증한 후 저장소나 창을 조작합니다.

Todo 알림은 다음 흐름으로 동작합니다.

```text
Todo 저장
   ↓
electron-store
   ↓
Reminder Scheduler (Main Process)
   ↓ 지정 날짜·시간 확인
IPC
   ↓
SpeechBubble 표시 (Renderer)
```

알림을 보낸 Todo의 ID·날짜·시간 조합을 저장하여 앱을 다시 실행해도 같은 알림이 중복 발송되지 않도록 처리합니다.

## 설치 방법

1. [GitHub Releases](https://github.com/luckyhs38/TodoPet/releases)에서 `TodoPet-0.1.0 Setup.exe`를 다운로드합니다.
2. 설치 파일을 실행합니다.
3. 설치 후 바탕화면 또는 시작 메뉴의 `TodoPet` 바로가기로 실행합니다.

패키징된 Windows 앱은 최초 실행 시 Windows 로그인 자동 실행을 등록합니다. 개발 환경에서 실행하는 `npm start`는 시작 프로그램에 등록되지 않습니다.

## 개발 환경 실행

Node.js와 npm이 설치된 Windows 환경이 필요합니다.

```bash
git clone https://github.com/luckyhs38/TodoPet.git
cd TodoPet
npm install
npm start
```

별도의 Unit Test나 Integration Test는 아직 구성하지 않았습니다. 현재 테스트 명령은 `tsc --noEmit` 기반 TypeScript 정적 검사를 수행합니다.

```bash
npm test
```

## 빌드 및 배포

```bash
npm run package
npm run make
```

- `npm run package`: 실행 가능한 Electron 앱 폴더를 `out/`에 생성합니다.
- `npm run make`: Squirrel.Windows를 사용해 배포용 Setup 파일을 `out/make/`에 생성합니다.

`out/`은 빌드 산출물이므로 Git 버전 관리에서 제외됩니다.

## 데이터 저장

별도의 데이터베이스 설치 없이 `electron-store`가 사용자 로컬 영역의 `todos.json`에 데이터를 저장합니다.

- `todos`: Todo 내용, 날짜, 시간, 상태, 중요도
- `notifiedReminderKeys`: 이미 발송된 알림을 구분하는 키

## 주요 구현 포인트

- Electron Main / Preload / Renderer 책임 분리
- Context Isolation 기반의 제한된 preload API와 IPC 입력 검증
- 투명 창에서 상호작용 영역만 마우스 이벤트를 받는 Click-through 처리
- `electron-store` 스키마를 이용한 Todo 영구 저장
- Main Process Scheduler와 영구 발송 기록을 이용한 알림 중복 방지
- Tray와 캐릭터 Context Menu를 활용한 데스크톱 앱 UX
- 개발 환경을 제외한 Windows 로그인 자동 실행과 Squirrel 설치 지원

## 향후 개선 사항

- 자동 실행 ON / OFF와 기타 옵션을 관리하는 설정 화면
- Reminder 전용 Talk 애니메이션과 캐릭터 동작 확장
- Todo, IPC, Reminder Scheduler 단위·통합 테스트 추가
- Windows 코드 서명과 자동 업데이트 도입 검토
- FHD·QHD 등 다양한 Windows 해상도에서 사용성 검증
