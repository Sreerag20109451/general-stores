import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Replace with your actual Firebase project config for PRODUCTION
// TODO: Replace with your actual Firebase project config for PRODUCTION
const firebaseConfigProd = {
    apiKey: "PROD_API_KEY",
    authDomain: "PROD_AUTH_DOMAIN",
    projectId: "PROD_PROJECT_ID",
    storageBucket: "PROD_STORAGE_BUCKET",
    messagingSenderId: "PROD_MESSAGING_SENDER_ID",
    appId: "PROD_APP_ID"
};

// Config for DEVELOPMENT (Local) uses Env Vars
const firebaseConfigDev = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const firebaseConfig = __DEV__ ? firebaseConfigDev : firebaseConfigProd;

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
