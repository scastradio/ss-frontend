import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AdminContext = createContext()

// Admin API instance
const adminApi = axios.create({
  baseURL: '/api/admin',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add admin token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle admin auth errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      window.location.href = '/admin'
    }
    return Promise.reject(error)
  }
)

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const adminUser = localStorage.getItem('adminUser')
    
    if (token && adminUser) {
      try {
        setAdmin(JSON.parse(adminUser))
      } catch (error) {
        console.error('Error parsing admin user:', error)
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await adminApi.post('/login', { username, password })
      const { token, admin: adminUser } = response.data
      
      localStorage.setItem('adminToken', token)
      localStorage.setItem('adminUser', JSON.stringify(adminUser))
      setAdmin(adminUser)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setAdmin(null)
  }

  const value = {
    admin,
    loading,
    login,
    logout,
    adminApi
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}
