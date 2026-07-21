interface TodoPanelProps {
  petPosition: number;
  onClose(): void;
}

const PANEL_WIDTH = 230;
const PET_WIDTH = 70;
const PANEL_GAP = 8;

export function TodoPanel({ petPosition, onClose }: TodoPanelProps) {
  const hasRoomOnRight =
    petPosition + PET_WIDTH + PANEL_GAP + PANEL_WIDTH <= window.innerWidth;

  const left = hasRoomOnRight
    ? petPosition + PET_WIDTH + PANEL_GAP
    : Math.max(PANEL_GAP, petPosition - PANEL_WIDTH - PANEL_GAP);

  return (
    <aside
      id="todo-panel"
      className="todo-panel"
      style={{ left }}
      data-tail-side={hasRoomOnRight ? 'left' : 'right'}
      data-pet-interactive="true"
      aria-label="투두 패널"
    >
      <div className="todo-panel-header">
        <h2>할 일</h2>
        <button type="button">추가</button>
        <button
          type="button"
          className="todo-close-button"
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>
      </div>

      <input
        type="text"
        aria-label="할 일"
        placeholder="할 일을 입력하세요"
      />

      <div className="todo-datetime-row">
        <input type="date" aria-label="날짜" />
        <input type="time" aria-label="시간" />
      </div>
    </aside>
  );
}
