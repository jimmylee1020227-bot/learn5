// Firebase 雲端即時連線實例 (官方 Realtime Database 初始化)
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, off, child, update } from 'firebase/database';

export const firebaseConfig = {
  projectId: "learn-9e08c",
  appId: "1:441886374818:web:19ac00711cfba05afa90fb",
  databaseURL: "https://learn-9e08c-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "learn-9e08c.firebasestorage.app",
  apiKey: "AIzaSyD9O5Q8m1YHIBYukWbWIv_dvY_m2D57OOA",
  authDomain: "learn-9e08c.firebaseapp.com",
  messagingSenderId: "441886374818",
  measurementId: "G-PMP2WVVL0V"
};

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (e) {
  console.error('[Firebase Init Error]', e);
}

export { db, ref, set, get, onValue, off, child, update };
