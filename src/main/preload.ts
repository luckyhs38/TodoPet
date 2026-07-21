import { contextBridge, ipcRenderer } from 'electron';

import { IPC_CHANNELS } from '../shared/ipcChannels';
import type { DesktopPetApi } from '../shared/types';

const desktopPetApi: DesktopPetApi = Object.freeze({
  setIgnoreMouseEvents: (shouldIgnore: boolean): void => {
    ipcRenderer.send(IPC_CHANNELS.setIgnoreMouseEvents, shouldIgnore);
  },
});

contextBridge.exposeInMainWorld('desktopPet', desktopPetApi);
