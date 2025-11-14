# Firebase Setup Guide

This guide will help you set up Firebase for the Barangay Chatbot project with authentication, Firestore database, and messaging capabilities.

## Prerequisites

- Node.js installed
- Firebase account
- Basic knowledge of React and Firebase

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "barangay-chatbot")
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to "Authentication" > "Sign-in method"
2. Enable "Email/Password" provider
3. Optionally enable other providers (Google, Facebook, etc.)

## Step 3: Create Firestore Database

1. Go to "Firestore Database" in Firebase Console
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

## Step 4: Skip Cloud Messaging (Not Needed)

Since this is a web application, we'll use Firestore for messaging instead of Cloud Messaging. No additional setup is required for messaging.

## Step 5: Get Firebase Configuration

1. Go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" > Web app (</>) icon
4. Register your app with a nickname
5. Copy the Firebase configuration object

## Step 6: Update Configuration Files

### Update `src/firebase/config.js`

Replace the placeholder configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
}
```

### No Additional Configuration Needed

The messaging service is now Firestore-based and doesn't require additional configuration.

## Step 7: Database Initialization

The application will automatically initialize the database with default collections and settings when first accessed. However, you can also manually initialize it:

1. **Automatic Initialization**: The app will show a database setup notification if collections don't exist
2. **Manual Initialization**: Use the database management methods in the Firebase context
3. **Sample Data**: Optionally create sample events and messages for testing

## Step 8: Set Up Firestore Security Rules

Go to "Firestore Database" > "Rules" and update with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events collection - readable by all, writable by authenticated users
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Messages collection - readable/writable by authenticated users only
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Users collection - readable/writable by authenticated users only
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // System collection - readable by authenticated users, writable by staff only
    match /system/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['staff', 'moderator'];
    }
  }
}
```

## Step 9: Create Initial Admin User

You can create an admin user through the Firebase Console:

1. Go to "Authentication" > "Users"
2. Click "Add user"
3. Enter email and password
4. Go to "Firestore Database" > "Data"
5. Create a new document in "users" collection
6. Use the user's UID as document ID
7. Add fields:
   - `role: "staff"` or `role: "moderator"`
   - `createdAt: timestamp`
   - `updatedAt: timestamp`

## Step 10: Test the Implementation

1. Start your development server: `npm run dev`
2. Navigate to `/login`
3. Try logging in with your created admin user
4. Check if events are loading from Firestore
5. Test creating/editing events in admin panel

## Features Implemented

### Authentication
- Email/password login
- User role management (staff/moderator)
- Secure session management
- Account lockout after failed attempts

### Events Management
- Real-time events CRUD operations
- Event status calculation (upcoming/past)
- Category filtering and search
- Real-time updates across tabs

### Messaging
- Firestore-based messaging system
- Agent transfer notifications
- Real-time message updates
- Message status tracking (pending, read, resolved)

### Database Management
- Automatic database initialization
- Collection structure validation
- Default documents and settings
- Sample data creation
- System configuration management

### Database Structure

#### Events Collection
```javascript
{
  title: string,
  date: string,
  time: string,
  category: string,
  description: string,
  venue: string,
  image: string,
  banner: string | null,
  status: 'upcoming' | 'past',
  organizer: string,
  contactPerson: string,
  contactPhone: string,
  additionalInfo: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Messages Collection
```javascript
{
  type: 'agent_transfer' | 'notification',
  userId: string,
  agentId: string,
  content: string,
  originalMessage: string,
  priority: 'normal' | 'high' | 'urgent',
  status: 'pending' | 'read' | 'resolved' | 'unread',
  read: boolean,
  metadata: object,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Users Collection
```javascript
{
  role: 'staff' | 'moderator',
  isActive: boolean,
  permissions: string[],
  profile: {
    displayName: string,
    email: string,
    phone: string
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### System Collection
```javascript
// Settings document
{
  appName: string,
  version: string,
  maintenanceMode: boolean,
  maxEventsPerUser: number,
  maxMessagesPerUser: number,
  eventCategories: string[],
  messageTypes: string[],
  priorityLevels: string[],
  statusTypes: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}

// Config document
{
  features: {
    eventsManagement: boolean,
    messaging: boolean,
    userManagement: boolean,
    notifications: boolean,
    realTimeUpdates: boolean
  },
  limits: {
    maxFileSize: number,
    maxEventsPerDay: number,
    maxMessagesPerDay: number,
    sessionTimeout: number
  },
  ui: {
    theme: string,
    language: string,
    timezone: string,
    dateFormat: string,
    timeFormat: string
  },
  security: {
    requireAuth: boolean,
    allowGuestAccess: boolean,
    maxLoginAttempts: number,
    lockoutDuration: number
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check if email/password provider is enabled
   - Verify Firebase configuration
   - Check browser console for errors

2. **Events not loading**
   - Verify Firestore security rules
   - Check if database is created
   - Ensure proper permissions

3. **Messaging not working**
   - Check Firestore security rules for messages collection
   - Verify user authentication
   - Check browser console for errors

4. **CORS errors**
   - Add your domain to Firebase authorized domains
   - Check Firebase configuration

### Development vs Production

- **Development**: Use test mode for Firestore rules
- **Production**: Implement proper security rules
- **HTTPS**: Recommended for production
- **Domain**: Add production domain to authorized domains

## Next Steps

1. Set up Firebase hosting for production deployment
2. Implement user management features
3. Add more sophisticated messaging features
4. Set up monitoring and analytics
5. Implement backup and recovery procedures

## Support

For issues related to:
- Firebase setup: Check [Firebase Documentation](https://firebase.google.com/docs)
- React integration: Check [Firebase React Documentation](https://firebase.google.com/docs/web/setup)
- This implementation: Check the code comments and error messages
