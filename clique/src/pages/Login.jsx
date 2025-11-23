import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useFirebase } from '../contexts/FirebaseContext'
import { AuthService } from '../firebase/authService'
import communalLogo from '../assets/communal-logo.png'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { signIn, signOut, user, loading } = useFirebase()

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !loading) {
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin')
      } else if (user.role === 'staff' || user.role === 'moderator') {
        navigate('/staff')
      } else {
        // Default redirect for unknown roles
        navigate('/')
      }
    }
  }, [user, loading, navigate])

  // Check if account is locked (after 5 failed attempts)
  useEffect(() => {
    if (loginAttempts >= 5) {
      setIsLocked(true)
      const timer = setTimeout(() => {
        setIsLocked(false)
        setLoginAttempts(0)
      }, 300000) // 5 minutes lockout
      return () => clearTimeout(timer)
    }
  }, [loginAttempts])

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (isLocked) {
      setError('Account temporarily locked due to multiple failed attempts. Please try again in 5 minutes.')
      return
    }

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await signIn(email, password)
      setLoginAttempts(0)
      // Redirect will be handled by useEffect when user state updates
    } catch (error) {
      // Increment failed attempts
      const newAttempts = loginAttempts + 1
      setLoginAttempts(newAttempts)
      
      // Clear sensitive data from form
      setPassword('')
      setError(error.message)
      
      if (newAttempts >= 5) {
        setError('Multiple failed login attempts. Account will be locked for 5 minutes.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading && !isLocked) {
      handleLogin(e)
    }
  }

  // Show loading state while Firebase initializes
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Simple Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white border-opacity-20 p-2">
            <img 
              src={communalLogo} 
              alt="Barangay Communal Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-green-100 text-lg">Sign in to access your dashboard</p>
          
          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-400 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-8">
          {/* Email Field */}
          <div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-xl flex items-center justify-center border border-white border-opacity-30 group-hover:bg-opacity-30 group-focus-within:bg-opacity-40 transition-all duration-300">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || isLocked}
                className="block w-full pl-20 pr-6 py-4 bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-white placeholder-opacity-70 rounded-2xl focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:bg-white focus:bg-opacity-20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white border-opacity-20 group-hover:border-opacity-40 group-focus-within:border-opacity-60"
                placeholder="Email Address"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-xl flex items-center justify-center border border-white border-opacity-30 group-hover:bg-opacity-30 group-focus-within:bg-opacity-40 transition-all duration-300">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || isLocked}
                className="block w-full pl-20 pr-20 py-4 bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-white placeholder-opacity-70 rounded-2xl focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:bg-white focus:bg-opacity-20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white border-opacity-20 group-hover:border-opacity-40 group-focus-within:border-opacity-60"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-5 flex items-center z-10"
              >
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-xl flex items-center justify-center border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300">
                  {showPassword ? (
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isLocked || !email || !password}
            className="w-full bg-gradient-to-r from-green-700 to-green-800 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:from-green-800 hover:to-green-900 focus:ring-4 focus:ring-green-600 focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl hover:shadow-green-800/30 border-0"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default Login
