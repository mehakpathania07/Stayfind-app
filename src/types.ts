export type CurrencyCode = 'USD' | 'INR' | 'GBP' | 'EUR';

export type RoomType = 'single' | 'double' | 'triple' | 'studio' | 'quad';
export type GenderPolicy = 'coed' | 'boys' | 'girls';
export type PropertyCategory = 'pg' | 'hostel' | 'coliving' | 'apartment';

export type UserRole = 'student' | 'owner' | 'admin';

export interface StateRegion {
  id: string; // 'himachal-pradesh' | 'punjab' | 'chandigarh' | 'delhi'
  name: string; // 'Himachal Pradesh' | 'Punjab' | 'Chandigarh' | 'Delhi'
  type: 'state' | 'union_territory';
  code: string; // 'HP' | 'PB' | 'CH' | 'DL'
}

export interface City {
  id: string;
  name: string;
  stateId: string;
  stateName: string;
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  cityId: string;
  cityName: string;
  stateId: string;
  stateName: string;
  popularGates?: string[];
  landmarks?: {
    name: string;
    type: 'library' | 'sports' | 'metro' | 'cafeteria' | 'engineering' | 'medical' | 'other';
    lat: number;
    lng: number;
  }[];
  coordinates?: [number, number];
  heroImage?: string;
  avgRentRange?: {
    min: number;
    max: number;
  };
}

export interface Room {
  id: string;
  propertyId: string;
  roomType: RoomType;
  sharingType: string;
  rentPerPerson: number;
  totalRooms: number;
  availableRooms: number;
  securityDeposit: number;
  attachedBathroom: boolean;
  furnished: boolean;
  foodIncluded: boolean;
  facilities: string[];
  images?: string[];
}

export interface StudentPreferences {
  maxBudget: number;
  roomType: 'single' | 'double' | 'triple' | 'studio' | 'any';
  genderPolicy: 'girls' | 'boys' | 'coed' | 'any';
  maxDistanceKm: number; // 0.5, 1, 2, 5
  foodRequired: 'yes' | 'no' | 'optional';
  acRequired: boolean;
  wifiRequired: boolean;
  attachedBath: 'required' | 'preferred' | 'not_important';
  laundry: 'required' | 'preferred' | 'not_important';
  powerBackup: 'required' | 'preferred' | 'not_important';
  preferredSafetyLevel: 'high' | 'medium' | 'any';
  updatedAt?: string;
}

export interface NearbyService {
  name: string;
  category: 'transit' | 'healthcare' | 'food' | 'grocery' | 'bank' | 'safety' | 'other';
  distanceKm: number;
  durationMin?: number;
  lat?: number;
  lng?: number;
  description?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  preferences?: StudentPreferences;
  createdAt: string;
}

export interface RoomOption {
  id: string;
  type: RoomType;
  title: string;
  nominalMonthlyRent: number; // Base monthly rent
  depositMonths: number;
  availableBeds: number;
  totalBeds: number;
  sizeSqFt: number;
  attachedBath: boolean;
  balcony: boolean;
  airConditioning: boolean;
  studyDeskIncluded: boolean;
  images: string[];
}

export interface CostBreakdownItem {
  name: string;
  amount: number;
  period: 'monthly' | 'one-time' | 'per-unit';
  mandatory: boolean;
  category: 'rent' | 'food' | 'utilities' | 'maintenance' | 'deposit' | 'commute';
  tooltip?: string;
}

export interface Amenity {
  id: string;
  name: string;
  category: 'comfort' | 'food' | 'security' | 'connectivity' | 'lifestyle';
  icon: string;
  isIncluded: boolean;
  extraCostMonthly?: number;
}

export interface Review {
  id: string;
  authorName: string;
  authorUniversity?: string;
  authorMajor?: string;
  authorYear?: string;
  avatarUrl?: string;
  rating: number;
  date: string;
  comment?: string;
  content?: string;
  tags?: string[];
  userId?: string;
  stayDuration?: string;
  roomType?: string;
  likes?: number;
  helpfulCount?: number;
  isSample?: boolean;
  subRatings?: {
    cleanliness: number;
    foodQuality: number;
    wifiReliability: number;
    safety: number;
    management: number;
  };
}

export interface CommuteOption {
  type: 'walk' | 'bicycle' | 'bus' | 'metro';
  durationMin: number;
  distanceKm: number;
  monthlyCostEst: number;
  description: string;
}

export interface Property {
  id: string;
  ownerId?: string;
  name: string;
  tagline: string;
  description?: string;
  stateId?: string;
  stateName?: string;
  cityId?: string;
  cityName?: string;
  universityIds?: string[];
  primaryUniversityId?: string;
  primaryUniversityName?: string;
  category: PropertyCategory;
  propertyType?: PropertyCategory;
  genderPolicy: GenderPolicy;
  gender?: GenderPolicy;
  campusId: string;
  campusName: string;
  address: string;
  addressArea?: string;
  neighborhood: string;
  city?: string;
  state?: string;
  location?: string;
  latitude: number;
  longitude: number;
  coverImage: string;
  galleryImages: string[];
  images?: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  availability?: 'available' | 'few_left' | 'sold_out';
  safetyScore?: number;
  monthlyRent?: number;
  foodCost?: number;
  electricityCost?: number;
  wifiCost?: number;
  maintenanceCost?: number;
  otherRecurringCost?: number;
  securityDeposit?: number;
  brokerage?: number;
  oneTimeCharges?: number;
  estimatedMonthlyCost?: number;
  distanceFromCollege?: string;
  distanceFromUniversity?: string;
  estimatedWalkingTime?: string;
  curfewTime: string; // e.g. "11:00 PM", "No Curfew / 24x7 Entry"
  visitorPolicy: string;
  mealsIncluded: boolean;
  foodAvailable?: boolean;
  mealPlanType?: '3_meals_daily' | 'breakfast_dinner' | 'breakfast_only' | 'self_kitchen';
  wifiSpeedMbps: number;
  powerBackup: boolean;
  noticePeriodDays: number;
  roomOptions: RoomOption[];
  rooms?: Room[];
  defaultRoomId: string;
  baseCostBreakdown: CostBreakdownItem[];
  costBreakdown?: CostBreakdownItem[];
  amenities: Amenity[];
  facilities?: string[];
  rules?: string[];
  commuteOptions: CommuteOption[];
  houseRules: string[];
  ownerVerified?: boolean;
  cctv?: boolean;
  secureEntry?: boolean;
  emergencyContactAvailable?: boolean;
  securityFeatures?: string[];
  nearbyServices?: NearbyService[];
  wardenContact: {
    name: string;
    role: string;
    phone: string;
    responseRate: string;
    verifiedHost: boolean;
  };
  reviews: Review[];
  featuredPerks: string[];
  specialOffer?: {
    title: string;
    discountAmount: number;
    validUntil: string;
  };
  isDemo?: boolean;
  isSampleData?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UniversityHub {
  id: string;
  name: string;
  shortName: string;
  city: string;
  country: string;
  coordinates: [number, number]; // [lat, lng]
  popularGates: string[];
  landmarks: {
    name: string;
    type: 'library' | 'sports' | 'metro' | 'cafeteria' | 'engineering' | 'medical';
    lat: number;
    lng: number;
  }[];
  heroImage: string;
  avgRentRange: {
    min: number;
    max: number;
  };
}

export interface FilterState {
  searchQuery: string;
  stateId: string; // 'all' | 'himachal-pradesh' | 'punjab' | 'chandigarh' | 'delhi'
  cityId: string; // 'all' | 'palampur' | etc.
  universityId: string; // 'all' | university id
  campusId: string; // compatibility
  category: PropertyCategory | 'all';
  gender: GenderPolicy | 'all';
  roomType: RoomType | 'all';
  maxBudget: number;
  maxDistanceMin: number;
  mealsIncludedOnly: boolean;
  attachedBathOnly: boolean;
  acOnly: boolean;
  noCurfewOnly: boolean;
  wifiSpeedMin: number;
  verifiedOnly: boolean;
  sortBy: 'recommended' | 'price_low' | 'price_high' | 'distance_near' | 'rating_high';
}

export interface RoommateProfile {
  id: string;
  name: string;
  age: number;
  avatarUrl: string;
  university: string;
  major: string;
  yearOfStudy: string;
  gender: 'male' | 'female' | 'nonbinary';
  budgetMonthly: number;
  preferredAreas: string[];
  cleanlinessLevel: number; // 1 to 5
  sleepSchedule: 'early_bird' | 'night_owl' | 'flexible';
  studyVibe: 'silent' | 'light_music' | 'group_study';
  dietPreference: 'veg' | 'non_veg' | 'vegan';
  guestPolicy: 'frequent' | 'occasional' | 'weekends_only' | 'no_guests';
  hobbies: string[];
  bio: string;
  lookingForRoomType: RoomType;
  verifiedStudent: boolean;
  matchScore?: number;
}

export interface TourBooking {
  id: string;
  propertyId: string;
  propertyName: string;
  userId?: string;
  ownerId?: string;
  date: string;
  timeSlot: string;
  tourType: 'in_person' | 'video_call';
  studentName: string;
  studentPhone: string;
  studentEmail: string;
  status: 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'completed';
  createdAt: string;
  updatedAt?: string;
}

export interface Reservation {
  id: string;
  propertyId: string;
  propertyName: string;
  userId?: string;
  roomType: string;
  moveInDate: string;
  leaseDurationMonths: number;
  tokenPaid: number;
  status: 'active' | 'under_review' | 'confirmed' | 'cancelled';
  bookingRef: string;
  createdAt?: string;
}

export interface FirestoreReport {
  id: string;
  propertyId: string;
  propertyName: string;
  reportedBy: string;
  reportedByName?: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export interface FirestoreWishlist {
  userId: string;
  propertyIds: string[];
  updatedAt: string;
}
