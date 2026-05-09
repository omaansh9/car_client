import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  X,
  CheckCircle,
  AlertCircle,
  Car,
  Star
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNotification } from '../contexts/NotificationContext.jsx'
import { cancelBooking, getUserBookings } from '../services/api.js'

const BookingsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, active, completed, cancelled

  useEffect(() => {
    if (!user) {
      setBookings([])
      setLoading(false)
      return
    }

    setLoading(true)
    getUserBookings()
      .then(data => {
        const bookingsList = Array.isArray(data)
          ? data.map(booking => ({
              ...booking,
              car: {
                ...booking.carId,
                pricePerDay: booking.carId?.pricePerDay
              }
            }))
          : []

        setBookings(bookingsList)
      })
      .catch(error => {
        console.error(error)
        showNotification('Failed to load bookings.', 'error')
      })
      .finally(() => setLoading(false))
  }, [user])

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    return booking.status === filter
  })

  const handleCancelBooking = (bookingId) => {
    cancelBooking(bookingId)
      .then(() => {
        setBookings(prev => prev.map(booking =>
          booking._id === bookingId
            ? { ...booking, status: 'cancelled' }
            : booking
        ))
        showNotification('Booking cancelled successfully', 'success')
      })
      .catch(error => {
        const message = error?.response?.data?.message || error.message || 'Unable to cancel booking.'
        console.error(error)
        showNotification(message, 'error')
      })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <X className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            My Bookings
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Manage your car rental reservations
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg">
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All Bookings', count: bookings.length },
                { key: 'active', label: 'Active', count: bookings.filter(b => b.status === 'active').length },
                { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
                { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    filter === key
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="md:flex">
                  {/* Car Image */}
                  <div className="md:w-1/3">
                    <img
                      src={booking.car.image}
                      alt={booking.car.name}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {booking.car.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 mb-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{booking.pickupLocation || 'Pickup location not set'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-white text-sm font-semibold ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="capitalize">{booking.status}</span>
                      </div>
                    </div>

                    {/* Booking Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))} days
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Daily Rate</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          ₹{booking.car.pricePerDay}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</div>
                        <div className="font-semibold text-blue-600 dark:text-blue-400">
                          ₹{booking.totalPrice}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {booking.status === 'active' && (
                        <>
                          <button className="btn-primary">
                            Modify Booking
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 font-semibold"
                          >
                            Cancel Booking
                          </button>
                        </>
                      )}

                      {booking.status === 'completed' && (
                        <>
                          <button className="btn-primary">
                            Book Again
                          </button>
                          <button className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-semibold">
                            Leave Review
                          </button>
                        </>
                      )}

                      <button className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-semibold">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'all'
                ? "You haven't made any bookings yet."
                : `No ${filter} bookings found.`
              }
            </p>
            <button
              onClick={() => navigate('/cars')}
              className="btn-primary"
            >
              Browse Cars
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default BookingsPage
