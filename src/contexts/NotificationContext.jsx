import { createContext, useContext, useMemo, useState } from 'react'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity })
  }

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }))
  }

  const value = useMemo(
    () => ({ notification, showNotification, closeNotification }),
    [notification]
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}
