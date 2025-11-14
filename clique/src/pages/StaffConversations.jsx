import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFirebase } from '../contexts/FirebaseContext'
import { StaffService } from '../firebase/staffService'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

const StaffConversations = () => {
  const [assignedConversations, setAssignedConversations] = useState([])
  const [unassignedConversations, setUnassignedConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState('assigned') // 'assigned' or 'unassigned'
  const { user } = useFirebase()

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    // Load assigned conversations
    const unsubscribeAssigned = StaffService.subscribeToAssignedConversations((conversations) => {
      setAssignedConversations(conversations)
      setLoading(false)
      
      // Update selectedConversation if it exists in the updated conversations
      if (selectedConversation) {
        const updatedConversation = conversations.find(conv => conv.id === selectedConversation.id)
        if (updatedConversation) {
          setSelectedConversation(updatedConversation)
        }
      }
    }, user.uid)

    // Load unassigned conversations
    const unsubscribeUnassigned = StaffService.subscribeToUnassignedConversations((conversations) => {
      setUnassignedConversations(conversations)
    })

    // Fallback: If no conversations are loaded after 5 seconds, show a message
    const fallbackTimer = setTimeout(() => {
      if (assignedConversations.length === 0 && unassignedConversations.length === 0) {
        setLoading(false)
      }
    }, 5000)

    return () => {
      clearTimeout(fallbackTimer)
      unsubscribeAssigned()
      unsubscribeUnassigned()
    }
  }, [refreshKey, user?.uid])

  useEffect(() => {
    if (!selectedConversation?.id) {
      setMessages([])
      return
    }

    const unsubscribeMessages = StaffService.subscribeToMessages(
      selectedConversation.id, 
      (messages) => {
        setMessages(messages)
        setLastMessageCount(messages.length)
      },
      user?.uid // Pass current staff member's ID for filtering
    )

    return () => unsubscribeMessages()
  }, [selectedConversation?.id, user?.uid])


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return
    
    // Prevent sending messages if conversation is done
    if (selectedConversation.status === 'done') {
      console.log('Cannot send message: conversation is done')
      return
    }

    setSending(true)
    try {
      await StaffService.sendMessage(selectedConversation.id, newMessage, user)
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAssignConversation = async (conversationId) => {
    try {
      setIsRefreshing(true)
      
      const staffId = user.uid
      const staffName = user.displayName || user.email || 'Staff'
      
      await StaffService.assignConversation(conversationId, staffId, staffName)
      
      // Wait a moment for database update to propagate
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Force refresh both conversation lists
      setRefreshKey(prev => prev + 1)
      
      // Switch to assigned tab to show the newly assigned conversation
      setActiveTab('assigned')
      
    } catch (error) {
      console.error('Error assigning conversation:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now'
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (error) {
      return 'Unknown time'
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-gray-100 text-gray-800',
      done: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                <p className="text-sm text-gray-600">Manage user conversations</p>
              </div>
              <div className="flex items-center space-x-2">
                {isRefreshing && (
                  <span className="text-xs text-green-600 px-2 py-1 bg-green-100 rounded">
                    Syncing...
                  </span>
                )}
                <button
                  onClick={forceRefresh}
                  className="text-xs text-blue-600 px-2 py-1 bg-blue-100 rounded hover:bg-blue-200"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('assigned')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'assigned'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Conversations ({assignedConversations.length})
              </button>
              <button
                onClick={() => setActiveTab('unassigned')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'unassigned'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Available to Assign ({unassignedConversations.length})
              </button>
            </div>
          </div>
          
          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
              </div>
            ) : (() => {
              // Show conversations based on active tab
              const currentConversations = activeTab === 'assigned' ? assignedConversations : unassignedConversations
              return currentConversations.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {currentConversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-green-50 border-r-2 border-green-500' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{conversation.userName || 'Anonymous'}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                          {conversation.status}
                        </span>
                        {activeTab === 'unassigned' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAssignConversation(conversation.id)
                            }}
                            disabled={isRefreshing}
                            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isRefreshing ? 'Assigning...' : 'Assign'}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{conversation.lastMessage}</p>
                    <p className="text-xs text-gray-500">{formatTime(conversation.lastMessageAt)}</p>
                    {activeTab === 'assigned' && conversation.assignedStaffName && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Assigned to you
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {activeTab === 'assigned' ? 'No assigned conversations' : 'No available conversations'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'assigned' 
                    ? 'You have no conversations assigned to you yet.' 
                    : 'No unassigned conversations available for assignment.'
                  }
                </p>
              </div>
            )
            })()}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{selectedConversation.userName || 'Anonymous'}</h3>
                  <p className="text-sm text-gray-600">Started {formatTime(selectedConversation.createdAt)}</p>
                  <p className="text-xs text-green-600 mt-1">
                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Assigned to you - private conversation
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedConversation.status)}`}>
                    {selectedConversation.status}
                  </span>
                  {selectedConversation.status !== 'done' && (
                    <button
                      onClick={async () => {
                        if (selectedConversation?.id) {
                          try {
                            setIsRefreshing(true)
                            
                            // Update conversation status to done
                            await StaffService.updateConversationStatus(selectedConversation.id, 'done')
                            
                            // Send a system message indicating session ended
                            await StaffService.sendMessage(
                              selectedConversation.id, 
                              'Session ended by staff. You can now continue chatting with our AI assistant.', 
                              user
                            )
                            
                            // Refresh the conversation list to update the UI
                            setRefreshKey(prev => prev + 1)
                            
                            // Update the selected conversation status locally
                            setSelectedConversation(prev => ({
                              ...prev,
                              status: 'done'
                            }))
                            
                            console.log('Session ended for conversation:', selectedConversation.id)
                          } catch (error) {
                            console.error('Error ending session:', error)
                          } finally {
                            setIsRefreshing(false)
                          }
                        }
                      }}
                      disabled={isRefreshing}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRefreshing ? 'Ending...' : 'End Session'}
                    </button>
                  )}
                  {selectedConversation.status === 'done' && (
                    <span className="px-3 py-1 bg-gray-500 text-white text-xs rounded-full">
                      Session Ended
                    </span>
                  )}
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

              {/* Messages Area - Fixed Height with Scroll */}
              <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isStaffMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isStaffMessage 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.isStaffMessage ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {message.isStaffMessage ? message.senderName : 'User'} • {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Start the conversation by sending a message.</p>
                    <p className="mt-2 text-xs text-blue-600">
                      <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Only your messages and user messages are visible
                    </p>
                  </div>
                )}
              </div>
            </div>

              {/* Message Input - Fixed at Bottom */}
              <div className="p-4 border-t border-gray-200 flex-shrink-0">
              {selectedConversation.status === 'done' ? (
                <div className="text-center py-4">
                  <div className="text-gray-500 text-sm">
                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-medium">Session Ended</p>
                    <p className="text-xs">This conversation has been resolved and closed.</p>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending || selectedConversation.status === 'done'}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
          </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Select a conversation</h3>
              <p className="mt-1 text-sm text-gray-500">Choose a conversation from the list to start chatting.</p>
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StaffConversations
