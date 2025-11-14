import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const AdminNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const location = useLocation()

  // Check if user is logged in
  useEffect(() => {
    const checkUserAuth = () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          // Only set currentUser if it's a valid admin or staff account
          if (userData && (userData.role === 'admin' || userData.role === 'staff')) {
            setCurrentUser(userData)
          } else {
            // Clear invalid user data
            localStorage.removeItem('user')
            setCurrentUser(null)
          }
        } catch (error) {
          // Clear corrupted user data
          localStorage.removeItem('user')
          setCurrentUser(null)
        }
      } else {
        setCurrentUser(null)
      }
    }

    // Check immediately
    checkUserAuth()

    // Set up periodic check every 30 seconds
    const interval = setInterval(checkUserAuth, 30000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [])

  const adminNavLinks = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/events', label: 'Events Management' },
    { path: '/admin/content', label: 'Content Management' },
    { path: '/admin/staff', label: 'Staff Management' },
    { path: '/admin/settings', label: 'Settings' }
  ]

  // Only show admin navigation for authenticated admin/staff users
  const allNavLinks = currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff') 
    ? adminNavLinks 
    : []

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/admin" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
              <p className="text-xs text-gray-500">Barangay Communal</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {allNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    layoutId="activeTab"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            

          </div>

          {/* User Status and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* User Status (Desktop) - Only show for authenticated admin/staff */}
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff') && (
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">
                      {currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-blue-700">
                    {currentUser.fullName}
                  </span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    // Clear all user-related data
                    localStorage.removeItem('user')
                    localStorage.removeItem('currentUser')
                    setCurrentUser(null)
                    // Redirect to admin login page
                    window.location.href = '/login'
                  }}
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {allNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    isActive(link.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default AdminNavbar
