import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthService } from '../firebase/authService'

// Staff Protected Route Component
const StaffProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((userData) => {
      setUser(userData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Allow staff and moderator roles to access staff routes
  if (!user || (user.role !== 'staff' && user.role !== 'moderator')) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default StaffProtectedRoute
