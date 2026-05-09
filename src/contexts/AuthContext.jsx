import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginUser, registerUser, fetchProfile, setAuthToken } from '../services/api.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = window.localStorage.getItem('car-rental-user')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const [token, setToken] = useState(() => window.localStorage.getItem('car-rental-token'))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) {
      setAuthToken(token)
      fetchProfile()
        .then(response => {
          if (response?.success && response.data) {
            setUser(response.data)
            window.localStorage.setItem('car-rental-user', JSON.stringify(response.data))
          }
        })
        .catch(() => {
          logout()
        })
    }
  }, [])

  const saveAuth = (tokenValue, userData) => {
    setToken(tokenValue)
    setUser(userData)
    setAuthToken(tokenValue)
    window.localStorage.setItem('car-rental-token', tokenValue)
    window.localStorage.setItem('car-rental-user', JSON.stringify(userData))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setAuthToken(null)
    window.localStorage.removeItem('car-rental-token')
    window.localStorage.removeItem('car-rental-user')
  }

  const login = async credentials => {
    setLoading(true)
    try {
      const response = await loginUser(credentials)
      if (response?.token && response?.user) {
        saveAuth(response.token, response.user)
      }
      return response
    } finally {
      setLoading(false)
    }
  }

  const register = async credentials => {
    setLoading(true)
    try {
      const response = await registerUser(credentials)
      if (response?.token && response?.user) {
        saveAuth(response.token, response.user)
      }
      return response
    } finally {
      setLoading(false)
    }
  }

  const value = useMemo(
    () => ({ user, token, login, register, logout, loading }),
    [user, token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
