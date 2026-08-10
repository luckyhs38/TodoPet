import { app } from 'electron';

export function enableAutoLaunch(): void {
  if (process.platform !== 'win32' || !app.isPackaged) return;

  const { openAtLogin } = app.getLoginItemSettings();
  if (openAtLogin) return;

  app.setLoginItemSettings({ openAtLogin: true });
}
