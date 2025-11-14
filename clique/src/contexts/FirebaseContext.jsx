import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService } from '../firebase/authService'
import { FirestoreService } from '../firebase/firestoreService'
import { MessagingService } from '../firebase/messagingService'
import { DatabaseInit } from '../firebase/databaseInit'

const FirebaseContext = createContext()

export const useFirebase = () => {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider')
  }
  return context
}

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [messages, setMessages] = useState([])
  const [databaseInitialized, setDatabaseInitialized] = useState(false)

  // Initialize Firebase services
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Check if database is initialized
        const isInitialized = await DatabaseInit.isDatabaseInitialized()
        setDatabaseInitialized(isInitialized)
        
        // Initialize messaging service
        await MessagingService.initialize()
        
        // Set up auth state listener
        const unsubscribe = AuthService.onAuthStateChanged((userData) => {
          setUser(userData)
          setLoading(false)
        })

        return unsubscribe
      } catch (error) {
        console.error('Error initializing Firebase:', error)
        setLoading(false)
      }
    }

    const cleanup = initializeFirebase()
    return () => {
      cleanup.then(unsubscribe => unsubscribe && unsubscribe())
    }
  }, [])

  // Set up real-time events listener (for all users, not just authenticated)
  useEffect(() => {
    const unsubscribe = FirestoreService.subscribeToEvents((eventsData) => {
      setEvents(eventsData)
    })

    return unsubscribe
  }, [])

  // Set up real-time messages listener
  useEffect(() => {
    if (user) {
      const unsubscribe = FirestoreService.subscribeToMessages(user.uid, (messagesData) => {
        setMessages(messagesData)
      })

      return unsubscribe
    }
  }, [user])

  // Authentication methods
  const signIn = async (email, password) => {
    try {
      const userData = await AuthService.signIn(email, password)
      return userData
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      await AuthService.signOut()
      setUser(null)
      setEvents([])
      setMessages([])
    } catch (error) {
      throw error
    }
  }

  const createUser = async (email, password, displayName, role) => {
    try {
      const userData = await AuthService.createUser(email, password, displayName, role)
      return userData
    } catch (error) {
      throw error
    }
  }

  // Events methods
  const createEvent = async (eventData) => {
    try {
      const newEvent = await FirestoreService.createEvent(eventData)
      return newEvent
    } catch (error) {
      throw error
    }
  }

  const updateEvent = async (eventId, eventData) => {
    try {
      const updatedEvent = await FirestoreService.updateEvent(eventId, eventData)
      return updatedEvent
    } catch (error) {
      throw error
    }
  }

  const deleteEvent = async (eventId) => {
    try {
      await FirestoreService.deleteEvent(eventId)
      return true
    } catch (error) {
      throw error
    }
  }

  const getEvents = async () => {
    try {
      const eventsData = await FirestoreService.getEvents()
      return eventsData
    } catch (error) {
      throw error
    }
  }

  const getEventsByCategory = async (category) => {
    try {
      const eventsData = await FirestoreService.getEventsByCategory(category)
      return eventsData
    } catch (error) {
      throw error
    }
  }

  const searchEvents = async (searchTerm) => {
    try {
      const eventsData = await FirestoreService.searchEvents(searchTerm)
      return eventsData
    } catch (error) {
      throw error
    }
  }

  // Messaging methods
  const sendMessageToAgent = async (agentId, messageData) => {
    try {
      const message = await MessagingService.sendMessageToAgent(agentId, messageData)
      return message
    } catch (error) {
      throw error
    }
  }

  const sendNotification = async (userId, notificationData) => {
    try {
      const notification = await MessagingService.sendNotificationToUser(userId, notificationData)
      return notification
    } catch (error) {
      throw error
    }
  }

  const getUserMessages = async (userId) => {
    try {
      const userMessages = await MessagingService.getUserMessages(userId)
      return userMessages
    } catch (error) {
      throw error
    }
  }

  const markMessageAsRead = async (messageId) => {
    try {
      await MessagingService.markMessageAsRead(messageId)
      return true
    } catch (error) {
      throw error
    }
  }

  const markMessageAsResolved = async (messageId) => {
    try {
      await MessagingService.markMessageAsResolved(messageId)
      return true
    } catch (error) {
      throw error
    }
  }

  const getUnreadMessageCount = async (userId) => {
    try {
      const count = await MessagingService.getUnreadMessageCount(userId)
      return count
    } catch (error) {
      throw error
    }
  }

  // Database initialization methods
  const initializeDatabase = async () => {
    try {
      await DatabaseInit.initializeDatabase()
      setDatabaseInitialized(true)
      return true
    } catch (error) {
      throw error
    }
  }

  const createSampleData = async () => {
    try {
      await DatabaseInit.createSampleData()
      return true
    } catch (error) {
      throw error
    }
  }

  const getSystemSettings = async () => {
    try {
      const settings = await DatabaseInit.getSystemSettings()
      return settings
    } catch (error) {
      throw error
    }
  }

  const getAppConfig = async () => {
    try {
      const config = await DatabaseInit.getAppConfig()
      return config
    } catch (error) {
      throw error
    }
  }

  const value = {
    // State
    user,
    loading,
    events,
    messages,
    databaseInitialized,
    
    // Authentication
    signIn,
    signOut,
    createUser,
    
    // Events
    createEvent,
    updateEvent,
    deleteEvent,
    getEvents,
    getEventsByCategory,
    searchEvents,
    
    // Messaging
    sendMessageToAgent,
    sendNotification,
    getUserMessages,
    markMessageAsRead,
    markMessageAsResolved,
    getUnreadMessageCount,
    
    // Database Management
    initializeDatabase,
    createSampleData,
    getSystemSettings,
    getAppConfig
  }

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  )
}
