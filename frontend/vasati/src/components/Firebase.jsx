import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  GithubAuthProvider,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  signInWithCredential,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3k0nn1YBKpYX2q5ibBGC6Q_qHjRVaR1U",
  authDomain: "nammavasati.firebaseapp.com",
  projectId: "nammavasati",
  storageBucket: "nammavasati.firebasestorage.app",
  messagingSenderId: "839320200281",
  appId: "1:839320200281:web:c0a5f73f2abde400e87d48",
  measurementId: "G-TX1C19HDXC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const githubProvider = new GithubAuthProvider();

// Configure providers
provider.addScope("email");
githubProvider.addScope("user:email");
facebookProvider.addScope("email");

export {
  auth,
  provider,
  facebookProvider,
  githubProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  signInWithCredential,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
};
