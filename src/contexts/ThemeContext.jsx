import React, { createContext, useContext, useState, useEffect } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'

const ThemeContext = createContext()

// Create themes
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
})

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // Light blue
      light: '#1a237e', // Dark blue for backgrounds
      dark: '#42a5f5', // Medium blue
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f48fb1', // Light pink
      light: '#ad1457', // Dark pink
      dark: '#e91e63', // Medium pink
    },
    success: {
      main: '#4caf50', // Medium green
      light: '#1b5e20', // Dark green for backgrounds
      dark: '#66bb6a', // Light green
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ff9800', // Orange
      light: '#e65100', // Dark orange
      dark: '#ffb74d', // Light orange
    },
    error: {
      main: '#f44336', // Red
      light: '#b71c1c', // Dark red
      dark: '#ef5350', // Light red
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1e1e1e', // Slightly lighter for cards
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove any background patterns
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
  },
})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProviderWrapper')
  }
  return context
}

export const ThemeProviderWrapper = ({ children }) => {
  // Default to dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference, default to true (dark)
    const saved = localStorage.getItem('darkMode')
    return saved !== null ? JSON.parse(saved) : true
  })

  // Save to localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const theme = isDarkMode ? darkTheme : lightTheme

  const value = {
    isDarkMode,
    toggleTheme,
    theme,
  }

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}
