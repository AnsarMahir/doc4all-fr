import { useState, useEffect } from 'react'

const OtpVerification = ({ switchToLogin, switchToRegister, closeModal, initialEmail = '' }) => {
  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [showEmailInput, setShowEmailInput] = useState(!initialEmail)

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [resendCooldown])

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
  }

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '') // Only allow digits
    if (value.length <= 6) {
      setOtp(value)
    }
  }

  const startResendCooldown = () => {
    setResendCooldown(60)
  }

  const handleVerifyOtp = async () => {
    if (!email || !otp) {
      setError('Please enter both email and OTP')
      return
    }

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8005/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          otp: otp
        })
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'OTP verification failed')
      }

      // OTP verified successfully
      closeModal()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    setError('')
    setIsResending(true)

    try {
      const res = await fetch('http://localhost:8005/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to resend OTP')
      }

      startResendCooldown()
      setShowEmailInput(false) // Hide email input after successful resend
      setError('') // Clear any previous errors
      // You could show a success message here if needed
    } catch (err) {
      setError(err.message)
    } finally {
      setIsResending(false)
    }
  }

  const handleChangeEmail = () => {
    setShowEmailInput(true)
    setOtp('')
    setError('')
  }

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-center mb-2">Verify Your Email</h2>
      
      {!showEmailInput && email ? (
        <p className="text-center text-gray-600 mb-6">
          We've sent a verification code to <strong>{email}</strong>
          <br />
          <button
            type="button"
            onClick={handleChangeEmail}
            className="text-sm text-primary-600 hover:text-primary-700 hover:underline mt-1"
          >
            Use different email?
          </button>
        </p>
      ) : (
        <p className="text-center text-gray-600 mb-6">
          Enter your email and the verification code we sent you
        </p>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Email input - show if no initial email or user wants to change */}
        {showEmailInput && (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
            Enter Verification Code
          </label>
          <input
            type="text"
            id="otp"
            name="otp"
            value={otp}
            onChange={handleOtpChange}
            placeholder="Enter 6-digit code"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-lg tracking-widest"
            maxLength="6"
            required
          />
        </div>

        <button
          type="button"
          onClick={handleVerifyOtp}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </div>

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-600">
          Didn't receive the code?
        </p>
        
        {resendCooldown > 0 ? (
          <p className="text-sm text-gray-500">
            Resend available in {resendCooldown}s
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending}
            className="text-primary-600 hover:text-primary-700 hover:underline font-medium text-sm disabled:opacity-50"
          >
            {isResending ? 'Sending...' : 'Resend Code'}
          </button>
        )}

        <div className="pt-4 space-y-2 border-t border-gray-200">
          <button
            type="button"
            onClick={switchToLogin}
            className="block w-full text-center text-primary-600 hover:text-primary-700 hover:underline font-medium text-sm"
          >
            Back to Login
          </button>
          
          <button
            type="button"
            onClick={switchToRegister}
            className="block w-full text-center text-gray-600 hover:text-gray-700 hover:underline text-sm"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>
    </div>
  )
}

export default OtpVerification