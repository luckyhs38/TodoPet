import { BrowserWindow, screen } from 'electron';
import path from 'node:path';

import { registerIpcHandlers } from './ipcHandlers';

const WINDOW_SIZE = 280;
const BOTTOM_MARGIN = 0;

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

  registerIpcHandlers(petWindow);

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
