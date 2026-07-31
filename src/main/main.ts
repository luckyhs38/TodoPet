import { app } from 'electron';

import { createPetWindow } from './windowManager';
import { startReminderScheduler } from './reminderScheduler';

app.whenReady().then(() => {
  const petWindow = createPetWindow();
  let stopReminderScheduler: (() => void) | undefined;

  petWindow.webContents.once('did-finish-load', () => {
    stopReminderScheduler ??= startReminderScheduler(petWindow);
  });

  app.once('before-quit', () => {
    stopReminderScheduler?.();
    stopReminderScheduler = undefined;
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
