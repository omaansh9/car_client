import axios from 'axios'

const envApiUrl = import.meta.env.VITE_API_URL
const DEFAULT_API_URL = 'http://localhost:8000'
const baseURL = envApiUrl && /^https?:\/\//.test(envApiUrl) ? envApiUrl : DEFAULT_API_URL

const publicApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const userApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const adminApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const setAuthToken = token => {
  if (token) {
    userApi.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete userApi.defaults.headers.common.Authorization
  }
}

export const setAdminToken = token => {
  if (token) {
    adminApi.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete adminApi.defaults.headers.common.Authorization
  }
}

export const registerUser = payload => publicApi.post('/api/users/register', payload).then(res => res.data)
export const loginUser = payload => publicApi.post('/api/users/login', payload).then(res => res.data)
export const fetchProfile = () => userApi.get('/api/users/profile').then(res => res.data)

export const getCars = () => publicApi.get('/api/cars').then(res => res.data.data)
export const getCar = id => publicApi.get(`/api/cars/${id}`).then(res => res.data.data)

export const createBooking = payload => userApi.post('/api/bookings', payload).then(res => res.data)
export const getUserBookings = () => userApi.get('/api/bookings').then(res => res.data.data)
export const cancelBooking = bookingId => userApi.put(`/api/bookings/${bookingId}/cancel`).then(res => res.data)
export const getAllBookings = () => adminApi.get('/api/bookings/all').then(res => res.data.data)

export const registerAdmin = payload => adminApi.post('/api/admin/register', payload).then(res => res.data)
export const loginAdmin = payload => adminApi.post('/api/admin/login', payload).then(res => res.data)

export const addCar = payload => adminApi.post('/api/cars', payload).then(res => res.data)
export const updateCar = (carId, payload) => adminApi.put(`/api/cars/${carId}`, payload).then(res => res.data)
export const deleteCar = carId => adminApi.delete(`/api/cars/${carId}`).then(res => res.data)
