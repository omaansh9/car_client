import { Card, CardContent, Typography, Box } from '@mui/material'
import { useAuth } from '../contexts/AuthContext.jsx'

const ProfilePage = () => {
  const { user } = useAuth()

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Profile
          </Typography>
          {user ? (
            <>
              <Typography variant="subtitle1">Name: {user.name}</Typography>
              <Typography variant="subtitle1">Email: {user.email}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Your profile is saved securely and used for bookings.
              </Typography>
            </>
          ) : (
            <Typography color="text.secondary">No profile information available.</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default ProfilePage
