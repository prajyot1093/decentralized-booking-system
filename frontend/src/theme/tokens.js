// Central design tokens for TicketChain
// These tokens are intentionally framework-agnostic; MUI theme builder will map them.

const tokens = {
  version: 1,
  color: {
    dark: {
      background: {
        gradientStart: '#060b17',
        gradientEnd: '#101b2a',
        surface: '#101b2a',
        surfaceAlt: '#162335'
      },
      text: {
        primary: '#e4ecff',
        secondary: '#8aa2c2',
        inverted: '#0b1220'
      },
      accent: {
        cyan: '#00e5ff',
        pink: '#ff29e6',
        violet: '#8f6eff',
        lime: '#b5ff3b'
      },
      state: {
        success: '#35d49a',
        warning: '#ffb347',
        error: '#ff4d61',
        info: '#42b7ff'
      },
      border: 'rgba(255,255,255,0.10)',
      divider: 'rgba(255,255,255,0.08)',
      overlayGlass: 'rgba(255,255,255,0.06)'
    },
    light: {
      background: {
        gradientStart: '#ffffff',
        gradientEnd: '#f5f8ff',
        surface: '#ffffff',
        surfaceAlt: '#f1f5ff'
      },
      text: {
        primary: '#1d2442',
        secondary: '#54627d',
        inverted: '#ffffff'
      },
      accent: {
        cyan: '#2ab9e6',
        pink: '#ff4fcf',
        violet: '#8f6eff',
        lime: '#98d92e'
      },
      state: {
        success: '#1fa971',
        warning: '#ff9a2f',
        error: '#e2304c',
        info: '#268ad6'
      },
      border: 'rgba(0,0,0,0.12)',
      divider: 'rgba(0,0,0,0.1)',
      overlayGlass: 'rgba(255,255,255,0.65)'
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 32
  },
  radius: {
    sm: 6,
    md: 12,
    lg: 18,
    pill: 999
  },
  shadow: {
    glassDark: '0 8px 32px -6px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
    glassLight: '0 4px 24px -6px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
    focus: '0 0 0 2px rgba(0,229,255,0.65)',
    glowAccent: '0 0 14px -2px rgba(0,229,255,0.55), 0 0 28px -8px rgba(255,41,230,0.45)'
  },
  motion: {
    duration: {
      fast: 120,
      base: 240,
      slow: 400,
      blast: 900
    },
    easing: {
      standard: 'cubic-bezier(.4,0,.2,1)',
      entrance: 'cubic-bezier(.3,.7,.4,1)',
      blast: 'cubic-bezier(.65,.02,.35,1)'
    }
  },
  z: {
    nav: 100,
    drawer: 1200,
    modal: 1300,
    toast: 1400,
    blast: 2000
  }
};

export default tokens;
