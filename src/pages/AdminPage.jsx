import { useEffect, useState } from 'react'
import {
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material'
import {
  getCars,
  addCar,
  updateCar,
  deleteCar,
  getAllBookings,
  registerAdmin,
  loginAdmin,
  setAdminToken
} from '../services/api.js'
import { useNotification } from '../contexts/NotificationContext.jsx'

const AdminPage = () => {
  const [tabIndex, setTabIndex] = useState(0)
  const [cars, setCars] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedCar, setSelectedCar] = useState(null)
  const [bookingFilter, setBookingFilter] = useState('all')
  const [adminToken, setAdminTokenState] = useState(() => window.localStorage.getItem('car-rental-admin-token'))
  const [adminForm, setAdminForm] = useState({ email: '', name: '', password: '' })
  const [carForm, setCarForm] = useState({ name: '', brand: '', model: '', pricePerDay: '', image: '', availability: true })
  const { showNotification } = useNotification()

  useEffect(() => {
    if (adminToken) {
      setAdminToken(adminToken)
    }
    if (tabIndex === 1) {
      loadCars()
    } else if (tabIndex === 2) {
      loadBookings()
    }
  }, [adminToken, tabIndex])

  const loadCars = () => {
    setLoading(true)
    getCars()
      .then(cars => setCars(cars || []))
      .catch(error => {
        console.error(error)
        showNotification('Failed to load cars.', 'error')
      })
      .finally(() => setLoading(false))
  }

  const loadBookings = () => {
    setLoading(true)
    getAllBookings()
      .then(data => {
        const bookingsList = Array.isArray(data) ? data : []
        setBookings(bookingsList)
      })
      .catch(error => {
        console.error(error)
        showNotification('Failed to load bookings.', 'error')
      })
      .finally(() => setLoading(false))
  }

  const handleAdminChange = event => {
    setAdminForm({ ...adminForm, [event.target.name]: event.target.value })
  }

  const handleAdminSubmit = async action => {
    setSubmitting(true)
    try {
      const response = action === 'register' ? await registerAdmin(adminForm) : await loginAdmin(adminForm)
      if (response?.token) {
        window.localStorage.setItem('car-rental-admin-token', response.token)
        setAdminTokenState(response.token)
      }
      showNotification(response?.message || `${action} completed successfully.` )
    } catch (error) {
      console.error(error)
      showNotification(error?.response?.data?.message || `${action} failed.`, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCarChange = event => {
    const value = event.target.name === 'availability' ? event.target.checked : event.target.value
    setCarForm({ ...carForm, [event.target.name]: value })
  }

  const handleCarSubmit = async event => {
    event.preventDefault()
    if (!carForm.name || !carForm.brand || !carForm.model || !carForm.pricePerDay || !carForm.image) {
      showNotification('All car fields are required.', 'warning')
      return
    }
    setSubmitting(true)
    try {
      if (selectedCar) {
        await updateCar(selectedCar._id, {
          ...carForm,
          pricePerDay: Number(carForm.pricePerDay)
        })
        showNotification('Car updated successfully.')
      } else {
        await addCar({
          ...carForm,
          pricePerDay: Number(carForm.pricePerDay)
        })
        showNotification('Car added successfully.')
      }
      setCarForm({ name: '', brand: '', model: '', pricePerDay: '', image: '', availability: true })
      setSelectedCar(null)
      loadCars()
    } catch (error) {
      console.error(error)
      showNotification(error?.response?.data?.message || 'Car save failed.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = car => {
    setSelectedCar(car)
    setCarForm({
      name: car.name || '',
      brand: car.brand || '',
      model: car.model || '',
      pricePerDay: car.pricePerDay || '',
      image: car.image || '',
      availability: car.availability ?? true
    })
  }

  const handleDelete = async carId => {
    setSubmitting(true)
    try {
      await deleteCar(carId)
      showNotification('Car removed successfully.')
      loadCars()
    } catch (error) {
      console.error(error)
      showNotification(error?.response?.data?.message || 'Delete failed.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabIndex} onChange={(_, value) => setTabIndex(value)}>
          <Tab label="Admin login / register" />
          <Tab label="Car management" />
          <Tab label="All bookings" />
        </Tabs>
      </Paper>

      {tabIndex === 0 && (
        <Paper sx={{ p: 3, maxWidth: 640, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Admin credentials
          </Typography>
          <Box component="form" sx={{ display: 'grid', gap: 2 }}>
            <TextField label="Name" name="name" value={adminForm.name} onChange={handleAdminChange} />
            <TextField label="Email" name="email" type="email" value={adminForm.email} onChange={handleAdminChange} />
            <TextField label="Password" name="password" type="password" value={adminForm.password} onChange={handleAdminChange} />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={() => handleAdminSubmit('login')} disabled={submitting}>
                {submitting ? <CircularProgress size={22} /> : 'Admin Login'}
              </Button>
              <Button variant="outlined" onClick={() => handleAdminSubmit('register')} disabled={submitting}>
                {submitting ? 'Working...' : 'Register Admin'}
              </Button>
            </Box>
            {adminToken && <Typography color="success.main">Admin token loaded. You may manage cars now.</Typography>}
          </Box>
        </Paper>
      )}

      {tabIndex === 1 && (
        <Box>
          <Paper sx={{ p: 3, mb: 4, maxWidth: 760 }}>
            <Typography variant="h6" gutterBottom>
              Add or update a car
            </Typography>
            <Box component="form" onSubmit={handleCarSubmit} sx={{ display: 'grid', gap: 2 }}>
              <TextField label="Car Name" name="name" value={carForm.name} onChange={handleCarChange} required />
              <TextField label="Make / Brand" name="brand" value={carForm.brand} onChange={handleCarChange} required />
              <TextField label="Model" name="model" value={carForm.model} onChange={handleCarChange} required />
              <TextField label="Price Per Day" name="pricePerDay" type="number" value={carForm.pricePerDay} onChange={handleCarChange} required />
              <TextField label="Image URL" name="image" value={carForm.image} onChange={handleCarChange} required />
              <FormControlLabel
                control={<Switch checked={carForm.availability} onChange={handleCarChange} name="availability" />}
                label="Available"
              />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button type="submit" variant="contained" disabled={submitting}>
                  {selectedCar ? 'Update Car' : 'Add Car'}
                </Button>
                {selectedCar && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSelectedCar(null)
                      setCarForm({ name: '', brand: '', model: '', pricePerDay: '', image: '', availability: true })
                    }}
                  >
                    Clear Selection
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>

          <Typography variant="h6" gutterBottom>
            Current car inventory
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {cars.map(car => (
                <Grid item xs={12} md={6} key={car._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {car.brand} {car.model}
                      </Typography>
                      <Typography>{car.name}</Typography>
                      <Typography>${car.pricePerDay}/day</Typography>
                      <Typography color={car.availability ? 'success.main' : 'text.secondary'}>
                        {car.availability ? 'Available' : 'Unavailable'}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => handleEdit(car)}>
                        Edit
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(car._id)} disabled={submitting}>
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {tabIndex === 2 && (
        <Box>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              All Bookings
            </Typography>
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {['all', 'active', 'completed', 'cancelled'].map(status => (
                <Button
                  key={status}
                  variant={bookingFilter === status ? 'contained' : 'outlined'}
                  onClick={() => setBookingFilter(status)}
                  size="small"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : bookings.length === 0 ? (
              <Typography color="text.secondary">No bookings found.</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Car</strong></TableCell>
                      <TableCell><strong>User Email</strong></TableCell>
                      <TableCell><strong>Start Date</strong></TableCell>
                      <TableCell><strong>End Date</strong></TableCell>
                      <TableCell><strong>Total Price</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookings
                      .filter(booking => bookingFilter === 'all' || booking.status === bookingFilter)
                      .map(booking => (
                        <TableRow key={booking._id}>
                          <TableCell>
                            {booking.carId?.brand} {booking.carId?.model}
                          </TableCell>
                          <TableCell>{booking.userId?.email || 'Unknown'}</TableCell>
                          <TableCell>
                            {new Date(booking.startDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(booking.endDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>${booking.totalPrice}</TableCell>
                          <TableCell>
                            <Chip
                              label={booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                              color={
                                booking.status === 'active'
                                  ? 'primary'
                                  : booking.status === 'completed'
                                    ? 'success'
                                    : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  )
}

export default AdminPage
