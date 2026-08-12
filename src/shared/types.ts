export interface DesktopPetApi {
  setIgnoreMouseEvents(shouldIgnore: boolean): void;
  showPetContextMenu(): void;
  getTodos(): Promise<Todo[]>;
  addTodo(todo: Todo): Promise<Todo>;
  updateTodo(todo: Todo): Promise<Todo>;
  deleteTodo(todoId: string): Promise<void>;
  getAutoLaunchEnabled(): Promise<boolean>;
  setAutoLaunchEnabled(enabled: boolean): Promise<boolean>;
  getSpeechBubbleSettings(): Promise<SpeechBubbleSettings>;
  setSpeechBubbleEnabled(enabled: boolean): Promise<SpeechBubbleSettings>;
  setSpeechBubbleDurationMinutes(
    durationMinutes: SpeechBubbleDurationMinutes,
  ): Promise<SpeechBubbleSettings>;
  onTodoReminder(
    callback: (payload: TodoReminderPayload) => void,
  ): () => void;
}

export type TodoStatus = 'todo' | 'inProgress' | 'done';

export type TodoPriority = 'low' | 'high';

export interface Todo {
  id: string;
  content: string;
  remindDate: string;
  remindTime: string;
  status: TodoStatus;
  priority: TodoPriority;
  isDone: boolean;
  createdAt: string;
}

export interface TodoReminderPayload {
  todoId: string;
  content: string;
  remindDate: string;
  remindTime: string;
  speechBubbleDurationMinutes: SpeechBubbleDurationMinutes;
}

export type SpeechBubbleDurationMinutes = number;

export interface SpeechBubbleSettings {
  speechBubbleEnabled: boolean;
  speechBubbleDurationMinutes: SpeechBubbleDurationMinutes;
}

export type PetDirection = 'left' | 'right';
