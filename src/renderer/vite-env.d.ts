/// <reference types="vite/client" />

import type { DesktopPetApi } from '../shared/types';

declare global {
  interface Window {
    desktopPet: DesktopPetApi;
  }
}

export {};
