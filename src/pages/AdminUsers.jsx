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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  AppBar,
  Toolbar,
  CircularProgress
} from '@mui/material'
import {
  ArrowBack,
  Delete,
  People,
  ChildCare
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null })

  const { adminApi } = useAdmin()
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await adminApi.get('/users')
      setUsers(response.data.users)
    } catch (err) {
      setError('Failed to load users')
      console.error('Users fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (user) => {
    setDeleteDialog({ open: true, user })
  }

  const handleDeleteConfirm = async () => {
    try {
      await adminApi.delete(`/users/${deleteDialog.user.id}`)
      setUsers(users.filter(u => u.id !== deleteDialog.user.id))
      setDeleteDialog({ open: false, user: null })
    } catch (err) {
      setError('Failed to delete user')
      console.error('Delete user error:', err)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, user: null })
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
          <People sx={{ mr: 2 }} />
          <Typography variant="h6" component="div">
            User Management
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
          Users ({users.length})
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Children</TableCell>
                <TableCell>Email Subscriptions</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<ChildCare />}
                      label={user._count.children}
                      size="small"
                      sx={{ bgcolor: 'primary.light', color: 'white' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.subscribeEmails ? 'Yes' : 'No'}
                      color={user.subscribeEmails ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(user)}
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

        {users.length === 0 && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
            <Typography color="text.secondary">
              No users found
            </Typography>
          </Paper>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user <strong>{deleteDialog.user?.name}</strong>?
          </Typography>
          <Typography color="error" sx={{ mt: 1 }}>
            This will also delete all their children and schedules. This action cannot be undone.
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

export default AdminUsers
