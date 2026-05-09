import { Typography, Box } from '@mui/material'

const NotFoundPage = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <Typography variant="h3" gutterBottom>
        404
      </Typography>
      <Typography variant="h6">Page not found.</Typography>
    </Box>
  )
}

export default NotFoundPage
