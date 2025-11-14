import React from 'react'
import { motion } from 'framer-motion'

const ChatMessage = ({ message }) => {
  const isUser = message.type === 'user'
  const isStaff = message.type === 'staff'
  const formattedTime = message.timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  // Format message content with line breaks for bot/staff messages
  const formatContent = (content) => {
    if (isUser) return content
    
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ))
  }

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-1`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`message-bubble ${isUser ? 'user-message' : isStaff ? 'staff-message' : 'bot-message'}`}>
        <div className="text-xs sm:text-sm leading-relaxed">
          {formatContent(message.content)}
        </div>
        <div className={`text-xs mt-1 sm:mt-2 ${isUser ? 'text-blue-100' : isStaff ? 'text-green-100' : 'text-gray-500'}`}>
          {isStaff && message.senderName ? `${message.senderName} • ` : ''}{formattedTime}
        </div>
      </div>
    </motion.div>
  )
}

export default ChatMessage



