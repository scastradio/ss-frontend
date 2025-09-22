import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Container, Box, IconButton, Tooltip } from '@mui/material'
import { Brightness4, Brightness7 } from '@mui/icons-material'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Children from './pages/Children'
import ChildDetail from './pages/ChildDetail'
import ScheduleDetail from './pages/ScheduleDetail'
import ChildView from './pages/ChildView'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminChildren from './pages/AdminChildren'
import AdminSchedules from './pages/AdminSchedules'
import AdminImages from './pages/AdminImages'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AdminProvider } from './contexts/AdminContext'
import { ThemeProviderWrapper, useTheme } from './contexts/ThemeContext'

function AppRoutes() {
  const { user } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Theme Toggle Button - Fixed Position */}
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
          <IconButton
            onClick={toggleTheme}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: 3,
              },
            }}
          >
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Tooltip>
      </Box>

      <Routes>
        {/* Regular App Routes */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/children" element={user ? <Children /> : <Navigate to="/login" replace />} />
        <Route path="/children/:id" element={user ? <ChildDetail /> : <Navigate to="/login" replace />} />
        <Route path="/schedules/:id" element={user ? <ScheduleDetail /> : <Navigate to="/login" replace />} />
        <Route path="/child/:token" element={<ChildView />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/children" element={<AdminChildren />} />
        <Route path="/admin/schedules" element={<AdminSchedules />} />
        <Route path="/admin/images" element={<AdminImages />} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Box>
  )
}

function App() {
  return (
    <ThemeProviderWrapper>
      <AuthProvider>
        <AdminProvider>
          <Container maxWidth="lg" sx={{ py: 2 }}>
            <AppRoutes />
          </Container>
        </AdminProvider>
      </AuthProvider>
    </ThemeProviderWrapper>
  )
}

export default App
