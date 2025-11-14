import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useFirebase } from '../contexts/FirebaseContext'

const DatabaseRedirect = () => {
  const { databaseInitialized, loading } = useFirebase()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Only redirect if we're not already on the setup page and database is not initialized
    if (!loading && !databaseInitialized && location.pathname !== '/setup') {
      navigate('/setup')
    }
  }, [databaseInitialized, loading, navigate, location.pathname])

  return null // This component doesn't render anything
}

export default DatabaseRedirect
