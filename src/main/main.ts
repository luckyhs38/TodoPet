import { app } from 'electron';
import squirrelStartup from 'electron-squirrel-startup';

import { enableAutoLaunch } from './autoLaunch';
import { createPetWindow } from './windowManager';
import { startReminderScheduler } from './reminderScheduler';
import { createTray, destroyTray } from './trayManager';

if (squirrelStartup) app.quit();

app.whenReady().then(() => {
  enableAutoLaunch();
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
