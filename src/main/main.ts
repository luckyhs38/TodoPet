import { app } from 'electron';

import { createPetWindow } from './windowManager';

app.whenReady().then(() => {
  createPetWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
