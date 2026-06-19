import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC2ZPChcwmWOpAMqAMY4mpG5c1ifmiFr0Y",
  authDomain: "campus-workspace.firebaseapp.com",
  projectId: "campus-workspace",
  storageBucket: "campus-workspace.firebasestorage.app",
  messagingSenderId: "729909965242",
  appId: "1:729909965242:web:7cf76edc335fec2492ed83",
  measurementId: "G-6BDLC8JNWW"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// INI KUNCI UTAMANYA:
// Memaksa Google untuk selalu memunculkan pop-up "Pilih Akun"
googleProvider.setCustomParameters({
  prompt: 'select_account'
});