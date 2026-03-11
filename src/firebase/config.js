import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app
let db

try {
  app = initializeApp(firebaseConfig)
  // Enable offline persistence with multi-tab support
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  })
} catch (error) {
  console.error('Firebase initialization error:', error)
  // Graceful degradation — db will be undefined, handled in services
}

export { db }
export const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
)
