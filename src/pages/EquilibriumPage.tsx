/**
 * Equilibrium Page — Redirect to standalone app
 * 
 * Equilibrium is built as a standalone Vite + TypeScript app
 * and served as static files from /equilibrium/.
 * 
 * This React route just redirects there.
 */

import { useEffect } from 'react';

const EquilibriumPage = () => {
    useEffect(() => {
        // Redirect to the standalone app served from public/equilibrium/
        window.location.href = '/equilibrium/';
    }, []);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: '#0a0a0f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c9a84c',
            fontFamily: 'serif',
        }}>
            Loading Equilibrium...
        </div>
    );
};

export default EquilibriumPage;
