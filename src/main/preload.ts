import { contextBridge, ipcRenderer } from 'electron';

import { IPC_CHANNELS } from '../shared/ipcChannels';
import type { DesktopPetApi, Todo } from '../shared/types';

const desktopPetApi: DesktopPetApi = Object.freeze({
  setIgnoreMouseEvents: (shouldIgnore: boolean): void => {
    ipcRenderer.send(IPC_CHANNELS.setIgnoreMouseEvents, shouldIgnore);
  },
  getTodos: () => ipcRenderer.invoke(IPC_CHANNELS.getTodos),
  addTodo: (todo: Todo) => ipcRenderer.invoke(IPC_CHANNELS.addTodo, todo),
  updateTodo: (todo: Todo) =>
    ipcRenderer.invoke(IPC_CHANNELS.updateTodo, todo),
  deleteTodo: (todoId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.deleteTodo, todoId),
});

contextBridge.exposeInMainWorld('desktopPet', desktopPetApi);
