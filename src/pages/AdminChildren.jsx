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
  CircularProgress,
  Avatar
} from '@mui/material'
import {
  ArrowBack,
  Delete,
  ChildCare,
  Schedule
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'

const AdminChildren = () => {
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, child: null })

  const { adminApi } = useAdmin()
  const navigate = useNavigate()

  useEffect(() => {
    fetchChildren()
  }, [])

  const fetchChildren = async () => {
    try {
      const response = await adminApi.get('/children')
      setChildren(response.data.children)
    } catch (err) {
      setError('Failed to load children')
      console.error('Children fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (child) => {
    setDeleteDialog({ open: true, child })
  }

  const handleDeleteConfirm = async () => {
    try {
      await adminApi.delete(`/children/${deleteDialog.child.id}`)
      setChildren(children.filter(c => c.id !== deleteDialog.child.id))
      setDeleteDialog({ open: false, child: null })
    } catch (err) {
      setError('Failed to delete child')
      console.error('Delete child error:', err)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, child: null })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
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
          <ChildCare sx={{ mr: 2 }} />
          <Typography variant="h6" component="div">
            Children Management
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
          Children ({children.length})
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Avatar</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Parent</TableCell>
                <TableCell>Magic Token</TableCell>
                <TableCell>Schedules</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {children.map((child) => (
                <TableRow key={child.id}>
                  <TableCell>
                    {child.avatar ? (
                      <Avatar
                        src={child.avatar}
                        alt={child.name}
                        sx={{ width: 40, height: 40 }}
                      />
                    ) : (
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {child.name.charAt(0)}
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{child.name}</Typography>
                    {child.color && (
                      <Chip
                        size="small"
                        label="Themed"
                        sx={{ 
                          mt: 0.5,
                          bgcolor: child.color,
                          color: 'white'
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{child.parent.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {child.parent.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {child.magicToken.substring(0, 8)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<Schedule />}
                      label={child._count.schedules}
                      size="small"
                      sx={{ bgcolor: 'primary.light', color: 'white' }}
                    />
                  </TableCell>
                  <TableCell>{formatDate(child.createdAt)}</TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(child)}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {children.length === 0 && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
            <Typography color="text.secondary">
              No children found
            </Typography>
          </Paper>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete child <strong>{deleteDialog.child?.name}</strong>?
          </Typography>
          <Typography color="error" sx={{ mt: 1 }}>
            This will also delete all their schedules. This action cannot be undone.
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

export default AdminChildren
