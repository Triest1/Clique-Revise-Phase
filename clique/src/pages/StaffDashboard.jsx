import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useFirebase } from '../contexts/FirebaseContext'
import { StaffService } from '../firebase/staffService'

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    activeConversations: 0,
    pendingMessages: 0,
    resolvedToday: 0,
    responseTime: 0
  })
  const [loading, setLoading] = useState(true)
  const { user } = useFirebase()

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    // Load conversation stats using the new assignment system
    const unsubscribeAssigned = StaffService.subscribeToAssignedConversations((assignedConversations) => {
      try {
        // Calculate stats from assigned conversations
        const activeConversations = assignedConversations.filter(conv => conv.status === 'active').length
        const pendingMessages = assignedConversations.filter(conv => conv.status === 'pending').length
        const resolvedToday = assignedConversations.filter(conv => {
          if (!conv.resolvedAt) return false
          const resolvedDate = conv.resolvedAt.toDate ? conv.resolvedAt.toDate() : new Date(conv.resolvedAt)
          const today = new Date()
          return resolvedDate.toDateString() === today.toDateString()
        }).length
        
        // Calculate average response time (simplified)
        const responseTime = assignedConversations.length > 0 ? 
          assignedConversations.reduce((acc, conv) => acc + (conv.responseTime || 2.5), 0) / assignedConversations.length : 2.5
        
        setStats({
          activeConversations,
          pendingMessages,
          resolvedToday,
          responseTime: Math.round(responseTime * 10) / 10
        })
        setLoading(false)
      } catch (error) {
        console.error('Error processing conversation stats:', error)
        setLoading(false)
      }
    })

    return () => {
      unsubscribeAssigned()
    }
  }, [user?.uid])


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.displayName || 'Staff Member'}!</h1>
          <p className="text-green-100">Loading your dashboard...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.displayName || 'Staff Member'}!</h1>
        <p className="text-green-100">Ready to help users with their inquiries today?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Conversations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeConversations}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Messages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingMessages}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolvedToday}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.responseTime}m</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-sm"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-600">Common tasks</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <button className="w-full flex items-center p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Start Live Chat</p>
                <p className="text-sm text-gray-600">Begin a new conversation</p>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StaffDashboard
