import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginAdmin, registerAdmin, setAdminToken } from '../services/api.js'
import { useAuth } from './AuthContext.jsx'

const AdminContext = createContext(null)

export const AdminProvider = ({ children }) => {
  const { user, token } = useAuth()
  const [admin, setAdmin] = useState(() => {
    const storedAdmin = window.localStorage.getItem('car-rental-admin')
    return storedAdmin ? JSON.parse(storedAdmin) : null
  })
  const [adminToken, setAdminTokenState] = useState(() => window.localStorage.getItem('car-rental-admin-token'))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (adminToken) {
      setAdminToken(adminToken)
    }
  }, [])

  useEffect(() => {
    if (user?.role === 'admin' && token) {
      const adminData = {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
      setAdmin(adminData)
      setAdminTokenState(token)
      setAdminToken(token)
      window.localStorage.setItem('car-rental-admin-token', token)
      window.localStorage.setItem('car-rental-admin', JSON.stringify(adminData))
    }
  }, [user, token])

  const saveAdminAuth = (tokenValue, adminData) => {
    setAdminTokenState(tokenValue)
    setAdmin(adminData)
    setAdminToken(tokenValue)
    window.localStorage.setItem('car-rental-admin-token', tokenValue)
    window.localStorage.setItem('car-rental-admin', JSON.stringify(adminData))
  }

  const logoutAdmin = () => {
    setAdminTokenState(null)
    setAdmin(null)
    setAdminToken(null)
    window.localStorage.removeItem('car-rental-admin-token')
    window.localStorage.removeItem('car-rental-admin')
  }

  const login = async credentials => {
    setLoading(true)
    try {
      const response = await loginAdmin(credentials)
      if (response?.token && response?.admin) {
        saveAdminAuth(response.token, response.admin)
      }
      return response
    } finally {
      setLoading(false)
    }
  }

  const register = async credentials => {
    setLoading(true)
    try {
      const response = await registerAdmin(credentials)
      if (response?.token && response?.admin) {
        saveAdminAuth(response.token, response.admin)
      }
      return response
    } finally {
      setLoading(false)
    }
  }

  const value = useMemo(
    () => ({ admin, adminToken, login, register, logoutAdmin, loading }),
    [admin, adminToken, loading]
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}
