// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAkuJYXkP2ImCDZuw6YLdeQFUSoF-XT3iE',
  authDomain: 'apartman-booking-app.firebaseapp.com',
  projectId: 'apartman-booking-app',
  storageBucket: 'apartman-booking-app.firebasestorage.app',
  messagingSenderId: '740165246379',
  appId: '1:740165246379:web:9a1b962ed7ec6233eec6ee',
  measurementId: 'G-NM6S9X88RW',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);