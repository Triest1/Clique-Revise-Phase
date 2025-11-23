import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFirebase } from '../contexts/FirebaseContext'
import { useNavigate } from 'react-router-dom'
import { DatabaseInit } from '../firebase/databaseInit'

const Setup = () => {
  const [isInitializing, setIsInitializing] = useState(false)
  const [initError, setInitError] = useState('')
  const [showCredentials, setShowCredentials] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  const { databaseInitialized, initializeDatabase, createSampleData } = useFirebase()
  const navigate = useNavigate()

  // Redirect if database is already initialized (only on initial load)
  useEffect(() => {
    console.log('Setup - databaseInitialized:', databaseInitialized, 'currentStep:', currentStep)
    if (databaseInitialized && currentStep === 1) {
      console.log('Setup - Redirecting to /login because database is already initialized')
      navigate('/login')
    }
  }, [databaseInitialized, navigate, currentStep])

  const handleInitialize = async () => {
    try {
      setIsInitializing(true)
      setInitError('')
      setCurrentStep(2)
      
      await initializeDatabase()
      
      setCurrentStep(3)
      setShowCredentials(true)
    } catch (error) {
      console.error('Error initializing database:', error)
      setInitError('Failed to initialize database. Please try again.')
      setCurrentStep(1)
    } finally {
      setIsInitializing(false)
    }
  }

  const handleCreateSampleData = async () => {
    try {
      setIsInitializing(true)
      setInitError('')
      await createSampleData()
    } catch (error) {
      console.error('Error creating sample data:', error)
      setInitError('Failed to create sample data. Please try again.')
    } finally {
      setIsInitializing(false)
    }
  }

  const handleGoToLogin = () => {
    navigate('/login')
  }

  const handleResetDatabase = async () => {
    try {
      console.log('Resetting database...')
      await DatabaseInit.resetDatabase()
      console.log('Database reset complete')
      // Reload the page to restart the flow
      window.location.reload()
    } catch (error) {
      console.error('Error resetting database:', error)
    }
  }

  const steps = [
    {
      number: 1,
      title: 'Welcome',
      description: 'Set up your Barangay Admin Management System',
      icon: '🏛️'
    },
    {
      number: 2,
      title: 'Initializing',
      description: 'Creating database collections and admin account...',
      icon: '⚙️'
    },
    {
      number: 3,
      title: 'Complete',
      description: 'Database initialized successfully!',
      icon: '✅'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Barangay Admin Management</h1>
            <p className="text-green-100 text-lg">Initial Setup Required</p>
          </div>

          <div className="p-8">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 ${
                      currentStep >= step.number 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > step.number ? '✓' : step.icon}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.number ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 max-w-24">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-green-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / 3) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome to Barangay Admin Management
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Before you can start using the admin management system, we need to initialize the database with the necessary collections and create your admin account.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">
                    What will be created:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                    <div>
                      <h4 className="font-medium mb-2">Collections:</h4>
                      <ul className="space-y-1">
                        <li>• Admin staff management</li>
                        <li>• Admin queries management</li>
                        <li>• Admin settings</li>
                        <li>• Contact messages</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Configuration:</h4>
                      <ul className="space-y-1">
                        <li>• System settings</li>
                        <li>• Admin configuration</li>
                        <li>• Admin account</li>
                        <li>• Security policies</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {initError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{initError}</p>
                  </div>
                )}

                 <div className="space-y-4">
                   <button
                     onClick={handleInitialize}
                     disabled={isInitializing}
                     className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto space-x-2"
                   >
                     {isInitializing ? (
                       <>
                         <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         <span>Initializing...</span>
                       </>
                     ) : (
                       <>
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                         </svg>
                         <span>Initialize Database</span>
                       </>
                     )}
                   </button>
                   
                   {/* Debug Reset Button */}
                   <button
                     onClick={handleResetDatabase}
                     className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors text-sm"
                   >
                     🔄 Reset Database (Debug)
                   </button>
                 </div>
              </motion.div>
            )}

            {/* Step 2: Initializing */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center"
              >
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Initializing Database...
                  </h2>
                  <p className="text-gray-600">
                    Please wait while we set up your admin management system. This may take a few moments.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-700">Creating admin collections...</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-700">Setting up admin configuration...</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-700">Creating admin account...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Complete */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center"
              >
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Setup Complete!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your admin management system has been successfully initialized. You can now log in with your admin credentials.
                  </p>
                </div>

                {/* Admin Credentials */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">
                    Admin Account Created
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                      <p className="text-sm font-mono text-gray-900">admin@barangay.local</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                      <p className="text-sm font-mono text-gray-900">Admin123!</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> Please change the password after your first login for security reasons.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleCreateSampleData}
                    disabled={isInitializing}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Add Sample Data</span>
                  </button>
                  
                  <button
                    onClick={handleGoToLogin}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Go to Login</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Setup
