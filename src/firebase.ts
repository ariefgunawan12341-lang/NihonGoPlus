import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCK1_2c9VRpXkg-LVvf9n8nAwSCH1_v7CQ",
  authDomain: "nihongoplus-317e6.firebaseapp.com",
  projectId: "nihongoplus-317e6",
  storageBucket: "nihongoplus-317e6.firebasestorage.app",
  messagingSenderId: "836452904435",
  appId: "1:836452904435:web:89158c70885926549a7686",
  measurementId: "G-K9283B34MG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
