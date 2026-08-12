import { BrowserWindow, screen } from 'electron';
import path from 'node:path';

import { registerIpcHandlers } from './ipcHandlers';

const WINDOW_SIZE = 280;
const BOTTOM_MARGIN = 0;
const SETTINGS_WINDOW_WIDTH = 340;
const SETTINGS_WINDOW_HEIGHT = 240;

let settingsWindow: BrowserWindow | undefined;

export function openSettingsWindow(petWindow: BrowserWindow): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: SETTINGS_WINDOW_WIDTH,
    height: SETTINGS_WINDOW_HEIGHT,
    parent: petWindow,
    show: false,
    transparent: true,
    frame: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWindow.center();
  settingsWindow.once('ready-to-show', () => settingsWindow?.show());
  settingsWindow.once('closed', () => {
    settingsWindow = undefined;
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    const settingsUrl = new URL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    settingsUrl.searchParams.set('view', 'settings');
    void settingsWindow.loadURL(settingsUrl.toString());
  } else {
    void settingsWindow.loadFile(
      path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`,
      ),
      { query: { view: 'settings' } },
    );
  }
}

export function createPetWindow(): BrowserWindow {
  // Keep one transparent stage fixed directly above the taskbar.
  const { workArea } = screen.getPrimaryDisplay();
  const x = workArea.x;
  const y = workArea.y + workArea.height - WINDOW_SIZE - BOTTOM_MARGIN;

  const petWindow = new BrowserWindow({
    width: workArea.width,
    height: WINDOW_SIZE,
    x,
    y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  registerIpcHandlers(
    petWindow,
    () => openSettingsWindow(petWindow),
    () => settingsWindow,
  );

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    void petWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    void petWindow.loadFile(
      path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`,
      ),
    );
  }

  return petWindow;
}
