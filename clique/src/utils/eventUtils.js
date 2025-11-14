// Utility functions for event management

/**
 * Updates event status based on current date
 * @param {Array} events - Array of events
 * @returns {Array} - Updated events with correct status
 */
export const updateEventStatuses = (events) => {
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison

  return events.map(event => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison
    
    // If event date is in the past, mark as 'past', otherwise 'upcoming'
    const newStatus = eventDate < currentDate ? 'past' : 'upcoming'
    
    return {
      ...event,
      status: newStatus
    }
  })
}

/**
 * Filters events by status
 * @param {Array} events - Array of events
 * @param {string} status - Status to filter by ('upcoming', 'past', or 'all')
 * @returns {Array} - Filtered events
 */
export const filterEventsByStatus = (events, status) => {
  if (status === 'all') return events
  return events.filter(event => event.status === status)
}

/**
 * Checks if an event is upcoming
 * @param {Object} event - Event object
 * @returns {boolean} - True if event is upcoming
 */
export const isEventUpcoming = (event) => {
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  const eventDate = new Date(event.date)
  eventDate.setHours(0, 0, 0, 0)
  
  return eventDate >= currentDate
}

/**
 * Gets events that need status updates
 * @param {Array} events - Array of events
 * @returns {Array} - Events that need status updates
 */
export const getEventsNeedingStatusUpdate = (events) => {
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  return events.filter(event => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    
    // Event needs update if status doesn't match date
    const shouldBeUpcoming = eventDate >= currentDate
    const isCurrentlyUpcoming = event.status === 'upcoming'
    
    return shouldBeUpcoming !== isCurrentlyUpcoming
  })
}

/**
 * Formats date for display
 * @param {string} dateString - Date string
 * @returns {string} - Formatted date
 */
export const formatEventDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Gets relative time description for event
 * @param {string} dateString - Date string
 * @returns {string} - Relative time description
 */
export const getEventRelativeTime = (dateString) => {
  const eventDate = new Date(dateString)
  const currentDate = new Date()
  const diffTime = eventDate - currentDate
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return 'Past event'
  } else if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Tomorrow'
  } else if (diffDays <= 7) {
    return `In ${diffDays} days`
  } else {
    return `In ${Math.ceil(diffDays / 7)} weeks`
  }
}
