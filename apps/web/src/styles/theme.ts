export const colors = {
    primary: {
        DEFAULT: '#2563eb',
        light: '#3b82f6',
        dark: '#1d4ed8',
    },
    secondary: {
        DEFAULT: '#475569',
        light: '#64748b',
        dark: '#334155',
    },
    background: {
        DEFAULT: '#f8fafc',
        dark: '#1e293b',
    },
    surface: {
        DEFAULT: '#ffffff',
        primary: '#fefefe',
        dark: '#0f172a',
    },
    content: {
        primary: '#1a1a1a',
        secondary: '#4a4a4a',
    },
    tile: {
        fill: 'rgba(255, 107, 53, 0.2)',
        stroke: '#FF6B35',
        highlighted: {
            fill: 'rgba(255, 87, 34, 0.4)',
            stroke: '#FF5722',
        }
    },
    error: '#dc2626',
    success: '#16a34a',
    warning: '#ca8a04',
    info: '#0891b2',
} as const;

export const theme = {
    colors
} as const;

export type Theme = typeof theme;