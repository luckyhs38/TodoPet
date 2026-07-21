import { ipcMain } from 'electron';
import type { BrowserWindow, IpcMainEvent } from 'electron';

import { IPC_CHANNELS } from '../shared/ipcChannels';

export function registerIpcHandlers(petWindow: BrowserWindow): void {
  const handleSetIgnoreMouseEvents = (
    event: IpcMainEvent,
    shouldIgnore: unknown,
  ): void => {
    if (event.sender !== petWindow.webContents) return;
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

  petWindow.once('closed', () => {
    ipcMain.removeListener(
      IPC_CHANNELS.setIgnoreMouseEvents,
      handleSetIgnoreMouseEvents,
    );
  });
}
