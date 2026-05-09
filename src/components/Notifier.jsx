import { Alert, Snackbar } from '@mui/material'
import { useNotification } from '../contexts/NotificationContext.jsx'

const Notifier = () => {
  const { notification, closeNotification } = useNotification()

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={3000}
      onClose={closeNotification}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={closeNotification} severity={notification.severity} sx={{ width: '100%' }}>
        {notification.message}
      </Alert>
    </Snackbar>
  )
}

export default Notifier
