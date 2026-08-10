import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { VitePlugin } from '@electron-forge/plugin-vite';
import path from 'node:path';

const appIconPath = path.resolve(__dirname, 'assets', 'icons', 'icon.ico');

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: appIconPath,
    ignore: (file) => {
      if (!file) return false;
      return !file.startsWith('/.vite') && !file.startsWith('/assets');
    },
  },
  makers: [
    new MakerSquirrel({
      name: 'TodoPet',
      authors: 'TodoPet',
      setupIcon: appIconPath,
    }),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/main/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
  ],
};

export default config;
