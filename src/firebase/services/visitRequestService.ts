import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config';
import { TourBooking } from '../../types';

const VISIT_REQUESTS_COLLECTION = 'visitRequests';

export const createVisitRequest = async (booking: TourBooking): Promise<TourBooking> => {
  const reqId = booking.id || `visit_${Date.now()}`;
  const docRef = doc(db, VISIT_REQUESTS_COLLECTION, reqId);

  const requestData = {
    id: reqId,
    propertyId: booking.propertyId,
    propertyName: booking.propertyName,
    userId: booking.userId || 'anonymous_student',
    ownerId: booking.ownerId || 'all_owners',
    studentName: booking.studentName,
    studentPhone: booking.studentPhone,
    studentEmail: booking.studentEmail,
    visitDate: booking.date,
    visitTime: booking.timeSlot,
    date: booking.date,
    timeSlot: booking.timeSlot,
    tourType: booking.tourType,
    status: booking.status || 'pending',
    createdAt: booking.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(docRef, requestData);
  } catch (err) {
    console.warn('Could not sync visit request to Firestore:', err);
  }
  return requestData as unknown as TourBooking;
};

export const fetchVisitRequestsForUser = async (userId: string): Promise<TourBooking[]> => {
  try {
    const q = query(
      collection(db, VISIT_REQUESTS_COLLECTION), 
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const list: TourBooking[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as any;
      list.push({
        id: data.id || d.id,
        propertyId: data.propertyId,
        propertyName: data.propertyName,
        userId: data.userId,
        ownerId: data.ownerId,
        date: data.visitDate || data.date,
        timeSlot: data.visitTime || data.timeSlot,
        tourType: data.tourType || 'in_person',
        studentName: data.studentName,
        studentPhone: data.studentPhone,
        studentEmail: data.studentEmail,
        status: data.status,
        createdAt: data.createdAt,
      });
    });
    return list;
  } catch (err) {
    console.error('Error fetching visit requests for user:', err);
    return [];
  }
};

export const fetchVisitRequestsForOwner = async (ownerId?: string): Promise<TourBooking[]> => {
  try {
    let q;
    if (ownerId && ownerId !== 'all') {
      q = query(
        collection(db, VISIT_REQUESTS_COLLECTION),
        where('ownerId', '==', ownerId)
      );
    } else {
      q = collection(db, VISIT_REQUESTS_COLLECTION);
    }

    const snapshot = await getDocs(q);
    const list: TourBooking[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as any;
      list.push({
        id: data.id || d.id,
        propertyId: data.propertyId,
        propertyName: data.propertyName,
        userId: data.userId,
        ownerId: data.ownerId,
        date: data.visitDate || data.date,
        timeSlot: data.visitTime || data.timeSlot,
        tourType: data.tourType || 'in_person',
        studentName: data.studentName,
        studentPhone: data.studentPhone,
        studentEmail: data.studentEmail,
        status: data.status,
        createdAt: data.createdAt,
      });
    });
    return list;
  } catch (err) {
    console.error('Error fetching visit requests for owner:', err);
    return [];
  }
};

export const updateVisitRequestStatus = async (
  requestId: string, 
  status: 'accepted' | 'rejected' | 'pending' | 'completed' | 'confirmed'
): Promise<void> => {
  const docRef = doc(db, VISIT_REQUESTS_COLLECTION, requestId);
  await updateDoc(docRef, {
    status,
    updatedAt: new Date().toISOString()
  });
};

export const subscribeToVisitRequests = (
  userId: string | null,
  role: string | null,
  callback: (requests: TourBooking[]) => void
): Unsubscribe => {
  let q;
  if (role === 'student' && userId) {
    q = query(collection(db, VISIT_REQUESTS_COLLECTION), where('userId', '==', userId));
  } else if (role === 'owner' && userId) {
    q = collection(db, VISIT_REQUESTS_COLLECTION);
  } else {
    q = collection(db, VISIT_REQUESTS_COLLECTION);
  }

  return onSnapshot(q, (snapshot) => {
    const list: TourBooking[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as any;
      list.push({
        id: data.id || d.id,
        propertyId: data.propertyId,
        propertyName: data.propertyName,
        userId: data.userId,
        ownerId: data.ownerId,
        date: data.visitDate || data.date,
        timeSlot: data.visitTime || data.timeSlot,
        tourType: data.tourType || 'in_person',
        studentName: data.studentName,
        studentPhone: data.studentPhone,
        studentEmail: data.studentEmail,
        status: data.status,
        createdAt: data.createdAt,
      });
    });
    callback(list);
  }, (error) => {
    console.error('Error in visit requests subscription:', error);
  });
};
