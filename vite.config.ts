import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          shop: path.resolve(__dirname, 'shop.html'),
          login: path.resolve(__dirname, 'login.html'),
          cart: path.resolve(__dirname, 'cart.html'),
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
  };
});
