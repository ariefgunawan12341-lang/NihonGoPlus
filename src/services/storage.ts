import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

export const STORAGE_BUCKETS = {
  images: 'images',
  audio: 'audio',
  video: 'video',
  pdf: 'pdf',
  modules: 'modules'
} as const;

export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  const path = `profiles/${userId}/${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadMediaFile(file: File, bucket: string): Promise<string> {
  const path = `${bucket}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function listMediaFiles(bucket: string) {
  const listRef = ref(storage, bucket);
  const res = await listAll(listRef);

  const promises = res.items.map(async (item) => ({
    name: item.name,
    url: await getDownloadURL(item),
    path: item.fullPath
  }));

  return Promise.all(promises);
}

export async function deleteMediaFile(path: string): Promise<void> {
  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
}
