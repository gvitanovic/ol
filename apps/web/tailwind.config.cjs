/** @type {import('tailwindcss').Config} */
const colors = require('./src/styles/theme.ts').colors;

module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors
        },
    },
    plugins: [],
}