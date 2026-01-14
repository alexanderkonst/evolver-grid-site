/**
 * Wabi-sabi Gradient Presets
 * Soft-focus, serene color combinations
 */

export const WABI_GRADIENTS = {
    // Core backgrounds
    pearl: 'from-[#e7e9e5] via-[#dcdde2] to-[#e7e9e5]',
    lavender: 'from-[#a4a3d0] via-[#c8b7d8] to-[#a4a3d0]',

    // Hero sections - warm
    sunrise: 'from-[#cea4ae] via-[#cdaed2] to-[#c8b7d8]',
    blush: 'from-[#cba8ad] via-[#d0b8d0] to-[#c2b9e1]',

    // Hero sections - cool
    serenity: 'from-[#a7cbd4] via-[#e7e9e5] to-[#a4a3d0]',
    ocean: 'from-[#1e4374] via-[#29549f] to-[#6894d0]',

    // Strip gradients (full spectrum)
    cosmic: 'from-[#8460ea] via-[#a4a3d0] via-[#a7cbd4] via-[#cec9b0] to-[#cea4ae]',
    deep: 'from-[#1e4374] via-[#29549f] via-[#6894d0] via-[#e7e9e5] to-[#c8b7d8]',

    // Cards & UI
    subtle: 'from-[#e7e9e5]/50 to-[#a4a3d0]/10',
    glass: 'from-white/80 to-white/60',

    // Buttons
    primary: 'from-[#8460ea] to-[#29549f]',
    primaryHover: 'from-[#7350da] to-[#1e4374]',
} as const;

export const WABI_COLORS = {
    // Core pastels
    lavender: '#a4a3d0',
    lilac: '#c8b7d8',
    blush: '#cea4ae',
    orchid: '#cdaed2',
    aqua: '#a7cbd4',
    sage: '#b1c9b6',
    champagne: '#cec9b0',
    pearl: '#e7e9e5',

    // Depth accents
    royal: '#29549f',
    cornflower: '#6894d0',
    navy: '#1e4374',
    charcoal: '#2c3150',
    violet: '#8460ea',
} as const;

export type WabiGradient = keyof typeof WABI_GRADIENTS;
export type WabiColor = keyof typeof WABI_COLORS;
