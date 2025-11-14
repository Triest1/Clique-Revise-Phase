import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  getDoc,
  getDocs
} from 'firebase/firestore'
import { db } from './config'

export class StaffService {
  // Get conversations assigned to specific staff member
  static subscribeToAssignedConversations(callback, staffId) {
    if (!staffId) {
      callback([])
      return () => {}
    }

    const conversationsRef = collection(db, 'conversations')
    const assignedQuery = query(
      conversationsRef,
      where('assignedStaffId', '==', staffId)
    )
    
    return onSnapshot(assignedQuery, (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Sort conversations by lastMessageAt
      conversations.sort((a, b) => {
        const aTime = a.lastMessageAt?.toDate ? a.lastMessageAt.toDate() : new Date(a.lastMessageAt || 0)
        const bTime = b.lastMessageAt?.toDate ? b.lastMessageAt.toDate() : new Date(b.lastMessageAt || 0)
        return bTime - aTime
      })
      
      callback(conversations)
    }, (error) => {
      console.error('Error in assigned conversations subscription:', error)
      callback([])
    })
  }

  // Get unassigned conversations (for assignment)
  static subscribeToUnassignedConversations(callback) {
    const conversationsRef = collection(db, 'conversations')
    const unassignedQuery = query(
      conversationsRef,
      where('assignedStaffId', '==', null)
    )
    
    return onSnapshot(unassignedQuery, (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Sort conversations by createdAt
      conversations.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
        return bTime - aTime
      })
      
      callback(conversations)
    }, (error) => {
      console.error('Error in unassigned conversations subscription:', error)
      callback([])
    })
  }

  // Get messages for a specific conversation (filtered by current staff member)
  static subscribeToMessages(conversationId, callback, currentStaffId) {
    if (!conversationId) {
      callback([])
      return () => {}
    }

    const messagesRef = collection(db, 'messages')
    const q = query(
      messagesRef, 
      where('conversationId', '==', conversationId)
    )
    
    return onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Filter messages: show only user messages and messages from current staff member
      const filteredMessages = allMessages.filter(message => {
        // Always show user messages (not staff messages)
        if (!message.isStaffMessage) {
          return true
        }
        
        // For staff messages, only show if they're from the current staff member
        if (message.isStaffMessage && currentStaffId) {
          return message.senderId === currentStaffId
        }
        
        // If no currentStaffId provided, don't show any staff messages (fallback)
        return false
      })
      
      // Sort messages by timestamp locally
      filteredMessages.sort((a, b) => {
        const aTime = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0)
        const bTime = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0)
        return aTime - bTime
      })
      
      callback(filteredMessages)
    }, (error) => {
      console.error('StaffService: Error in message subscription:', error)
      callback([])
    })
  }

  // Send a message to a conversation
  static async sendMessage(conversationId, messageText, user) {
    try {
      const messagesRef = collection(db, 'messages')
      const messageDoc = await addDoc(messagesRef, {
        text: messageText,
        senderId: user.uid,
        senderName: user.displayName || 'Staff',
        senderRole: user.role,
        conversationId: conversationId,
        timestamp: serverTimestamp(),
        isStaffMessage: true
      })

      const conversationRef = doc(db, 'conversations', conversationId)
      const updateData = {
        lastMessageAt: serverTimestamp(),
        lastMessage: messageText,
        lastStaffMessage: messageText,
        lastStaffMessageAt: serverTimestamp()
      }

      // Only set status to 'active' if conversation is not 'done'
      const conversationDoc = await getDoc(conversationRef)
      if (conversationDoc.exists()) {
        const currentStatus = conversationDoc.data().status
        if (currentStatus !== 'done') {
          updateData.status = 'active'
        }
      } else {
        updateData.status = 'active'
      }

      await updateDoc(conversationRef, updateData)
      return messageDoc.id
    } catch (error) {
      console.error('StaffService: Error sending message:', error)
      throw error
    }
  }

  // Assign conversation to staff member
  static async assignConversation(conversationId, staffId, staffName) {
    try {
      const conversationRef = doc(db, 'conversations', conversationId)
      const updateData = {
        assignedStaffId: staffId,
        assignedStaffName: staffName,
        assignedAt: serverTimestamp(),
        status: 'active',
        updatedAt: serverTimestamp()
      }

      await updateDoc(conversationRef, updateData)
      
      // Send a system message indicating assignment
      const messagesRef = collection(db, 'messages')
      await addDoc(messagesRef, {
        text: `Conversation assigned to ${staffName}. You are now connected with a staff member.`,
        senderId: 'system',
        senderName: 'System',
        senderRole: 'system',
        conversationId: conversationId,
        timestamp: serverTimestamp(),
        isStaffMessage: false,
        isSystemMessage: true
      })

      return true
    } catch (error) {
      console.error('Error assigning conversation:', error)
      throw error
    }
  }

  // Unassign conversation from staff member
  static async unassignConversation(conversationId) {
    try {
      const conversationRef = doc(db, 'conversations', conversationId)
      const updateData = {
        assignedStaffId: null,
        assignedStaffName: null,
        assignedAt: null,
        status: 'pending',
        updatedAt: serverTimestamp()
      }

      await updateDoc(conversationRef, updateData)
      return true
    } catch (error) {
      console.error('Error unassigning conversation:', error)
      throw error
    }
  }

  // Update conversation status
  static async updateConversationStatus(conversationId, status) {
    try {
      const conversationRef = doc(db, 'conversations', conversationId)
      const updateData = {
        status: status,
        updatedAt: serverTimestamp()
      }

      if (status === 'resolved' || status === 'done') {
        updateData.resolvedAt = serverTimestamp()
        updateData.resolvedBy = 'staff'
      }

      await updateDoc(conversationRef, updateData)
    } catch (error) {
      console.error('Error updating conversation status:', error)
      throw error
    }
  }

  // Get recent conversations (for dashboard stats)
  static subscribeToRecentConversations(callback, limitCount = 10) {
    const conversationsRef = collection(db, 'conversations')
    const q = query(conversationsRef)
    
    return onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Sort and limit locally
      conversations.sort((a, b) => {
        const aTime = a.lastMessageAt?.toDate ? a.lastMessageAt.toDate() : new Date(a.lastMessageAt || 0)
        const bTime = b.lastMessageAt?.toDate ? b.lastMessageAt.toDate() : new Date(b.lastMessageAt || 0)
        return bTime - aTime
      })
      
      callback(conversations.slice(0, limitCount))
    }, (error) => {
      console.error('StaffService: Error in recent conversations subscription:', error)
      callback([])
    })
  }

}