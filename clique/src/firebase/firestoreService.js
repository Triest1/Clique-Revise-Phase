import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  orderBy, 
  where, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './config'

// Firestore service for events management
export class FirestoreService {
  // Events collection
  static eventsCollection = 'events'
  static messagesCollection = 'messages'
  static usersCollection = 'users'

  // Create a new event
  static async createEvent(eventData) {
    try {
      // Ensure the events collection exists
      await this.ensureCollectionExists(this.eventsCollection)
      
      const eventWithTimestamp = {
        ...eventData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
        // Don't override manually selected status - let the admin choose
      }
      
      const docRef = await addDoc(collection(db, this.eventsCollection), eventWithTimestamp)
      return { id: docRef.id, ...eventWithTimestamp }
    } catch (error) {
      console.error('Error creating event:', error)
      throw new Error('Failed to create event')
    }
  }

  // Get all events
  static async getEvents() {
    try {
      const eventsQuery = query(
        collection(db, this.eventsCollection),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(eventsQuery)
      const events = []
      
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() })
      })
      
      return events
    } catch (error) {
      console.error('Error getting events:', error)
      throw new Error('Failed to fetch events')
    }
  }

  // Get event by ID
  static async getEventById(eventId) {
    try {
      const eventDoc = await getDoc(doc(db, this.eventsCollection, eventId))
      if (eventDoc.exists()) {
        return { id: eventDoc.id, ...eventDoc.data() }
      }
      return null
    } catch (error) {
      console.error('Error getting event:', error)
      throw new Error('Failed to fetch event')
    }
  }

  // Update event
  static async updateEvent(eventId, eventData) {
    try {
      const eventRef = doc(db, this.eventsCollection, eventId)
      const updatedData = {
        ...eventData,
        updatedAt: serverTimestamp()
        // Don't override manually selected status - let the admin choose
      }
      
      await updateDoc(eventRef, updatedData)
      return { id: eventId, ...updatedData }
    } catch (error) {
      console.error('Error updating event:', error)
      throw new Error('Failed to update event')
    }
  }

  // Delete event
  static async deleteEvent(eventId) {
    try {
      await deleteDoc(doc(db, this.eventsCollection, eventId))
      return true
    } catch (error) {
      console.error('Error deleting event:', error)
      throw new Error('Failed to delete event')
    }
  }

  // Get events by category
  static async getEventsByCategory(category) {
    try {
      const eventsQuery = query(
        collection(db, this.eventsCollection),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(eventsQuery)
      const events = []
      
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() })
      })
      
      return events
    } catch (error) {
      console.error('Error getting events by category:', error)
      throw new Error('Failed to fetch events by category')
    }
  }

  // Get upcoming events
  static async getUpcomingEvents() {
    try {
      const eventsQuery = query(
        collection(db, this.eventsCollection),
        where('status', '==', 'upcoming'),
        orderBy('date', 'asc')
      )
      
      const querySnapshot = await getDocs(eventsQuery)
      const events = []
      
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() })
      })
      
      return events
    } catch (error) {
      console.error('Error getting upcoming events:', error)
      throw new Error('Failed to fetch upcoming events')
    }
  }

  // Real-time events listener
  static subscribeToEvents(callback) {
    const eventsQuery = query(
      collection(db, this.eventsCollection),
      orderBy('createdAt', 'desc')
    )
    
    return onSnapshot(eventsQuery, (querySnapshot) => {
      const events = []
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() })
      })
      callback(events)
    }, (error) => {
      console.error('FirestoreService: Error in events subscription:', error)
      callback([])
    })
  }

  // Create a message (for agent transfers)
  static async createMessage(messageData) {
    try {
      // Ensure the messages collection exists
      await this.ensureCollectionExists(this.messagesCollection)
      
      const messageWithTimestamp = {
        ...messageData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: messageData.status || 'pending'
      }
      
      const docRef = await addDoc(collection(db, this.messagesCollection), messageWithTimestamp)
      return { id: docRef.id, ...messageWithTimestamp }
    } catch (error) {
      console.error('Error creating message:', error)
      throw new Error('Failed to create message')
    }
  }

  // Get messages for a user
  static async getMessages(userId) {
    try {
      const messagesQuery = query(
        collection(db, this.messagesCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(messagesQuery)
      const messages = []
      
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() })
      })
      
      return messages
    } catch (error) {
      console.error('Error getting messages:', error)
      throw new Error('Failed to fetch messages')
    }
  }

  // Update message status
  static async updateMessageStatus(messageId, status) {
    try {
      const messageRef = doc(db, this.messagesCollection, messageId)
      await updateDoc(messageRef, {
        status: status,
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error('Error updating message status:', error)
      throw new Error('Failed to update message status')
    }
  }

  // Real-time messages listener
  static subscribeToMessages(userId, callback) {
    const messagesQuery = query(
      collection(db, this.messagesCollection),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    return onSnapshot(messagesQuery, (querySnapshot) => {
      const messages = []
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() })
      })
      callback(messages)
    })
  }

  // Calculate event status based on date (utility function for manual use)
  static calculateEventStatus(eventDate) {
    const today = new Date()
    const eventDateTime = new Date(eventDate)
    
    // Set time to end of day for comparison
    today.setHours(23, 59, 59, 999)
    eventDateTime.setHours(23, 59, 59, 999)
    
    return eventDateTime >= today ? 'upcoming' : 'past'
  }

  // Bulk update event statuses based on dates (optional utility for admins)
  static async updateEventStatusesByDate() {
    try {
      const events = await this.getEvents()
      const updates = []
      
      for (const event of events) {
        const calculatedStatus = this.calculateEventStatus(event.date)
        if (event.status !== calculatedStatus) {
          updates.push({
            id: event.id,
            status: calculatedStatus,
            updatedAt: serverTimestamp()
          })
        }
      }
      
      // Apply updates
      for (const update of updates) {
        const eventRef = doc(db, this.eventsCollection, update.id)
        await updateDoc(eventRef, {
          status: update.status,
          updatedAt: update.updatedAt
        })
      }
      
      return { updated: updates.length, events: updates }
    } catch (error) {
      console.error('Error updating event statuses:', error)
      throw new Error('Failed to update event statuses')
    }
  }

  // Search events
  static async searchEvents(searchTerm) {
    try {
      const events = await this.getEvents()
      return events.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } catch (error) {
      console.error('Error searching events:', error)
      throw new Error('Failed to search events')
    }
  }

  // Ensure collection exists by creating a placeholder document
  static async ensureCollectionExists(collectionName) {
    try {
      // Try to get a document from the collection
      const testQuery = query(collection(db, collectionName), orderBy('createdAt', 'desc'))
      const testSnapshot = await getDocs(testQuery)
      
      // If collection is empty, create a placeholder document
      if (testSnapshot.empty) {
        const placeholderRef = doc(collection(db, collectionName))
        await setDoc(placeholderRef, {
          _placeholder: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        
        // Delete the placeholder document immediately
        await deleteDoc(placeholderRef)
        
        console.log(`Collection '${collectionName}' initialized`)
      }
    } catch (error) {
      console.error(`Error ensuring collection '${collectionName}' exists:`, error)
      // Don't throw error here as it might be a permissions issue
      // The actual operation will handle the error
    }
  }

  // Initialize collections with default structure
  static async initializeCollections() {
    try {
      await this.ensureCollectionExists(this.eventsCollection)
      await this.ensureCollectionExists(this.messagesCollection)
      await this.ensureCollectionExists(this.usersCollection)
      console.log('All collections initialized')
    } catch (error) {
      console.error('Error initializing collections:', error)
      throw error
    }
  }
}
