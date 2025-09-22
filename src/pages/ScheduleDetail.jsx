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
  Checkbox,
  FormControlLabel,
  Divider,
  ImageList,
  ImageListItem,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  ArrowBack,
  CheckCircle,
  RadioButtonUnchecked,
  ThumbUp,
  Refresh,
  Print
} from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { convertFileToBase64, isValidImageFile } from '../utils/imageUtils'

const ScheduleDetail = () => {
  const { id } = useParams()
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [predefinedImages, setPredefinedImages] = useState([])
  const [selectedPredefinedImage, setSelectedPredefinedImage] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    imageFile: null
  })
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    image: '',
    imageFile: null
  })

  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    fetchSchedule()
    fetchPredefinedImages()
  }, [id])

  useEffect(() => {
    // Fetch predefined images when user becomes authenticated
    if (user && predefinedImages.length === 0) {
      fetchPredefinedImages()
    }
  }, [user])

  const fetchPredefinedImages = async () => {
    try {
      console.log('🔍 Fetching predefined images...')
      const response = await api.get('/test/images')
      console.log('✅ Predefined images loaded:', response.data.images.length)
      setPredefinedImages(response.data.images)
    } catch (err) {
      console.error('❌ Failed to fetch predefined images:', err)
      // Don't set error state for predefined images - it's not critical
      setPredefinedImages([]) // Set empty array so UI doesn't break
    }
  }

  const handlePredefinedImageSelect = (image) => {
    setSelectedPredefinedImage(image)
    setFormData({
      ...formData,
      image: image.imageData,
      imageType: 'predefined'
    })
  }

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/schedules/${id}`)
      setSchedule(response.data.schedule)
    } catch (err) {
      console.error('Failed to fetch schedule:', err)
      setError('Failed to load schedule details')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      imageFile: null,
      imageType: ''
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setFormData({
      title: '',
      description: '',
      image: '',
      imageFile: null,
      imageType: ''
    })
    setSelectedPredefinedImage(null)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!isValidImageFile(file)) {
        setError('Please select a valid image file')
        return
      }

      try {
        const base64 = await convertFileToBase64(file)
        setFormData({
          ...formData,
          image: base64,
          imageType: 'uploaded'
        })
      } catch (error) {
        console.error('Error converting image:', error)
        setError('Failed to process image')
      }
    }
  }

  const handleOpenEditDialog = (task) => {
    setEditingTask(task)
    setEditFormData({
      title: task.title,
      description: task.description || '',
      image: task.image || '',
      imageType: task.imageType || null
    })
    setEditDialogOpen(true)
  }

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false)
    setEditingTask(null)
    setEditFormData({
      title: '',
      description: '',
      image: '',
      imageType: null
    })
  }

  const handleEditInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    })
  }

  const handleEditFileChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!isValidImageFile(file)) {
        setError('Please select a valid image file')
        return
      }

      try {
        const base64 = await convertFileToBase64(file)
        setEditFormData({
          ...editFormData,
          image: base64,
          imageType: 'uploaded'
        })
      } catch (error) {
        console.error('Error converting image:', error)
        setError('Failed to process image')
      }
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()

    try {
      await api.put(`/schedules/${id}/tasks/${editingTask.id}`, {
        title: editFormData.title,
        description: editFormData.description,
        image: editFormData.image,
        imageType: editFormData.imageType
      })

      handleCloseEditDialog()
      fetchSchedule() // Refresh schedule data
    } catch (err) {
      console.error('Failed to update task:', err)
      setError('Failed to update task')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await api.post(`/schedules/${id}/tasks`, {
        title: formData.title,
        description: formData.description,
        image: formData.image,
        imageType: formData.imageType,
        order: schedule.tasks.length
      })

      handleCloseDialog()
      fetchSchedule() // Refresh schedule data
    } catch (err) {
      console.error('Failed to create task:', err)
      setError('Failed to create task')
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      await api.put(`/schedules/${id}/tasks/${taskId}`, updates)
      fetchSchedule() // Refresh schedule data
    } catch (err) {
      console.error('Failed to update task:', err)
      setError('Failed to update task')
    }
  }

  const handleTaskComplete = (task) => {
    const newCompleted = !task.isCompleted;
    const updates = {
      isCompleted: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : null,
      // When marking task as completed, also mark child and parent as done
      childMarkedDone: newCompleted,
      childMarkedAt: newCompleted ? new Date().toISOString() : null,
      parentConfirmed: newCompleted,
      parentConfirmedAt: newCompleted ? new Date().toISOString() : null
    }
    handleTaskUpdate(task.id, updates)
  }

  const handleChildMarkDone = (task) => {
    const newChildDone = !task.childMarkedDone;
    const updates = {
      childMarkedDone: newChildDone,
      childMarkedAt: newChildDone ? new Date().toISOString() : null,
      // If child marks as done and parent already confirmed, mark task as completed
      isCompleted: newChildDone && task.parentConfirmed,
      completedAt: (newChildDone && task.parentConfirmed) ? new Date().toISOString() : null
    }
    handleTaskUpdate(task.id, updates)
  }

  const handleParentConfirm = (task) => {
    const newParentConfirmed = !task.parentConfirmed;
    const updates = {
      parentConfirmed: newParentConfirmed,
      parentConfirmedAt: newParentConfirmed ? new Date().toISOString() : null,
      // If parent confirms and child already marked as done, mark task as completed
      isCompleted: newParentConfirmed && task.childMarkedDone,
      completedAt: (newParentConfirmed && task.childMarkedDone) ? new Date().toISOString() : null
    }
    handleTaskUpdate(task.id, updates)
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      await api.delete(`/schedules/${id}/tasks/${taskId}`)
      fetchSchedule() // Refresh schedule data
    } catch (err) {
      console.error('Failed to delete task:', err)
      setError('Failed to delete task')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset this schedule? All task progress will be cleared.')) {
      return
    }

    try {
      await api.put(`/schedules/${id}/reset`)
      fetchSchedule() // Refresh schedule data
    } catch (err) {
      console.error('Failed to reset schedule:', err)
      setError('Failed to reset schedule')
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (!schedule) {
    return (
      <Box>
        <Alert severity="error">Schedule not found</Alert>
        <Button onClick={() => navigate('/children')} sx={{ mt: 2 }}>
          Back to Children
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* Print Styles */}
      <style>
        {`
          @media print {
            body {
              font-family: Arial, sans-serif;
              line-height: 1.4;
              color: #000;
              background: #fff !important;
            }
            
            .MuiPaper-root {
              box-shadow: none !important;
              background: #fff !important;
            }
            
            .MuiButton-root {
              display: none !important;
            }
            
            .MuiIconButton-root {
              display: none !important;
            }
            
            .MuiTabs-root {
              display: none !important;
            }
            
            .MuiAlert-root {
              display: none !important;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #000;
            }
            
            .print-task {
              display: flex;
              align-items: center;
              margin-bottom: 15px;
              padding: 10px;
              border: 1px solid #ccc;
              border-radius: 5px;
              page-break-inside: avoid;
            }
            
            .print-task-number {
              font-size: 18px;
              font-weight: bold;
              margin-right: 15px;
              min-width: 30px;
            }
            
            .print-task-content {
              flex: 1;
            }
            
            .print-task-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .print-task-description {
              font-size: 14px;
              color: #666;
              margin-bottom: 8px;
            }
            
            .print-task-image {
              width: 60px;
              height: 60px;
              object-fit: cover;
              border-radius: 4px;
              margin-left: 15px;
            }
            
            .print-footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ccc;
              padding-top: 20px;
            }
            
            @page {
              margin: 0.5in;
              size: A4;
            }
          }
        `}
      </style>

      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(`/children/${schedule.child.id}`)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h4" component="h1" gutterBottom>
            {schedule.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {schedule.child.name}'s Schedule
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
            sx={{
              '@media print': {
                display: 'none'
              }
            }}
          >
            Print Schedule
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<Refresh />}
            onClick={handleReset}
          >
            Reset Schedule
          </Button>
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
            Add Task
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {schedule.description && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {schedule.description}
        </Alert>
      )}

      {/* Print Header - Hidden on screen, visible when printing */}
      <Box className="print-header" sx={{ display: 'none', '@media print': { display: 'block' } }}>
        <Typography variant="h3" component="h1" sx={{ mb: 1 }}>
          {schedule.title}
        </Typography>
        <Typography variant="h5" sx={{ color: '#666' }}>
          {schedule.child.name}'s Daily Schedule
        </Typography>
        {schedule.description && (
          <Typography variant="body1" sx={{ mt: 2, fontStyle: 'italic' }}>
            {schedule.description}
          </Typography>
        )}
      </Box>

      <Grid container spacing={2}>
        {schedule.tasks.map((task, index) => (
          <Grid item xs={12} key={task.id}>
            {/* Screen view - normal cards */}
            <Card
              sx={{
                display: { xs: 'block', '@media print': { display: 'none' } },
                backgroundColor: task.isCompleted ? 'success.light' : 'background.paper',
                opacity: task.isCompleted ? 0.9 : 1,
                color: task.isCompleted ? 'success.contrastText' : 'text.primary'
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Typography variant="h6" component="span" sx={{ mr: 2 }}>
                    {index + 1}.
                  </Typography>

                  {task.image && (
                    <Box sx={{ mr: 2 }}>
                      <img
                        src={task.image}
                        alt={task.title}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 4,
                          objectFit: 'cover'
                        }}
                      />
                    </Box>
                  )}

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={task.isCompleted}
                        onChange={() => handleTaskComplete(task)}
                        icon={<RadioButtonUnchecked />}
                        checkedIcon={<CheckCircle />}
                      />
                    }
                    label={
                      <Typography
                        variant="h6"
                        sx={{
                          textDecoration: task.isCompleted ? 'line-through' : 'none'
                        }}
                      >
                        {task.title}
                      </Typography>
                    }
                  />

                  <Box ml="auto" display="flex" gap={1}>
                    {/* Child can mark as done */}
                    <IconButton
                      size="small"
                      color={task.childMarkedDone ? 'success' : 'default'}
                      onClick={() => handleChildMarkDone(task)}
                      title="Child marks as done"
                    >
                      <ThumbUp />
                    </IconButton>

                    {/* Parent confirmation */}
                    <IconButton
                      size="small"
                      color={task.parentConfirmed ? 'primary' : 'default'}
                      onClick={() => handleParentConfirm(task)}
                      title="Parent confirms completion"
                    >
                      <CheckCircle />
                    </IconButton>

                    <IconButton size="small" onClick={() => handleOpenEditDialog(task)} sx={{ color: 'primary.light' }}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteTask(task.id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                {task.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    {task.description}
                  </Typography>
                )}

                <Box display="flex" gap={1} mt={1} ml={4}>
                  {task.childMarkedDone && (
                    <Chip
                      label="Child completed"
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                  {task.parentConfirmed && (
                    <Chip
                      label="Parent confirmed"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                  {task.completedAt && (
                    <Chip
                      label={`Completed: ${new Date(task.completedAt).toLocaleTimeString()}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Print view - clean layout */}
            <Box
              className="print-task"
              sx={{
                display: 'none',
                '@media print': { display: 'flex' }
              }}
            >
              <Box className="print-task-number">
                {index + 1}.
              </Box>
              <Box className="print-task-content">
                <Box className="print-task-title">
                  {task.title}
                </Box>
                {task.description && (
                  <Box className="print-task-description">
                    {task.description}
                  </Box>
                )}
              </Box>
              {task.image && (
                <img
                  src={task.image}
                  alt={task.title}
                  className="print-task-image"
                />
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Print Footer - Hidden on screen, visible when printing */}
      <Box className="print-footer" sx={{ display: 'none', '@media print': { display: 'block' } }}>
        <Typography>
          Printed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </Typography>
        <Typography sx={{ mt: 1 }}>
          {schedule.child.name}'s Daily Schedule - {schedule.title}
        </Typography>
      </Box>

      {schedule.tasks.length === 0 && (
        <Box textAlign="center" py={6}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tasks in this schedule yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Add tasks for {schedule.child.name} to complete
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
            Add First Task
          </Button>
        </Box>
      )}

      {/* Print empty state - Hidden on screen, visible when printing */}
      {schedule.tasks.length === 0 && (
        <Box sx={{ display: 'none', '@media print': { display: 'block', textAlign: 'center', mt: 4 } }}>
          <Typography variant="h5" sx={{ color: '#666' }}>
            No tasks have been added to this schedule yet.
          </Typography>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Task</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Task Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              margin="normal"
              required
              placeholder="e.g., Brush teeth, Make bed, Eat breakfast"
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
              placeholder="Additional details about this task..."
            />

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Task Image (optional)
            </Typography>

            <TextField
              fullWidth
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              margin="normal"
              helperText="Upload an image for this task"
              InputLabelProps={{
                shrink: true,
              }}
            />

            {formData.image && (
              <Box sx={{ mt: 1 }}>
                <img
                  src={formData.image}
                  alt="Task image preview"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 4,
                    objectFit: 'cover'
                  }}
                />
              </Box>
            )}

            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => setFormData({...formData, image: '', imageFile: null, imageType: ''})}
            >
              Remove Image
            </Button>

            {/* Predefined Images Section */}
            {predefinedImages.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  Or Choose from Predefined Images
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                  <Grid container spacing={1}>
                    {predefinedImages.map((image) => (
                      <Grid item xs={4} sm={3} key={image.id}>
                        <Box
                          sx={{
                            cursor: 'pointer',
                            border: selectedPredefinedImage?.id === image.id ? 2 : 1,
                            borderColor: selectedPredefinedImage?.id === image.id ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            p: 1,
                            textAlign: 'center',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: 'primary.light',
                            },
                          }}
                          onClick={() => handlePredefinedImageSelect(image)}
                        >
                          <img
                            src={image.imageData}
                            alt={image.name}
                            style={{
                              width: '100%',
                              height: 40,
                              objectFit: 'contain',
                              borderRadius: 4,
                            }}
                          />
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
                            {image.name}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Add Task
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <Box component="form" onSubmit={handleEditSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Task Title"
              name="title"
              value={editFormData.title}
              onChange={handleEditInputChange}
              margin="normal"
              required
              placeholder="e.g., Brush teeth, Make bed, Eat breakfast"
            />
            <TextField
              fullWidth
              label="Description (optional)"
              name="description"
              value={editFormData.description}
              onChange={handleEditInputChange}
              margin="normal"
              multiline
              rows={3}
              placeholder="Additional details about this task..."
            />

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Task Image (optional)
            </Typography>

            <TextField
              fullWidth
              type="file"
              accept="image/*"
              onChange={handleEditFileChange}
              margin="normal"
              helperText="Upload an image for this task"
              InputLabelProps={{
                shrink: true,
              }}
            />

            {editFormData.image && (
              <Box sx={{ mt: 1 }}>
                <img
                  src={editFormData.image}
                  alt="Task image preview"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 4,
                    objectFit: 'cover'
                  }}
                />
              </Box>
            )}

            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => setEditFormData({...editFormData, image: '', imageFile: null})}
            >
              Remove Image
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Update Task
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}

export default ScheduleDetail
