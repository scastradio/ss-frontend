import React, { useState, useEffect } from 'react'
import { Tooltip, 
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material'
import { Tooltip,  Add, Person, Schedule } from '@mui/icons-material'
import { Tooltip,  useNavigate } from 'react-router-dom'
import { Tooltip,  useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const Dashboard = () => {
  const [children, setChildren] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [childrenRes, schedulesRes] = await Promise.all([
        api.get('/children'),
        api.get('/schedules')
      ])

      setChildren(childrenRes.data.children || [])
      setSchedules(schedulesRes.data.schedules || [])
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddChild = () => {
    navigate('/children')
  }

  const handleViewChild = (childId) => {
    navigate(`/children/${childId}`)
  }

  const handleViewSchedule = (scheduleId) => {
    navigate(`/schedules/${scheduleId}`)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user?.name}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your children's schedules and track their progress
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={logout}
          size="small"
        >
          Logout
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Children Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="h2">
                  Children
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={handleAddChild}
                  size="small"
                >
                  Add Child
                </Button>
                <Tooltip title="Quick actions available here">
                  <IconButton size="small" sx={{ color: 'primary.light' }}>
                    <HelpOutline fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {children.length === 0 ? (
                <Box textAlign="center" py={3}>
                  <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No children added yet. Start by adding your first child!
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/children')}
                    startIcon={<Add />}
                  >
                    Add Child
                  </Button>
                </Box>
              ) : (
                <Box>
                  {children.slice(0, 3).map((child) => (
                    <Box
                      key={child.id}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1}
                      onClick={() => handleViewChild(child.id)}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, px: 1 }}
                    >
                      <Box display="flex" alignItems="center">
                        <Person sx={{ mr: 2 }} />
                        <Typography variant="body1">{child.name}</Typography>
                      </Box>
                      <Chip
                        label={`${child._count.schedules} schedules`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  ))}
                  {children.length > 3 && (
                    <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
                      And {children.length - 3} more...
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Schedules */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Recent Schedules
              </Typography>

              {schedules.length === 0 ? (
                <Box textAlign="center" py={3}>
                  <Schedule sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No schedules created yet. Create your first schedule!
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {schedules.slice(0, 3).map((schedule) => (
                    <Box
                      key={schedule.id}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1}
                      onClick={() => handleViewSchedule(schedule.id)}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, px: 1 }}
                    >
                      <Box>
                        <Typography variant="body1">{schedule.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {schedule.child.name}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${schedule.tasks.length} tasks`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  ))}
                  {schedules.length > 3 && (
                    <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
                      And {schedules.length - 3} more...
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
