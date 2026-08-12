import { app } from 'electron';

export function isAutoLaunchSupported(): boolean {
  return process.platform === 'win32' && app.isPackaged;
}

export function getAutoLaunchEnabled(): boolean {
  if (!isAutoLaunchSupported()) return false;

  return app.getLoginItemSettings().openAtLogin;
}

export function setAutoLaunchEnabled(enabled: boolean): boolean {
  if (!isAutoLaunchSupported()) return false;

  app.setLoginItemSettings({ openAtLogin: enabled });
  return app.getLoginItemSettings().openAtLogin;
}

export function enableAutoLaunch(): void {
  if (getAutoLaunchEnabled()) return;

  setAutoLaunchEnabled(true);
}
