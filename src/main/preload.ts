import { contextBridge, ipcRenderer } from 'electron';

import { IPC_CHANNELS } from '../shared/ipcChannels';
import type {
  DesktopPetApi,
  SpeechBubbleDurationMinutes,
  Todo,
  TodoReminderPayload,
} from '../shared/types';

function isTodoReminderPayload(
  value: unknown,
): value is TodoReminderPayload {
  if (!value || typeof value !== 'object') return false;

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.todoId === 'string' &&
    typeof payload.content === 'string' &&
    typeof payload.remindDate === 'string' &&
    typeof payload.remindTime === 'string' &&
    typeof payload.speechBubbleDurationMinutes === 'number' &&
    Number.isInteger(payload.speechBubbleDurationMinutes) &&
    payload.speechBubbleDurationMinutes >= 1 &&
    payload.speechBubbleDurationMinutes <= 120
  );
}

const desktopPetApi: DesktopPetApi = Object.freeze({
  setIgnoreMouseEvents: (shouldIgnore: boolean): void => {
    ipcRenderer.send(IPC_CHANNELS.setIgnoreMouseEvents, shouldIgnore);
  },
  showPetContextMenu: (): void => {
    ipcRenderer.send(IPC_CHANNELS.showPetContextMenu);
  },
  getTodos: () => ipcRenderer.invoke(IPC_CHANNELS.getTodos),
  addTodo: (todo: Todo) => ipcRenderer.invoke(IPC_CHANNELS.addTodo, todo),
  updateTodo: (todo: Todo) =>
    ipcRenderer.invoke(IPC_CHANNELS.updateTodo, todo),
  deleteTodo: (todoId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.deleteTodo, todoId),
  getAutoLaunchEnabled: () =>
    ipcRenderer.invoke(IPC_CHANNELS.getAutoLaunchEnabled),
  setAutoLaunchEnabled: (enabled: boolean) =>
    ipcRenderer.invoke(IPC_CHANNELS.setAutoLaunchEnabled, enabled),
  getSpeechBubbleSettings: () =>
    ipcRenderer.invoke(IPC_CHANNELS.getSpeechBubbleSettings),
  setSpeechBubbleEnabled: (enabled: boolean) =>
    ipcRenderer.invoke(IPC_CHANNELS.setSpeechBubbleEnabled, enabled),
  setSpeechBubbleDurationMinutes: (
    durationMinutes: SpeechBubbleDurationMinutes,
  ) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.setSpeechBubbleDurationMinutes,
      durationMinutes,
    ),
  onTodoReminder: (
    callback: (payload: TodoReminderPayload) => void,
  ): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: unknown) => {
      if (!isTodoReminderPayload(payload)) {
        console.error('잘못된 Todo 알림 payload를 받았습니다.');
        return;
      }

      callback(payload);
    };

    ipcRenderer.on(IPC_CHANNELS.todoReminderTriggered, listener);
    return () => {
      ipcRenderer.removeListener(
        IPC_CHANNELS.todoReminderTriggered,
        listener,
      );
    };
  },
});

contextBridge.exposeInMainWorld('desktopPet', desktopPetApi);
