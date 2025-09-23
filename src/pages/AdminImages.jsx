import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  AppBar,
  Toolbar,
  CircularProgress,
  Fab
} from '@mui/material'
import {
  ArrowBack,
  Delete,
  Edit,
  Add,
  Image,
  CloudUpload
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'
import LazyImage from '../components/LazyImage'

const AdminImages = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, image: null })
  const [editDialog, setEditDialog] = useState({ open: false, image: null })
  const [addDialog, setAddDialog] = useState({ open: false })
  const [imageForm, setImageForm] = useState({
    name: '',
    category: '',
    imageData: ''
  })

  const { adminApi } = useAdmin()
  const navigate = useNavigate()

  const categories = ['general', 'meals', 'morning', 'bedtime', 'activities', 'hygiene', 'school']

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await adminApi.get('/predefined-images')
      setImages(response.data.images)
    } catch (err) {
      setError('Failed to load images')
      console.error('Images fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setImageForm(prev => ({
          ...prev,
          imageData: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddImage = () => {
    setImageForm({ name: '', category: '', imageData: '' })
    setAddDialog({ open: true })
  }

  const handleEditImage = (image) => {
    setImageForm({
      name: image.name,
      category: image.category,
      imageData: image.imageData
    })
    setEditDialog({ open: true, image })
  }

  const handleDeleteClick = (image) => {
    setDeleteDialog({ open: true, image })
  }

  const handleDeleteConfirm = async () => {
    try {
      await adminApi.delete(`/predefined-images/${deleteDialog.image.id}`)
      setImages(images.filter(img => img.id !== deleteDialog.image.id))
      setDeleteDialog({ open: false, image: null })
    } catch (err) {
      setError('Failed to delete image')
      console.error('Delete image error:', err)
    }
  }

  const handleSaveImage = async (isEdit = false) => {
    try {
      if (!imageForm.name || !imageForm.category || !imageForm.imageData) {
        setError('All fields are required')
        return
      }

      if (!imageForm.name.trim()) {
        setError('Image name cannot be empty')
        return
      }

      setError('') // Clear any previous errors

      if (isEdit) {
        const response = await adminApi.put(`/predefined-images/${editDialog.image.id}`, imageForm)
        setImages(images.map(img => 
          img.id === editDialog.image.id 
            ? response.data.image
            : img
        ))
        setEditDialog({ open: false, image: null })
      } else {
        const response = await adminApi.post('/predefined-images', imageForm)
        setImages([...images, response.data.image])
        setAddDialog({ open: false })
      }

      setImageForm({ name: '', category: '', imageData: '' })
    } catch (err) {
      console.error('Save image error:', err)
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          'Failed to save image. Please try again.'
      setError(errorMessage)
    }
  }

  const handleDialogClose = () => {
    setDeleteDialog({ open: false, image: null })
    setEditDialog({ open: false, image: null })
    setAddDialog({ open: false })
    setImageForm({ name: '', category: '', imageData: '' })
  }

  const groupedImages = images.reduce((acc, image) => {
    if (!acc[image.category]) acc[image.category] = []
    acc[image.category].push(image)
    return acc
  }, {})

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  const ImageDialog = ({ open, onClose, onSave, title, isEdit }) => (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Image Name"
              value={imageForm.name}
              onChange={(e) => setImageForm(prev => ({ ...prev, name: e.target.value }))}
              margin="normal"
              autoFocus
              key={`name-${open ? 'open' : 'closed'}`}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={imageForm.category}
                onChange={(e) => setImageForm(prev => ({ ...prev, category: e.target.value }))}
                label="Category"
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ mt: 2 }}
            >
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                hidden
              />
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            {imageForm.imageData && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Preview:
                </Typography>
                <img
                  src={imageForm.imageData}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                    borderRadius: 8
                  }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(isEdit)} variant="contained">
          {isEdit ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  )

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
          <Image sx={{ mr: 2 }} />
          <Typography variant="h6" component="div">
            Image Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Typography variant="h4" gutterBottom>
          Predefined Images ({images.length})
        </Typography>

        {Object.entries(groupedImages).map(([category, categoryImages]) => (
          <Paper key={category} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {category.charAt(0).toUpperCase() + category.slice(1)}
              <Chip 
                label={categoryImages.length} 
                size="small" 
                sx={{ ml: 1, bgcolor: 'primary.light', color: 'white' }} 
              />
            </Typography>
            <Grid container spacing={2}>
              {categoryImages.map((image) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                  <Card>
                    <LazyImage
                      src={image.imageData}
                      alt={image.name}
                      style={{
                        width: '100%',
                        height: 120,
                        objectFit: 'contain',
                        backgroundColor: '#f5f5f5'
                      }}
                    />
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography variant="subtitle2" noWrap>
                        {image.name}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditImage(image)}
                          sx={{ color: 'primary.light' }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(image)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        ))}

        {images.length === 0 && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No images found. Add some predefined images to get started.
            </Typography>
          </Paper>
        )}
      </Container>

      <Fab
        onClick={handleAddImage}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          bgcolor: 'primary.light',
          color: 'white',
          '&:hover': {
            bgcolor: 'primary.main'
          }
        }}
      >
        <Add />
      </Fab>

      {/* Add Image Dialog */}
      <ImageDialog
        open={addDialog.open}
        onClose={handleDialogClose}
        onSave={handleSaveImage}
        title="Add Predefined Image"
        isEdit={false}
      />

      {/* Edit Image Dialog */}
      <ImageDialog
        open={editDialog.open}
        onClose={handleDialogClose}
        onSave={handleSaveImage}
        title="Edit Predefined Image"
        isEdit={true}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDialogClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the image <strong>{deleteDialog.image?.name}</strong>?
          </Typography>
          <Typography color="error" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminImages
