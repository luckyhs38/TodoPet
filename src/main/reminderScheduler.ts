import type { BrowserWindow } from 'electron';

import { IPC_CHANNELS } from '../shared/ipcChannels';
import type { Todo, TodoReminderPayload } from '../shared/types';
import {
  getNotifiedReminderKeys,
  getTodos,
  saveNotifiedReminderKeys,
} from './store';

const REMINDER_CHECK_INTERVAL_MS = 15_000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLocalTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function isReminderTodo(todo: unknown): todo is Todo {
  if (!todo || typeof todo !== 'object') return false;

  const value = todo as Record<string, unknown>;
  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.content === 'string' &&
    value.content.trim().length > 0 &&
    typeof value.remindDate === 'string' &&
    DATE_PATTERN.test(value.remindDate) &&
    typeof value.remindTime === 'string' &&
    TIME_PATTERN.test(value.remindTime) &&
    (value.status === 'todo' ||
      value.status === 'inProgress' ||
      value.status === 'done')
  );
}

function createReminderKey(todo: Todo): string {
  return `${todo.id}|${todo.remindDate}|${todo.remindTime}`;
}

export function isTodoReminderDue(todo: unknown, now: Date): todo is Todo {
  return (
    isReminderTodo(todo) &&
    todo.status !== 'done' &&
    todo.remindDate === formatLocalDate(now) &&
    todo.remindTime === formatLocalTime(now)
  );
}

export function startReminderScheduler(
  petWindow: BrowserWindow,
): () => void {
  const sessionNotifiedKeys = new Set<string>();
  let isChecking = false;

  const checkReminders = (): void => {
    if (isChecking) return;
    isChecking = true;

    try {
      const todos = getTodos();
      const configuredKeys = new Set(
        todos.filter(isReminderTodo).map(createReminderKey),
      );
      const storedKeys = getNotifiedReminderKeys();
      const persistedKeys = storedKeys.filter((key) =>
        configuredKeys.has(key),
      );
      const sessionKeys = [...sessionNotifiedKeys].filter((key) =>
        configuredKeys.has(key),
      );
      const notifiedKeys = new Set([
        ...persistedKeys,
        ...sessionKeys,
      ]);
      const now = new Date();

      for (const todo of todos) {
        if (!isTodoReminderDue(todo, now)) continue;

        const reminderKey = createReminderKey(todo);
        if (notifiedKeys.has(reminderKey)) continue;
        if (petWindow.isDestroyed() || petWindow.webContents.isDestroyed()) {
          continue;
        }

        const payload: TodoReminderPayload = {
          todoId: todo.id,
          content: todo.content,
          remindDate: todo.remindDate,
          remindTime: todo.remindTime,
        };

        try {
          petWindow.webContents.send(
            IPC_CHANNELS.todoReminderTriggered,
            payload,
          );
          sessionNotifiedKeys.add(reminderKey);
          notifiedKeys.add(reminderKey);
        } catch (error) {
          console.error('Todo 알림을 전송하지 못했습니다.', error);
        }
      }

      const keysToPersist = [...notifiedKeys];
      const storedKeySet = new Set(storedKeys);
      const didStoredKeysChange =
        storedKeySet.size !== keysToPersist.length ||
        keysToPersist.some((key) => !storedKeySet.has(key));

      if (didStoredKeysChange) {
        saveNotifiedReminderKeys(keysToPersist);
      }
    } catch (error) {
      console.error('Todo 알림 대상을 확인하지 못했습니다.', error);
    } finally {
      isChecking = false;
    }
  };

  checkReminders();
  const timerId = setInterval(checkReminders, REMINDER_CHECK_INTERVAL_MS);

  return () => clearInterval(timerId);
}
