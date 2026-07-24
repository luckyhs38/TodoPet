import { useRef, useState } from 'react';
import type { FocusEvent, KeyboardEvent } from 'react';

import type {
  Todo,
  TodoPriority,
  TodoStatus,
} from '../../shared/types';
import { CalendarView } from './CalendarView';

type TodoPanelMode = 'list' | 'create' | 'calendar';
type EditingField = 'content' | 'time' | null;

interface TodoPanelProps {
  petPosition: number;
  todos: Todo[];
  onAddTodo(
    content: string,
    remindDate: string,
    remindTime: string,
    status: TodoStatus,
    priority: TodoPriority,
  ): boolean;
  onUpdateTodo(todoId: string, content: string, remindTime: string): void;
  onCycleTodoStatus(todoId: string): void;
  onCycleTodoPriority(todoId: string): void;
  onClose(): void;
}

const PANEL_WIDTH = 230;
const PET_WIDTH = 70;
const PANEL_GAP = 8;
const TODO_STATUS_LABELS: Record<TodoStatus, string> = {
  todo: '할 일',
  inProgress: '진행 중',
  done: '완료',
};
const TODO_PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: '기본',
  high: '높음',
};
const TODO_TIME_PATTERN = /^$|^([01]\d|2[0-3]):[0-5]\d$/;

function getTodoPriorityLabel(priority: TodoPriority): string {
  // 예전 값이 들어와도 high가 아니면 기본 중요도로 표시합니다.
  return priority === 'high'
    ? TODO_PRIORITY_LABELS.high
    : TODO_PRIORITY_LABELS.low;
}

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
  onUpdateTodo,
  onCycleTodoStatus,
  onCycleTodoPriority,
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
  // select도 입력창처럼 React 상태로 선택값을 관리합니다.
  const [status, setStatus] = useState<TodoStatus>('todo');
  const [priority, setPriority] = useState<TodoPriority>('low');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<EditingField>(null);
  const editingOriginalValueRef = useRef('');
  const shouldCancelBlurRef = useRef(false);
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

  const panelTitle = mode === 'create' ? '일정 추가' : '달력';

  const moveSelectedDate = (offset: number): void => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    // Date가 월말과 연말을 자동으로 다음 달·해로 보정합니다.
    const nextDate = new Date(year, month - 1, day + offset);
    setSelectedDate(formatLocalDate(nextDate));
  };

  const handleOpenCalendar = (): void => {
    const [year, month] = selectedDate.split('-').map(Number);
    // 달력을 열 때 선택된 날짜가 속한 월부터 보여줍니다.
    setDisplayedMonth(new Date(year, month - 1, 1));
    setMode('calendar');
  };

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
    const wasAdded = onAddTodo(
      content,
      remindDate,
      remindTime,
      status,
      priority,
    );
    if (!wasAdded) return;

    // 추가에 성공했을 때만 세 입력창을 비웁니다.
    setContent('');
    setRemindDate('');
    setRemindTime('');
    setStatus('todo');
    setPriority('low');
    setMode('list');
  };

  const resetEditingTodo = (): void => {
    setEditingTodoId(null);
    setEditingField(null);
    editingOriginalValueRef.current = '';
  };

  const startEditingTodo = (
    todoId: string,
    field: Exclude<EditingField, null>,
    originalValue: string,
  ): void => {
    setEditingTodoId(todoId);
    setEditingField(field);
    editingOriginalValueRef.current = originalValue;
  };

  const restoreOriginalValue = (element: HTMLElement): void => {
    element.textContent = editingOriginalValueRef.current;
  };

  const cancelEditingTodo = (element: HTMLElement): void => {
    restoreOriginalValue(element);
    // Escape 직후 발생하는 blur에서는 수정 내용을 저장하지 않습니다.
    shouldCancelBlurRef.current = true;
    resetEditingTodo();
    element.blur();
  };

  const saveEditingTodo = (
    event: FocusEvent<HTMLElement>,
    todo: Todo,
    field: Exclude<EditingField, null>,
  ): void => {
    if (shouldCancelBlurRef.current) {
      shouldCancelBlurRef.current = false;
      return;
    }

    const editedValue = event.currentTarget.textContent?.trim() ?? '';

    if (field === 'content') {
      if (!editedValue) {
        // 빈 내용은 저장하지 않고 기존 내용을 다시 보여줍니다.
        restoreOriginalValue(event.currentTarget);
      } else {
        // 붙여넣은 HTML이 아니라 화면에 보이는 글자만 저장합니다.
        event.currentTarget.textContent = editedValue;
        if (editedValue !== todo.content) {
          onUpdateTodo(todo.id, editedValue, todo.remindTime);
        }
      }
    } else if (TODO_TIME_PATTERN.test(editedValue)) {
      event.currentTarget.textContent = editedValue;
      if (editedValue !== todo.remindTime) {
        onUpdateTodo(todo.id, todo.content, editedValue);
      }
    } else {
      restoreOriginalValue(event.currentTarget);
    }

    resetEditingTodo();
  };

  const handleEditingKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    field: Exclude<EditingField, null>,
  ): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditingTodo(event.currentTarget);
      return;
    }

    if (event.key !== 'Enter') return;

    event.preventDefault();
    if (field === 'content' && event.shiftKey) {
      const selection = window.getSelection();
      if (!selection?.rangeCount) return;

      const range = selection.getRangeAt(0);
      if (!event.currentTarget.contains(range.commonAncestorContainer)) return;

      // br 태그 대신 줄바꿈 문자를 넣어 textContent로 읽을 수 있게 합니다.
      const newline = document.createTextNode('\n');
      range.deleteContents();
      range.insertNode(newline);
      range.setStartAfter(newline);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    // blur가 발생하면 한 곳의 저장 함수만 실행됩니다.
    event.currentTarget.blur();
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
            </>
          )}
        </div>

        {mode === 'list' ? (
          <div className="todo-date-navigation">
            <button
              type="button"
              className="todo-date-navigation-button"
              onClick={() => moveSelectedDate(-1)}
              aria-label="이전 날짜"
            >
              &lt;
            </button>
            <button
              type="button"
              className="todo-date-navigation-button todo-selected-date-button"
              onClick={handleOpenCalendar}
              aria-label={`${selectedDate} 달력 열기`}
            >
              {selectedDate}
            </button>
            <button
              type="button"
              className="todo-date-navigation-button"
              onClick={() => moveSelectedDate(1)}
              aria-label="다음 날짜"
            >
              &gt;
            </button>
          </div>
        ) : (
          <h2 className="todo-panel-title">{panelTitle}</h2>
        )}

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
                  <button
                    type="button"
                    className="todo-priority-button"
                    data-priority={todo.priority === 'high' ? 'high' : 'low'}
                    onClick={() => onCycleTodoPriority(todo.id)}
                    aria-label={`중요도: ${getTodoPriorityLabel(todo.priority)}`}
                    title={`중요도: ${getTodoPriorityLabel(todo.priority)}`}
                  >
                    {todo.priority === 'high' ? '★' : '☆'}
                  </button>
                  <button
                    type="button"
                    className="todo-status-button"
                    data-status={todo.status}
                    onClick={() => onCycleTodoStatus(todo.id)}
                    aria-label={`진행상태: ${TODO_STATUS_LABELS[todo.status]}`}
                    title={`진행상태: ${TODO_STATUS_LABELS[todo.status]}`}
                  >
                    {todo.status === 'todo'
                      ? '□'
                      : todo.status === 'inProgress'
                        ? '◩'
                        : '■'}
                  </button>
                  <time
                    className="todo-list-time"
                    dateTime={todo.remindTime || undefined}
                    contentEditable
                    suppressContentEditableWarning
                    role="textbox"
                    tabIndex={0}
                    aria-label={`시간 수정: ${todo.remindTime || '시간 없음'}`}
                    data-editing={
                      editingTodoId === todo.id && editingField === 'time'
                        ? 'true'
                        : undefined
                    }
                    onFocus={() =>
                      startEditingTodo(todo.id, 'time', todo.remindTime)
                    }
                    onBlur={(event) => saveEditingTodo(event, todo, 'time')}
                    onKeyDown={(event) =>
                      handleEditingKeyDown(event, 'time')
                    }
                  >
                    {todo.remindTime}
                  </time>
                  <span
                    className={`todo-list-content ${
                      todo.status === 'done'
                        ? 'todo-list-content--done'
                        : ''
                    }`}
                    contentEditable
                    suppressContentEditableWarning
                    role="textbox"
                    tabIndex={0}
                    aria-multiline="true"
                    aria-label={`일정 내용 수정: ${todo.content}`}
                    data-editing={
                      editingTodoId === todo.id && editingField === 'content'
                        ? 'true'
                        : undefined
                    }
                    onFocus={() =>
                      startEditingTodo(todo.id, 'content', todo.content)
                    }
                    onBlur={(event) => saveEditingTodo(event, todo, 'content')}
                    onKeyDown={(event) =>
                      handleEditingKeyDown(event, 'content')
                    }
                  >
                    {todo.content}
                  </span>
                </li>
              ))}
            </ul>
          )
        ) : mode === 'create' ? (
          <>
            <input
              type="text"
              aria-label="할 일"
              placeholder="일정을 입력하세요"
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

            <div className="todo-datetime-row">
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as TodoStatus)
                }
              >
                <option value="todo">할 일</option>
                <option value="inProgress">진행 중</option>
                <option value="done">완료</option>
              </select>

              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as TodoPriority)
                }
              >
                <option value="low">기본</option>
                <option value="high">높음</option>
              </select>
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
