import React, { useState } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  Alert,
  Container,
  Checkbox,
  FormControlLabel
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [tab, setTab] = useState(0) // 0 for login, 1 for register
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    subscribeEmails: true // Default to checked
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let result
      if (tab === 0) {
        // Login
        result = await login(formData.email, formData.password)
      } else {
        // Register
        result = await register(formData.email, formData.password, formData.name, formData.subscribeEmails)
      }

      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Visual Schedule
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
            Create visual schedules for your children
          </Typography>

          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            centered
            sx={{ mb: 3 }}
          >
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {tab === 1 && (
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            )}

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              margin="normal"
              required
              helperText={tab === 1 ? "Password must be at least 6 characters" : ""}
            />

            {tab === 1 && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.subscribeEmails}
                    onChange={handleInputChange}
                    name="subscribeEmails"
                    color="primary"
                  />
                }
                label="Receive emails from our site. We will never sell your information."
                sx={{ mt: 1 }}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Loading...' : tab === 0 ? 'Login' : 'Sign Up'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" color="text.secondary">
            {tab === 0 ? (
              <>
                Don't have an account?{' '}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    color: 'primary.light',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                  onClick={() => setTab(1)}
                >
                  Sign Up
                </Typography>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    color: 'primary.light',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                  onClick={() => setTab(0)}
                >
                  Login
                </Typography>
              </>
            )}
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}

export default Login
