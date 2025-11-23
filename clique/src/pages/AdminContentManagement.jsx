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
    heroSubtitle: '',
    // About page fields
    aboutOurBarangay: '',
    ourVision: '',
    byTheNumbersResidents: '15,000+',
    byTheNumbersYearsOfService: '25+',
    byTheNumbersCommunityPrograms: '50+',
    byTheNumbersCommitment: '100%',
    getInTouchVisitUs: 'Purok 2, Communal Rd, Buhangin District\nBarangay Communal, Davao City',
    getInTouchCallUs: '+63 2 8XXX XXXX\nMon-Fri: 8:00 AM - 5:00 PM',
    getInTouchEmailUs: 'newbarangaycommunal84@gmail.com\nWe\'ll respond within 24 hours',
    // Contact page fields
    contactGetInTouchVisitUs: 'Purok 2, Communal Rd, Buhangin District\nBarangay Communal, Davao City',
    contactGetInTouchCallUs: '+63 2 8XXX XXXX\nMon-Fri: 8:00 AM - 5:00 PM',
    contactGetInTouchEmailUs: 'newbarangaycommunal84@gmail.com\nWe\'ll respond within 24 hours',
    contactFacebook: 'https://www.facebook.com/barangay.communal.5',
    contactOfficeHours: 'Everyday: 8:00 AM - 5:00 PM'
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
          heroSubtitle: 'Building a stronger community together',
          // About page defaults
          aboutOurBarangay: 'Our barangay is committed to serving the community with excellence and integrity. We provide various services and programs to improve the quality of life for all residents.',
          ourVision: 'To be a model barangay that exemplifies excellence in local governance, community development, and citizen participation, creating a vibrant, inclusive, and sustainable community for all residents.',
          byTheNumbersResidents: '15,000+',
          byTheNumbersYearsOfService: '25+',
          byTheNumbersCommunityPrograms: '50+',
          byTheNumbersCommitment: '100%',
          getInTouchVisitUs: 'Purok 2, Communal Rd, Buhangin District\nBarangay Communal, Davao City',
          getInTouchCallUs: '+63 2 8XXX XXXX\nMon-Fri: 8:00 AM - 5:00 PM',
          getInTouchEmailUs: 'newbarangaycommunal84@gmail.com\nWe\'ll respond within 24 hours',
          // Contact page defaults
          contactGetInTouchVisitUs: 'Purok 2, Communal Rd, Buhangin District\nBarangay Communal, Davao City',
          contactGetInTouchCallUs: '+63 2 8XXX XXXX\nMon-Fri: 8:00 AM - 5:00 PM',
          contactGetInTouchEmailUs: 'newbarangaycommunal84@gmail.com\nWe\'ll respond within 24 hours',
          contactFacebook: 'https://www.facebook.com/barangay.communal.5',
          contactOfficeHours: 'Everyday: 8:00 AM - 5:00 PM'
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
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
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

          {/* About Page Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-green-500"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">About Page Content</h3>
            
            <div className="space-y-6">
              {/* About Our Barangay */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Our Barangay
                </label>
                <textarea
                  value={content.aboutOurBarangay || ''}
                  onChange={(e) => handleInputChange('aboutOurBarangay', e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter about our barangay text..."
                />
              </div>

              {/* Our Vision */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Our Vision
                </label>
                <textarea
                  value={content.ourVision || ''}
                  onChange={(e) => handleInputChange('ourVision', e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter vision text..."
                />
              </div>

              {/* By The Numbers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  By The Numbers
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Residents
                    </label>
                    <input
                      type="text"
                      value={content.byTheNumbersResidents || ''}
                      onChange={(e) => handleInputChange('byTheNumbersResidents', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="15,000+"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Years of Service
                    </label>
                    <input
                      type="text"
                      value={content.byTheNumbersYearsOfService || ''}
                      onChange={(e) => handleInputChange('byTheNumbersYearsOfService', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="25+"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Community Programs
                    </label>
                    <input
                      type="text"
                      value={content.byTheNumbersCommunityPrograms || ''}
                      onChange={(e) => handleInputChange('byTheNumbersCommunityPrograms', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="50+"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Commitment
                    </label>
                    <input
                      type="text"
                      value={content.byTheNumbersCommitment || ''}
                      onChange={(e) => handleInputChange('byTheNumbersCommitment', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="100%"
                    />
                  </div>
                </div>
              </div>

              {/* Get In Touch - Visit Us */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adress
                </label>
                <textarea
                  value={content.getInTouchVisitUs || ''}
                  onChange={(e) => handleInputChange('getInTouchVisitUs', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter visit us information..."
                />
              </div>

              {/* Get In Touch - Call Us */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone 
                </label>
                <textarea
                  value={content.getInTouchCallUs || ''}
                  onChange={(e) => handleInputChange('getInTouchCallUs', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter call us information..."
                />
              </div>

              {/* Get In Touch - Email Us */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <textarea
                  value={content.getInTouchEmailUs || ''}
                  onChange={(e) => handleInputChange('getInTouchEmailUs', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter email us information..."
                />
              </div>
            </div>
          </motion.div>

          {/* Contact Page Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-green-500"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Page Content</h3>
            
            <div className="space-y-6">
              {/* Get In Touch - Visit Us */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adress
                </label>
                <textarea
                  value={content.contactGetInTouchVisitUs || ''}
                  onChange={(e) => handleInputChange('contactGetInTouchVisitUs', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter visit us information..."
                />
              </div>

              {/* Get In Touch - Call Us */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <textarea
                  value={content.contactGetInTouchCallUs || ''}
                  onChange={(e) => handleInputChange('contactGetInTouchCallUs', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter call us information..."
                />
              </div>

               {/* Facebook */}
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  type="text"
                  value={content.contactFacebook || ''}
                  onChange={(e) => handleInputChange('contactFacebook', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter Facebook URL or text..."
                />
              </div>

              {/* Get In Touch - Email Us */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <textarea
                  value={content.contactGetInTouchEmailUs || ''}
                  onChange={(e) => handleInputChange('contactGetInTouchEmailUs', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter email us information..."
                />
              </div>

              {/* Office Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Office Hours
                </label>
                <textarea
                  value={content.contactOfficeHours || ''}
                  onChange={(e) => handleInputChange('contactOfficeHours', e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter office hours..."
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AdminContentManagement
