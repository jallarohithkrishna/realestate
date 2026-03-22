import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app, firebaseConfig.storageBucket);
export const auth = getAuth();

// Validate Connection to Firestore
async function testConnection() {
  try {
    const docRef = doc(db, 'test', 'connection');
    await getDocFromServer(docRef);
    console.log("Firestore connection successful");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Firestore connection test failed: ${message}`);
    if(message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
    // Log more details for non-offline errors
    if (!message.includes('the client is offline')) {
      console.error("Full error details:", error);
    }
  }
}
testConnection();
