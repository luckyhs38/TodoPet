import { useState } from 'react';

import type { Todo } from '../../shared/types';

interface TodoPanelProps {
  petPosition: number;
  todos: Todo[];
  onAddTodo(
    content: string,
    remindDate: string,
    remindTime: string,
  ): boolean;
  onClose(): void;
}

const PANEL_WIDTH = 230;
const PET_WIDTH = 70;
const PANEL_GAP = 8;

export function TodoPanel({
  petPosition,
  todos,
  onAddTodo,
  onClose,
}: TodoPanelProps) {
  // value와 onChange를 연결해 입력창의 값을 React 상태로 관리합니다.
  const [content, setContent] = useState('');
  const [remindDate, setRemindDate] = useState('');
  const [remindTime, setRemindTime] = useState('');
  // 첫 일정은 바로 입력하고, 이후에는 추가 버튼으로 입력창을 엽니다.
  const [isInputOpen, setIsInputOpen] = useState(todos.length === 0);
  const hasRoomOnRight =
    petPosition + PET_WIDTH + PANEL_GAP + PANEL_WIDTH <= window.innerWidth;

  const left = hasRoomOnRight
    ? petPosition + PET_WIDTH + PANEL_GAP
    : Math.max(PANEL_GAP, petPosition - PANEL_WIDTH - PANEL_GAP);

  const handleAddTodo = (): void => {
    if (!isInputOpen) {
      setIsInputOpen(true);
      return;
    }

    const wasAdded = onAddTodo(content, remindDate, remindTime);
    if (!wasAdded) return;

    // 추가에 성공했을 때만 세 입력창을 비웁니다.
    setContent('');
    setRemindDate('');
    setRemindTime('');
    setIsInputOpen(false);
  };

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
        <h2>투 두</h2>
        <button
          type="button"
          onClick={handleAddTodo}
          aria-expanded={isInputOpen}
        >
          {isInputOpen ? '등록' : '추가'}
        </button>
        <button
          type="button"
          className="todo-close-button"
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>
      </div>

      {isInputOpen && (
        <>
          <input
            type="text"
            aria-label="할 일"
            placeholder="할 일을 입력하세요"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />

          <div className="todo-datetime-row">
            <input
              type="date"
              aria-label="날짜"
              value={remindDate}
              onChange={(event) => setRemindDate(event.target.value)}
            />
            <input
              type="time"
              aria-label="시간"
              value={remindTime}
              onChange={(event) => setRemindTime(event.target.value)}
            />
          </div>
        </>
      )}

      {todos.length > 0 && (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className="todo-list-item">
              <span>{todo.content}</span>
              {(todo.remindDate || todo.remindTime) && (
                <span className="todo-reminder">
                  {todo.remindDate && <span>{todo.remindDate}</span>}
                  {todo.remindTime && <span>{todo.remindTime}</span>}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
