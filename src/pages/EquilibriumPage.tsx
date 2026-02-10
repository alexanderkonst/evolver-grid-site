/**
 * Equilibrium Page — Full-screen iframe wrapper
 * 
 * Equilibrium is a standalone Vite + TypeScript app.
 * In dev, it runs on :5173. In production, it's served from /equilibrium/.
 * This page embeds it full-screen, no chrome, no navbar.
 */

const EquilibriumPage = () => {
    // In dev, point to the standalone dev server; in production, serve from same origin
    const src = import.meta.env.DEV
        ? 'http://localhost:5173/'
        : '/equilibrium/index.html';

    return (
        <iframe
            src={src}
            title="Equilibrium — Living Clock"
            style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                border: 'none',
                background: '#0a0a0f',
            }}
        />
    );
};

export default EquilibriumPage;
