import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const AdminContentManagement = () => {
  const [content, setContent] = useState({
    announcements: '',
    aboutText: '',
    contactInfo: '',
    footerText: '',
    heroTitle: '',
    heroSubtitle: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load content from Firebase and localStorage on component mount
  useEffect(() => {
    const loadContent = async () => {
      try {
        // Try Firebase first
        const contentDoc = doc(db, 'websiteContent', 'main')
        const docSnap = await getDoc(contentDoc)
        
        if (docSnap.exists()) {
          const firebaseContent = docSnap.data()
          // Remove Firebase-specific fields
          const { lastUpdated, updatedBy, ...cleanContent } = firebaseContent
          setContent(cleanContent)
          // Content loaded from Firebase
          return
        }
      } catch (error) {
        console.error('Error loading from Firebase:', error)
      }
      
      // Fallback to localStorage
      const storedContent = localStorage.getItem('adminContent')
      if (storedContent) {
        setContent(JSON.parse(storedContent))
        // Content loaded from localStorage
      } else {
        // Initialize with default content
        const defaultContent = {
          announcements: 'Welcome to our barangay website! Stay updated with the latest community news and events.',
          aboutText: 'Our barangay is committed to serving the community with excellence and integrity. We provide various services and programs to improve the quality of life for all residents.',
          contactInfo: 'Barangay Hall\n123 Main Street\nCity, Province 1234\nPhone: (02) 123-4567\nEmail: info@barangay.gov.ph',
          footerText: '© 2024 Barangay Name. All rights reserved. | Privacy Policy | Terms of Service',
          heroTitle: 'Welcome to Our Barangay',
          heroSubtitle: 'Building a stronger community together'
        }
        setContent(defaultContent)
      }
    }

    loadContent()
  }, [])

  const handleInputChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Save to Firebase Firestore for real-time sync
      const contentDoc = doc(db, 'websiteContent', 'main')
      await setDoc(contentDoc, {
        ...content,
        lastUpdated: new Date(),
        updatedBy: 'admin'
      })
      
      // Content saved to Firebase
      
      // Also save to localStorage as backup
      localStorage.setItem('adminContent', JSON.stringify(content))
      sessionStorage.setItem('adminContent', JSON.stringify(content))
      
      // Trigger a custom event to notify other components
      const event = new CustomEvent('contentUpdated', { detail: content })
      window.dispatchEvent(event)
      
      // Also try to broadcast to other windows/tabs
      try {
        window.postMessage({
          type: 'CONTENT_UPDATED',
          content: content
        }, '*')
      } catch (error) {
        console.error('postMessage failed:', error)
      }
      
      // Trigger events for real-time updates
      
      setIsSaving(false)
      setSaveSuccess(true)
      setIsEditing(false)
      
      setTimeout(() => setSaveSuccess(false), 3000)
      
    } catch (error) {
      console.error('Error saving content to Firebase:', error)
      
      // Fallback to localStorage if Firebase fails
      localStorage.setItem('adminContent', JSON.stringify(content))
      sessionStorage.setItem('adminContent', JSON.stringify(content))
      
      setIsSaving(false)
      setSaveSuccess(true)
      setIsEditing(false)
      
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const handleCancel = () => {
    // Reload from localStorage to discard changes
    const storedContent = localStorage.getItem('adminContent')
    if (storedContent) {
      setContent(JSON.parse(storedContent))
    }
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h1>
          <p className="text-gray-600">Update website content, announcements, and information</p>
        </div>

        {/* Success Notification */}
        <AnimatePresence>
          {saveSuccess && (
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
                <span>Content saved successfully!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Website Content</h2>
              <p className="text-sm text-gray-600">Manage the main content displayed on the website</p>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Content</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Title
                </label>
                <input
                  type="text"
                  value={content.heroTitle}
                  onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={content.heroSubtitle}
                  onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </motion.div>

          {/* Announcements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Announcements</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                FAQ Text
              </label>
              <textarea
                value={content.announcements}
                onChange={(e) => handleInputChange('announcements', e.target.value)}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter announcement text..."
              />
            </div>
          </motion.div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About Section</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About Text
              </label>
              <textarea
                value={content.aboutText}
                onChange={(e) => handleInputChange('aboutText', e.target.value)}
                disabled={!isEditing}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter about text..."
              />
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Details
              </label>
              <textarea
                value={content.contactInfo}
                onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                disabled={!isEditing}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter contact information..."
              />
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Footer</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer Text
              </label>
              <input
                type="text"
                value={content.footerText}
                onChange={(e) => handleInputChange('footerText', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter footer text..."
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AdminContentManagement
