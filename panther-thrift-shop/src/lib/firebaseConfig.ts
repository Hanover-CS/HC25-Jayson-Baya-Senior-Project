// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBYKzEs3p1CuLH0nPKTJ-nw75NUxkpoi9Y",
    authDomain: "panther-thrift-shop.firebaseapp.com",
    projectId: "panther-thrift-shop",
    storageBucket: "panther-thrift-shop.appspot.com",
    messagingSenderId: "137267857983",
    appId: "1:137267857983:web:07d01ffeb0dca0d0dd468a",
    measurementId: "G-BB0HNZWM2X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };