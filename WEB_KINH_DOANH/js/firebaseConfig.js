// js/firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// ⚙️ Thay thông tin dưới đây bằng config của bạn trên Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyBN1aAHEvrhz3RnF04cWSwbBmyJytHYqC0",
    authDomain: "kinhdoanh-3c132.firebaseapp.com",
    projectId: "kinhdoanh-3c132",
    storageBucket: "kinhdoanh-3c132.firebasestorage.app",
    messagingSenderId: "44950699779",
    appId: "1:44950699779:web:3c6816f2b08f0bb61ff336",
    measurementId: "G-969891QZ32"
};

// 🔥 Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Xuất các hàm & biến cần dùng cho các file khác
export { db, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc, getDoc, serverTimestamp };
