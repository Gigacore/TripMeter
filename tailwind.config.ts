/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "Noto Sans", "sans-serif"],
      },
      colors: {
        background: 'var(--bg)',
        panel: 'var(--panel)',
        muted: 'var(--muted)',
        foreground: 'var(--fg)',
        accent: {
          DEFAULT: 'var(--accent)',
          2: 'var(--accent2)',
        }
      },
    },
  },
  plugins: [],
}
