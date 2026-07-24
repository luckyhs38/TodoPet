export interface DesktopPetApi {
  setIgnoreMouseEvents(shouldIgnore: boolean): void;
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

export type PetDirection = 'left' | 'right';
