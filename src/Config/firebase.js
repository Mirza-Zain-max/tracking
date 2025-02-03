// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDyaaWWgzpYVp-WtvZ7reJwna1m_q3yM2c",
    authDomain: "naveedbts-acffa.firebaseapp.com",
    projectId: "naveedbts-acffa",
    storageBucket: "naveedbts-acffa.firebasestorage.app",
    messagingSenderId: "375849808121",
    appId: "1:375849808121:web:dd1e542101de7996f73228",
    measurementId: "G-BDGTWDJK3S"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const fireStore = getFirestore(app);

export { analytics , auth ,fireStore };