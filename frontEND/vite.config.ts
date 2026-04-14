import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = env.VITE_API_BASE_URL || 'http://localhost:8001';

  // Nisbi VITE_API_BASE_URL (məs. /api/v1) — dev-də sorğular Vite proxy ilə backend-ə gedir
  const proxy: Record<
    string,
    { target: string; changeOrigin: boolean; rewrite: (path: string) => string }
  > = {};
  if (mode === 'development' && apiBase.startsWith('/')) {
    const target = env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:8001';
    proxy[apiBase] = {
      target,
      changeOrigin: true,
      rewrite: (path) => {
        const stripped = path.slice(apiBase.length);
        return stripped || '/';
      },
    };
  }

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy,
    },
  };
});
