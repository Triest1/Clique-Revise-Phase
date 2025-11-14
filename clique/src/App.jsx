import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { FirebaseProvider } from './contexts/FirebaseContext'
import { AuthService } from './firebase/authService'
import UserNavbar from './components/UserNavbar'
import AdminLayout from './components/AdminLayout'
import StaffLayout from './components/StaffLayout'
import StaffProtectedRoute from './components/StaffProtectedRoute'
import Home from './pages/Home'
import Events from './pages/Events'
import About from './pages/About'
import Contact from './pages/Contact'
import AdminDashboard from './pages/AdminDashboard'
import AdminEventsManagement from './pages/AdminEventsManagement'
import AdminContentManagement from './pages/AdminContentManagement'
import AdminStaffManagement from './pages/AdminStaffManagement'
import AdminSettings from './pages/AdminSettings'
import Login from './pages/Login'
import Setup from './pages/Setup'
import StaffDashboard from './pages/StaffDashboard'
import StaffConversations from './pages/StaffConversations'
import StaffProfile from './pages/StaffProfile'
import ChatBot from './components/ChatBot'
import DatabaseRedirect from './components/DatabaseRedirect'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Conditional Navbar Component
const ConditionalNavbar = () => {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isStaffRoute = location.pathname.startsWith('/staff')
  const isLoginPage = location.pathname === '/login'
  
  // Don't show any navbar on login page, admin routes, or staff routes (sidebars handle navigation)
  if (isLoginPage || isAdminRoute || isStaffRoute) {
    return null
  }
  
  return <UserNavbar />
}

// Component to conditionally render ChatBot
const ConditionalChatBot = () => {
  const location = useLocation()
  const isUserPage = ['/', '/about', '/events', '/contact'].includes(location.pathname)
  
  return isUserPage ? <ChatBot /> : null
}

function App() {
  return (
    <FirebaseProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <DatabaseRedirect />
          <ConditionalNavbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/setup" element={<Setup />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/events" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminEventsManagement />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/content" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminContentManagement />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/staff" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminStaffManagement />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminSettings />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              
              {/* Staff Routes */}
              <Route path="/staff" element={
                <StaffProtectedRoute>
                  <StaffLayout>
                    <StaffDashboard />
                  </StaffLayout>
                </StaffProtectedRoute>
              } />
              <Route path="/staff/conversations" element={
                <StaffProtectedRoute>
                  <StaffLayout>
                    <StaffConversations />
                  </StaffLayout>
                </StaffProtectedRoute>
              } />
              <Route path="/staff/profile" element={
                <StaffProtectedRoute>
                  <StaffLayout>
                    <StaffProfile />
                  </StaffLayout>
                </StaffProtectedRoute>
              } />
            </Routes>
          </main>
          <ConditionalChatBot />
        </div>
      </Router>
    </FirebaseProvider>
  )
}

export default App

