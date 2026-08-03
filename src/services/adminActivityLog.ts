import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { UserProfile } from '../types';
import { toSnakeCase } from './caseConvert';

/** Records an admin action to admin_activity_log in Firestore. */
export async function logAdminActivity(
  admin: UserProfile,
  action: string,
  targetTable?: string,
  targetId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const logRef = collection(db, 'admin_activity_log');
    await addDoc(logRef, toSnakeCase({
      adminId: admin.id,
      adminName: admin.fullName,
      action,
      targetTable,
      targetId,
      details: details ?? null,
      createdAt: serverTimestamp()
    }));
  } catch (err) {
    console.error('Failed to log admin activity:', err);
  }
}
