import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFirebase } from '../contexts/FirebaseContext'

const MessageCenter = () => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const { user, getUserMessages, markMessageAsRead, markMessageAsResolved, getUnreadMessageCount } = useFirebase()

  // Load messages when component mounts
  useEffect(() => {
    const loadMessages = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        setError('')
        const userMessages = await getUserMessages(user.uid)
        setMessages(userMessages)
      } catch (error) {
        console.error('Error loading messages:', error)
        setError('Failed to load messages')
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [user, getUserMessages])

  const handleMessageClick = async (message) => {
    setSelectedMessage(message)
    setShowModal(true)
    
    // Mark as read if not already read
    if (!message.read) {
      try {
        await markMessageAsRead(message.id)
        // Update local state
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, read: true, status: 'read' } : msg
        ))
      } catch (error) {
        console.error('Error marking message as read:', error)
      }
    }
  }

  const handleResolveMessage = async (messageId) => {
    try {
      await markMessageAsResolved(messageId)
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'resolved' } : msg
      ))
      setShowModal(false)
    } catch (error) {
      console.error('Error resolving message:', error)
      setError('Failed to resolve message')
    }
  }

  const getMessageTypeColor = (type) => {
    const colors = {
      'agent_transfer': 'bg-green-100 text-green-800',
      'notification': 'bg-green-100 text-green-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'read': 'bg-green-100 text-green-800',
      'resolved': 'bg-green-100 text-green-800',
      'unread': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'normal': 'bg-gray-100 text-gray-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date'
    
    let date
    if (timestamp.toDate) {
      // Firestore timestamp
      date = timestamp.toDate()
    } else if (timestamp.seconds) {
      // Firestore timestamp object
      date = new Date(timestamp.seconds * 1000)
    } else {
      // Regular date
      date = new Date(timestamp)
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Loading messages...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Messages</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Message Center</h2>
            <p className="text-gray-600">Manage agent transfers and notifications</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{messages.length}</div>
            <div className="text-sm text-gray-500">Total Messages</div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📬</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-600">You'll receive notifications and agent transfers here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow ${
                !message.read ? 'border-l-4 border-green-500' : ''
              }`}
              onClick={() => handleMessageClick(message)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMessageTypeColor(message.type)}`}>
                      {message.type === 'agent_transfer' ? 'Agent Transfer' : 'Notification'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                      {message.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                      {message.priority}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {message.title || 'New Message'}
                  </h3>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {message.content || message.body}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(message.createdAt)}
                  </div>
                </div>
                
                {!message.read && (
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Message Detail Modal */}
      <AnimatePresence>
        {showModal && selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Message Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMessageTypeColor(selectedMessage.type)}`}>
                      {selectedMessage.type === 'agent_transfer' ? 'Agent Transfer' : 'Notification'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedMessage.status)}`}>
                      {selectedMessage.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedMessage.priority)}`}>
                      {selectedMessage.priority}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedMessage.title || 'Message'}
                    </h3>
                    <p className="text-gray-600">{selectedMessage.content || selectedMessage.body}</p>
                  </div>

                  {selectedMessage.originalMessage && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Original Message</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedMessage.originalMessage}</p>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Message Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Created:</strong> {formatDate(selectedMessage.createdAt)}</p>
                      <p><strong>Updated:</strong> {formatDate(selectedMessage.updatedAt)}</p>
                      <p><strong>Agent ID:</strong> {selectedMessage.agentId || 'N/A'}</p>
                      <p><strong>User ID:</strong> {selectedMessage.userId}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  {selectedMessage.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolveMessage(selectedMessage.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Mark as Resolved
                    </button>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MessageCenter

