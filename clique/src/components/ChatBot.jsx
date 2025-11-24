import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatMessage from './ChatMessage'
import LoadingDots from './LoadingDots'
import { collection, addDoc, serverTimestamp, doc, updateDoc, onSnapshot, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import aiDatasetService from '../services/aiDatasetService'
import communalLogo from '../assets/communal-logo.png'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I am the Commu-Bot. I\'m here to help you with information about our barangay services, including:\n\n• Barangay Clearance\n• Indigency Certificates\n• Permits\n• Health and Emergency Services\n• Office Hours\n• Event Information\n• Live Chat with Agent\n• And much more!\n\nHow can I assist you today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationState, setConversationState] = useState('initial')
  const [forwardedQueries, setForwardedQueries] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [isStaffChat, setIsStaffChat] = useState(false)
  const [userName, setUserName] = useState('')
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Initialize AI dataset service
  useEffect(() => {
    const initializeAI = async () => {
      try {
        await aiDatasetService.loadDataset()
        console.log('AI dataset service initialized')
        
        // Run comprehensive test
        await aiDatasetService.testDataset()
        
        // Test greeting detection
        console.log('=== TESTING GREETING DETECTION ===')
        const testGreetings = [
          'hi',
          'hello',
          'hey',
          'hi there',
          'hello there',
          'hey there',
          'hello hello',
          'hi hi',
          'hello hello there',
          'hi there everyone',
          'good morning',
          'good afternoon',
          'good evening'
        ]
        
        testGreetings.forEach(greeting => {
          const result = isEssentialQuery(greeting)
          console.log(`"${greeting}" -> ${result.isEssential ? '✅ GREETING' : '❌ NOT GREETING'}`)
        })
        console.log('=== END GREETING TEST ===')
        
        // Test the dataset with a sample query
        const testResponse = await aiDatasetService.findBestResponse('How do I get a barangay clearance?')
        if (testResponse) {
          console.log('✅ Dataset test successful:', testResponse['Intent'])
        } else {
          console.log('❌ Dataset test failed - no response found')
        }
      } catch (error) {
        console.error('Failed to initialize AI dataset service:', error)
      }
    }
    
    initializeAI()
  }, [])


  // Listen for all messages in current conversation
  useEffect(() => {
    if (currentConversationId) {
      console.log('Setting up message subscription for conversation:', currentConversationId) // Debug log
      
      const messagesRef = collection(db, 'messages')
      
      // Try with orderBy first
      const q = query(
        messagesRef,
        where('conversationId', '==', currentConversationId),
        orderBy('timestamp', 'asc')
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firebaseMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        console.log('Firebase messages received:', firebaseMessages) // Debug log

        // Convert Firebase messages to chat format
        const chatMessages = firebaseMessages.map(msg => ({
          id: msg.id,
          type: msg.isStaffMessage ? 'staff' : 'user',
          content: msg.text,
          timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(),
          senderName: msg.senderName,
          isStaffMessage: msg.isStaffMessage
        }))

        // Sort messages by timestamp locally
        chatMessages.sort((a, b) => a.timestamp - b.timestamp)

        console.log('Converted chat messages:', chatMessages) // Debug log

        // Always update messages when we have a conversation
        setMessages(prev => {
          console.log('Previous messages:', prev.length, 'New messages:', chatMessages.length) // Debug log
          setLastMessageCount(chatMessages.length)
          
          // Check if session was ended by staff
          const lastMessage = chatMessages[chatMessages.length - 1]
          if (lastMessage && lastMessage.content && lastMessage.content.includes('Session ended by staff')) {
            console.log('Session ended by staff, returning to AI mode')
            setIsStaffChat(false)
            setCurrentConversationId(null)
            setLastMessageCount(0)
          }
          
          return chatMessages
        })
      }, (error) => {
        console.error('Error in message subscription with orderBy:', error) // Debug log
        
        // Fallback: try without orderBy
        console.log('ChatBot: Trying fallback query without orderBy')
        const qFallback = query(
          messagesRef,
          where('conversationId', '==', currentConversationId)
        )
        
        return onSnapshot(qFallback, (snapshot) => {
          const firebaseMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))

          console.log('Firebase messages received (fallback):', firebaseMessages) // Debug log

          // Convert Firebase messages to chat format
          const chatMessages = firebaseMessages.map(msg => ({
            id: msg.id,
            type: msg.isStaffMessage ? 'staff' : 'user',
            content: msg.text,
            timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(),
            senderName: msg.senderName,
            isStaffMessage: msg.isStaffMessage
          }))

          // Sort messages by timestamp locally
          chatMessages.sort((a, b) => a.timestamp - b.timestamp)

          console.log('Converted chat messages (fallback):', chatMessages) // Debug log

          // Always update messages when we have a conversation
          setMessages(prev => {
            console.log('Previous messages (fallback):', prev.length, 'New messages:', chatMessages.length) // Debug log
            setLastMessageCount(chatMessages.length)
            
            // Check if session was ended by staff
            const lastMessage = chatMessages[chatMessages.length - 1]
            if (lastMessage && lastMessage.content && lastMessage.content.includes('Session ended by staff')) {
              console.log('Session ended by staff, returning to AI mode (fallback)')
              setIsStaffChat(false)
              setCurrentConversationId(null)
              setLastMessageCount(0)
            }
            
            return chatMessages
          })
        }, (fallbackError) => {
          console.error('Error in fallback message subscription:', fallbackError) // Debug log
          setMessages([])
        })
      })

      return () => {
        console.log('Unsubscribing from messages') // Debug log
        unsubscribe()
      }
    }
  }, [currentConversationId])

  // Auto-refresh mechanism for staff chat
  useEffect(() => {
    if (isStaffChat && currentConversationId) {
      console.log('Setting up auto-refresh for staff chat')
      
      const refreshInterval = setInterval(async () => {
        console.log('Auto-refreshing messages...')
        setIsRefreshing(true)
        
        try {
          const messagesRef = collection(db, 'messages')
          
          // Try with orderBy first
          let q = query(
            messagesRef,
            where('conversationId', '==', currentConversationId),
            orderBy('timestamp', 'asc')
          )
          
          let snapshot = await getDocs(q)
          let firebaseMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          
          // If no messages found with orderBy, try without orderBy
          if (firebaseMessages.length === 0) {
            console.log('Auto-refresh: No messages with orderBy, trying without orderBy')
            q = query(messagesRef, where('conversationId', '==', currentConversationId))
            snapshot = await getDocs(q)
            firebaseMessages = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
          }
          
          console.log('Auto-refresh found messages:', firebaseMessages.length)
          
          if (firebaseMessages.length !== lastMessageCount) {
            console.log('Message count changed, updating...')
            const chatMessages = firebaseMessages.map(msg => ({
              id: msg.id,
              type: msg.isStaffMessage ? 'staff' : 'user',
              content: msg.text,
              timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(),
              senderName: msg.senderName,
              isStaffMessage: msg.isStaffMessage
            }))
            
            // Sort messages by timestamp locally
            chatMessages.sort((a, b) => a.timestamp - b.timestamp)
            
            // Check if session was ended by staff
            const lastMessage = chatMessages[chatMessages.length - 1]
            if (lastMessage && lastMessage.content && lastMessage.content.includes('Session ended by staff')) {
              console.log('Session ended by staff, returning to AI mode (auto-refresh)')
              setIsStaffChat(false)
              setCurrentConversationId(null)
              setLastMessageCount(0)
            }
            
            setMessages(chatMessages)
            setLastMessageCount(firebaseMessages.length)
          }
        } catch (error) {
          console.error('Auto-refresh error:', error)
        } finally {
          setIsRefreshing(false)
        }
      }, 3000) // Refresh every 3 seconds
      
      return () => {
        console.log('Clearing auto-refresh interval')
        clearInterval(refreshInterval)
      }
    }
  }, [isStaffChat, currentConversationId, lastMessageCount])

  // Essential queries that the chatbot can handle (only greetings and very general queries)
  const essentialQueries = {
    'greeting': {
      keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'howdy'],
      response: 'Hello! I am the Commu-bot. I\'m here to help you with information about our barangay services, including:\n\n• Barangay Clearance\n• Indigency Certificates\n• Permits\n• Health and Emergency Services\n• Office Hours\n• Event Information\n• Live Chat with Agent\n• And much more!\n\nHow can I assist you today?',
      category: 'greeting'
    },
    'help': {
      keywords: ['help', 'what can you do', 'what do you do', 'assist', 'guide'],
      response: 'I can help you with information on several barangay documents and services:\n\n• Barangay Clearance\n• Certificate of Residency\n• Indigency Certificate\n• Permits\n• Office Hours\n• Location\n• Health and Emergency Services\n• Event Information\n• Live Chat with Agent\n\nWhich document or service do you need help with?',
      category: 'general_info'
    },
    'office_hours': {
      keywords: ['office hours', 'hours', 'open', 'close', 'time', 'schedule'],
      response: 'Our barangay office is open 24/7, 8:00 AM to 5:00 PM. For urgent matters, you can contact our emergency hotline.',
      category: 'general_info'
    },
    'closing_remarks': {
      keywords: ['thanks', 'thank you', 'thankyou', 'okay', 'ok', 'noted', 'alright', 'great', 'cool', 'got it, ty, tys, thank u'],
      response: 'Great! If you want more assistance just enter Hi/Help!',
      category: 'general_info'
    }
  }

  // Check if a query is essential and can be handled by the chatbot
  const isEssentialQuery = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase().trim()
    
    for (const [key, query] of Object.entries(essentialQueries)) {
      // Special handling for greetings - check for exact matches or common variations
      if (key === 'greeting') {
        // More flexible greeting patterns
        const greetingPatterns = [
          /^(hi|hello|hey)$/,  // Simple greetings
          /^(hi|hello|hey)\s+(there|everyone|all|guys|folks)$/,  // Greetings with "there"
          /^(good\s+(morning|afternoon|evening))$/,  // Time-based greetings
          /^(greetings?|howdy)$/,  // Formal greetings
          /^(hi|hello|hey)\s+(hi|hello|hey)/,  // Repeated greetings like "hello hello"
          /^(hi|hello|hey)\s+(hi|hello|hey)\s+(there|everyone|all)$/,  // Repeated greetings with "there"
          /^(hi|hello|hey)\s+(there|everyone|all)\s+(hi|hello|hey)$/,  // Greetings with "there" in middle
        ]
        
        if (greetingPatterns.some(pattern => pattern.test(lowerMessage))) {
          console.log('✅ Greeting detected:', lowerMessage)
          return { isEssential: true, query: key, response: query.response, category: query.category }
        }
        
        // Additional check: if message starts with greeting words and is short
        const greetingWords = ['hi', 'hello', 'hey']
        const words = lowerMessage.split(/\s+/)
        if (words.length <= 4 && greetingWords.some(word => words.includes(word))) {
          console.log('✅ Short greeting detected:', lowerMessage)
          return { isEssential: true, query: key, response: query.response, category: query.category }
        }
      }
      
      // Regular keyword matching for other queries
      if (query.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return { isEssential: true, query: key, response: query.response, category: query.category }
      }
    }
    
    return { isEssential: false, query: null, response: null, category: null }
  }

  // Create a new conversation with staff
  const createStaffConversation = async (userMessage, userName) => {
    try {
      console.log('Creating staff conversation for user:', userName) // Debug log
      
      const conversationRef = collection(db, 'conversations')
      const conversationDoc = await addDoc(conversationRef, {
        userName: userName || 'Anonymous',
        status: 'pending',
        lastMessage: userMessage,
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        userAgent: navigator.userAgent,
        ipAddress: 'N/A', // Would be captured by backend in production
        assignedStaffId: null, // Explicitly set to null to ensure unassigned
        assignedStaffName: null
      })

      console.log('Created conversation with ID:', conversationDoc.id) // Debug log
      return conversationDoc.id
    } catch (error) {
      console.error('Error creating conversation:', error)
      return null
    }
  }

  // Send user message to staff conversation
  const sendMessageToStaff = async (messageText, conversationId) => {
    try {
      console.log('Sending message to staff:', messageText, 'conversationId:', conversationId) // Debug log
      
      const messagesRef = collection(db, 'messages')
      const messageDoc = await addDoc(messagesRef, {
        text: messageText,
        senderId: 'user',
        senderName: userName || 'Anonymous',
        senderRole: 'user',
        conversationId: conversationId,
        timestamp: serverTimestamp(),
        isStaffMessage: false,
        isRead: false
      })

      console.log('Message sent successfully:', messageDoc.id) // Debug log

      // Update conversation last message
      const conversationRef = doc(db, 'conversations', conversationId)
      await updateDoc(conversationRef, {
        lastMessage: messageText,
        lastMessageAt: serverTimestamp(),
        status: 'pending'
      })

      console.log('Conversation updated successfully') // Debug log
    } catch (error) {
      console.error('Error sending message to staff:', error)
    }
  }

  // Log forwarded queries for admin review
  const logForwardedQuery = (userMessage, timestamp) => {
    const forwardedQuery = {
      id: Date.now(),
      query: userMessage,
      timestamp: timestamp,
      status: 'pending',
      userAgent: navigator.userAgent,
      ipAddress: 'N/A' // Would be captured by backend in production
    }
    
    setForwardedQueries(prev => [...prev, forwardedQuery])
    
    // In production, this would be sent to backend/database
    
    // Store in localStorage for demo purposes
    const stored = JSON.parse(localStorage.getItem('forwardedQueries') || '[]')
    stored.push(forwardedQuery)
    localStorage.setItem('forwardedQueries', JSON.stringify(stored))
  }

  // Placeholder AI response function - now with essential query filtering and staff escalation
  const fetchAIResponse = async (userMessage) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
    
    // FIRST PRIORITY: Check for greetings and essential queries
    const queryCheck = isEssentialQuery(userMessage)
    
    if (queryCheck.isEssential) {
      console.log('✅ Using essential query response:', queryCheck.category)
      // Handle essential queries
      if (queryCheck.category === 'document_requirements') {
        setConversationState('collecting_name')
      }
      return queryCheck.response
    }
    
    // SECOND PRIORITY: Try to find response in AI dataset
    try {
      console.log('🔍 Searching AI dataset for:', userMessage)
      const datasetResponse = await aiDatasetService.findBestResponse(userMessage)
      
      if (datasetResponse) {
        console.log('✅ Found dataset response:', datasetResponse['Intent'])
        console.log('📝 Response:', datasetResponse['Response'])
        return datasetResponse['Response']
    } else {
        console.log('❌ No dataset response found for:', userMessage)
      }
    } catch (error) {
      console.error('Error searching AI dataset:', error)
    }

    // If no dataset response found, provide helpful fallback
    console.log('⚠️ No specific response found, using fallback')
    return `I understand your question about "${userMessage}", but I don't have specific information about that topic in my database. 

You can:
• Try rephrasing your question
• Ask about barangay documents (clearance, certificates, etc.)
• Click "Chat with Agent" below to speak with our staff team
• Visit our office during business hours

How else can I help you today?`
  }

  // Function to manually connect to staff
  const connectToStaff = async () => {
    if (isStaffChat) return // Already connected
    
    setIsLoading(true)
    try {
      // Create conversation with staff
      const conversationId = await createStaffConversation('User requested to chat with agent', userName)
      console.log('Created conversation with ID:', conversationId)
      
      if (conversationId) {
        setCurrentConversationId(conversationId)
        setIsStaffChat(true)
        
        // Send initial message to staff
        await sendMessageToStaff('User requested to chat with agent', conversationId)
        
        // Add welcome message
        const welcomeMessage = {
          id: Date.now(),
          type: 'bot',
          content: 'Great! I\'ve connected you with our staff team. They\'ll be with you shortly to help with your inquiry.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, welcomeMessage])
      }
    } catch (error) {
      console.error('Error connecting to staff:', error)
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: 'Sorry, I couldn\'t connect you with our staff right now. Please try again later or visit our office.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    // Only add user message to local state if not in staff chat (Firebase will handle it)
    if (!isStaffChat) {
    setMessages(prev => [...prev, userMessage])
    }
    
    setInputMessage('')
    setIsLoading(true)

    try {
      if (isStaffChat) {
        // In staff chat mode, send message directly to staff
        await sendMessageToStaff(inputMessage.trim(), currentConversationId)
        
        // Don't add confirmation message - Firebase subscription will handle it
      } else {
        // Regular AI response
      const aiResponse = await fetchAIResponse(inputMessage.trim())
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'I apologize, but I\'m experiencing some technical difficulties. Please try again in a moment.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle mobile keyboard events
  const handleInputFocus = () => {
    // Scroll to bottom when input is focused on mobile
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  // Prevent zoom on input focus (iOS)
  const handleInputTouch = (e) => {
    if (e.target.tagName === 'INPUT') {
      e.target.style.fontSize = '16px'
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center touch-manipulation"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </motion.button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-20 right-4 left-4 sm:bottom-24 sm:right-6 sm:left-auto sm:w-96 h-[70vh] sm:h-[500px] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 sm:p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0 p-1">
                    <img 
                      src={communalLogo} 
                      alt="Barangay Communal Logo" 
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base truncate">
                      {isStaffChat ? 'Live Staff Support' : 'Commu-Bot Assistant'}
                    </h3>
                    <p className="text-green-100 text-xs sm:text-sm truncate">
                      {isStaffChat ? 'Chatting with our staff team' : 'Your smart guide to barangay services'}
                    </p>
                  </div>
                </div>
                
                {/* Mobile Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="sm:hidden w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {isStaffChat && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-100">Connected to staff</span>
                </div>
              )}
              {!isStaffChat && (
                <div className="mt-2 sm:mt-3">
                  <button
                    onClick={connectToStaff}
                    disabled={isLoading}
                    className="w-full bg-white/20 hover:bg-white/30 active:bg-white/40 text-white text-xs sm:text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="truncate">{isLoading ? 'Connecting...' : 'Chat with Agent'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 bg-gray-50">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChatMessage message={message} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="message-bubble bot-message">
                    <LoadingDots />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={handleInputFocus}
                  onTouchStart={handleInputTouch}
                  placeholder="Type your message..."
                  className="input-field flex-1 text-sm sm:text-base"
                  disabled={isLoading}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="send-button touch-manipulation"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatBot


