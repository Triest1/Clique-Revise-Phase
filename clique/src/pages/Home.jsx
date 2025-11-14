import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'

const Home = () => {
  const [content, setContent] = useState({
    announcements: 'Welcome to our barangay website! Stay updated with the latest community news and events.',
    aboutText: 'Our barangay is committed to serving the community with excellence and integrity. We provide various services and programs to improve the quality of life for all residents.',
    contactInfo: 'Barangay Hall\n123 Main Street\nCity, Province 1234\nPhone: (02) 123-4567\nEmail: info@barangay.gov.ph',
    footerText: '© 2024 Barangay Name. All rights reserved. | Privacy Policy | Terms of Service',
    heroTitle: 'Welcome to Our Barangay ',
    heroSubtitle: 'Building a stronger community together'
  })
  const previousContentRef = useRef(null)

  // Load content from Firebase, localStorage, and listen for real-time updates
  useEffect(() => {
    const loadContent = () => {
      // First, check URL parameters for content
      const urlParams = new URLSearchParams(window.location.search)
      const urlContent = urlParams.get('content')
      
      if (urlContent) {
        try {
          const decodedContent = decodeURIComponent(urlContent)
          const parsedContent = JSON.parse(decodedContent)
          setContent(parsedContent)
          previousContentRef.current = parsedContent
          // Content loaded from URL
          
          // Clean up URL after loading
          const newUrl = window.location.pathname
          window.history.replaceState({}, document.title, newUrl)
          return
        } catch (error) {
          console.error('Home: Error parsing URL content:', error)
        }
      }
      
      // Try localStorage first
      let storedContent = localStorage.getItem('adminContent')
      if (!storedContent) {
        // Try sessionStorage as backup
        storedContent = sessionStorage.getItem('adminContent')
        // localStorage not found, trying sessionStorage
      }
      
      if (storedContent) {
        const parsedContent = JSON.parse(storedContent)
        setContent(parsedContent)
        previousContentRef.current = parsedContent
        // Content loaded from storage
      } else {
        // No content found in storage or URL
      }
    }
    loadContent()

    // Set up real-time Firebase listener
    const contentDoc = doc(db, 'websiteContent', 'main')
    const unsubscribe = onSnapshot(contentDoc, (doc) => {
      if (doc.exists()) {
        const firebaseContent = doc.data()
        // Remove Firebase-specific fields
        const { lastUpdated, updatedBy, ...cleanContent } = firebaseContent
        
        // Only update if content has actually changed
        if (JSON.stringify(cleanContent) !== JSON.stringify(previousContentRef.current)) {
          // Firebase content updated
          setContent(cleanContent)
          previousContentRef.current = cleanContent
        }
      }
    }, (error) => {
      console.error('Home: Firebase listener error:', error)
    })

    // Listen for content updates from admin panel
    const handleContentUpdate = (event) => {
      // Content update event received
      setContent(event.detail)
      previousContentRef.current = event.detail
    }

    // Listen for cross-tab messages
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'CONTENT_UPDATED') {
        // Cross-tab message received
        setContent(event.data.content)
        previousContentRef.current = event.data.content
      }
    }

    window.addEventListener('contentUpdated', handleContentUpdate)
    window.addEventListener('message', handleMessage)
    
    // Fallback: Check localStorage every 5 seconds for updates (in case Firebase fails)
    const intervalId = setInterval(() => {
      let storedContent = localStorage.getItem('adminContent')
      if (!storedContent) {
        storedContent = sessionStorage.getItem('adminContent')
      }
      
      if (storedContent) {
        const parsedContent = JSON.parse(storedContent)
        // Only update if content has actually changed
        if (JSON.stringify(parsedContent) !== JSON.stringify(previousContentRef.current)) {
          // Content changed detected via polling
          setContent(parsedContent)
          previousContentRef.current = parsedContent
        }
      }
    }, 5000) // Increased to 5 seconds since Firebase is primary
    
    return () => {
      unsubscribe() // Clean up Firebase listener
      window.removeEventListener('contentUpdated', handleContentUpdate)
      window.removeEventListener('message', handleMessage)
      clearInterval(intervalId)
    }
  }, []) // Remove content dependency to prevent infinite loop
  const features = [
    {
      icon: "🏛️",
      title: "Barangay Services",
      description: "Access to official documents, permits, and community services"
    },
    {
      icon: "📅",
      title: "Community Events",
      description: "Stay updated with local events, meetings, and activities"
    },
    {
      icon: "🤝",
      title: "Community Support",
      description: "Get assistance with various barangay-related concerns"
    },
    {
      icon: "🤖",
      title: "AI Chatbot",
      description: "Quick and efficient in answering your questions"
    }
  ]

  const stats = [
    { number: "15,000+", label: "Residents" },
    { number: "20+", label: "Events/Year" },
    { number: "24/7", label: "Support" },
    { number: "100%", label: "Satisfaction" }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {content.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              {content.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/events"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                View Events
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </section>

      {/* Announcements Section */}
      {content.announcements && (
        <section className="py-16 bg-yellow-50 border-l-4 border-yellow-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Frequently Asked Questions on Documents</h2>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm max-w-4xl mx-auto">
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                  {content.announcements}
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      )}

    {/* Mission & Vision 
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              About Our Barangay
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto whitespace-pre-line">
              {content.aboutText}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl"
            >
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To provide efficient, transparent, and accessible public services that promote 
                community development, social welfare, and environmental sustainability while 
                fostering unity and cooperation among residents.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl"
            >
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To be a model barangay known for excellence in governance, community 
                engagement, and sustainable development, creating a vibrant and inclusive 
                environment where every resident can thrive and prosper.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      */}

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Barangay Offer
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive services and support for our community members
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Barangay Communal by the Numbers
            </h2>
            <p className="text-xl text-blue-100">
              Serving our community with dedication and excellence
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      {content.contactInfo && (
        <section className="py-20 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="bg-white p-8 rounded-lg shadow-sm max-w-4xl mx-auto">
                <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                  {content.contactInfo}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Quick Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Need Immediate Assistance?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get in touch with us directly through phone or email for urgent matters
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Call Us Now</h3>
              <p className="text-gray-600 mb-6">For urgent matters and immediate assistance</p>
              <Link 
                to="/contact" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +63 2 8XXX XXXX
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Send Email</h3>
              <p className="text-gray-600 mb-6">For inquiries and non-urgent matters</p>
              <Link 
                to="/contact" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Get Involved in Our Community
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join us in building a stronger, more vibrant barangay. Attend events, 
              participate in community programs, and help shape our future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/events"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                View Upcoming Events
              </Link>
              <Link
                to="/contact"
                className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors duration-200"
              >
                Contact Barangay Office
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
