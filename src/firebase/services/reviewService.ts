import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  deleteDoc, 
  query, 
  where,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config';
import { Review, Property } from '../../types';

const REVIEWS_COLLECTION = 'reviews';
const PROPERTIES_COLLECTION = 'properties';

export const fetchReviewsForProperty = async (propertyId: string): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('propertyId', '==', propertyId)
    );
    const snapshot = await getDocs(q);
    const list: Review[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      list.push({
        id: data.id || d.id,
        userId: data.userId,
        authorName: data.userName || data.authorName || 'Student Resident',
        authorUniversity: data.authorUniversity || 'University',
        authorMajor: data.authorMajor || 'Resident',
        authorYear: data.authorYear || 'Batch 2026',
        avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: data.rating || 5,
        date: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Recent',
        comment: data.comment || '',
        tags: data.tags || ['Verified Student Review'],
        subRatings: data.subRatings || {
          cleanliness: data.rating,
          foodQuality: data.rating,
          wifiReliability: data.rating,
          safety: data.rating,
          management: data.rating
        }
      });
    });
    return list;
  } catch (err) {
    console.error('Error fetching reviews from Firestore:', err);
    return [];
  }
};

export const fetchAllReviews = async (): Promise<(Review & { propertyId: string; propertyName?: string })[]> => {
  try {
    const snapshot = await getDocs(collection(db, REVIEWS_COLLECTION));
    const list: (Review & { propertyId: string; propertyName?: string })[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      list.push({
        id: data.id || d.id,
        propertyId: data.propertyId,
        propertyName: data.propertyName,
        userId: data.userId,
        authorName: data.userName || data.authorName || 'Student',
        authorUniversity: data.authorUniversity || 'Campus Hub',
        authorMajor: data.authorMajor || 'Student',
        authorYear: data.authorYear || 'Resident',
        avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: data.rating || 5,
        date: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Recent',
        comment: data.comment || '',
        tags: data.tags || ['Verified Review'],
        subRatings: data.subRatings || {
          cleanliness: 5,
          foodQuality: 5,
          wifiReliability: 5,
          safety: 5,
          management: 5
        }
      });
    });
    return list;
  } catch (err) {
    console.error('Error fetching all reviews:', err);
    return [];
  }
};

export const addReview = async (propertyId: string, review: Review): Promise<void> => {
  const revId = review.id || `rev_${Date.now()}`;
  const docRef = doc(db, REVIEWS_COLLECTION, revId);

  const payload = {
    id: revId,
    propertyId,
    userId: review.userId || 'anonymous_user',
    userName: review.authorName,
    authorName: review.authorName,
    authorUniversity: review.authorUniversity,
    authorMajor: review.authorMajor,
    authorYear: review.authorYear,
    avatarUrl: review.avatarUrl,
    rating: review.rating,
    comment: review.comment,
    tags: review.tags,
    subRatings: review.subRatings,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(docRef, payload);
  } catch (err) {
    console.warn('Could not sync review to Firestore:', err);
  }

  // Update property's reviews array and rating aggregate
  try {
    const propDocRef = doc(db, PROPERTIES_COLLECTION, propertyId);
    const propSnap = await getDoc(propDocRef);
    if (propSnap.exists()) {
      const prop = propSnap.data() as Property;
      const currentReviews = prop.reviews || [];
      const updatedReviews = [review, ...currentReviews];
      const avgRating = Number(
        (updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length).toFixed(1)
      );

      await updateDoc(propDocRef, {
        reviews: updatedReviews,
        rating: avgRating,
        reviewCount: updatedReviews.length,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Could not update property review aggregate:', err);
  }
};

export const deleteReview = async (reviewId: string, propertyId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewId));
    
    // Also remove from property document if present
    const propDocRef = doc(db, PROPERTIES_COLLECTION, propertyId);
    const propSnap = await getDoc(propDocRef);
    if (propSnap.exists()) {
      const prop = propSnap.data() as Property;
      const updatedReviews = (prop.reviews || []).filter(r => r.id !== reviewId);
      const avgRating = updatedReviews.length 
        ? Number((updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length).toFixed(1))
        : 4.5;

      await updateDoc(propDocRef, {
        reviews: updatedReviews,
        rating: avgRating,
        reviewCount: updatedReviews.length,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('Error deleting review:', err);
  }
};
