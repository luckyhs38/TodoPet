import { useState } from 'react';

import type { Todo } from '../shared/types';
import { TodoPanel } from './components/TodoPanel';
import { useClickThrough } from './hooks/useClickThrough';
import { usePetMovement } from './hooks/usePetMovement';

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
  ): boolean => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return false;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      content: trimmedContent,
      remindDate,
      remindTime,
      isDone: false,
      createdAt: new Date().toISOString(),
    };

    // 기존 배열을 바꾸지 않고 새 배열을 만들어 React에 변경을 알립니다.
    setTodos((currentTodos) => [...currentTodos, newTodo]);
    return true;
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
          onClose={() => setIsTodoPanelOpen(false)}
        />
      )}
    </main>
  );
}
