import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFirebase } from '../contexts/FirebaseContext'

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())
  const [showUpdateNotification, setShowUpdateNotification] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const { events, searchEvents } = useFirebase()

  // Load events on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true)
        setError('')
        // Events are automatically loaded via Firebase context
        setLastUpdateTime(Date.now())
      } catch (error) {
        console.error('Error loading events:', error)
        setError('Failed to load events. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [events]) // Add events as dependency to re-run when events change

  // Handle search functionality
  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      return
    }

    try {
      setIsUpdating(true)
      const searchResults = await searchEvents(searchTerm)
      setLastUpdateTime(Date.now())
      setShowUpdateNotification(true)
      setTimeout(() => setShowUpdateNotification(false), 3000)
    } catch (error) {
      console.error('Error searching events:', error)
      setError('Failed to search events. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const categories = [
    { id: 'all', label: 'All Events', count: events.length },
    { id: 'upcoming', label: 'Upcoming', count: events.filter(e => e.status === 'upcoming').length },
    { id: 'past', label: 'Past Events', count: events.filter(e => e.status === 'past').length },
    { id: 'meeting', label: 'Meetings', count: events.filter(e => e.category === 'meeting').length },
    { id: 'community', label: 'Community', count: events.filter(e => e.category === 'community').length },
    { id: 'health', label: 'Health', count: events.filter(e => e.category === 'health').length },
    { id: 'youth', label: 'Youth', count: events.filter(e => e.category === 'youth').length },
    { id: 'senior', label: 'Senior Citizens', count: events.filter(e => e.category === 'senior').length },
    { id: 'environment', label: 'Environment', count: events.filter(e => e.category === 'environment').length }
  ]

  const filteredEvents = events.filter(event => {
    // Handle status filtering (upcoming/past)
    let matchesCategory = true
    if (selectedCategory === 'upcoming' || selectedCategory === 'past') {
      matchesCategory = event.status === selectedCategory
    } else if (selectedCategory !== 'all') {
      matchesCategory = event.category === selectedCategory
    }
    
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryColor = (category) => {
    const colors = {
      meeting: 'bg-green-100 text-green-800',
      community: 'bg-green-100 text-green-800',
      health: 'bg-red-100 text-red-800',
      youth: 'bg-purple-100 text-purple-800',
      senior: 'bg-yellow-100 text-yellow-800',
      environment: 'bg-emerald-100 text-emerald-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const handleViewEvent = (event) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const getStatusColor = (status) => {
    return status === 'upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status) => {
    return status === 'upcoming' ? 'Upcoming' : 'Past Event'
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading events...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Events</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Update Notification */}
        <AnimatePresence>
          {showUpdateNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Events updated successfully!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Event Announcements
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
                Stay informed about upcoming and past barangay events, meetings, and community activities. 
                View event details, schedules, and important information.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6">
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className={`w-2 h-2 rounded-full ${isUpdating ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span>{isUpdating ? 'Updating...' : 'Live Updates'}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(lastUpdateTime).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border-l-4 border-green-400 p-4 max-w-2xl mx-auto">
            <div className="flex items-center text-green-700">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">
                <strong>Announcement Board:</strong> View event information and details. For event management, 
                please contact the barangay office or use the admin portal.
              </span>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => handleViewEvent(event)}
            >
              {/* Event Image */}
              <div className="h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center relative">
                {event.banner ? (
                  <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">{event.image}</span>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {getStatusText(event.status)}
                  </span>
                </div>

                {/* Category Badge */}
                <div className="absolute bottom-3 left-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                    {categories.find(c => c.id === event.category)?.label}
                  </span>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-6">
                {/* Event Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {event.title}
                </h3>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-sm">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{event.venue}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {event.description}
                </p>

                {/* Additional Info */}
                {event.additionalInfo && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Additional Information:</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{event.additionalInfo}</p>
                  </div>
                )}

                {/* Contact Information */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    <p><strong>Organizer:</strong> {event.organizer}</p>
                    <p><strong>Contact:</strong> {event.contactPerson}</p>
                  </div>
                </div>

                {/* View Details Button */}
                <div className="mt-4">
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Events Message */}
        {filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </motion.div>
        )}
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {showEventModal && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEventModal(false)}
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
                  <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Event Image */}
                <div className="mb-6">
                  <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {selectedEvent.banner ? (
                      <img src={selectedEvent.banner} alt={selectedEvent.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-8xl">{selectedEvent.image}</span>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedEvent.status)}`}>
                        {getStatusText(selectedEvent.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h3>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedEvent.category)}`}>
                        {categories.find(c => c.id === selectedEvent.category)?.label}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div>
                        <p className="font-medium">Date</p>
                        <p className="text-sm">{formatDate(selectedEvent.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">Time</p>
                        <p className="text-sm">{selectedEvent.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600 md:col-span-2">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">Venue</p>
                        <p className="text-sm">{selectedEvent.venue}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{selectedEvent.description}</p>
                  </div>

                  {selectedEvent.additionalInfo && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Additional Information</h4>
                      <p className="text-gray-600">{selectedEvent.additionalInfo}</p>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <p><strong>Organizer:</strong> {selectedEvent.organizer}</p>
                      <p><strong>Contact Person:</strong> {selectedEvent.contactPerson}</p>
                      <p><strong>Phone:</strong> {selectedEvent.contactPhone}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
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

export default Events
