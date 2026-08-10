import { app } from 'electron';

import { createPetWindow } from './windowManager';
import { startReminderScheduler } from './reminderScheduler';
import { createTray, destroyTray } from './trayManager';

app.whenReady().then(() => {
  const petWindow = createPetWindow();
  createTray(petWindow);
  let stopReminderScheduler: (() => void) | undefined;

  petWindow.webContents.once('did-finish-load', () => {
    stopReminderScheduler ??= startReminderScheduler(petWindow);
  });

  app.once('before-quit', () => {
    stopReminderScheduler?.();
    stopReminderScheduler = undefined;
    destroyTray();
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
