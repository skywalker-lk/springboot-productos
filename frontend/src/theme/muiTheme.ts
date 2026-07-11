import { createTheme } from '@mui/material/styles';

// Paleta Navy + Lime — inspirada en Game Night Manager
const navy = '#1A2744';
const navyLight = '#2C3E6B';
const lime = '#7BC043';
const limeDark = '#5FA02E';

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: navy,
      light: navyLight,
      dark: '#0F1A2E',
      contrastText: '#ffffff',
    },
    secondary: {
      main: lime,
      light: '#9FD870',
      dark: limeDark,
      contrastText: '#1A2744',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A2744',
      secondary: '#6B7B8D',
    },
    divider: 'rgba(26, 39, 68, 0.08)',
    success: {
      main: lime,
      light: '#9FD870',
      dark: limeDark,
    },
    error: {
      main: '#DC3545',
      light: '#E86A76',
      dark: '#A71D2A',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.3,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
      lineHeight: 1.3,
    },
    button: {
      fontWeight: 500,
      letterSpacing: 0,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollBehavior: 'smooth',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 20px',
          fontWeight: 500,
          fontSize: '0.875rem',
          transition: 'all 0.2s ease',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(26, 39, 68, 0.15)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(123, 192, 67, 0.08)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          borderBottom: '1px solid',
          borderColor: 'rgba(26, 39, 68, 0.08)',
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(26, 39, 68, 0.08)',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(26, 39, 68, 0.06)',
          transition: 'all 0.25s ease',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(26, 39, 68, 0.1)',
            borderColor: 'rgba(123, 192, 67, 0.3)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.75rem',
        },
        outlined: {
          borderWidth: 1.5,
        },
        filled: {
          backgroundColor: 'rgba(123, 192, 67, 0.12)',
          color: limeDark,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: navy,
            backgroundColor: '#F8F9FA',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: 'rgba(26, 39, 68, 0.08)',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
      },
    },
  },
});
