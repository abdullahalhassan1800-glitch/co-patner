import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB4tbxMiCr1571wkiQa8BH8-db0MwU3SNc",
  authDomain: "funcam-6c254.firebaseapp.com",
  projectId: "funcam-6c254",
  storageBucket: "funcam-6c254.firebasestorage.app",
  messagingSenderId: "121518820033",
  appId: "1:121518820033:web:73993e03d669664f566240",
};

let app: FirebaseApp;
let auth: Auth;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
} catch {
  app = null!;
  auth = null!;
}

export { auth };
