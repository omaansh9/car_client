import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { AdminProvider } from './contexts/AdminContext.jsx'
import { NotificationProvider } from './contexts/NotificationContext.jsx'
import Header from './components/Header.jsx'
import Notifier from './components/Notifier.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import BookingsPage from './pages/BookingsPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import CarDetailsPage from './pages/CarDetailsPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import CarsPage from './pages/CarsPage.jsx'

const AppShell = () => {
  const location = useLocation()
  const hideHeader = ['/login', '/register'].includes(location.pathname)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {!hideHeader && <Header />}
      <main className={`${!hideHeader ? 'pt-16' : ''} min-h-screen`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/cars/:id" element={<CarDetailsPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/bookings" element={<BookingsPage />} />
          </Route>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Notifier />
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <NotificationProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppShell />
          </BrowserRouter>
        </NotificationProvider>
      </AdminProvider>
    </AuthProvider>
  )
}

export default App
