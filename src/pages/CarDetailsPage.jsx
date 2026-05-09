import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Users,
  Fuel,
  Settings,
  Star,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Shield,
  Clock,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNotification } from '../contexts/NotificationContext.jsx'
import { createBooking, getCar } from '../services/api.js'

const CarDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showNotification } = useNotification()

  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [bookingDates, setBookingDates] = useState({
    startDate: '',
    endDate: ''
  })
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getCar(id)
      .then(data => setCar(data))
      .catch(error => {
        console.error(error)
        showNotification('Failed to load car details.', 'error')
      })
      .finally(() => setLoading(false))
  }, [id])

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === car.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? car.images.length - 1 : prev - 1
    )
  }

  const handleFavorite = () => {
    if (!user) {
      showNotification('Please login to add favorites', 'warning')
      return
    }
    setIsFavorited(!isFavorited)
    showNotification(
      isFavorited ? 'Removed from favorites' : 'Added to favorites',
      'success'
    )
  }

  const handleShare = () => {
    navigator.share?.({
      title: car.name,
      text: `Check out this ${car.name} for rent!`,
      url: window.location.href
    }) || navigator.clipboard.writeText(window.location.href)
    showNotification('Link copied to clipboard', 'success')
  }

  const handleBooking = () => {
    if (!user) {
      showNotification('Please login to book this car', 'warning')
      navigate('/login')
      return
    }

    if (!bookingDates.startDate || !bookingDates.endDate) {
      showNotification('Please select booking dates', 'warning')
      return
    }

    const start = new Date(bookingDates.startDate)
    const end = new Date(bookingDates.endDate)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))

    if (days <= 0) {
      showNotification('Please select valid booking dates', 'warning')
      return
    }

    const totalPrice = days * car.pricePerDay
    setBookingLoading(true)

    createBooking({
      carId: car._id,
      startDate: bookingDates.startDate,
      endDate: bookingDates.endDate
    })
      .then(() => {
        showNotification(`Booking confirmed! Total: ₹${totalPrice}`, 'success')
        navigate('/bookings')
      })
      .catch(error => {
        const message = error?.response?.data?.message || error.message || 'Booking failed. Please try again.'
        console.error(error)
        showNotification(message, 'error')
      })
      .finally(() => setBookingLoading(false))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading car details...</p>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Car not found
          </h2>
          <button
            onClick={() => navigate('/cars')}
            className="btn-primary"
          >
            Back to Cars
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/cars')}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Cars</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleFavorite}
                className={`p-2 rounded-full transition-colors ${
                  isFavorited
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="relative h-96 lg:h-[500px]">
                <img
                  src={car.images[currentImageIndex]}
                  alt={car.name}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {car.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex
                          ? 'bg-white'
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2 overflow-x-auto">
                  {car.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex
                          ? 'border-blue-500'
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${car.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Car Information */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {car.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="font-medium">{car.rating}</span>
                      <span>({car.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{car.location}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ₹{car.pricePerDay}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">per day</div>
                </div>
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <Settings className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">Engine</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{car.engine}</div>
                </div>

                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <Fuel className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">Fuel</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{car.fuelType}</div>
                </div>

                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">Seats</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{car.seats}</div>
                </div>

                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <Settings className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">Transmission</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{car.transmission}</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  About this car
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {car.description}
                </p>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Features & Amenities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {car.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Book this car
              </h2>

              {/* Date Selection */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    value={bookingDates.startDate}
                    onChange={(e) => setBookingDates(prev => ({ ...prev, startDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={bookingDates.endDate}
                    onChange={(e) => setBookingDates(prev => ({ ...prev, endDate: e.target.value }))}
                    min={bookingDates.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Price Breakdown */}
              {bookingDates.startDate && bookingDates.endDate && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      ${car.pricePerDay} × {Math.ceil((new Date(bookingDates.endDate) - new Date(bookingDates.startDate)) / (1000 * 60 * 60 * 24))} days
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${Math.ceil((new Date(bookingDates.endDate) - new Date(bookingDates.startDate)) / (1000 * 60 * 60 * 24)) * car.pricePerDay}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        ${Math.ceil((new Date(bookingDates.endDate) - new Date(bookingDates.startDate)) / (1000 * 60 * 60 * 24)) * car.pricePerDay}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Policies */}
              <div className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>{car.insurance}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>{car.cancellation}</span>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBooking}
                disabled={!car.availability || bookingLoading}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  car.availability
                    ? 'btn-primary hover:scale-105'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                }`}
              >
                {bookingLoading
                  ? 'Booking...'
                  : car.availability
                    ? 'Book Now'
                    : 'Not Available'}
              </button>

              {!car.availability && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                  This car is currently unavailable
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarDetailsPage
