import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import tokens from './tokens';

// Factory converting our design tokens + runtime mode + network colors into a MUI theme.
export function buildTheme({ mode = 'dark', network = {} } = {}) {
  const paletteToken = tokens.color[mode];
  const primaryMain = network.primary || (mode === 'dark' ? '#2962ff' : '#2962ff');
  const secondaryMain = network.secondary || (mode === 'dark' ? '#ff29e6' : '#ff4fcf');

  let theme = createTheme({
    palette: {
      mode,
      primary: { main: primaryMain },
      secondary: { main: secondaryMain },
      background: {
        default: paletteToken.background.gradientStart,
        paper: paletteToken.background.surface
      },
      text: {
        primary: paletteToken.text.primary,
        secondary: paletteToken.text.secondary
      },
      success: { main: paletteToken.state.success },
      warning: { main: paletteToken.state.warning },
      error: { main: paletteToken.state.error },
      info: { main: paletteToken.state.info }
    },
    shape: { borderRadius: tokens.radius.md },
    spacing: (factor) => {
      const map = { 0:0,1:4,2:8,3:12,4:16,5:20,6:24,7:28,8:32 };
      return map[factor] ?? factor * 8;
    },
    typography: {
      fontFamily: 'Inter, Roboto, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      body1: { lineHeight: 1.55 },
      button: { fontWeight: 600, textTransform: 'none' }
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backdropFilter: 'blur(10px)',
            backgroundColor: mode === 'dark' ? 'rgba(16,27,42,0.85)' : 'rgba(255,255,255,0.85)',
            border: `1px solid ${paletteToken.border}`,
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.lg,
            transition: 'transform .5s cubic-bezier(.19,1,.22,1), box-shadow .5s',
            '&:hover': {
              transform: 'translateY(-6px)',
              boxShadow: tokens.shadow.glowAccent
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: { fontWeight: 600 }
        }
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backdropFilter: 'blur(6px)',
            background: mode === 'dark' ? 'rgba(30,40,55,0.85)' : 'rgba(255,255,255,0.85)',
            border: `1px solid ${paletteToken.divider}`
          }
        }
      }
    }
  });

  theme = responsiveFontSizes(theme);
  return theme;
}
