import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar
} from '@mui/material'
import {
  ArrowBack,
  CheckCircle,
  RadioButtonUnchecked,
  ThumbUp,
  Refresh
} from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LazyImage from '../components/LazyImage'
import api from '../services/api'

const ChildView = () => {
  const { token } = useParams()
  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchChildData()
  }, [token])

  const fetchChildData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/children/magic/${token}`)
      setChild(response.data.child)
    } catch (err) {
      console.error('Failed to fetch child data:', err)
      setError('Unable to load schedule. Please check with your parent.')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskUpdate = async (taskId, childMarkedDone) => {
    try {
      await axios.put(`/api/children/magic/${token}/tasks/${taskId}`, {
        childMarkedDone
      })
      // Refresh child data to show updated task status
      fetchChildData()
    } catch (err) {
      console.error('Failed to update task:', err)
      setError('Failed to update task status')
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !child) {
    return (
      <Container maxWidth="md">
        <Box mt={4}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Schedule not found'}
          </Alert>
          <Typography variant="body1" color="text.secondary">
            Please ask your parent to check the magic link.
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Box>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {child.name}'s Schedule
          </Typography>
          {child.avatar && (
            <Box sx={{ ml: 2 }}>
              <LazyImage
                src={child.avatar}
                alt={child.name}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Welcome, {child.name}!
        </Typography>

        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Tap the circle next to each task to mark it as completed!
        </Typography>

        {/* Progress Summary */}
        <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom align="center">
            📊 Your Progress
          </Typography>
          <Box display="flex" justifyContent="space-around" flexWrap="wrap" gap={2}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                {child.schedules.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Schedules
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                {child.schedules.reduce((total, schedule) =>
                  total + schedule.tasks.filter(task => task.isCompleted).length, 0
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tasks Done
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                {child.schedules.reduce((total, schedule) =>
                  total + schedule.tasks.filter(task => !task.isCompleted).length, 0
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tasks Left
              </Typography>
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {child.schedules.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No schedules yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ask your parent to create some schedules for you!
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {child.schedules.map((schedule) => (
              <Grid item xs={12} key={schedule.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box flexGrow={1}>
                        <Typography variant="h5" component="h2" gutterBottom>
                          {schedule.title}
                        </Typography>
                        {schedule.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {schedule.description}
                          </Typography>
                        )}
                        {/* Schedule Progress */}
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {schedule.tasks.filter(task => task.isCompleted).length} / {schedule.tasks.length} tasks completed
                          </Typography>
                          <Box sx={{
                            width: '100%',
                            height: 6,
                            bgcolor: 'grey.300',
                            borderRadius: 3,
                            overflow: 'hidden'
                          }}>
                            <Box sx={{
                              width: `${schedule.tasks.length > 0 ? (schedule.tasks.filter(task => task.isCompleted).length / schedule.tasks.length) * 100 : 0}%`,
                              height: '100%',
                              bgcolor: 'success.main',
                              transition: 'width 0.3s ease'
                            }} />
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {schedule.tasks.filter(task => !task.isCompleted).length === 0 ? (
                      schedule.tasks.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No tasks in this schedule yet
                        </Typography>
                      ) : (
                        <Box textAlign="center" py={2}>
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                            🎉 All tasks completed!
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Great job! All tasks in this schedule are done.
                          </Typography>
                        </Box>
                      )
                    ) : (
                      <Grid container spacing={2}>
                        {schedule.tasks
                          .filter(task => !task.isCompleted) // Only show incomplete tasks
                          .map((task, index) => (
                          <Grid item xs={12} sm={6} md={4} key={task.id}>
                            <Card
                              sx={{
                                backgroundColor: task.childMarkedDone ? 'success.light' : 'background.paper',
                                opacity: task.childMarkedDone ? 0.9 : 1,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: 3,
                                },
                                minHeight: 280,
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                              onClick={() => handleTaskUpdate(task.id, !task.childMarkedDone)}
                            >
                              <CardContent sx={{ flexGrow: 1, p: 2, textAlign: 'center' }}>
                                {/* Large Image at Top */}
                                {task.image ? (
                                  <Box sx={{ mb: 2 }}>
                                    <LazyImage
                                      src={task.image}
                                      alt={task.title}
                                      style={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: 8,
                                        objectFit: 'cover',
                                        border: '2px solid',
                                        borderColor: task.childMarkedDone ? '#4caf50' : '#e0e0e0',
                                        filter: task.childMarkedDone ? 'grayscale(0.3) brightness(0.9)' : 'none',
                                      }}
                                    />
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      width: 120,
                                      height: 120,
                                      borderRadius: 8,
                                      bgcolor: 'grey.200',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      mb: 2,
                                      mx: 'auto',
                                      border: '2px solid',
                                      borderColor: task.childMarkedDone ? '#4caf50' : '#e0e0e0',
                                    }}
                                  >
                                    <Typography variant="h6" color="text.secondary">
                                      {index + 1}
                                    </Typography>
                                  </Box>
                                )}

                                {/* Large Checkbox/Icon */}
                                <Box sx={{ mb: 2 }}>
                                  <IconButton
                                    size="large"
                                    sx={{
                                      fontSize: '3rem',
                                      color: task.childMarkedDone ? 'success.main' : 'primary.light',
                                    }}
                                  >
                                    {task.childMarkedDone ? <CheckCircle fontSize="inherit" /> : <RadioButtonUnchecked fontSize="inherit" />}
                                  </IconButton>
                                </Box>

                                {/* Task Title - Small and centered */}
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    textDecoration: task.childMarkedDone ? 'line-through' : 'none',
                                    color: task.childMarkedDone ? 'text.secondary' : 'text.primary',
                                    mb: 1,
                                  }}
                                >
                                  {task.title}
                                </Typography>

                                {/* Description - Very small */}
                                {task.description && (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: '0.8rem',
                                      color: 'text.secondary',
                                      opacity: 0.8,
                                    }}
                                  >
                                    {task.description}
                                  </Typography>
                                )}

                                {/* Completion Status */}
                                {task.childMarkedDone && (
                                  <Box sx={{ mt: 1 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontSize: '0.9rem',
                                        color: 'success.main',
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      ✓ Completed!
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box textAlign="center" sx={{ mt: 6, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Made with ❤️ for {child.name}
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default ChildView
