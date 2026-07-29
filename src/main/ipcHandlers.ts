import { ipcMain } from 'electron';
import type {
  BrowserWindow,
  IpcMainEvent,
  IpcMainInvokeEvent,
} from 'electron';

import { IPC_CHANNELS } from '../shared/ipcChannels';
import type { Todo } from '../shared/types';
import {
  addTodo,
  deleteTodo,
  getTodos,
  updateTodo,
} from './store';

function isTodo(value: unknown): value is Todo {
  if (!value || typeof value !== 'object') return false;

  const todo = value as Record<string, unknown>;
  return (
    typeof todo.id === 'string' &&
    typeof todo.content === 'string' &&
    typeof todo.remindDate === 'string' &&
    typeof todo.remindTime === 'string' &&
    (todo.status === 'todo' ||
      todo.status === 'inProgress' ||
      todo.status === 'done') &&
    (todo.priority === 'low' || todo.priority === 'high') &&
    typeof todo.isDone === 'boolean' &&
    typeof todo.createdAt === 'string'
  );
}

export function registerIpcHandlers(petWindow: BrowserWindow): void {
  const isTrustedSender = (
    event: IpcMainEvent | IpcMainInvokeEvent,
  ): boolean => event.sender === petWindow.webContents;

  const handleSetIgnoreMouseEvents = (
    event: IpcMainEvent,
    shouldIgnore: unknown,
  ): void => {
    if (!isTrustedSender(event)) return;
    if (typeof shouldIgnore !== 'boolean') return;

    if (shouldIgnore) {
      petWindow.setIgnoreMouseEvents(true, { forward: true });
      return;
    }

    petWindow.setIgnoreMouseEvents(false);
  };

  ipcMain.on(
    IPC_CHANNELS.setIgnoreMouseEvents,
    handleSetIgnoreMouseEvents,
  );

  ipcMain.handle(IPC_CHANNELS.getTodos, (event) => {
    if (!isTrustedSender(event)) throw new Error('Untrusted IPC sender.');
    return getTodos();
  });

  ipcMain.handle(IPC_CHANNELS.addTodo, (event, todo: unknown) => {
    if (!isTrustedSender(event)) throw new Error('Untrusted IPC sender.');
    if (!isTodo(todo)) throw new TypeError('Invalid Todo.');
    return addTodo(todo);
  });

  ipcMain.handle(IPC_CHANNELS.updateTodo, (event, todo: unknown) => {
    if (!isTrustedSender(event)) throw new Error('Untrusted IPC sender.');
    if (!isTodo(todo)) throw new TypeError('Invalid Todo.');
    return updateTodo(todo);
  });

  ipcMain.handle(IPC_CHANNELS.deleteTodo, (event, todoId: unknown) => {
    if (!isTrustedSender(event)) throw new Error('Untrusted IPC sender.');
    if (typeof todoId !== 'string') throw new TypeError('Invalid Todo id.');
    deleteTodo(todoId);
  });

  petWindow.once('closed', () => {
    ipcMain.removeListener(
      IPC_CHANNELS.setIgnoreMouseEvents,
      handleSetIgnoreMouseEvents,
    );
    ipcMain.removeHandler(IPC_CHANNELS.getTodos);
    ipcMain.removeHandler(IPC_CHANNELS.addTodo);
    ipcMain.removeHandler(IPC_CHANNELS.updateTodo);
    ipcMain.removeHandler(IPC_CHANNELS.deleteTodo);
  });
}
