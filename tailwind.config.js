export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-main)',
        surface: 'var(--bg-surface)',
        'surface-light': 'var(--bg-surface-light)',
        border: 'var(--border-main)',
        'border-light': 'var(--border-light)',
        main: 'var(--text-main)',
        heading: 'var(--text-heading)',
        muted: 'var(--text-muted)',
        brand: 'var(--brand-primary)',
        'brand-secondary': 'var(--brand-secondary)',
        critical: 'var(--status-critical)',
        bg_critical: 'var(--status-critical)',
        warning: 'var(--status-warning)',
        bg_warning: 'var(--status-warning)',
        success: 'var(--status-success)',
        bg_success: 'var(--status-success)',
        dim: 'var(--status-dim)',
      }
    },
  },
  plugins: [],
}

