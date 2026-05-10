import { useEffect, useMemo, useState } from 'react'
import {
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
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
  Chip,
  Stack
} from '@mui/material'
import {
  addCar,
  deleteCar,
  deleteUser,
  getAllBookings,
  getAllUsers,
  getCars,
  setAdminToken,
  updateCar,
  updateUser
} from '../services/api.js'
import { useAdmin } from '../contexts/AdminContext.jsx'
import { useNotification } from '../contexts/NotificationContext.jsx'

const emptyCarForm = {
  name: '',
  brand: '',
  model: '',
  pricePerDay: '',
  image: '',
  images: '',
  availability: true,
  fuelType: '',
  transmission: '',
  seats: '',
  rating: '',
  reviews: '',
  year: '',
  location: '',
  mileage: '',
  engine: '',
  features: '',
  insurance: '',
  cancellation: '',
  description: ''
}

const emptyUserForm = {
  name: '',
  email: '',
  phone: ''
}

const formatCurrency = amount => `₹${Number(amount || 0).toLocaleString('en-IN')}`

const splitList = value => String(value || '')
  .split('\n')
  .map(item => item.trim())
  .filter(Boolean)

const joinList = value => Array.isArray(value) ? value.join('\n') : ''

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2
  }
}

const panelSx = {
  p: 3,
  borderRadius: 3,
  border: '1px solid rgba(148, 163, 184, 0.22)',
  boxShadow: '0 24px 70px rgba(15, 23, 42, 0.16)'
}

const formatDate = value => (value ? new Date(value).toLocaleDateString() : 'Not available')

const statusLabel = value => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'

const paymentColor = status => status === 'paid' ? 'success' : status === 'pending' ? 'warning' : 'error'

const bookingColor = status => status === 'active' ? 'primary' : status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'error'

const getEffectiveBookingStatus = booking =>
  booking.paymentStatus === 'paid' && booking.status === 'pending' ? 'active' : booking.status

const AdminPage = () => {
  const { admin, adminToken, login, register, logoutAdmin, loading: adminLoading } = useAdmin()
  const { showNotification } = useNotification()
  const [tabIndex, setTabIndex] = useState(0)
  const [bookings, setBookings] = useState([])
  const [cars, setCars] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bookingFilter, setBookingFilter] = useState('all')
  const [selectedCar, setSelectedCar] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [adminForm, setAdminForm] = useState({ email: '', name: '', password: '' })
  const [carForm, setCarForm] = useState(emptyCarForm)
  const [userForm, setUserForm] = useState(emptyUserForm)

  const loadBookings = () => {
    setLoading(true)
    getAllBookings()
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(error => {
        console.error(error)
        showNotification(error?.response?.data?.message || 'Failed to load bookings.', 'error')
      })
      .finally(() => setLoading(false))
  }

  const loadCars = () => {
    setLoading(true)
    getCars()
      .then(data => setCars(Array.isArray(data) ? data : []))
      .catch(error => {
        console.error(error)
        showNotification('Failed to load cars.', 'error')
      })
      .finally(() => setLoading(false))
  }

  const loadUsers = () => {
    setLoading(true)
    getAllUsers()
      .then(data => setUsers(Array.isArray(data?.data) ? data.data : []))
      .catch(error => {
        console.error(error)
        showNotification(error?.response?.data?.message || 'Failed to load users.', 'error')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!adminToken) return
    setAdminToken(adminToken)
  }, [adminToken])

  useEffect(() => {
    if (!admin || !adminToken) return

    if (tabIndex === 0 || tabIndex === 1) {
      loadBookings()
    } else if (tabIndex === 2) {
      loadCars()
    } else if (tabIndex === 3) {
      loadUsers()
    }
  }, [admin, adminToken, tabIndex])

  useEffect(() => {
    if (admin) {
      setTabIndex(0)
    }
  }, [admin])

  const filteredBookings = useMemo(
    () => bookings.filter(booking => bookingFilter === 'all' || getEffectiveBookingStatus(booking) === bookingFilter),
    [bookings, bookingFilter]
  )

  const transactions = useMemo(
    () => bookings.map(booking => ({
      id: booking.stripePaymentIntentId || booking._id,
      bookingId: booking._id,
      chargeId: booking.stripeChargeId || 'Not available',
      customer: booking.userId?.email || booking.userId?.name || 'Unknown',
      car: `${booking.carId?.brand || ''} ${booking.carId?.model || booking.carId?.name || ''}`.trim() || 'Unknown',
      amount: booking.totalPrice,
      paymentStatus: booking.paymentStatus || 'pending',
      bookingStatus: getEffectiveBookingStatus(booking),
      paidAt: booking.paidAt || booking.invoiceEmailSentAt || booking.createdAt
    })),
    [bookings]
  )

  const totals = useMemo(() => {
    const paidTransactions = transactions.filter(transaction => transaction.paymentStatus === 'paid')
    return {
      bookings: bookings.length,
      active: bookings.filter(booking => getEffectiveBookingStatus(booking) === 'active').length,
      paid: paidTransactions.length,
      revenue: paidTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
    }
  }, [bookings, transactions])

  const handleAdminSubmit = async action => {
    setSubmitting(true)
    try {
      const payload = action === 'login'
        ? { email: adminForm.email, password: adminForm.password }
        : adminForm
      const response = action === 'register' ? await register(payload) : await login(payload)
      showNotification(response?.message || `${action} completed successfully.`)
      setAdminForm({ email: '', name: '', password: '' })
      setTabIndex(0)
    } catch (error) {
      console.error(error)
      showNotification(error?.response?.data?.message || `${action} failed.`, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCarChange = event => {
    const { name, value, checked } = event.target
    const nextValue = name === 'availability'
      ? checked
      : ['pricePerDay', 'seats', 'year', 'rating', 'reviews'].includes(name)
        ? value ? Number(value) : ''
        : value
    setCarForm(previous => ({ ...previous, [name]: nextValue }))
  }

  const handleCarSubmit = async event => {
    event.preventDefault()
    if (!carForm.name || !carForm.brand || !carForm.model || !carForm.pricePerDay || !carForm.image) {
      showNotification('Name, brand, model, price, and image are required.', 'warning')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...carForm,
        images: splitList(carForm.images).length ? splitList(carForm.images) : [carForm.image],
        features: splitList(carForm.features),
        pricePerDay: Number(carForm.pricePerDay),
        seats: carForm.seats ? Number(carForm.seats) : undefined,
        year: carForm.year ? Number(carForm.year) : undefined,
        rating: carForm.rating !== '' ? Number(carForm.rating) : undefined,
        reviews: carForm.reviews !== '' ? Number(carForm.reviews) : undefined
      }

      if (selectedCar) {
        await updateCar(selectedCar._id, payload)
        showNotification('Car updated successfully.')
      } else {
        await addCar(payload)
        showNotification('Car added successfully.')
      }

      setSelectedCar(null)
      setCarForm(emptyCarForm)
      loadCars()
    } catch (error) {
      console.error(error)
      showNotification(error?.response?.data?.message || 'Car save failed.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditCar = car => {
    setSelectedCar(car)
    setCarForm({
      name: car.name || '',
      brand: car.brand || '',
      model: car.model || '',
      pricePerDay: car.pricePerDay || '',
      image: car.image || '',
      images: joinList(car.images?.length ? car.images : car.image ? [car.image] : []),
      availability: car.availability ?? true,
      fuelType: car.fuelType || '',
      transmission: car.transmission || '',
      seats: car.seats || '',
      rating: car.rating || '',
      reviews: car.reviews || '',
      year: car.year || '',
      location: car.location || '',
      mileage: car.mileage || '',
      engine: car.engine || '',
      features: joinList(car.features),
      insurance: car.insurance || '',
      cancellation: car.cancellation || '',
      description: car.description || ''
    })
  }

  const handleDeleteCar = async carId => {
    if (!window.confirm('Delete this car from inventory?')) return
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

  const handleUserSubmit = async event => {
    event.preventDefault()
    if (!selectedUser) {
      showNotification('Select a user to edit first.', 'warning')
      return
    }

    setSubmitting(true)
    try {
      await updateUser(selectedUser._id, userForm)
      showNotification('User updated successfully.')
      setSelectedUser(null)
      setUserForm(emptyUserForm)
      loadUsers()
    } catch (error) {
      console.error(error)
      showNotification(error?.response?.data?.message || 'User update failed.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditUser = user => {
    setSelectedUser(user)
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    })
  }

  const handleDeleteUser = async userId => {
    if (!window.confirm('Delete this user?')) return
    setSubmitting(true)
    try {
      await deleteUser(userId)
      showNotification('User removed successfully.')
      loadUsers()
    } catch (error) {
      console.error(error)
      showNotification(error?.response?.data?.message || 'Delete failed.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!admin) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 720 }}>
        <Typography variant="h4" sx={{ mb: 3, color: 'white' }}>
          Admin Login
        </Typography>
        <Paper sx={panelSx}>
          <Typography variant="h6" gutterBottom>
            Admin credentials
          </Typography>
          <Box component="form" sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Name"
              value={adminForm.name}
              onChange={event => setAdminForm(previous => ({ ...previous, name: event.target.value }))}
              disabled={adminLoading || submitting}
            />
            <TextField
              label="Email"
              type="email"
              value={adminForm.email}
              onChange={event => setAdminForm(previous => ({ ...previous, email: event.target.value }))}
              disabled={adminLoading || submitting}
            />
            <TextField
              label="Password"
              type="password"
              value={adminForm.password}
              onChange={event => setAdminForm(previous => ({ ...previous, password: event.target.value }))}
              disabled={adminLoading || submitting}
            />
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button variant="contained" onClick={() => handleAdminSubmit('login')} disabled={submitting || adminLoading}>
                {submitting || adminLoading ? <CircularProgress size={22} /> : 'Admin Login'}
              </Button>
              <Button variant="outlined" onClick={() => handleAdminSubmit('register')} disabled={submitting || adminLoading}>
                Register Admin
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, color: 'white' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Admin Dashboard
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
            Bookings, payments, cars, and users from backend endpoints.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => (tabIndex === 2 ? loadCars() : tabIndex === 3 ? loadUsers() : loadBookings())}>
            Refresh
          </Button>
          <Button variant="outlined" color="error" onClick={logoutAdmin}>
            Logout Admin
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          ['Total bookings', totals.bookings],
          ['Active bookings', totals.active],
          ['Paid transactions', totals.paid],
          ['Revenue', formatCurrency(totals.revenue)]
        ].map(([label, value]) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Paper sx={{ p: 2.4, borderRadius: 3, bgcolor: '#111827', color: 'white', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 18px 42px rgba(0,0,0,0.22)' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.68)' }}>{label}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tabIndex} onChange={(_, value) => setTabIndex(value)} variant="scrollable" scrollButtons="auto">
          <Tab label="Bookings" />
          <Tab label="Payments" />
          <Tab label="Cars" />
          <Tab label="Users" />
        </Tabs>
      </Paper>

      {tabIndex === 0 && (
        <Paper sx={panelSx}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
            <Typography variant="h6">All car bookings with payment details</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {['all', 'pending', 'active', 'completed', 'cancelled'].map(status => (
                <Button
                  key={status}
                  variant={bookingFilter === status ? 'contained' : 'outlined'}
                  onClick={() => setBookingFilter(status)}
                  size="small"
                >
                  {statusLabel(status)}
                </Button>
              ))}
            </Stack>
          </Stack>
          {loading ? <CircularProgress /> : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Booking</TableCell>
                    <TableCell>Car</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment Intent</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookings.map(booking => (
                    <TableRow key={booking._id}>
                      <TableCell sx={{ maxWidth: 120, wordBreak: 'break-all' }}>{booking._id}</TableCell>
                      <TableCell>{booking.carId?.brand} {booking.carId?.model}</TableCell>
                      <TableCell>{booking.userId?.email || booking.userId?.name || 'Unknown'}</TableCell>
                      <TableCell>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</TableCell>
                      <TableCell>{formatCurrency(booking.totalPrice)}</TableCell>
                      <TableCell><Chip label={statusLabel(booking.paymentStatus)} color={paymentColor(booking.paymentStatus)} size="small" /></TableCell>
                      <TableCell><Chip label={statusLabel(getEffectiveBookingStatus(booking))} color={bookingColor(getEffectiveBookingStatus(booking))} size="small" /></TableCell>
                      <TableCell sx={{ maxWidth: 190, wordBreak: 'break-all' }}>{booking.stripePaymentIntentId || 'Not available'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {tabIndex === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Payment transactions</Typography>
          {loading ? <CircularProgress /> : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Payment Intent</TableCell>
                    <TableCell>Charge ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Car</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Booking</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map(transaction => (
                    <TableRow key={transaction.bookingId}>
                      <TableCell sx={{ maxWidth: 190, wordBreak: 'break-all' }}>{transaction.id}</TableCell>
                      <TableCell sx={{ maxWidth: 160, wordBreak: 'break-all' }}>{transaction.chargeId}</TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell>{transaction.car}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell><Chip label={statusLabel(transaction.paymentStatus)} color={paymentColor(transaction.paymentStatus)} size="small" /></TableCell>
                      <TableCell><Chip label={statusLabel(transaction.bookingStatus)} color={bookingColor(transaction.bookingStatus)} size="small" /></TableCell>
                      <TableCell>{transaction.paidAt ? new Date(transaction.paidAt).toLocaleString() : 'Not available'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {tabIndex === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ ...panelSx, position: 'sticky', top: 88 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>{selectedCar ? 'Update vehicle' : 'Add vehicle'}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Fill every field from the backend car model. Put gallery images and features on separate lines.
              </Typography>
              <Box component="form" onSubmit={handleCarSubmit} sx={{ display: 'grid', gap: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField sx={fieldSx} label="Car Name" name="name" value={carForm.name} onChange={handleCarChange} required fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField sx={fieldSx} label="Brand" name="brand" value={carForm.brand} onChange={handleCarChange} required fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField sx={fieldSx} label="Model" name="model" value={carForm.model} onChange={handleCarChange} required fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField sx={fieldSx} label="Price Per Day" name="pricePerDay" type="number" value={carForm.pricePerDay} onChange={handleCarChange} required fullWidth />
                  </Grid>
                </Grid>
                <TextField sx={fieldSx} label="Primary Image URL" name="image" value={carForm.image} onChange={handleCarChange} required />
                <TextField sx={fieldSx} label="Gallery Image URLs" name="images" multiline rows={3} value={carForm.images} onChange={handleCarChange} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField sx={fieldSx} label="Fuel Type" name="fuelType" value={carForm.fuelType} onChange={handleCarChange} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField sx={fieldSx} label="Transmission" name="transmission" value={carForm.transmission} onChange={handleCarChange} fullWidth />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField sx={fieldSx} label="Seats" name="seats" type="number" value={carForm.seats} onChange={handleCarChange} fullWidth />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField sx={fieldSx} label="Year" name="year" type="number" value={carForm.year} onChange={handleCarChange} fullWidth />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField sx={fieldSx} label="Rating" name="rating" type="number" value={carForm.rating} onChange={handleCarChange} fullWidth inputProps={{ min: 0, max: 5, step: 0.1 }} />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField sx={fieldSx} label="Reviews" name="reviews" type="number" value={carForm.reviews} onChange={handleCarChange} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField sx={fieldSx} label="Mileage" name="mileage" value={carForm.mileage} onChange={handleCarChange} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField sx={fieldSx} label="Engine" name="engine" value={carForm.engine} onChange={handleCarChange} fullWidth />
                  </Grid>
                </Grid>
                <TextField sx={fieldSx} label="Location" name="location" value={carForm.location} onChange={handleCarChange} />
                <TextField sx={fieldSx} label="Features" name="features" multiline rows={3} value={carForm.features} onChange={handleCarChange} />
                <TextField sx={fieldSx} label="Insurance Policy" name="insurance" value={carForm.insurance} onChange={handleCarChange} />
                <TextField sx={fieldSx} label="Cancellation Policy" name="cancellation" value={carForm.cancellation} onChange={handleCarChange} />
                <TextField sx={fieldSx} label="Description" name="description" multiline rows={3} value={carForm.description} onChange={handleCarChange} />
                <FormControlLabel control={<Switch checked={carForm.availability} onChange={handleCarChange} name="availability" />} label="Available" />
                <Stack direction="row" spacing={2}>
                  <Button type="submit" variant="contained" disabled={submitting}>{selectedCar ? 'Update Car' : 'Add Car'}</Button>
                  {selectedCar && <Button variant="outlined" onClick={() => { setSelectedCar(null); setCarForm(emptyCarForm) }}>Clear</Button>}
                </Stack>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <Grid container spacing={3}>
              {cars.map(car => (
                <Grid item xs={12} lg={6} key={car._id}>
                  <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 18px 44px rgba(15,23,42,0.22)', height: '100%' }}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="210"
                        image={car.image}
                        alt={`${car.brand} ${car.model}`}
                        sx={{ objectFit: 'cover', bgcolor: '#0f172a' }}
                      />
                      <Chip
                        label={car.availability ? 'Available' : 'Unavailable'}
                        color={car.availability ? 'success' : 'default'}
                        size="small"
                        sx={{ position: 'absolute', top: 14, right: 14, fontWeight: 700 }}
                      />
                      <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, p: 2, color: 'white', background: 'linear-gradient(transparent, rgba(0,0,0,0.78))' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>{car.brand} {car.model}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.88 }}>{car.name}</Typography>
                      </Box>
                    </Box>
                    <CardContent sx={{ display: 'grid', gap: 1.4 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>{formatCurrency(car.pricePerDay)}/day</Typography>
                        <Typography variant="body2" color="text.secondary">★ {car.rating || 0} ({car.reviews || 0})</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {[car.fuelType, car.transmission, car.seats ? `${car.seats} seats` : '', car.year, car.engine, car.mileage]
                          .filter(Boolean)
                          .map(item => <Chip key={item} label={item} size="small" variant="outlined" />)}
                      </Stack>
                      {car.location && <Typography variant="body2" color="text.secondary">{car.location}</Typography>}
                      {car.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {car.description}
                        </Typography>
                      )}
                      {!!car.features?.length && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {car.features.slice(0, 4).map(feature => <Chip key={feature} label={feature} size="small" color="primary" variant="outlined" />)}
                        </Stack>
                      )}
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                      <Button variant="contained" size="small" onClick={() => handleEditCar(car)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => handleDeleteCar(car._id)} disabled={submitting}>Delete</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      {tabIndex === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={panelSx}>
              <Typography variant="h6" gutterBottom>Edit user</Typography>
              <Box component="form" onSubmit={handleUserSubmit} sx={{ display: 'grid', gap: 2 }}>
                <TextField label="Name" value={userForm.name} onChange={event => setUserForm(previous => ({ ...previous, name: event.target.value }))} />
                <TextField label="Email" type="email" value={userForm.email} onChange={event => setUserForm(previous => ({ ...previous, email: event.target.value }))} />
                <TextField label="Phone" value={userForm.phone} onChange={event => setUserForm(previous => ({ ...previous, phone: event.target.value }))} />
                <Stack direction="row" spacing={2}>
                  <Button type="submit" variant="contained" disabled={submitting || !selectedUser}>Update User</Button>
                  {selectedUser && <Button variant="outlined" onClick={() => { setSelectedUser(null); setUserForm(emptyUserForm) }}>Clear</Button>}
                </Stack>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {users.map(user => (
                <Grid item xs={12} sm={6} key={user._id}>
                  <Card sx={{ borderRadius: 3, boxShadow: '0 14px 36px rgba(15,23,42,0.16)', height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1">{user.name}</Typography>
                      <Typography>{user.email}</Typography>
                      <Typography color="text.secondary">{user.phone || 'No phone'}</Typography>
                      <Chip label={user.role || 'user'} color={user.role === 'admin' ? 'primary' : 'default'} size="small" />
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => handleEditUser(user)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => handleDeleteUser(user._id)} disabled={submitting}>Delete</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default AdminPage

