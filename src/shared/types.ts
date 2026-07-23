export interface DesktopPetApi {
  setIgnoreMouseEvents(shouldIgnore: boolean): void;
}

export interface Todo {
  id: string;
  content: string;
  remindDate: string;
  remindTime: string;
  isDone: boolean;
  createdAt: string;
}

export type PetDirection = 'left' | 'right';
