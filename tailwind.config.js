/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Ink & paper palette — a notebook, not a dashboard.
        paper: '#F6F1E4',      // warm off-white page
        'paper-dark': '#EDE4CE',
        ink: '#2B2A28',        // near-black, slightly warm
        'ink-soft': '#5B564C',
        margin: '#B23A2E',     // margin-note red for accents/links
        moss: '#4B5D45',       // secondary accent — pressed-leaf green
        gold: '#B8873A',       // gilt accent for highlights/borders
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Newsreader"', 'Georgia', 'serif'],
        hand: ['"Caveat"', 'cursive'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'paper-grain': "radial-gradient(circle at 1px 1px, rgba(43,42,40,0.05) 1px, transparent 0)",
      },
      backgroundSize: {
        grain: '18px 18px',
      },
    },
  },
  plugins: [],
};
