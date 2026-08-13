import { app, Menu, nativeImage, Tray } from 'electron';
import type { BrowserWindow } from 'electron';
import path from 'node:path';

import {
  getPositionLocked,
  setPositionLocked,
  subscribeToPositionLock,
} from './positionLock';

let tray: Tray | undefined;
let unsubscribeFromPositionLock: (() => void) | undefined;

function showPetWindow(petWindow: BrowserWindow): void {
  if (petWindow.isDestroyed()) return;

  if (petWindow.isMinimized()) {
    petWindow.restore();
  }

  petWindow.show();
}

export function quitApp(): void {
  app.quit();
}

export function createTray(
  petWindow: BrowserWindow,
  openSettingsWindow: () => void,
): void {
  if (tray) return;

  const trayIconPath = path.join(
    app.getAppPath(),
    'assets',
    'icons',
    'tray.png',
  );
  const trayIcon = nativeImage.createFromPath(trayIconPath);

  if (trayIcon.isEmpty()) {
    console.warn(`Tray 아이콘을 찾을 수 없습니다: ${trayIconPath}`);
    return;
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('Desktop Pet');
  const trayMenu = Menu.buildFromTemplate([
    {
      label: '환경설정',
      click: openSettingsWindow,
    },
    { type: 'separator' },
    {
      label: '위치 고정',
      id: 'position-lock',
      type: 'checkbox',
      checked: getPositionLocked(),
      click: (menuItem) => setPositionLocked(menuItem.checked),
    },
    { type: 'separator' },
    {
      label: '열기',
      click: () => showPetWindow(petWindow),
    },
    {
      label: '종료',
      click: quitApp,
    },
  ]);
  const positionLockMenuItem = trayMenu.getMenuItemById('position-lock');
  unsubscribeFromPositionLock = subscribeToPositionLock((isLocked) => {
    if (positionLockMenuItem) positionLockMenuItem.checked = isLocked;
  });
  tray.setContextMenu(trayMenu);
  tray.on('double-click', () => showPetWindow(petWindow));
}

export function destroyTray(): void {
  unsubscribeFromPositionLock?.();
  unsubscribeFromPositionLock = undefined;
  tray?.destroy();
  tray = undefined;
}
