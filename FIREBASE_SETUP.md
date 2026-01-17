# Firebase Setup Guide

Follow these steps to configure the backend for your General Stores app.

## 1. Create a Firebase Project
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"**.
3.  Name it (e.g., `General-Stores-App`) and click **Continue**.
4.  Disable Google Analytics (optional, simpler for now) and click **Create project**.

## 2. Register Your App (Get Config Keys)
1.  On the project overview page, click the **Web icon (`</>`)** to add an app.
2.  Name it `General Store Web` and click **Register app**.
3.  **Copy the `firebaseConfig` object** (the part inside the curly braces `{ ... }`).
4.  Keep this tab open, you will need these keys.

## 3. Enable Authentication
1.  In the left menu, click **Build > Authentication**.
2.  Click **Get Started**.
3.  **Phone Auth (For Client App):**
    *   Click **Phone**.
    *   Enable the toggle.
    *   (Optional) Add a test phone number (e.g., `+91 9999999999`, Code: `123456`) to test without using real SMS quota.
    *   Click **Save**.
4.  **Email/Password (For Admin App):**
    *   Click **Add new provider**.
    *   Select **Email/Password**.
    *   Enable the toggle.
    *   Click **Save**.
    *   **Create an Admin User:**
        *   Go to the **Users** tab.
        *   Click **Add user**.
        *   Enter an email (e.g., `admin@test.com`) and password. **Result:** You will use this to log in to the Admin App.

## 4. Enable Firestore Database
1.  In the left menu, click **Build > Firestore Database**.
2.  Click **Create database**.
3.  Choose a location (e.g., `asia-south1` for Mumbai). Click **Next**.
4.  **Security Rules:**
    *   Select **Start in test mode** (allows read/write for 30 days).
    *   *Note: For a real production app, we will need to secure this later.*
    *   Click **Enable**.

## 5. Update Your Code
Open the following files in your editor and paste the config keys you copied in Step 2.

### `client/src/services/firebase.js`
Replace the placeholders in `firebaseConfigDev` (and `Prod` if you have a separate project) with your keys:
```javascript
const firebaseConfigDev = {
  apiKey: "AIzaSy...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

### `admin/src/services/firebase.js`
Do the same for the Admin app. You can use the **same keys** for both apps for now to share the database (Production/Development separation is handled by the code I added).

## 6. (Optional) Run the App
-   **Client:** `cd client` -> `npx expo start` -> Scan with Android phone.
-   **Admin:** `cd admin` -> `npx expo start` -> Scan with Android phone or run in browser (`w`).
