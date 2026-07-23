import { useState } from 'react';

import type { Todo } from '../../shared/types';
import { CalendarView } from './CalendarView';

type TodoPanelMode = 'list' | 'create' | 'calendar';

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

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function TodoPanel({
  petPosition,
  todos,
  onAddTodo,
  onClose,
}: TodoPanelProps) {
  const [selectedDate, setSelectedDate] = useState(() =>
    formatLocalDate(new Date()),
  );
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  // value와 onChange를 연결해 입력창의 값을 React 상태로 관리합니다.
  const [content, setContent] = useState('');
  const [remindDate, setRemindDate] = useState('');
  const [remindTime, setRemindTime] = useState('');
  // 패널을 열 때는 항상 목록 화면부터 보여줍니다.
  const [mode, setMode] = useState<TodoPanelMode>('list');
  const hasRoomOnRight =
    petPosition + PET_WIDTH + PANEL_GAP + PANEL_WIDTH <= window.innerWidth;

  const left = hasRoomOnRight
    ? petPosition + PET_WIDTH + PANEL_GAP
    : Math.max(PANEL_GAP, petPosition - PANEL_WIDTH - PANEL_GAP);

  const selectedDateTodos = todos.filter(
    (todo) => todo.remindDate === selectedDate,
  );

  const panelTitle =
    mode === 'list' ? selectedDate : mode === 'create' ? '일정 추가' : '달력';

  const moveDisplayedMonth = (offset: number): void => {
    setDisplayedMonth((currentMonth) =>
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + offset,
        1,
      ),
    );
  };

  const handleSelectDate = (date: string): void => {
    setSelectedDate(date);
    setMode('list');
  };

  const handleAddTodo = (): void => {
    const wasAdded = onAddTodo(content, remindDate, remindTime);
    if (!wasAdded) return;

    // 추가에 성공했을 때만 세 입력창을 비웁니다.
    setContent('');
    setRemindDate('');
    setRemindTime('');
    setMode('list');
  };

  return (
    <aside
      id="todo-panel"
      className="todo-panel"
      style={{ left }}
      data-tail-side={hasRoomOnRight ? 'left' : 'right'}
      data-mode={mode}
      data-pet-interactive="true"
      aria-label="투두 패널"
    >
      <div className="todo-panel-header">
        <div className="todo-panel-header-left">
          {mode !== 'list' && (
            <button
              type="button"
              className="todo-panel-navigation-button"
              onClick={() => setMode('list')}
              aria-label="일정 목록으로 돌아가기"
            >
              ←
            </button>
          )}

          {mode === 'list' && (
            <>
              <button
                type="button"
                className="todo-panel-navigation-button"
                onClick={() => {
                  setRemindDate(selectedDate);
                  setMode('create');
                }}
                aria-label="일정 추가 화면 열기"
              >
                +
              </button>
              <button
                type="button"
                className="todo-panel-navigation-button"
                onClick={() => setMode('calendar')}
                aria-label="달력 화면 열기"
              >
                ▦
              </button>
            </>
          )}
        </div>

        <h2 className="todo-panel-title">
          {panelTitle}
        </h2>

        <div className="todo-panel-header-right">
          <button
            type="button"
            className="todo-close-button"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>
      </div>

      {/* 공통 본문 안에서 현재 모드의 내용만 교체합니다. */}
      <div className="todo-panel-body" data-mode={mode}>
        {mode === 'list' ? (
          selectedDateTodos.length === 0 ? (
            <p className="todo-empty">등록된 일정이 없습니다.</p>
          ) : (
            <ul className="todo-list">
              {selectedDateTodos.map((todo) => (
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
          )
        ) : mode === 'create' ? (
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

            <button
              type="button"
              className="todo-save-button"
              onClick={handleAddTodo}
            >
              저장
            </button>
          </>
        ) : (
          <CalendarView
            displayedMonth={displayedMonth}
            selectedDate={selectedDate}
            todos={todos}
            onPreviousMonth={() => moveDisplayedMonth(-1)}
            onNextMonth={() => moveDisplayedMonth(1)}
            onSelectDate={handleSelectDate}
          />
        )}
      </div>
    </aside>
  );
}
