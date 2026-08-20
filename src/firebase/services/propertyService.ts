import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  addDoc
} from 'firebase/firestore';
import { db } from '../config';
import { Property, RoomOption, FirestoreReport } from '../../types';
import { PROPERTIES } from '../../data/mockData';

const PROPERTIES_COLLECTION = 'properties';
const REPORTS_COLLECTION = 'reports';
const ROOMS_COLLECTION = 'rooms';

export const seedInitialPropertiesIfEmpty = async (): Promise<Property[]> => {
  try {
    const colRef = collection(db, PROPERTIES_COLLECTION);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      console.log('Seeding regional properties into Firestore...');
      const seedPromises = PROPERTIES.map(async (prop) => {
        const propDocRef = doc(db, PROPERTIES_COLLECTION, prop.id);
        const seedData: Property = {
          ...prop,
          ownerId: prop.ownerId || ('sample_owner_' + (prop.id || '01')),
          verificationStatus: prop.verificationStatus || (prop.verified ? 'verified' : 'pending'),
          availability: prop.availability || 'available',
          safetyScore: prop.safetyScore || 92,
          isDemo: true,
          isSampleData: true,
          monthlyRent: prop.monthlyRent || Math.min(...prop.roomOptions.map(r => r.nominalMonthlyRent)),
          securityDeposit: prop.securityDeposit || Math.min(...prop.roomOptions.map(r => r.nominalMonthlyRent * (r.depositMonths || 1))),
          estimatedMonthlyCost: (prop.monthlyRent || Math.min(...prop.roomOptions.map(r => r.nominalMonthlyRent))) + (prop.foodCost || 0) + (prop.electricityCost || 0),
          facilities: prop.amenities.filter(a => a.isIncluded).map(a => a.name),
          rules: prop.houseRules,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(propDocRef, seedData);

        // Also seed rooms into rooms collection
        for (const room of prop.roomOptions) {
          const roomRef = doc(db, ROOMS_COLLECTION, `${prop.id}_${room.id}`);
          await setDoc(roomRef, {
            id: room.id,
            propertyId: prop.id,
            roomType: room.type,
            sharingType: room.title,
            rentPerPerson: room.nominalMonthlyRent,
            rent: room.nominalMonthlyRent,
            availableRooms: room.availableBeds,
            totalRooms: room.totalBeds,
            securityDeposit: room.nominalMonthlyRent * (room.depositMonths || 1),
            attachedBathroom: !!room.attachedBath,
            furnished: true,
            foodIncluded: !!prop.mealsIncluded,
            facilities: [
              room.attachedBath ? 'Attached Bathroom' : '',
              room.airConditioning ? 'Air Conditioning' : '',
              room.balcony ? 'Private Balcony' : '',
              room.studyDeskIncluded ? 'Ergonomic Study Desk' : '',
              `${prop.wifiSpeedMbps} Mbps Fiber Wi-Fi`
            ].filter(Boolean),
            images: room.images || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        return seedData;
      });

      const seeded = await Promise.all(seedPromises);
      return seeded;
    } else {
      const properties: Property[] = [];
      snapshot.forEach((d) => {
        properties.push(d.data() as Property);
      });
      return properties;
    }
  } catch (err) {
    console.error('Error during Firestore property seeding/fetching:', err);
    return PROPERTIES;
  }
};

export const fetchProperties = async (): Promise<Property[]> => {
  try {
    const colRef = collection(db, PROPERTIES_COLLECTION);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      return await seedInitialPropertiesIfEmpty();
    }

    const properties: Property[] = [];
    snapshot.forEach((d) => {
      properties.push(d.data() as Property);
    });

    // Merge any missing regional properties from PROPERTIES to guarantee complete regional coverage
    const existingIds = new Set(properties.map(p => p.id));
    const missing = PROPERTIES.filter(p => !existingIds.has(p.id));
    if (missing.length > 0) {
      missing.forEach(prop => {
        const propDocRef = doc(db, PROPERTIES_COLLECTION, prop.id);
        const seedData: Property = {
          ...prop,
          ownerId: prop.ownerId || ('sample_owner_' + (prop.id || '01')),
          verificationStatus: prop.verificationStatus || (prop.verified ? 'verified' : 'pending'),
          availability: prop.availability || 'available',
          safetyScore: prop.safetyScore || 92,
          isDemo: true,
          isSampleData: true,
          monthlyRent: prop.monthlyRent || Math.min(...prop.roomOptions.map(r => r.nominalMonthlyRent)),
          securityDeposit: prop.securityDeposit || Math.min(...prop.roomOptions.map(r => r.nominalMonthlyRent * (r.depositMonths || 1))),
          estimatedMonthlyCost: (prop.monthlyRent || Math.min(...prop.roomOptions.map(r => r.nominalMonthlyRent))) + (prop.foodCost || 0) + (prop.electricityCost || 0),
          facilities: prop.amenities.filter(a => a.isIncluded).map(a => a.name),
          rules: prop.houseRules,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setDoc(propDocRef, seedData).catch(() => {});
      });
      return [...properties, ...missing];
    }

    return properties;
  } catch (err) {
    console.error('Error fetching properties from Firestore:', err);
    return PROPERTIES;
  }
};

export const fetchPropertyById = async (id: string): Promise<Property | null> => {
  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Property;
    }
    return null;
  } catch (err) {
    console.error(`Error fetching property ${id} from Firestore:`, err);
    return null;
  }
};

export const createProperty = async (
  propertyData: Partial<Property>, 
  ownerId: string
): Promise<Property> => {
  const propId = propertyData.id || `prop_${Date.now()}`;
  const minRent = propertyData.roomOptions?.length 
    ? Math.min(...propertyData.roomOptions.map(r => r.nominalMonthlyRent))
    : (propertyData.monthlyRent || 800);

  const newProperty: Property = {
    id: propId,
    ownerId: ownerId,
    name: propertyData.name || 'New Student PG',
    tagline: propertyData.tagline || 'Modern Student Living',
    description: propertyData.description || propertyData.tagline || 'Modern Student Living near campus',
    category: propertyData.category || 'pg',
    propertyType: propertyData.category || 'pg',
    genderPolicy: propertyData.genderPolicy || 'coed',
    campusId: propertyData.campusId || 'hub_stanford',
    campusName: propertyData.campusName || 'Stanford Campus Hub',
    address: propertyData.address || 'Campus Road',
    neighborhood: propertyData.neighborhood || 'University District',
    city: propertyData.city || 'Palo Alto',
    location: propertyData.neighborhood || 'University District',
    latitude: propertyData.latitude || 37.4275,
    longitude: propertyData.longitude || -122.1697,
    coverImage: propertyData.coverImage || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    galleryImages: propertyData.galleryImages?.length 
      ? propertyData.galleryImages 
      : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    images: propertyData.galleryImages || [],
    rating: propertyData.rating || 4.8,
    reviewCount: propertyData.reviewCount || 0,
    verified: false,
    verificationStatus: 'pending',
    availability: 'available',
    safetyScore: 92,
    monthlyRent: minRent,
    securityDeposit: minRent * 2,
    estimatedMonthlyCost: minRent + 120,
    distanceFromCollege: propertyData.distanceFromCollege || '8 min walk',
    curfewTime: propertyData.curfewTime || 'No Curfew / 24x7 Entry',
    visitorPolicy: propertyData.visitorPolicy || 'Allowed till 10:00 PM',
    mealsIncluded: propertyData.mealsIncluded ?? true,
    mealPlanType: propertyData.mealPlanType || '3_meals_daily',
    wifiSpeedMbps: propertyData.wifiSpeedMbps || 150,
    powerBackup: propertyData.powerBackup ?? true,
    noticePeriodDays: propertyData.noticePeriodDays || 30,
    roomOptions: propertyData.roomOptions || [
      {
        id: 'rm-1',
        type: 'double',
        title: 'Deluxe Twin Sharing',
        nominalMonthlyRent: minRent,
        depositMonths: 2,
        availableBeds: 2,
        totalBeds: 2,
        sizeSqFt: 180,
        attachedBath: true,
        balcony: false,
        airConditioning: true,
        studyDeskIncluded: true,
        images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80']
      }
    ],
    defaultRoomId: propertyData.roomOptions?.[0]?.id || 'rm-1',
    baseCostBreakdown: propertyData.baseCostBreakdown || [
      { name: 'Room Rent', amount: minRent, period: 'monthly', mandatory: true, category: 'rent' },
      { name: 'High-Speed WiFi', amount: 0, period: 'monthly', mandatory: true, category: 'utilities', tooltip: 'Complimentary' },
      { name: 'Security Deposit', amount: minRent * 2, period: 'one-time', mandatory: true, category: 'deposit', tooltip: '100% Refundable' }
    ],
    amenities: propertyData.amenities || [
      { id: 'wifi', name: 'High-Speed WiFi', category: 'connectivity', icon: 'Wifi', isIncluded: true },
      { id: 'ac', name: 'Air Conditioning', category: 'comfort', icon: 'Wind', isIncluded: true },
      { id: 'security', name: 'Biometric Access', category: 'security', icon: 'ShieldCheck', isIncluded: true }
    ],
    facilities: ['High-Speed WiFi', 'Air Conditioning', 'Biometric Access'],
    rules: ['Curfew as stated', 'No smoking inside premises'],
    commuteOptions: propertyData.commuteOptions || [
      { type: 'walk', durationMin: 8, distanceKm: 0.6, monthlyCostEst: 0, description: 'Direct walking path' }
    ],
    houseRules: propertyData.houseRules || ['Valid student ID required', 'Quiet hours after 11 PM'],
    wardenContact: propertyData.wardenContact || {
      name: 'Property Manager',
      role: 'Host',
      phone: '+1 (555) 234-5678',
      responseRate: 'Under 15 mins',
      verifiedHost: true
    },
    reviews: [],
    featuredPerks: propertyData.featuredPerks || ['Verified Host', 'Zero Brokerage', 'Study Friendly'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, propId);
    await setDoc(docRef, newProperty);

    // Store individual rooms in 'rooms' collection
    for (const room of newProperty.roomOptions) {
      const roomDocRef = doc(db, ROOMS_COLLECTION, `${newProperty.id}_${room.id}`);
      await setDoc(roomDocRef, {
        id: room.id,
        propertyId: newProperty.id,
        roomType: room.type,
        sharingType: room.title,
        rent: room.nominalMonthlyRent,
        availableRooms: room.availableBeds,
        totalRooms: room.totalBeds,
        facilities: ['WiFi', room.airConditioning ? 'AC' : '', room.attachedBath ? 'Attached Bath' : ''].filter(Boolean),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('Could not sync created property to remote Firestore:', err);
  }

  return newProperty;
};

export const updateProperty = async (
  propertyId: string, 
  updates: Partial<Property>
): Promise<void> => {
  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, propertyId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn(`Could not sync update for property ${propertyId} to Firestore:`, err);
  }
};

export const deleteProperty = async (propertyId: string): Promise<void> => {
  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, propertyId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Could not sync delete for property ${propertyId} to Firestore:`, err);
  }
};

export const updatePropertyVerification = async (
  propertyId: string, 
  status: 'verified' | 'rejected'
): Promise<void> => {
  const isVerified = status === 'verified';
  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, propertyId);
    await updateDoc(docRef, {
      verificationStatus: status,
      verified: isVerified,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn(`Could not sync verification status for property ${propertyId}:`, err);
  }
};

export const updateRoomAvailability = async (
  propertyId: string,
  roomId: string,
  availableBeds: number,
  totalBeds?: number
): Promise<void> => {
  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, propertyId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const prop = docSnap.data() as Property;
      const updatedRooms = prop.roomOptions.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            availableBeds: Math.max(0, availableBeds),
            totalBeds: totalBeds !== undefined ? totalBeds : r.totalBeds
          };
        }
        return r;
      });

      const totalAvailable = updatedRooms.reduce((acc, r) => acc + r.availableBeds, 0);
      const availabilityStatus = totalAvailable === 0 ? 'sold_out' : (totalAvailable <= 2 ? 'few_left' : 'available');

      await updateDoc(docRef, {
        roomOptions: updatedRooms,
        availability: availabilityStatus,
        updatedAt: new Date().toISOString()
      });

      // Update rooms collection
      try {
        const roomDocRef = doc(db, ROOMS_COLLECTION, `${propertyId}_${roomId}`);
        await updateDoc(roomDocRef, {
          availableRooms: Math.max(0, availableBeds),
          ...(totalBeds !== undefined ? { totalRooms: totalBeds } : {}),
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Could not update room doc:', e);
      }
    }
  } catch (err) {
    console.warn(`Could not update room availability for property ${propertyId}:`, err);
  }
};

export const reportProperty = async (
  propertyId: string,
  propertyName: string,
  reportedBy: string,
  reportedByName: string,
  reason: string,
  description: string
): Promise<FirestoreReport> => {
  const reportId = `rep_${Date.now()}`;
  const reportData: FirestoreReport = {
    id: reportId,
    propertyId,
    propertyName,
    reportedBy,
    reportedByName,
    reason,
    description,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, REPORTS_COLLECTION, reportId), reportData);
  } catch (err) {
    console.warn('Could not sync report to Firestore:', err);
  }
  return reportData;
};

export const fetchReports = async (): Promise<FirestoreReport[]> => {
  try {
    const snapshot = await getDocs(collection(db, REPORTS_COLLECTION));
    const reports: FirestoreReport[] = [];
    snapshot.forEach((d) => {
      reports.push(d.data() as FirestoreReport);
    });
    return reports;
  } catch (err) {
    console.error('Error fetching reports from Firestore:', err);
    return [];
  }
};

export const updateReportStatus = async (
  reportId: string, 
  status: 'reviewed' | 'dismissed' | 'pending'
): Promise<void> => {
  const docRef = doc(db, REPORTS_COLLECTION, reportId);
  await updateDoc(docRef, { status });
};

export const seedInitialProperties = seedInitialPropertiesIfEmpty;
export const saveProperty = (prop: Property) => createProperty(prop, prop.ownerId || 'custom_owner');
export const submitReport = (report: {
  propertyId: string;
  propertyName: string;
  reportedByUid: string;
  reportedByName?: string;
  reason: string;
  description: string;
  status?: 'pending' | 'reviewed' | 'dismissed';
}) => reportProperty(
  report.propertyId,
  report.propertyName,
  report.reportedByUid,
  report.reportedByName || 'Student',
  report.reason,
  report.description
);
