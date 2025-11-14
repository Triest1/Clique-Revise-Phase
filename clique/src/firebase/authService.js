import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'
import { auth } from './config'

// Authentication service
export class AuthService {
  // Sign in with email and password
  static async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Store password temporarily for admin session restoration (only for admins)
      const userRole = await this.getUserRole(user.uid)
      if (userRole === 'admin') {
        sessionStorage.setItem('adminPassword', password)
      }
      
      // Get additional user data from Firestore if needed
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: userRole || 'staff'
      }
    } catch (error) {
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Sign out
  static async signOut() {
    try {
      await signOut(auth)
    } catch (error) {
      throw new Error('Failed to sign out')
    }
  }

  // Create new user (for admin use) - with session restoration
  static async createUser(email, password, displayName, role = 'staff') {
    try {
      // Store current admin credentials for restoration
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('No authenticated admin user found')
      }

      const adminEmail = currentUser.email
      const adminPassword = sessionStorage.getItem('adminPassword') // We'll store this temporarily

      // Create the new user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const newUser = userCredential.user
      
      // Update user profile
      await updateProfile(newUser, {
        displayName: displayName
      })

      // Store user data in Firestore
      await this.updateUserRole(newUser.uid, role)

      // Immediately restore admin session
      if (adminEmail && adminPassword) {
        await signOut(auth)
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword)
        sessionStorage.removeItem('adminPassword') // Clean up
      }

      return {
        uid: newUser.uid,
        email: newUser.email,
        displayName: displayName,
        role: role
      }
    } catch (error) {
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Direct user creation (fallback method)
  static async createUserDirect(email, password, displayName, role = 'staff') {
    try {
      // Create the new user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Update user profile
      await updateProfile(user, {
        displayName: displayName
      })

      // Store additional user data in Firestore
      await this.updateUserRole(user.uid, role)

      // Note: Firebase automatically signs in the newly created user
      // This is a limitation of Firebase Auth - only one user can be signed in at a time
      // The admin will be signed out, but the staff account is created successfully

      return {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: role
      }
    } catch (error) {
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Get user role from Firestore
  static async getUserRole(uid) {
    const { doc, getDoc } = await import('firebase/firestore')
    const { db } = await import('./config')

    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        return userDoc.data().role
      }
      return 'staff' // Default role
    } catch (error) {
      console.error('Error getting user role:', error)
      return 'staff' // Default role
    }
  }

  // Update user role in Firestore
  static async updateUserRole(uid, role) {
    const { doc, setDoc } = await import('firebase/firestore')
    const { db } = await import('./config')
    
    try {
      await setDoc(doc(db, 'users', uid), {
        role: role,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true })
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  // Get user role from Firestore
  static async getUserRole(uid) {
    const { doc, getDoc } = await import('firebase/firestore')
    const { db } = await import('./config')
    
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        return userDoc.data().role || 'admin'
      }
      return 'admin' // Default role
    } catch (error) {
      console.error('Error getting user role:', error)
      return 'admin'
    }
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user role from Firestore
        const role = await this.getUserRole(user.uid)
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: role
        }
        callback(userData)
      } else {
        callback(null)
      }
    })
  }

  // Get current user
  static getCurrentUser() {
    const user = auth.currentUser
    if (user) {
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: 'staff' // Default role, should be fetched from Firestore in real implementation
      }
    }
    return null
  }

  // Error message mapping
  static getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'No user found with this email address.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/user-disabled': 'This user account has been disabled.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/invalid-credential': 'Invalid credentials. Please check your email and password.'
    }
    return errorMessages[errorCode] || 'An error occurred during authentication.'
  }
}

