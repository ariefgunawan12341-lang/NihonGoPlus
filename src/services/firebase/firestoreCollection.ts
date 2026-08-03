import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions
} from 'firebase/firestore';
import { db } from '../../firebase';
import { toSnakeCase, toCamelCase } from '../caseConvert';

const converter = <T extends { id: string }>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: T): DocumentData => {
    const { id, ...rest } = data;
    return toSnakeCase(rest as Record<string, unknown>);
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T => {
    const data = snapshot.data(options);
    const camelData = toCamelCase<Record<string, any>>(data);
    return { ...camelData, id: snapshot.id } as T;
  }
});

export class FirestoreCollection<T extends { id: string }> {
  protected collectionRef;

  constructor(protected path: string) {
    this.collectionRef = collection(db, path).withConverter(converter<T>());
  }

  async list(): Promise<T[]> {
    const snapshot = await getDocs(this.collectionRef);
    return snapshot.docs.map(doc => doc.data());
  }

  async get(id: string): Promise<T | undefined> {
    const docRef = doc(db, this.path, id).withConverter(converter<T>());
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() : undefined;
  }

  async listFiltered(filters: Partial<T>, opts?: { limit?: number }): Promise<T[]> {
    let q = query(this.collectionRef);
    const snakeFilters = toSnakeCase(filters as Record<string, unknown>);
    for (const [key, value] of Object.entries(snakeFilters)) {
      if (value !== undefined) {
        q = query(q, where(key, '==', value));
      }
    }
    if (opts?.limit) {
      q = query(q, limit(opts.limit));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  async create(item: T): Promise<T> {
    const id = item.id || doc(this.collectionRef).id;
    const docRef = doc(db, this.path, id).withConverter(converter<T>());
    const { id: _, ...payload } = item;
    await setDoc(docRef, { ...payload });
    return { ...item, id };
  }

  async update(id: string, patch: Partial<T>): Promise<void> {
    const docRef = doc(db, this.path, id);
    const payload = toSnakeCase(patch as Record<string, unknown>);
    await updateDoc(docRef, payload);
  }

  async remove(id: string): Promise<void> {
    const docRef = doc(db, this.path, id);
    await deleteDoc(docRef);
  }
}

export class UserScopedFirestoreTable<T extends { id: string }> extends FirestoreCollection<T> {
  constructor(table: string, userId: string) {
    super(`users/${userId}/${table}`);
  }
}
