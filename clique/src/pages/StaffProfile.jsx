import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useFirebase } from '../contexts/FirebaseContext'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const StaffProfile = () => {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    bio: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const { user } = useFirebase()

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Try to get profile from adminStaff collection first
      const staffRef = doc(db, 'adminStaff', user.uid)
      const staffDoc = await getDoc(staffRef)
      
      if (staffDoc.exists()) {
        const staffData = staffDoc.data()
        setProfile({
          fullName: staffData.fullName || user.displayName || '',
          email: staffData.email || user.email || '',
          phone: staffData.phone || '',
          department: staffData.department || '',
          position: staffData.position || '',
          bio: staffData.bio || ''
        })
      } else {
        // Fallback to user data
        setProfile({
          fullName: user.displayName || '',
          email: user.email || '',
          phone: '',
          department: '',
          position: '',
          bio: ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Update profile in adminStaff collection
      const staffRef = doc(db, 'adminStaff', user.uid)
      await updateDoc(staffRef, {
        fullName: profile.fullName,
        phone: profile.phone,
        department: profile.department,
        position: profile.position,
        bio: profile.bio,
        updatedAt: new Date(),
        updatedBy: user.uid
      })

      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">My Profile</h1>
        <p className="text-green-100">Manage your staff profile information</p>
      </div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
          <p className="text-sm text-gray-600">Update your personal and professional details</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                placeholder="Email address"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={profile.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your department"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <input
                type="text"
                name="position"
                value={profile.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your position"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Account Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
          <p className="text-sm text-gray-600">Your account details</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Role</span>
            <span className="text-sm text-green-800 capitalize bg-green-100 px-2 py-1 rounded-full">
              {user?.role || 'staff'}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">User ID</span>
            <span className="text-sm text-gray-500 font-mono">
              {user?.uid?.substring(0, 8)}...
            </span>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="text-sm font-medium text-gray-700">Member Since</span>
            <span className="text-sm text-gray-900">
              {user?.metadata?.creationTime ? 
                new Date(user.metadata.creationTime).toLocaleDateString() : 
                'Unknown'
              }
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StaffProfile
