import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Car, Star, Users, Shield, ChevronRight, Calendar, MapPin, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'

const HomePage = () => {
  const { user } = useAuth()
  const [searchForm, setSearchForm] = useState({
    location: '',
    pickupDate: '',
    returnDate: ''
  })

  const featuredCars = [
    {
      id: 1,
      name: 'Lamborghini Huracan',
      image: 'https://images.unsplash.com/photo-1544829099-b9a0e3421dbb?w=400',
      price: 299,
      rating: 4.9,
      type: 'Sports Car'
    },
    {
      id: 2,
      name: 'Ferrari 488',
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400',
      price: 349,
      rating: 4.8,
      type: 'Supercar'
    },
    {
      id: 3,
      name: 'BMW M4',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
      price: 189,
      rating: 4.7,
      type: 'Luxury Sedan'
    }
  ]

  const stats = [
    { icon: Car, label: 'Premium Cars', value: '500+' },
    { icon: Users, label: 'Happy Customers', value: '10,000+' },
    { icon: Star, label: 'Average Rating', value: '4.9/5' },
    { icon: Shield, label: 'Safe Rentals', value: '100%' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920')"
          }}
        />

        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
          >
            Drive Your Dream Car
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-gray-200"
          >
            Experience luxury on wheels with our premium car rental service
          </motion.p>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="glassmorphism rounded-2xl p-6 md:p-8 max-w-4xl mx-auto mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pickup Location"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchForm.location}
                  onChange={(e) => setSearchForm({...searchForm, location: e.target.value})}
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchForm.pickupDate}
                  onChange={(e) => setSearchForm({...searchForm, pickupDate: e.target.value})}
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchForm.returnDate}
                  onChange={(e) => setSearchForm({...searchForm, returnDate: e.target.value})}
                />
              </div>

              <button className="btn-primary flex items-center justify-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search Cars</span>
              </button>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/cars"
              className="btn-primary text-center"
            >
              Explore Cars
            </Link>
            <Link
              to={user ? "/bookings" : "/register"}
              className="btn-secondary text-center"
            >
              {user ? "My Bookings" : "Book Now"}
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}


            {/* Why Choose Us Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Developer Details
            </h2>

            <p className="text-xl text-gray-600 dark:text-gray-400">
              Meet the developer behind LuxeDrive
            </p>
          </motion.div>

          {/* Developer Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-100 dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center hover:scale-105 transition duration-300"
          >

            {/* Developer Image */}
            <img
              src="public\dev.jpeg"
              alt="Omaansh"
              className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-blue-500 mb-6"
            />

            {/* Developer Name */}
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Omaansh
            </h3>

            {/* Role */}
            <p className="text-blue-500 text-lg font-semibold mb-4">
              Full Stack Developer
            </p>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
              Designed and developed the LuxeDrive Car Rental platform with a modern
              user interface, secure backend system, responsive design, and smooth
              user experience.
            </p>

            {/* Guide */}
            <div className="bg-white dark:bg-gray-700 rounded-2xl p-4 shadow-md inline-block">
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                Guided By
              </p>

              <h4 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                Dr. R. Rajalakshmi
              </h4>
            </div>

          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage