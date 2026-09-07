import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    favicon: './src/assets/car.png',
    title: 'WashApp PRO',
  },
  server: {
    // El hosting asigna el puerto por la variable PORT; sin esto el servidor
    // escucharia en el 3000 y la plataforma no podria enrutarlo.
    port: Number(process.env.PORT) || 3000,
    // En un contenedor hay que aceptar conexiones de fuera, no solo de localhost.
    host: '0.0.0.0',
    // Es una aplicacion de una sola pagina: cualquier ruta debe devolver
    // index.html para que el enrutador del navegador se encargue. Sin esto,
    // recargar /clients da 404.
    historyApiFallback: true,
  },
});
