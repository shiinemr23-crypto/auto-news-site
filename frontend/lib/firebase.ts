import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDObIFzbSsDHkCbBDIrLs37oBE1vP3I2cg",
  authDomain: "auto-news-site-52a52.firebaseapp.com",
  projectId: "auto-news-site-52a52",
  storageBucket: "auto-news-site-52a52.firebasestorage.app",
  messagingSenderId: "979816580955",
  appId: "1:979816580955:web:1569b17360d69716dbfc7e",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
