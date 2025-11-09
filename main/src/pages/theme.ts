import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0D47A1', // Deep, trustworthy blue
    },
    secondary: {
      main: '#00A78B', // Vibrant, compassionate teal
    },
    background: {
      default: '#f8f9fa', // Clean, light gray
      paper: '#ffffff',
    },
    text: {
      primary: '#212529',
      secondary: '#495057',
    },
  },
  typography: {
    fontFamily: "'Cabin', sans-serif",
    h1: { fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700 },
    h2: { fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700 },
    h5: { fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700 },
    h6: { fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          boxShadow: 'none',
          transition: 'all 0.3s ease-in-out',
        },
        containedPrimary: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(13, 71, 161, 0.25)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  },
});