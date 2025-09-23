import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  AppBar,
  Toolbar,
  CircularProgress,
  Fab,
  Avatar
} from '@mui/material'
import {
  ArrowBack,
  Delete,
  Edit,
  Add,
  Person,
  CloudUpload,
  Visibility
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LazyImage from '../components/LazyImage'
import api from '../services/api'
import { convertFileToBase64, isValidImageFile } from '../utils/imageUtils'

const Children = () => {
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingChild, setEditingChild] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    avatarFile: null,
    color: '#1976d2'
  })

  const handleCopyUrl = async (child) => {
    const url = `${window.location.origin}/child/${child.magicToken}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(child.name)
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
      setCopiedUrl(child.name)
      setSnackbarOpen(true)
    }
  }

  useEffect(() => {
    fetchChildren()
  }, [])

  const fetchChildren = async () => {
    try {
      setLoading(true)
      const response = await api.get('/children')
      setChildren(response.data.children || [])
    } catch (err) {
      console.error('Failed to fetch children:', err)
      setError('Failed to load children')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (child = null) => {
    if (child) {
      setEditingChild(child)
      setFormData({
        name: child.name,
        avatar: child.avatar || '',
        avatarType: child.avatarType || null,
        color: child.color || '#1976d2'
      })
    } else {
      setEditingChild(null)
      setFormData({
        name: '',
        avatar: '',
        avatarType: null,
        color: '#1976d2'
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingChild(null)
    setFormData({
      name: '',
      avatar: '',
      color: '#1976d2'
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const submitData = {
        name: formData.name,
        avatar: formData.avatar,
        avatarType: formData.avatarType,
        color: formData.color
      }

      if (editingChild) {
        await api.put(`/children/${editingChild.id}`, submitData)
      } else {
        await api.post('/children', submitData)
      }

      handleCloseDialog()
      fetchChildren()
    } catch (err) {
      console.error('Failed to save child:', err)
      setError('Failed to save child')
    }
  }

  const handleDelete = async (childId) => {
    if (!window.confirm('Are you sure you want to delete this child? This will also delete all their schedules.')) {
      return
    }

    try {
      await api.delete(`/children/${childId}`)
      fetchChildren()
    } catch (err) {
      console.error('Failed to delete child:', err)
      setError('Failed to delete child')
    }
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
          avatar: base64,
          avatarType: 'uploaded'
        })
      } catch (error) {
        console.error('Error converting image:', error)
        setError('Failed to process image')
      }
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
      <Box mb={3}>
        <Box display="flex" alignItems="center" mb={1}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            Children
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ ml: 7 }}>
          Manage your children's profiles and schedules
        </Typography>
        <Box sx={{ ml: 7 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: 'primary.light',
              '&:hover': {
                bgcolor: 'primary.main'
              }
            }}
          >
            Add Child
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {children.map((child) => (
          <Grid item xs={12} sm={6} md={4} key={child.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {child.name}
                    </Typography>
                    <Chip
                      label={`${child._count.schedules} schedules`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(child)}
                      sx={{ color: 'primary.light' }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(child.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                {/* Magic URL Section - More Prominent */}
                <Box sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'primary.light',
                  borderRadius: 1,
                  color: 'primary.contrastText'
                }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <LinkIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Magic Link:
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TextField
                      value={`${window.location.origin}/child/${child.magicToken}`}
                      size="small"
                      fullWidth
                      InputProps={{
                        readOnly: true,
                        sx: {
                          bgcolor: 'rgba(255,255,255,0.1)',
                          color: 'inherit'
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                        },
                        fontSize: '0.7rem'
                      }}
                    />
                    <Tooltip title="Copy magic link">
                      <IconButton
                        size="small"
                        sx={{
                          color: 'inherit',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                        onClick={() => handleCopyUrl(child)}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.8 }}>
                    Share with {child.name} for independent access
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate(`/children/${child.id}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {children.length === 0 && (
        <Box textAlign="center" py={6}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No children added yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Start by adding your first child to create schedules for them
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: 'primary.light',
              '&:hover': {
                bgcolor: 'primary.main'
              }
            }}
          >
            Add Your First Child
          </Button>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingChild ? 'Edit Child' : 'Add New Child'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Avatar Image (optional)"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              margin="normal"
              helperText="Upload an image for this child's avatar"
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            {formData.avatar && (
              <Box sx={{ mt: 1 }}>
                <LazyImage
                  src={formData.avatar}
                  alt="Avatar preview"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #ddd'
                  }}
                />
              </Box>
            )}

            <TextField
              fullWidth
              label="Theme Color (optional)"
              name="color"
              type="color"
              value={formData.color}
              onChange={handleInputChange}
              margin="normal"
              helperText="Choose a color theme for this child's schedules"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingChild ? 'Update' : 'Add'} Child
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Copy URL Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={`Magic link for ${copiedUrl} copied to clipboard!`}
      />
    </Box>
  )
}

export default Children
