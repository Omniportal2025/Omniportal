import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Check if we're building for the custom domain
var isCustomDomain = process.env.BUILD_MODE === 'CUSTOM_DOMAIN';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // Use root path for custom domain, subpath for GitHub Pages
    base: isCustomDomain ? '/' : '/Omniportal/',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    },
    server: {
        port: 3000,
        open: true,
    },
});
