import { FirestoreService } from './firestoreService'

// Firestore-based messaging service for web application
export class MessagingService {

  // Send message to agent (for transfer notifications)
  static async sendMessageToAgent(agentId, messageData) {
    try {
      const message = {
        type: 'agent_transfer',
        agentId: agentId,
        userId: messageData.userId,
        content: messageData.content,
        originalMessage: messageData.originalMessage,
        priority: messageData.priority || 'normal',
        status: 'pending',
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'chatbot_transfer'
        }
      }

      return await FirestoreService.createMessage(message)
    } catch (error) {
      console.error('Error sending message to agent:', error)
      throw new Error('Failed to send message to agent')
    }
  }

  // Send notification to user
  static async sendNotificationToUser(userId, notificationData) {
    try {
      const notification = {
        type: 'notification',
        userId: userId,
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
        priority: notificationData.priority || 'normal',
        status: 'unread',
        read: false,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'system'
        }
      }

      return await FirestoreService.createMessage(notification)
    } catch (error) {
      console.error('Error sending notification:', error)
      throw new Error('Failed to send notification')
    }
  }

  // Get messages for a specific user
  static async getUserMessages(userId) {
    try {
      return await FirestoreService.getMessages(userId)
    } catch (error) {
      console.error('Error getting user messages:', error)
      throw new Error('Failed to get user messages')
    }
  }

  // Mark message as read
  static async markMessageAsRead(messageId) {
    try {
      return await FirestoreService.updateMessageStatus(messageId, 'read')
    } catch (error) {
      console.error('Error marking message as read:', error)
      throw new Error('Failed to mark message as read')
    }
  }

  // Mark message as resolved
  static async markMessageAsResolved(messageId) {
    try {
      return await FirestoreService.updateMessageStatus(messageId, 'resolved')
    } catch (error) {
      console.error('Error marking message as resolved:', error)
      throw new Error('Failed to mark message as resolved')
    }
  }

  // Subscribe to real-time messages for a user
  static subscribeToUserMessages(userId, callback) {
    try {
      return FirestoreService.subscribeToMessages(userId, callback)
    } catch (error) {
      console.error('Error subscribing to user messages:', error)
      throw new Error('Failed to subscribe to user messages')
    }
  }

  // Get unread message count for a user
  static async getUnreadMessageCount(userId) {
    try {
      const messages = await this.getUserMessages(userId)
      return messages.filter(message => !message.read && message.status !== 'resolved').length
    } catch (error) {
      console.error('Error getting unread message count:', error)
      return 0
    }
  }

  // Initialize messaging service (no-op for Firestore-based messaging)
  static async initialize() {
    console.log('Firestore-based messaging service initialized')
    return true
  }
}
