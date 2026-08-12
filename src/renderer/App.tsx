import { useEffect, useState } from 'react';

import type {
  Todo,
  TodoPriority,
  TodoReminderPayload,
  TodoStatus,
} from '../shared/types';
import { SpeechBubble } from './components/SpeechBubble';
import { TodoPanel } from './components/TodoPanel';
import { useClickThrough } from './hooks/useClickThrough';
import { usePetMovement } from './hooks/usePetMovement';

const NEXT_TODO_STATUS: Record<TodoStatus, TodoStatus> = {
  todo: 'inProgress',
  inProgress: 'done',
  done: 'todo',
};
const SPEECH_BUBBLE_WIDTH = 220;

export function App() {
  useClickThrough();
  const [isTodoPanelOpen, setIsTodoPanelOpen] = useState(false);
  // 목록을 App에 두면 패널을 닫아도 앱 실행 중에는 투두가 유지됩니다.
  const [todos, setTodos] = useState<Todo[]>([]);
  const [reminderQueue, setReminderQueue] = useState<
    TodoReminderPayload[]
  >([]);
  const { position, direction, state } = usePetMovement(isTodoPanelOpen);
  const currentReminder = reminderQueue[0] ?? null;
  const speechBubbleLeft = Math.max(
    8,
    Math.min(position - 75, window.innerWidth - SPEECH_BUBBLE_WIDTH - 8),
  );

  useEffect(() => {
    let isActive = true;

    const loadTodos = async (): Promise<void> => {
      try {
        const storedTodos = await window.desktopPet.getTodos();
        if (isActive) setTodos(storedTodos);
      } catch (error) {
        console.error('Todo 목록을 불러오지 못했습니다.', error);
      }
    };

    void loadTodos();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    return window.desktopPet.onTodoReminder((payload) => {
      setReminderQueue((currentQueue) => {
        const reminderKey = `${payload.todoId}|${payload.remindDate}|${payload.remindTime}`;
        const isAlreadyQueued = currentQueue.some(
          (reminder) =>
            `${reminder.todoId}|${reminder.remindDate}|${reminder.remindTime}` ===
            reminderKey,
        );
        return isAlreadyQueued ? currentQueue : [...currentQueue, payload];
      });
    });
  }, []);

  useEffect(() => {
    if (!currentReminder) return;

    const durationMs =
      currentReminder.speechBubbleDurationMinutes * 60 * 1000;
    const timerId = window.setTimeout(() => {
      setReminderQueue((currentQueue) => currentQueue.slice(1));
    }, durationMs);

    return () => window.clearTimeout(timerId);
  }, [currentReminder]);

  const dismissCurrentReminder = (): void => {
    setReminderQueue((currentQueue) => currentQueue.slice(1));
  };

  const completeCurrentReminder = async (): Promise<void> => {
    if (!currentReminder) return;

    const currentTodo = todos.find(
      (todo) => todo.id === currentReminder.todoId,
    );
    if (!currentTodo) {
      dismissCurrentReminder();
      return;
    }

    const completedTodo: Todo = {
      ...currentTodo,
      status: 'done',
      isDone: true,
    };

    try {
      const savedTodo = await window.desktopPet.updateTodo(completedTodo);
      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === savedTodo.id ? savedTodo : todo,
        ),
      );
      dismissCurrentReminder();
    } catch (error) {
      console.error('알림 Todo를 완료 처리하지 못했습니다.', error);
    }
  };

  const addTodo = async (
    content: string,
    remindDate: string,
    remindTime: string,
    status: TodoStatus,
    priority: TodoPriority,
  ): Promise<boolean> => {
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
    try {
      const savedTodo = await window.desktopPet.addTodo(newTodo);
      setTodos((currentTodos) => [...currentTodos, savedTodo]);
      return true;
    } catch (error) {
      console.error('Todo를 저장하지 못했습니다.', error);
      return false;
    }
  };

  const updateTodo = async (
    todoId: string,
    content: string,
    remindTime: string,
  ): Promise<boolean> => {
    const currentTodo = todos.find((todo) => todo.id === todoId);
    if (!currentTodo) return false;

    const updatedTodo: Todo = {
      ...currentTodo,
      content,
      remindTime,
    };

    // 선택한 일정의 내용과 시간만 새 객체에 덮어씁니다.
    try {
      const savedTodo = await window.desktopPet.updateTodo(updatedTodo);
      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === todoId ? savedTodo : todo,
        ),
      );
      return true;
    } catch (error) {
      console.error('Todo를 수정하지 못했습니다.', error);
      return false;
    }
  };

  const deleteTodo = async (todoId: string): Promise<void> => {
    // 선택한 id가 아닌 일정만 남겨 기존 배열을 직접 수정하지 않습니다.
    try {
      await window.desktopPet.deleteTodo(todoId);
      setTodos((currentTodos) =>
        currentTodos.filter((todo) => todo.id !== todoId),
      );
    } catch (error) {
      console.error('Todo를 삭제하지 못했습니다.', error);
    }
  };

  const cycleTodoStatus = async (todoId: string): Promise<void> => {
    const currentTodo = todos.find((todo) => todo.id === todoId);
    if (!currentTodo) return;

    const nextStatus = NEXT_TODO_STATUS[currentTodo.status];

    const updatedTodo: Todo = {
      ...currentTodo,
      status: nextStatus,
      isDone: nextStatus === 'done',
    };
    // map으로 선택한 일정만 새 객체로 바꿔 기존 배열을 직접 수정하지 않습니다.
    try {
      const savedTodo = await window.desktopPet.updateTodo(updatedTodo);
      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === todoId ? savedTodo : todo,
        ),
      );
    } catch (error) {
      console.error('Todo 진행상태를 저장하지 못했습니다.', error);
    }
  };

  const cycleTodoPriority = async (todoId: string): Promise<void> => {
    const currentTodo = todos.find((todo) => todo.id === todoId);
    if (!currentTodo) return;

    const updatedTodo: Todo = {
      ...currentTodo,
      priority: currentTodo.priority === 'high' ? 'low' : 'high',
    };

    try {
      await window.desktopPet.updateTodo(updatedTodo);
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
    } catch (error) {
      console.error('Todo 중요도를 저장하지 못했습니다.', error);
    }
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
        onContextMenu={(event) => {
          event.preventDefault();
          window.desktopPet.showPetContextMenu();
        }}
      >
        <span className="pet-sprite" role="img" aria-label="캐릭터" />
      </button>

      {currentReminder && (
        <div
          className="speech-bubble-position"
          style={{ left: speechBubbleLeft }}
        >
          <SpeechBubble
            todoContent={currentReminder.content}
            remindTime={currentReminder.remindTime}
            onConfirm={() => void completeCurrentReminder()}
            onClose={dismissCurrentReminder}
          />
        </div>
      )}

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
