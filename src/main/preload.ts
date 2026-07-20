import { contextBridge } from 'electron';

// Reserve a safe, isolated namespace without exposing IPC or Node.js APIs yet.
contextBridge.exposeInMainWorld('desktopPet', Object.freeze({}));
