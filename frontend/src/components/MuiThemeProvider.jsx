import React, { useEffect, useMemo, useState } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const getMode = () => {
  const stored = localStorage.getItem('theme');
  return stored === 'dark' ? 'dark' : 'light';
};

const MuiThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(getMode);

  useEffect(() => {
    const onThemeChange = () => setMode(getMode());
    window.addEventListener('themechange', onThemeChange);
    window.addEventListener('storage', onThemeChange);
    return () => {
      window.removeEventListener('themechange', onThemeChange);
      window.removeEventListener('storage', onThemeChange);
    };
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#2563eb' }
        },
        shape: { borderRadius: 12 }
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default MuiThemeProvider;

