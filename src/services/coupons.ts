import { doc, getDoc, updateDoc, increment, query, collection, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import type { Coupon } from '../types/content';
import { toCamelCase } from './caseConvert';

export async function redeemCoupon(code: string, userId: string): Promise<Coupon> {
  const couponsRef = collection(db, 'coupons');
  const q = query(couponsRef, where('code', '==', code.toUpperCase()), where('active', '==', true), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('Kupon tidak valid atau sudah kedaluwarsa.');
  }

  const couponDoc = snapshot.docs[0];
  const data = toCamelCase<Coupon>(couponDoc.data() as Record<string, unknown>);
  data.id = couponDoc.id;

  if (data.currentUses >= data.maxUses) {
    throw new Error('Kupon ini sudah mencapai batas penggunaan.');
  }
  if (data.expiresAt && data.expiresAt < Date.now()) {
    throw new Error('Kupon ini sudah kedaluwarsa.');
  }

  // Update coupon uses
  await updateDoc(doc(db, 'coupons', data.id), {
    current_uses: increment(1)
  });

  // Grant premium to user
  const expireDate = data.durationDays
    ? new Date(Date.now() + data.durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : null;

  await updateDoc(doc(db, 'users', userId), {
    premium: true,
    premium_plan: data.plan,
    premium_expire: expireDate
  });

  return data;
}
