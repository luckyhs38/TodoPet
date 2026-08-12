import { app } from 'electron';
import squirrelStartup from 'electron-squirrel-startup';

import { enableAutoLaunch, isAutoLaunchSupported } from './autoLaunch';
import { createPetWindow, openSettingsWindow } from './windowManager';
import { startReminderScheduler } from './reminderScheduler';
import {
  getAutoLaunchInitialized,
  setAutoLaunchInitialized,
} from './store';
import { createTray, destroyTray } from './trayManager';

if (squirrelStartup) app.quit();

app.whenReady().then(() => {
  if (isAutoLaunchSupported() && !getAutoLaunchInitialized()) {
    enableAutoLaunch();
    setAutoLaunchInitialized(true);
  }

  const petWindow = createPetWindow();
  createTray(petWindow, () => openSettingsWindow(petWindow));
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
