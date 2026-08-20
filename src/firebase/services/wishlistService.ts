import { 
  doc, 
  getDoc, 
  setDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config';
import { FirestoreWishlist } from '../../types';

const WISHLISTS_COLLECTION = 'wishlists';

export const fetchWishlist = async (userId: string): Promise<string[]> => {
  if (!userId) return [];
  try {
    const docRef = doc(db, WISHLISTS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as FirestoreWishlist;
      return data.propertyIds || [];
    }
    return [];
  } catch (err) {
    console.error(`Error fetching wishlist for ${userId}:`, err);
    return [];
  }
};

export const saveWishlist = async (userId: string, propertyIds: string[]): Promise<void> => {
  if (!userId) return;
  try {
    const docRef = doc(db, WISHLISTS_COLLECTION, userId);
    const payload: FirestoreWishlist = {
      userId,
      propertyIds,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload);
  } catch (err) {
    console.error(`Error saving wishlist for ${userId}:`, err);
  }
};

export const toggleWishlistProperty = async (userId: string, propertyId: string): Promise<string[]> => {
  if (!userId || !propertyId) return [];
  const current = await fetchWishlist(userId);
  const updated = current.includes(propertyId)
    ? current.filter(id => id !== propertyId)
    : [...current, propertyId];
  await saveWishlist(userId, updated);
  return updated;
};

