import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
   html: {
    favicon: './src/assets/car.png',
    title: 'WashApp PRO',
  },
});
