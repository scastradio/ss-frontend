import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Tooltip,
  Snackbar
} from '@mui/material'
import { Add, Edit, Delete, ArrowBack, Schedule, ContentCopy, Link as LinkIcon, DeleteForever } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

const ChildDetail = () => {
  const { id } = useParams()
  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })

  const navigate = useNavigate()

  useEffect(() => {
    fetchChild()
  }, [id])

  const fetchChild = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/children/${id}`)
      setChild(response.data.child)
    } catch (err) {
      console.error('Failed to fetch child:', err)
      setError('Failed to load child details')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = () => {
    setFormData({
      title: '',
      description: ''
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setFormData({
      title: '',
      description: ''
    })
  }

  const handleOpenRenameDialog = (schedule) => {
    setSelectedSchedule(schedule)
    setFormData({
      title: schedule.title,
      description: schedule.description || ''
    })
    setRenameDialogOpen(true)
  }

  const handleCloseRenameDialog = () => {
    setRenameDialogOpen(false)
    setSelectedSchedule(null)
    setFormData({
      title: '',
      description: ''
    })
  }

  const handleRenameSubmit = async (e) => {
    e.preventDefault()

    try {
      await api.put(`/schedules/${selectedSchedule.id}`, {
        title: formData.title,
        description: formData.description
      })

      handleCloseRenameDialog()
      fetchChild() // Refresh child data
    } catch (err) {
      console.error('Failed to rename schedule:', err)
      setError('Failed to rename schedule')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await api.post('/schedules', {
        title: formData.title,
        description: formData.description,
        childId: id
      })

      handleCloseDialog()
      fetchChild() // Refresh child data to get updated schedules
    } catch (err) {
      console.error('Failed to create schedule:', err)
      setError('Failed to create schedule')
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleDeleteChild = async () => {
    if (!window.confirm(`Are you sure you want to delete ${child.name}? This will permanently delete all schedules and tasks for this child.`)) {
      return
    }

    try {
      await api.delete(`/children/${id}`)
      navigate('/children') // Navigate back to children list
    } catch (err) {
      console.error('Failed to delete child:', err)
      setError('Failed to delete child')
    }
  }

  const handleCopyUrl = async () => {
    const url = `${window.location.origin}/child/${child.magicToken}`
    try {
      await navigator.clipboard.writeText(url)
      setSnackbarOpen(true)
    } catch (err) {
      console.error('Failed to copy URL:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setSnackbarOpen(true)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (!child) {
    return (
      <Box>
        <Alert severity="error">Child not found</Alert>
        <Button onClick={() => navigate('/children')} sx={{ mt: 2 }}>
          Back to Children
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/children')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h4" component="h1" gutterBottom>
            {child.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage schedules and tasks for {child.name}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
            sx={{
              bgcolor: 'primary.light',
              '&:hover': {
                bgcolor: 'primary.main'
              }
            }}
          >
            New Schedule
          </Button>
          <Tooltip title={`Delete ${child.name}`}>
            <IconButton
              color="error"
              onClick={handleDeleteChild}
              sx={{
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'error.dark'
                }
              }}
            >
              <DeleteForever />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Magic URL Section - Always Visible */}
      <Paper elevation={2} sx={{
        p: 3,
        mb: 3,
        bgcolor: 'primary.light',
        color: 'primary.contrastText'
      }}>
        <Box display="flex" alignItems="center" mb={2}>
          <LinkIcon sx={{ mr: 2, fontSize: 28 }} />
          <Typography variant="h5" component="h2">
            Magic Link for {child.name}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
          Share this link with {child.name} so they can access their schedules independently on any device!
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            value={`${window.location.origin}/child/${child.magicToken}`}
            fullWidth
            size="small"
            InputProps={{
              readOnly: true,
              sx: { bgcolor: 'rgba(255,255,255,0.1)', color: 'inherit' }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
              }
            }}
          />
          <Tooltip title="Copy magic link">
            <IconButton
              onClick={handleCopyUrl}
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'inherit',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              <ContentCopy />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {child.schedules.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No schedules yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first schedule for {child.name}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
            sx={{
              bgcolor: 'primary.light',
              '&:hover': {
                bgcolor: 'primary.main'
              }
            }}
          >
            Create First Schedule
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {child.schedules.map((schedule) => (
            <Grid item xs={12} md={6} key={schedule.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box flexGrow={1}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {schedule.title}
                      </Typography>
                      {schedule.description && (
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          {schedule.description}
                        </Typography>
                      )}
                      <Chip
                        label={`${schedule.tasks.length} tasks`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={schedule.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={schedule.isActive ? 'success' : 'default'}
                      />
                    </Box>
                    <Box>
                      <Tooltip title="Rename schedule">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setRenameSchedule(schedule)
                            setNewScheduleName(schedule.title)
                            handleOpenRenameDialog(schedule)
                          }}
                          sx={{ color: 'primary.light' }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/schedules/${schedule.id}`)}
                      >
                        <Schedule />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate(`/schedules/${schedule.id}`)}
                  >
                    View Schedule
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Schedule</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Schedule Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              margin="normal"
              required
              placeholder="e.g., Morning Routine, Bedtime Routine"
            />
            <TextField
              fullWidth
              label="Description (optional)"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
              placeholder="Describe what this schedule is for..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create Schedule
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Rename Schedule Dialog */}
      <Dialog open={renameDialogOpen} onClose={handleCloseRenameDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Rename Schedule</DialogTitle>
        <Box component="form" onSubmit={handleRenameSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Schedule Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              margin="normal"
              required
              placeholder="e.g., Morning Routine, Bedtime Routine"
            />
            <TextField
              fullWidth
              label="Description (optional)"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
              placeholder="Describe what this schedule is for..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRenameDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Rename Schedule
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Copy URL Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Magic link copied to clipboard!"
      />
    </Box>
  )
}

export default ChildDetail
