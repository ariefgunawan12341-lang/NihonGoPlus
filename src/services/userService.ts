import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { toCamelCase, toSnakeCase } from './caseConvert';

export async function createUserProfile(uid: string, data: { username: string; fullName: string; email: string }) {
  const profileData = {
    uid,
    email: data.email,
    username: data.username,
    fullName: data.fullName, // included because UI needs it
    role: 'user',
    status: 'active',
    premium: false,
    createdAt: serverTimestamp(),
    xp: 0,
    level: 1,
    streak: 0,
    lastStudyDate: null,
    isAdmin: false,
    targetLevel: 'N5'
  };

  const docRef = doc(db, 'users', uid);
  await setDoc(docRef, toSnakeCase(profileData));

  return { ...profileData, id: uid, createdAt: Date.now() } as unknown as UserProfile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', uid);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    const data = snapshot.data();
    return { ...toCamelCase<UserProfile>(data), id: snapshot.id } as UserProfile;
  }
  return null;
}

export async function updateUserProfile(uid: string, patch: Partial<UserProfile>) {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, toSnakeCase(patch as Record<string, unknown>));
}
