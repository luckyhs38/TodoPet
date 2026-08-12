import { ipcMain, Menu } from 'electron';
import type {
  BrowserWindow,
  IpcMainEvent,
  IpcMainInvokeEvent,
} from 'electron';

import { IPC_CHANNELS } from '../shared/ipcChannels';
import type { SpeechBubbleDurationMinutes, Todo } from '../shared/types';
import {
  getAutoLaunchEnabled,
  setAutoLaunchEnabled,
} from './autoLaunch';
import {
  addTodo,
  deleteTodo,
  getSpeechBubbleSettings,
  getTodos,
  setSpeechBubbleDurationMinutes,
  setSpeechBubbleEnabled,
  updateTodo,
} from './store';
import { quitApp } from './trayManager';

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

export function registerIpcHandlers(
  petWindow: BrowserWindow,
  openSettingsWindow: () => void,
  getSettingsWindow: () => BrowserWindow | undefined,
): void {
  const isTrustedSender = (
    event: IpcMainEvent | IpcMainInvokeEvent,
  ): boolean => event.sender === petWindow.webContents;

  const isTrustedSettingsSender = (event: IpcMainInvokeEvent): boolean => {
    const settingsWindow = getSettingsWindow();
    return Boolean(
      settingsWindow &&
        !settingsWindow.isDestroyed() &&
        event.sender === settingsWindow.webContents,
    );
  };

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

  const petContextMenu = Menu.buildFromTemplate([
    {
      label: '환경설정',
      click: openSettingsWindow,
    },
    { type: 'separator' },
    {
      label: '숨기기',
      click: () => petWindow.hide(),
    },
    {
      label: '종료',
      click: quitApp,
    },
  ]);

  const handleShowPetContextMenu = (event: IpcMainEvent): void => {
    if (!isTrustedSender(event)) return;
    if (petWindow.isDestroyed()) return;

    petContextMenu.popup({ window: petWindow });
  };

  ipcMain.on(
    IPC_CHANNELS.setIgnoreMouseEvents,
    handleSetIgnoreMouseEvents,
  );
  ipcMain.on(
    IPC_CHANNELS.showPetContextMenu,
    handleShowPetContextMenu,
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

  ipcMain.handle(IPC_CHANNELS.getAutoLaunchEnabled, (event) => {
    if (!isTrustedSettingsSender(event)) {
      throw new Error('Untrusted IPC sender.');
    }

    return getAutoLaunchEnabled();
  });

  ipcMain.handle(
    IPC_CHANNELS.setAutoLaunchEnabled,
    (event, enabled: unknown) => {
      if (!isTrustedSettingsSender(event)) {
        throw new Error('Untrusted IPC sender.');
      }
      if (typeof enabled !== 'boolean') {
        throw new TypeError('Invalid auto-launch setting.');
      }

      return setAutoLaunchEnabled(enabled);
    },
  );

  ipcMain.handle(IPC_CHANNELS.getSpeechBubbleSettings, (event) => {
    if (!isTrustedSettingsSender(event)) {
      throw new Error('Untrusted IPC sender.');
    }

    return getSpeechBubbleSettings();
  });

  ipcMain.handle(
    IPC_CHANNELS.setSpeechBubbleEnabled,
    (event, enabled: unknown) => {
      if (!isTrustedSettingsSender(event)) {
        throw new Error('Untrusted IPC sender.');
      }
      if (typeof enabled !== 'boolean') {
        throw new TypeError('Invalid speech-bubble setting.');
      }

      return setSpeechBubbleEnabled(enabled);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.setSpeechBubbleDurationMinutes,
    (event, durationMinutes: unknown) => {
      if (!isTrustedSettingsSender(event)) {
        throw new Error('Untrusted IPC sender.');
      }
      if (!isSpeechBubbleDurationMinutes(durationMinutes)) {
        throw new TypeError('Invalid speech-bubble duration.');
      }

      return setSpeechBubbleDurationMinutes(durationMinutes);
    },
  );

  petWindow.once('closed', () => {
    ipcMain.removeListener(
      IPC_CHANNELS.setIgnoreMouseEvents,
      handleSetIgnoreMouseEvents,
    );
    ipcMain.removeListener(
      IPC_CHANNELS.showPetContextMenu,
      handleShowPetContextMenu,
    );
    ipcMain.removeHandler(IPC_CHANNELS.getTodos);
    ipcMain.removeHandler(IPC_CHANNELS.addTodo);
    ipcMain.removeHandler(IPC_CHANNELS.updateTodo);
    ipcMain.removeHandler(IPC_CHANNELS.deleteTodo);
    ipcMain.removeHandler(IPC_CHANNELS.getAutoLaunchEnabled);
    ipcMain.removeHandler(IPC_CHANNELS.setAutoLaunchEnabled);
    ipcMain.removeHandler(IPC_CHANNELS.getSpeechBubbleSettings);
    ipcMain.removeHandler(IPC_CHANNELS.setSpeechBubbleEnabled);
    ipcMain.removeHandler(
      IPC_CHANNELS.setSpeechBubbleDurationMinutes,
    );
  });
}

function isSpeechBubbleDurationMinutes(
  value: unknown,
): value is SpeechBubbleDurationMinutes {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 120
  );
}
