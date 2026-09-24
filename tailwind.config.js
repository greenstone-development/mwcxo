/** Tailwind build config for mattwalshcxo.com.
 *  Theme values are the ones that used to be inlined in each page's <head>
 *  for the Play CDN. Rebuild css/tailwind.css with `npm run build:css`
 *  whenever classes change in the HTML pages or in js/. */
module.exports = {
  content: ['./*.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        background: '#ffffff', foreground: '#0f172a',
        card: '#f8fafc', 'card-foreground': '#0f172a',
        popover: '#ffffff', 'popover-foreground': '#0f172a',
        primary: '#004b46', 'primary-foreground': '#ffffff',
        secondary: '#f1f5f9', 'secondary-foreground': '#0f172a',
        muted: '#f1f5f9', 'muted-foreground': '#64748b',
        accent: '#e2e8f0', 'accent-foreground': '#0f172a',
        destructive: '#ef4444', 'destructive-foreground': '#ffffff',
        border: '#e2e8f0', input: 'transparent', 'input-background': '#f1f5f9', ring: '#94a3b8'
      },
      fontFamily: { sans: ['Inter', 'sans-serif'], display: ['"Plus Jakarta Sans"', 'sans-serif'] },
      borderRadius: { sm: 'calc(0.75rem - 4px)', md: 'calc(0.75rem - 2px)', lg: '0.75rem', xl: 'calc(0.75rem + 4px)' }
    }
  }
};
