import { app } from 'electron';
import type { BrowserWindow } from 'electron';
import squirrelStartup from 'electron-squirrel-startup';

import { enableAutoLaunch, isAutoLaunchSupported } from './autoLaunch';
import { createPetWindow, openSettingsWindow } from './windowManager';
import { startReminderScheduler } from './reminderScheduler';
import {
  getAutoLaunchInitialized,
  setAutoLaunchInitialized,
} from './store';
import { createTray, destroyTray, showPetWindow } from './trayManager';

let primaryPetWindow: BrowserWindow | undefined;

if (squirrelStartup) {
  app.quit();
} else {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', () => {
      if (!primaryPetWindow || primaryPetWindow.isDestroyed()) return;

      showPetWindow(primaryPetWindow);
      primaryPetWindow.focus();
    });

    app.whenReady().then(() => {
    if (isAutoLaunchSupported() && !getAutoLaunchInitialized()) {
      enableAutoLaunch();
      setAutoLaunchInitialized(true);
    }

    const petWindow = createPetWindow();
    primaryPetWindow = petWindow;
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
  }
}

