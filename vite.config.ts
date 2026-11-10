import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // React is also a dependency of React DOM and React Router. Force Vite to
  // resolve every hook import to the app's single React instance (especially
  // when dependencies were installed through pnpm's symlinked store).
  resolve: { dedupe: ['react', 'react-dom'] },
  server: { host: '0.0.0.0', port: 3000, strictPort: true },
  preview: { host: '0.0.0.0', port: 3000, strictPort: true },
});
