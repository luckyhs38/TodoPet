import { useState } from 'react';

import type { Todo, TodoPriority, TodoStatus } from '../shared/types';
import { TodoPanel } from './components/TodoPanel';
import { useClickThrough } from './hooks/useClickThrough';
import { usePetMovement } from './hooks/usePetMovement';

const NEXT_TODO_STATUS: Record<TodoStatus, TodoStatus> = {
  todo: 'inProgress',
  inProgress: 'done',
  done: 'todo',
};
export function App() {
  useClickThrough();
  const [isTodoPanelOpen, setIsTodoPanelOpen] = useState(false);
  // 목록을 App에 두면 패널을 닫아도 앱 실행 중에는 투두가 유지됩니다.
  const [todos, setTodos] = useState<Todo[]>([]);
  const { position, direction, state } = usePetMovement(isTodoPanelOpen);

  const addTodo = (
    content: string,
    remindDate: string,
    remindTime: string,
    status: TodoStatus,
    priority: TodoPriority,
  ): boolean => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return false;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      content: trimmedContent,
      remindDate,
      remindTime,
      status,
      priority,
      // 기존 완료 필드는 진행상태와 같은 값을 나타내도록 맞춥니다.
      isDone: status === 'done',
      createdAt: new Date().toISOString(),
    };

    // 기존 배열을 바꾸지 않고 새 배열을 만들어 React에 변경을 알립니다.
    setTodos((currentTodos) => [...currentTodos, newTodo]);
    return true;
  };

  const updateTodo = (
    todoId: string,
    content: string,
    remindTime: string,
  ): void => {
    // 선택한 일정의 내용과 시간만 새 객체에 덮어씁니다.
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              content,
              remindTime,
            }
          : todo,
      ),
    );
  };

  const deleteTodo = (todoId: string): void => {
    // 선택한 id가 아닌 일정만 남겨 기존 배열을 직접 수정하지 않습니다.
    setTodos((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== todoId),
    );
  };

  const cycleTodoStatus = (todoId: string): void => {
    // map으로 선택한 일정만 새 객체로 바꿔 기존 배열을 직접 수정하지 않습니다.
    setTodos((currentTodos) =>
      currentTodos.map((todo) => {
        if (todo.id !== todoId) return todo;

        const nextStatus = NEXT_TODO_STATUS[todo.status];
        return {
          ...todo,
          status: nextStatus,
          isDone: nextStatus === 'done',
        };
      }),
    );
  };

  const cycleTodoPriority = (todoId: string): void => {
    // 중요도만 새 값으로 바꾸고 진행상태를 포함한 나머지 값은 유지합니다.
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              // high가 아니면 기본 중요도로 보고 ★로 전환합니다.
              priority: todo.priority === 'high' ? 'low' : 'high',
            }
          : todo,
      ),
    );
  };

  return (
    <main className="pet-stage">
      <button
        type="button"
        className="pet-placeholder"
        style={{ transform: `translateX(${position}px)` }}
        data-direction={direction}
        data-movement-state={state}
        data-pet-interactive="true"
        aria-label="투두 패널 열기 또는 닫기"
        aria-expanded={isTodoPanelOpen}
        aria-controls="todo-panel"
        onClick={() => setIsTodoPanelOpen((isOpen) => !isOpen)}
      >
        <span className="pet-sprite" role="img" aria-label="캐릭터" />
      </button>

      {isTodoPanelOpen && (
        <TodoPanel
          petPosition={position}
          todos={todos}
          onAddTodo={addTodo}
          onUpdateTodo={updateTodo}
          onDeleteTodo={deleteTodo}
          onCycleTodoStatus={cycleTodoStatus}
          onCycleTodoPriority={cycleTodoPriority}
          onClose={() => setIsTodoPanelOpen(false)}
        />
      )}
    </main>
  );
}
