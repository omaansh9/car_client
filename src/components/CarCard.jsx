import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Fuel, Users, Settings, Heart } from 'lucide-react'

const CarCard = ({ car }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className="glassmorphism rounded-2xl overflow-hidden card-hover group"
    >
      {/* Car Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={car.image || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
          ${car.pricePerDay}/day
        </div>

        {/* Favorite Button */}
        <button className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200">
          <Heart className="h-5 w-5" />
        </button>

        {/* Availability Badge */}
        <div className="absolute bottom-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            car.availability
              ? 'bg-green-500/90 text-white'
              : 'bg-red-500/90 text-white'
          }`}>
            {car.availability ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Car Details */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {car.brand} {car.model}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {car.name || 'Premium Luxury Car'}
          </p>
        </div>

        {/* Car Specs */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <Fuel className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {car.fuelType || 'Petrol'}
            </span>
          </div>
          <div className="text-center">
            <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {car.seats || 4} Seats
            </span>
          </div>
          <div className="text-center">
            <Settings className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {car.transmission || 'Auto'}
            </span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {car.rating || 4.5}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({car.reviews || 128} reviews)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Link
            to={`/cars/${car._id}`}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-center font-semibold"
          >
            View Details
          </Link>
          <button className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200">
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default CarCard
