import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  Dashboard,
  People,
  ChildCare,
  Schedule,
  Image,
  AccountCircle,
  ExitToApp,
  Analytics
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)

  const { admin, logout, adminApi } = useAdmin()
  const navigate = useNavigate()

  useEffect(() => {
    if (!admin) {
      navigate('/admin')
      return
    }
    fetchStats()
  }, [admin, navigate])

  const fetchStats = async () => {
    try {
      const response = await adminApi.get('/stats')
      setStats(response.data.stats)
    } catch (err) {
      setError('Failed to load dashboard statistics')
      console.error('Stats fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/admin')
    handleMenuClose()
  }

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 4 } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box sx={{ color, fontSize: 48 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Dashboard sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {admin?.username}
          </Typography>
          <IconButton
            size="large"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Typography variant="h4" gutterBottom>
          System Overview
        </Typography>

        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Users"
                value={stats.users}
                icon={<People />}
                color="primary.light"
                onClick={() => navigate('/admin/users')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Children"
                value={stats.children}
                icon={<ChildCare />}
                color="primary.light"
                onClick={() => navigate('/admin/children')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Schedules"
                value={stats.schedules}
                icon={<Schedule />}
                color="primary.light"
                onClick={() => navigate('/admin/schedules')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Images"
                value={stats.predefinedImages}
                icon={<Image />}
                color="primary.light"
                onClick={() => navigate('/admin/images')}
              />
            </Grid>
          </Grid>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<People />}
                onClick={() => navigate('/admin/users')}
              >
                Manage Users
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<ChildCare />}
                onClick={() => navigate('/admin/children')}
              >
                Manage Children
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<Schedule />}
                onClick={() => navigate('/admin/schedules')}
              >
                Manage Schedules
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<Image />}
                onClick={() => navigate('/admin/images')}
              >
                Manage Images
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  )
}

export default AdminDashboard
