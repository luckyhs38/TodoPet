export interface DesktopPetApi {
  setIgnoreMouseEvents(shouldIgnore: boolean): void;
  getTodos(): Promise<Todo[]>;
  addTodo(todo: Todo): Promise<Todo>;
  updateTodo(todo: Todo): Promise<Todo>;
  deleteTodo(todoId: string): Promise<void>;
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
}

export type PetDirection = 'left' | 'right';
