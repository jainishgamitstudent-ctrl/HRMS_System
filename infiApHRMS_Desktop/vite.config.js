import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: '0.0.0.0', // Bind to all network interfaces
    middlewareMode: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Rewrite cookies to remove domain restriction so browser stores them for localhost:5173
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies && Array.isArray(cookies)) {
              const rewrittenCookies = cookies.map(cookie => {
                // Remove Domain attribute and ensure Path is /
                return cookie
                  .replace(/;\s*Domain=[^;]+/gi, '')
                  .replace(/;\s*Path=[^;]+/gi, '; Path=/');
              });
              proxyRes.headers['set-cookie'] = rewrittenCookies;
            }
          });
        },
      },
      '/uploads': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
})
