import { defineConfig } from 'vite';

export default defineConfig({
    // Production: served from /equilibrium/ path on main domain
    base: '/equilibrium/',
    build: {
        // Output directly into main app's public folder
        // Vercel serves public/* as static files
        outDir: '../public/equilibrium',
        emptyOutDir: true,
    },
});
