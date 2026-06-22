import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore"; 

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
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: 'select_account' });
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

// Mencegah error persistence dengan pengecekan sederhana
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn("Persistence gagal: Multiple tabs open?");
  } else if (err.code === 'unimplemented') {
    console.warn("Persistence tidak didukung browser ini.");
  }
});