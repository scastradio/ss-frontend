import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Chip,
  AppBar,
  Toolbar,
  CircularProgress
} from '@mui/material'
import {
  ArrowBack,
  Delete,
  Schedule,
  Task,
  CheckCircle,
  RadioButtonUnchecked
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'

const AdminSchedules = () => {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, schedule: null })

  const { adminApi } = useAdmin()
  const navigate = useNavigate()

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const response = await adminApi.get('/schedules')
      setSchedules(response.data.schedules)
    } catch (err) {
      setError('Failed to load schedules')
      console.error('Schedules fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (schedule) => {
    setDeleteDialog({ open: true, schedule })
  }

  const handleDeleteConfirm = async () => {
    try {
      await adminApi.delete(`/schedules/${deleteDialog.schedule.id}`)
      setSchedules(schedules.filter(s => s.id !== deleteDialog.schedule.id))
      setDeleteDialog({ open: false, schedule: null })
    } catch (err) {
      setError('Failed to delete schedule')
      console.error('Delete schedule error:', err)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, schedule: null })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getCompletionStats = (tasks) => {
    const completed = tasks.filter(task => task.isCompleted).length
    const total = tasks.length
    return { completed, total, percentage: total > 0 ? (completed / total * 100).toFixed(0) : 0 }
  }

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
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/admin/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Schedule sx={{ mr: 2 }} />
          <Typography variant="h6" component="div">
            Schedule Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Typography variant="h4" gutterBottom>
          Schedules ({schedules.length})
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Child</TableCell>
                <TableCell>Parent</TableCell>
                <TableCell>Tasks</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.map((schedule) => {
                const stats = getCompletionStats(schedule.tasks)
                return (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{schedule.title}</Typography>
                      {schedule.description && (
                        <Typography variant="caption" color="text.secondary">
                          {schedule.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{schedule.child.name}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{schedule.child.parent.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {schedule.child.parent.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<Task />}
                        label={schedule._count.tasks}
                        size="small"
                        sx={{ bgcolor: 'primary.light', color: 'white' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {stats.completed}/{stats.total}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${stats.percentage}%`}
                          color={stats.percentage == 100 ? 'success' : 'default'}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={schedule.isActive ? <CheckCircle /> : <RadioButtonUnchecked />}
                        label={schedule.isActive ? 'Active' : 'Inactive'}
                        color={schedule.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(schedule.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(schedule)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {schedules.length === 0 && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
            <Typography color="text.secondary">
              No schedules found
            </Typography>
          </Paper>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete schedule <strong>{deleteDialog.schedule?.title}</strong>?
          </Typography>
          <Typography color="error" sx={{ mt: 1 }}>
            This will also delete all tasks in this schedule. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminSchedules
