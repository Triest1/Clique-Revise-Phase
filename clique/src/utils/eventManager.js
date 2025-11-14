// Global event manager for cross-component communication

class EventManager {
  constructor() {
    this.listeners = new Map()
  }

  // Subscribe to an event
  subscribe(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set())
    }
    this.listeners.get(eventName).add(callback)
    
    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(eventName)
      if (eventListeners) {
        eventListeners.delete(callback)
        if (eventListeners.size === 0) {
          this.listeners.delete(eventName)
        }
      }
    }
  }

  // Emit an event
  emit(eventName, data) {
    const eventListeners = this.listeners.get(eventName)
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
        }
      })
    }
  }

  // Remove all listeners for an event
  removeAllListeners(eventName) {
    this.listeners.delete(eventName)
  }

  // Remove all listeners
  clear() {
    this.listeners.clear()
  }
}

// Create a singleton instance
const eventManager = new EventManager()

export default eventManager
