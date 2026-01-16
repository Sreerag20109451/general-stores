import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Replace with your actual Firebase project config for PRODUCTION
const firebaseConfigProd = {
    apiKey: "PROD_API_KEY",
    authDomain: "PROD_AUTH_DOMAIN",
    projectId: "PROD_PROJECT_ID",
    storageBucket: "PROD_STORAGE_BUCKET",
    messagingSenderId: "PROD_MESSAGING_SENDER_ID",
    appId: "PROD_APP_ID"
};

// TODO: Replace with your actual Firebase project config for DEVELOPMENT (Local)
const firebaseConfigDev = {
    apiKey: "DEV_API_KEY",
    authDomain: "DEV_AUTH_DOMAIN",
    projectId: "DEV_PROJECT_ID",
    storageBucket: "DEV_STORAGE_BUCKET",
    messagingSenderId: "DEV_MESSAGING_SENDER_ID",
    appId: "DEV_APP_ID"
};

const firebaseConfig = __DEV__ ? firebaseConfigDev : firebaseConfigProd;

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
