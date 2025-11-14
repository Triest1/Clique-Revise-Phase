import { doc, setDoc, getDoc, collection, writeBatch } from 'firebase/firestore'
import { db } from './config'
import { AuthService } from './authService'

// Database initialization service
export class DatabaseInit {
  
  // Initialize the database for admin management
  static async initializeDatabase() {
    try {
      console.log('Initializing database for admin management...')
      
      // Create admin management collections
      await this.createAdminCollections()
      
      // Create admin management settings
      await this.createAdminSettings()
      
      // Create admin account with authentication
      await this.createAdminAccount()
      
      console.log('Admin management database initialization completed successfully')
      return true
    } catch (error) {
      console.error('Error initializing admin database:', error)
      throw new Error('Failed to initialize admin database')
    }
  }

  // Create admin management collections
  static async createAdminCollections() {
    try {
      const batch = writeBatch(db)
      
      // Create admin staff collection
      const staffRef = doc(collection(db, 'adminStaff'))
      batch.set(staffRef, {
        _placeholder: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Create admin queries collection
      const queriesRef = doc(collection(db, 'adminQueries'))
      batch.set(queriesRef, {
        _placeholder: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Create admin settings collection
      const settingsRef = doc(collection(db, 'adminSettings'))
      batch.set(settingsRef, {
        _placeholder: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Create contact messages collection
      const contactRef = doc(collection(db, 'contactMessages'))
      batch.set(contactRef, {
        _placeholder: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Commit the batch
      await batch.commit()
      console.log('Admin management collections created successfully')
      
    } catch (error) {
      console.error('Error creating admin collections:', error)
      throw error
    }
  }

  // Create admin management settings
  static async createAdminSettings() {
    try {
      // Create admin system settings
      await this.createAdminSystemSettings()
      
      // Create admin configuration
      await this.createAdminConfig()
      
      console.log('Admin management settings created successfully')
      
    } catch (error) {
      console.error('Error creating admin settings:', error)
      throw error
    }
  }

  // Create admin system settings
  static async createAdminSystemSettings() {
    try {
      const settingsRef = doc(db, 'admin', 'systemSettings')
      const settingsDoc = await getDoc(settingsRef)
      
      if (!settingsDoc.exists()) {
        await setDoc(settingsRef, {
          appName: 'Barangay Admin Management',
          version: '1.0.0',
          maintenanceMode: false,
          allowStaffRegistration: true,
          maxStaffMembers: 50,
          maxQueriesPerDay: 100,
          staffRoles: [
            'staff',
            'moderator',
            'admin'
          ],
          queryCategories: [
            'document',
            'complaint',
            'inquiry',
            'suggestion',
            'contact'
          ],
          queryPriorities: [
            'low',
            'medium',
            'high',
            'urgent'
          ],
          queryStatuses: [
            'pending',
            'responded',
            'resolved',
            'closed'
          ],
          staffDepartments: [
            'General Services',
            'Health Services',
            'Social Services',
            'Environmental Services',
            'Youth Development',
            'Senior Citizens Affairs',
            'Public Safety'
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        })
        console.log('Admin system settings document created')
      }
    } catch (error) {
      console.error('Error creating admin system settings:', error)
      throw error
    }
  }

  // Create admin account with Firebase Authentication
  static async createAdminAccount() {
    try {
      console.log('Creating admin account...')
      
      // Check if admin user already exists
      const adminRef = doc(db, 'users', 'admin')
      const adminDoc = await getDoc(adminRef)
      
      if (adminDoc.exists()) {
        console.log('Admin account already exists')
        return true
      }
      
      // Create admin user with Firebase Authentication
      const adminEmail = 'admin@barangay.local'
      const adminPassword = 'Admin123!'
      const adminDisplayName = 'System Administrator'
      
      try {
        // Create the authenticated user
        const userData = await AuthService.createUser(
          adminEmail, 
          adminPassword, 
          adminDisplayName, 
          'staff'
        )
        
        console.log('Admin user created successfully:', userData.uid)
        
        // Create admin user document in Firestore
        await setDoc(adminRef, {
          uid: userData.uid,
          role: 'admin',
          isActive: true,
          permissions: [
            'read_events',
            'write_events',
            'delete_events',
            'read_messages',
            'write_messages',
            'manage_users',
            'system_settings'
          ],
          profile: {
            displayName: adminDisplayName,
            email: adminEmail,
            phone: 'N/A'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        })
        
        console.log('Admin account created successfully')
        console.log('Admin credentials:')
        console.log('Email:', adminEmail)
        console.log('Password:', adminPassword)
        console.log('Please change the password after first login!')
        
        return true
        
      } catch (authError) {
        // If user already exists in Firebase Auth, just create the Firestore document
        if (authError.message.includes('email-already-in-use')) {
          console.log('Admin user already exists in Firebase Auth, creating Firestore document...')
          
        await setDoc(adminRef, {
            role: 'admin',
          isActive: true,
          permissions: [
            'read_events',
            'write_events',
            'delete_events',
            'read_messages',
            'write_messages',
            'manage_users',
            'system_settings'
          ],
          profile: {
              displayName: adminDisplayName,
              email: adminEmail,
            phone: 'N/A'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        })
          
          console.log('Admin Firestore document created successfully')
          return true
        } else {
          throw authError
        }
      }
      
    } catch (error) {
      console.error('Error creating admin account:', error)
      throw error
    }
  }

  // Create admin configuration
  static async createAdminConfig() {
    try {
      const configRef = doc(db, 'admin', 'config')
      const configDoc = await getDoc(configRef)
      
      if (!configDoc.exists()) {
        await setDoc(configRef, {
          features: {
            staffManagement: true,
            queryManagement: true,
            contactForm: true,
            notifications: true,
            realTimeUpdates: true,
            userAuthentication: true
          },
          limits: {
            maxFileSize: 5242880, // 5MB
            maxStaffPerDepartment: 10,
            maxQueriesPerDay: 100,
            sessionTimeout: 3600000 // 1 hour
          },
          ui: {
            theme: 'light',
            language: 'en',
            timezone: 'Asia/Manila',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h'
          },
          security: {
            requireAuth: true,
            allowGuestAccess: false,
            maxLoginAttempts: 5,
            lockoutDuration: 300000, // 5 minutes
            passwordPolicy: {
              minLength: 8,
              requireUppercase: true,
              requireLowercase: true,
              requireNumbers: true,
              requireSpecialChars: false
            }
          },
          notifications: {
            emailNotifications: true,
            realTimeUpdates: true,
            queryAlerts: true,
            staffUpdates: true
          },
          createdAt: new Date(),
          updatedAt: new Date()
        })
        console.log('Admin configuration created')
      }
    } catch (error) {
      console.error('Error creating admin configuration:', error)
      throw error
    }
  }

  // Check if database is initialized
  static async isDatabaseInitialized() {
    try {
      const settingsRef = doc(db, 'admin', 'systemSettings')
      const settingsDoc = await getDoc(settingsRef)
      return settingsDoc.exists()
    } catch (error) {
      console.error('Error checking database initialization:', error)
      return false
    }
  }

  // Reset database (use with caution)
  static async resetDatabase() {
    try {
      console.warn('Resetting database...')
      
      // This would typically involve deleting all documents
      // For safety, we'll just reinitialize
      await this.initializeDatabase()
      
      console.log('Database reset completed')
      return true
    } catch (error) {
      console.error('Error resetting database:', error)
      throw error
    }
  }

  // Get admin system settings
  static async getSystemSettings() {
    try {
      const settingsRef = doc(db, 'admin', 'systemSettings')
      const settingsDoc = await getDoc(settingsRef)
      
      if (settingsDoc.exists()) {
        return { id: settingsDoc.id, ...settingsDoc.data() }
      }
      return null
    } catch (error) {
      console.error('Error getting admin system settings:', error)
      throw error
    }
  }

  // Update admin system settings
  static async updateSystemSettings(updates) {
    try {
      const settingsRef = doc(db, 'admin', 'systemSettings')
      await setDoc(settingsRef, {
        ...updates,
        updatedAt: new Date()
      }, { merge: true })
      
      console.log('Admin system settings updated')
      return true
    } catch (error) {
      console.error('Error updating admin system settings:', error)
      throw error
    }
  }

  // Get admin configuration
  static async getAppConfig() {
    try {
      const configRef = doc(db, 'admin', 'config')
      const configDoc = await getDoc(configRef)
      
      if (configDoc.exists()) {
        return { id: configDoc.id, ...configDoc.data() }
      }
      return null
    } catch (error) {
      console.error('Error getting admin config:', error)
      throw error
    }
  }

  // Create sample admin data for testing (optional)
  static async createSampleData() {
    try {
      console.log('Creating sample admin data...')
      
      // Create sample staff members
      await this.createSampleStaff()
      
      // Create sample queries
      await this.createSampleQueries()
      
      console.log('Sample admin data created successfully')
      return true
    } catch (error) {
      console.error('Error creating sample admin data:', error)
      throw error
    }
  }

  // Create sample staff members
  static async createSampleStaff() {
    try {
      const sampleStaff = [
        {
          fullName: 'Maria Dela Cruz',
          email: 'maria.delacruz@barangay.gov.ph',
          phone: '+63 2 123-4568',
          role: 'admin',
          department: 'Health Services',
          position: 'Health Coordinator',
          status: 'active',
          dateAdded: new Date().toISOString()
        },
        {
          fullName: 'Pedro Garcia',
          email: 'pedro.garcia@barangay.gov.ph',
          phone: '+63 2 123-4569',
          role: 'admin',
          department: 'Environmental Services',
          position: 'Environment Officer',
          status: 'active',
          dateAdded: new Date().toISOString()
        },
        {
          fullName: 'Ana Rodriguez',
          email: 'ana.rodriguez@barangay.gov.ph',
          phone: '+63 2 123-4570',
          role: 'moderator',
          department: 'Social Services',
          position: 'Community Moderator',
          status: 'active',
          dateAdded: new Date().toISOString()
        }
      ]

      const batch = writeBatch(db)
      
      sampleStaff.forEach((staff, index) => {
        const staffRef = doc(collection(db, 'adminStaff'))
        batch.set(staffRef, {
          ...staff,
          id: Date.now() + index,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      })

      await batch.commit()
      console.log('Sample staff members created')
      
    } catch (error) {
      console.error('Error creating sample staff:', error)
      throw error
    }
  }

  // Create sample queries
  static async createSampleQueries() {
    try {
      const sampleQueries = [
        {
          name: 'Juan Dela Cruz',
          email: 'juan.delacruz@email.com',
          phone: '+63 912 345 6789',
          subject: 'Barangay Clearance Request',
          message: 'Good day! I would like to request a barangay clearance for my job application. When is the best time to visit the barangay hall?',
          date: new Date().toISOString(),
          status: 'pending',
          category: 'document',
          priority: 'medium',
          source: 'contact_form'
        },
        {
          name: 'Maria Santos',
          email: 'maria.santos@email.com',
          phone: '+63 917 123 4567',
          subject: 'Complaint about Street Lighting',
          message: 'The street lights in our area are not working properly. This is a safety concern especially at night. Can you please look into this matter?',
          date: new Date().toISOString(),
          status: 'pending',
          category: 'complaint',
          priority: 'high',
          source: 'contact_form'
        },
        {
          name: 'Pedro Garcia',
          email: 'pedro.garcia@email.com',
          phone: '+63 918 765 4321',
          subject: 'Event Participation Inquiry',
          message: 'I would like to participate in the upcoming community clean-up drive. What do I need to bring and what time should I arrive?',
          date: new Date().toISOString(),
          status: 'responded',
          category: 'inquiry',
          priority: 'low',
          source: 'contact_form',
          response: 'Thank you for your interest in participating in our community clean-up drive. Please bring your own cleaning materials, comfortable clothes, and water bottle. The event starts at 7:00 AM. We look forward to seeing you there!',
          responseDate: new Date().toISOString()
        }
      ]

      const batch = writeBatch(db)
      
      sampleQueries.forEach((query, index) => {
        const queryRef = doc(collection(db, 'adminQueries'))
        batch.set(queryRef, {
          ...query,
          id: Date.now() + index,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      })

      await batch.commit()
      console.log('Sample queries created')
      
    } catch (error) {
      console.error('Error creating sample queries:', error)
      throw error
    }
  }
}

