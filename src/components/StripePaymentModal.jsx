import { useState, useEffect } from 'react'
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { motion } from 'framer-motion'
import { CreditCard, Lock, CheckCircle, X } from 'lucide-react'
import { confirmPayment } from '../services/api.js'
import { useNotification } from '../contexts/NotificationContext.jsx'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const hideStripeDeveloperWidget = () => {
  const hideWidgetFrames = () => {
    document.querySelectorAll('iframe').forEach(frame => {
      const src = frame.getAttribute('src') || ''
      const title = frame.getAttribute('title') || ''
      const styles = window.getComputedStyle(frame)
      const zIndex = Number(styles.zIndex)
      const isStripeFrame = src.includes('stripe') || title.toLowerCase().includes('stripe')
      const isDeveloperOverlay = styles.position === 'fixed' && zIndex > 1000

      if (isStripeFrame && isDeveloperOverlay) {
        frame.style.display = 'none'
        frame.style.pointerEvents = 'none'
      }
    })
  }

  hideWidgetFrames()

  const observer = new MutationObserver(hideWidgetFrames)
  observer.observe(document.body, { childList: true, subtree: true })

  return () => observer.disconnect()
}

const PaymentForm = ({ clientSecret, bookingData, onSuccess, onCancel }) => {
  const stripe = useStripe()
  const elements = useElements()
  const { showNotification } = useNotification()
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setMessage('')

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/bookings`,
      },
      redirect: 'if_required'
    })

    if (error) {
      setMessage(error.message)
      setIsProcessing(false)
      showNotification('Payment failed: ' + error.message, 'error')
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Confirm payment on backend
      try {
        await confirmPayment({ paymentIntentId: paymentIntent.id })
        showNotification('Payment successful! Booking confirmed.', 'success')
        onSuccess()
      } catch (confirmError) {
        console.error('Payment confirmation error:', confirmError)
        showNotification('Payment processed but booking confirmation failed. Please contact support.', 'warning')
        onSuccess() // Still proceed as payment was successful
      }
    } else {
      setMessage('Payment processing...')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <CreditCard className="h-6 w-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Payment Details
          </h3>
        </div>

        <PaymentElement
          options={{
            layout: 'tabs'
          }}
          className="mb-4"
        />

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('failed') || message.includes('error')
              ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Booking Summary
        </h4>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Car</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {bookingData.car.brand} {bookingData.car.model}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Duration</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {bookingData.days} day{bookingData.days > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Daily Rate</span>
            <span className="font-medium text-gray-900 dark:text-white">
              ₹{bookingData.car.pricePerDay.toLocaleString()}
            </span>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{bookingData.totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
        <div className="flex items-center space-x-2">
          <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-800 dark:text-green-200">
            Your payment information is secure and encrypted
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          disabled={isProcessing}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Lock className="h-5 w-5" />
              <span>Pay ₹{bookingData.totalPrice.toLocaleString()}</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

const StripePaymentModal = ({ isOpen, onClose, clientSecret, bookingData, onSuccess }) => {
  useEffect(() => {
    if (!isOpen) return undefined
    return hideStripeDeveloperWidget()
  }, [isOpen])

  if (!isOpen || !clientSecret) return null

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
      },
    },
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Complete Your Booking
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm
              clientSecret={clientSecret}
              bookingData={bookingData}
              onSuccess={() => {
                onSuccess()
                onClose()
              }}
              onCancel={onClose}
            />
          </Elements>
        </div>
      </motion.div>
    </div>
  )
}

export default StripePaymentModal
