import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebase';
import { createUserProfile, getUserProfile } from './userService';

export async function registerUser(email: string, password: string, fullName: string, username: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  await createUserProfile(user.uid, { email, fullName, username });
  return user;
}

export async function loginUser(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
