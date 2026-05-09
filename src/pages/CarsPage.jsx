import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react'
import CarCard from '../components/CarCard.jsx'
import { useNotification } from '../contexts/NotificationContext.jsx'
import { getCars } from '../services/api.js'

const CarsPage = () => {
  const { showNotification } = useNotification()
  const [cars, setCars] = useState([])
  const [filteredCars, setFilteredCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    priceRange: [0, 20000000],
    brand: '',
    fuelType: '',
    transmission: '',
    rating: 0,
    seats: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    getCars()
      .then(data => {
        const carsList = Array.isArray(data) ? data : []
        setCars(carsList)
        console.log('Fetched cars:', carsList)
        setFilteredCars(carsList)
      })
      .catch(error => {
        console.error(error)
        showNotification('Failed to load cars.', 'error')
      })
      .finally(() => setLoading(false))
  }, [])

  // Filter and search logic
  useEffect(() => {
    let filtered = cars.filter(car => {
      const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          car.model.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPrice = car.pricePerDay >= filters.priceRange[0] && car.pricePerDay <= filters.priceRange[1]
      const matchesBrand = !filters.brand || car.brand === filters.brand
      const matchesFuel = !filters.fuelType || car.fuelType === filters.fuelType
      const matchesTransmission = !filters.transmission || car.transmission === filters.transmission
      const matchesRating = car.rating >= filters.rating
      const matchesSeats = !filters.seats || car.seats >= parseInt(filters.seats)

      return matchesSearch && matchesPrice && matchesBrand && matchesFuel &&
             matchesTransmission && matchesRating && matchesSeats
    })

    setFilteredCars(filtered)
  }, [cars, searchTerm, filters])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 500],
      brand: '',
      fuelType: '',
      transmission: '',
      rating: 0,
      seats: ''
    })
    setSearchTerm('')
  }

  const brands = [...new Set(cars.map(car => car.brand))]
  const fuelTypes = [...new Set(cars.map(car => car.fuelType))]
  const transmissions = [...new Set(cars.map(car => car.transmission))]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading premium cars...</p>
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
            Premium Car Collection
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Discover our exclusive fleet of luxury vehicles
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-lg"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search cars by name, brand, or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filters</span>
            </button>

            {/* Results Count */}
            <div className="text-gray-600 dark:text-gray-400">
              {filteredCars.length} cars found
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range ($/day)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={filters.priceRange[1]}
                      onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>${filters.priceRange[0]}</span>
                      <span>${filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Brand
                  </label>
                  <select
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="w-full py-2 px-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fuel Type
                  </label>
                  <select
                    value={filters.fuelType}
                    onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                    className="w-full py-2 px-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    {fuelTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Transmission */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transmission
                  </label>
                  <select
                    value={filters.transmission}
                    onChange={(e) => handleFilterChange('transmission', e.target.value)}
                    className="w-full py-2 px-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    {transmissions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                    className="w-full py-2 px-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="0">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.8">4.8+ Stars</option>
                  </select>
                </div>

                {/* Seats */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Seats
                  </label>
                  <select
                    value={filters.seats}
                    onChange={(e) => handleFilterChange('seats', e.target.value)}
                    className="w-full py-2 px-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any Seats</option>
                    <option value="2">2+ Seats</option>
                    <option value="4">4+ Seats</option>
                    <option value="5">5+ Seats</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                  <span>Clear Filters</span>
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Cars Grid */}
        {filteredCars.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCars.map((car, index) => (
              <motion.div
                key={car._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <CarCard car={car} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No cars found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default CarsPage
