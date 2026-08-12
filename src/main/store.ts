import Store from 'electron-store';
import type { Schema } from 'electron-store';

import type {
  SpeechBubbleDurationMinutes,
  SpeechBubbleSettings,
  Todo,
} from '../shared/types';

interface TodoStoreSchema {
  todos: Todo[];
  notifiedReminderKeys: string[];
  autoLaunchInitialized: boolean;
  speechBubbleEnabled: boolean;
  speechBubbleDurationMinutes: SpeechBubbleDurationMinutes;
}

const schema: Schema<TodoStoreSchema> = {
  todos: {
    type: 'array',
    default: [],
    items: {
      type: 'object',
      additionalProperties: false,
      required: [
        'id',
        'content',
        'remindDate',
        'remindTime',
        'status',
        'priority',
        'isDone',
        'createdAt',
      ],
      properties: {
        id: { type: 'string' },
        content: { type: 'string' },
        remindDate: { type: 'string' },
        remindTime: { type: 'string' },
        status: { type: 'string', enum: ['todo', 'inProgress', 'done'] },
        priority: { type: 'string', enum: ['low', 'high'] },
        isDone: { type: 'boolean' },
        createdAt: { type: 'string' },
      },
    },
  },
  notifiedReminderKeys: {
    type: 'array',
    default: [],
    items: {
      type: 'string',
    },
  },
  autoLaunchInitialized: {
    type: 'boolean',
    default: false,
  },
  speechBubbleEnabled: {
    type: 'boolean',
    default: true,
  },
  speechBubbleDurationMinutes: {
    type: 'number',
    minimum: 1,
    maximum: 120,
    default: 1,
  },
};

let todoStore: Store<TodoStoreSchema> | undefined;

function getStore(): Store<TodoStoreSchema> {
  todoStore ??= new Store<TodoStoreSchema>({
    name: 'todos',
    schema,
    defaults: {
      todos: [],
      notifiedReminderKeys: [],
      autoLaunchInitialized: false,
      speechBubbleEnabled: true,
      speechBubbleDurationMinutes: 1,
    },
  });

  return todoStore;
}

export function getTodos(): Todo[] {
  return getStore().get('todos');
}

export function addTodo(todo: Todo): Todo {
  const todos = getTodos();
  if (todos.some((currentTodo) => currentTodo.id === todo.id)) {
    throw new Error(`Todo already exists: ${todo.id}`);
  }

  getStore().set('todos', [...todos, todo]);
  return todo;
}

export function updateTodo(todo: Todo): Todo {
  const todos = getTodos();
  if (!todos.some((currentTodo) => currentTodo.id === todo.id)) {
    throw new Error(`Todo was not found: ${todo.id}`);
  }

  getStore().set(
    'todos',
    todos.map((currentTodo) =>
      currentTodo.id === todo.id ? todo : currentTodo,
    ),
  );
  return todo;
}

export function deleteTodo(todoId: string): void {
  const todos = getTodos();
  if (!todos.some((todo) => todo.id === todoId)) {
    throw new Error(`Todo was not found: ${todoId}`);
  }

  getStore().set(
    'todos',
    todos.filter((todo) => todo.id !== todoId),
  );
}

export function getNotifiedReminderKeys(): string[] {
  return getStore().get('notifiedReminderKeys');
}

export function saveNotifiedReminderKeys(keys: string[]): void {
  getStore().set('notifiedReminderKeys', keys);
}

export function getAutoLaunchInitialized(): boolean {
  return getStore().get('autoLaunchInitialized');
}

export function setAutoLaunchInitialized(initialized: boolean): void {
  getStore().set('autoLaunchInitialized', initialized);
}

export function getSpeechBubbleSettings(): SpeechBubbleSettings {
  const store = getStore();
  return {
    speechBubbleEnabled: store.get('speechBubbleEnabled'),
    speechBubbleDurationMinutes: store.get(
      'speechBubbleDurationMinutes',
    ),
  };
}

export function setSpeechBubbleEnabled(
  enabled: boolean,
): SpeechBubbleSettings {
  getStore().set('speechBubbleEnabled', enabled);
  return getSpeechBubbleSettings();
}

export function setSpeechBubbleDurationMinutes(
  durationMinutes: SpeechBubbleDurationMinutes,
): SpeechBubbleSettings {
  getStore().set('speechBubbleDurationMinutes', durationMinutes);
  return getSpeechBubbleSettings();
}
