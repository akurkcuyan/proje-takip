import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC637b0hVp7yHvgyLVPGompcL-WfWsCedA",
  authDomain: "proje-takip-a0ef3.firebaseapp.com",
  projectId: "proje-takip-a0ef3",
  storageBucket: "proje-takip-a0ef3.firebasestorage.app",
  messagingSenderId: "582802525657",
  appId: "1:582802525657:web:136e666a39fa41be519dc8",
  measurementId: "G-SPB523BQHH"
};

// Next.js hot-reloading sebebiyle birden fazla başlatmayı (initialization) önlüyoruz
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Analytics'i yalnızca istemci tarafında (tarayıcıda) başlatıyoruz
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((yes) => yes ? (analytics = getAnalytics(app)) : null);
}

export { db, app, analytics };
