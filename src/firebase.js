import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAKmOG8mtfKajaKujHRX3AFdF6RGN_ABYk",
    authDomain: "lkvoicestore-trincomalee.firebaseapp.com",
    projectId: "lkvoicestore-trincomalee",
    storageBucket: "lkvoicestore-trincomalee.firebasestorage.app",
    messagingSenderId: "421805649916",
    appId: "1:421805649916:web:17d0939f4844dcd94d8c79",
    measurementId: "G-25CCSJWHHJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
