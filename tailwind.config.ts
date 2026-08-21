import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#21164a',
        panel: '#f4efff',
        line: '#d9ccff',
        player: '#1677ff',
        focus: '#ff3ea5',
        hazard: '#ff4f64',
        arcade: {
          violet: '#7838e7',
          cyan: '#05c8ff',
          pink: '#ff3ea5',
          lime: '#a3e635',
          yellow: '#ffd23f',
          orange: '#ff8c42',
          sky: '#e2f8ff',
          glow: '#fff4bf',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
