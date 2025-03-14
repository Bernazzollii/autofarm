// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js";
import { child, get, getDatabase, ref, remove, set, update } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBqALa7SIRR9ZzNRag4pg3_560Vc7s4PJU",
    authDomain: "sclautofarm.firebaseapp.com",
    databaseURL: "https://sclautofarm-default-rtdb.firebaseio.com",
    projectId: "sclautofarm",
    storageBucket: "sclautofarm.appspot.com",
    messagingSenderId: "480128354723",
    appId: "1:480128354723:web:81d689b190e7d900837216"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth();
const provider = new GoogleAuthProvider();

const database = getDatabase();



export { app, auth, child, database, get, getDatabase, onAuthStateChanged, provider, ref, remove, set, signInWithPopup, signOut, update };

