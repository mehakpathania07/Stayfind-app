import { 
  Property, 
  UniversityHub, 
  FilterState, 
  TourBooking, 
  Reservation, 
  CurrencyCode, 
  Review,
  RoomOption
} from '../types';
import { PROPERTIES, UNIVERSITY_HUBS, ROOMMATE_PROFILES } from '../data/mockData';

export const STORAGE_KEYS = {
  PROPERTIES: 'stayfind_properties_v4',
  SAVED_IDS: 'stayfind_saved_ids_v1',
  COMPARE_IDS: 'stayfind_compare_ids_v1',
  TOUR_BOOKINGS: 'stayfind_tour_bookings_v1',
  RESERVATIONS: 'stayfind_reservations_v1',
  RECENTLY_VIEWED_IDS: 'stayfind_recently_viewed_ids_v1',
  SELECTED_HUB_ID: 'stayfind_selected_hub_id_v1',
  CURRENCY: 'stayfind_currency_v1',
  FILTERS: 'stayfind_filters_v1',
  ROOMMATE_PREFERENCES: 'stayfind_roommate_prefs_v1',
  CALCULATOR_PREFERENCES: 'stayfind_calc_prefs_v1',
  CURRENT_TAB: 'stayfind_current_tab_v1',
  STUDENT_PREFERENCES: 'stayfind_student_preferences_v1',
} as const;

// Safe localStorage access helpers
function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const testKey = '__stayfind_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (!isStorageAvailable()) return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return defaultValue;
    return parsed as T;
  } catch (err) {
    console.warn(`[StayFind Storage] Failed to load key "${key}", using default:`, err);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): boolean {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[StayFind Storage] Failed to save key "${key}":`, err);
    return false;
  }
}

export function removeFromStorage(key: string): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[StayFind Storage] Failed to remove key "${key}":`, err);
  }
}

// 1. PROPERTIES (includes owner availability edits, admin verifications, new listings, and added reviews)
export function getStoredProperties(): Property[] {
  const loaded = getFromStorage<Property[]>(STORAGE_KEYS.PROPERTIES, PROPERTIES);
  if (!Array.isArray(loaded) || loaded.length === 0) {
    saveToStorage(STORAGE_KEYS.PROPERTIES, PROPERTIES);
    return PROPERTIES;
  }
  
  // Merge any newly introduced regional mock properties
  const loadedIds = new Set(loaded.map(p => p.id));
  const missingFromLoaded = PROPERTIES.filter(p => !loadedIds.has(p.id));
  if (missingFromLoaded.length > 0) {
    const merged = [...loaded, ...missingFromLoaded];
    saveToStorage(STORAGE_KEYS.PROPERTIES, merged);
    return merged;
  }
  
  return loaded;
}

export function saveStoredProperties(properties: Property[]): void {
  saveToStorage(STORAGE_KEYS.PROPERTIES, properties);
}

// 2. SAVED / WISHLIST IDS
export function getStoredSavedIds(): string[] {
  const loaded = getFromStorage<string[]>(STORAGE_KEYS.SAVED_IDS, ['stay-01']);
  if (!Array.isArray(loaded)) return ['stay-01'];
  // Deduplicate
  return Array.from(new Set(loaded.filter(id => typeof id === 'string' && id.trim() !== '')));
}

export function saveStoredSavedIds(ids: string[]): void {
  const uniqueIds = Array.from(new Set(ids.filter(id => typeof id === 'string' && id.trim() !== '')));
  saveToStorage(STORAGE_KEYS.SAVED_IDS, uniqueIds);
}

// 3. COMPARE SELECTIONS
export function getStoredCompareIds(): string[] {
  const loaded = getFromStorage<string[]>(STORAGE_KEYS.COMPARE_IDS, []);
  if (!Array.isArray(loaded)) return [];
  return Array.from(new Set(loaded.filter(id => typeof id === 'string' && id.trim() !== '')));
}

export function saveStoredCompareIds(ids: string[]): void {
  const uniqueIds = Array.from(new Set(ids.filter(id => typeof id === 'string' && id.trim() !== '')));
  saveToStorage(STORAGE_KEYS.COMPARE_IDS, uniqueIds);
}

// 4. VISIT / BOOKING REQUESTS (Tour bookings and Token Bed Reservations)
export function getStoredTourBookings(): TourBooking[] {
  const loaded = getFromStorage<TourBooking[]>(STORAGE_KEYS.TOUR_BOOKINGS, []);
  if (!Array.isArray(loaded)) return [];
  return loaded;
}

export function saveStoredTourBookings(bookings: TourBooking[]): void {
  // Avoid duplicate booking IDs
  const seen = new Set<string>();
  const uniqueBookings = bookings.filter(b => {
    if (!b.id || seen.has(b.id)) return false;
    seen.add(b.id);
    return true;
  });
  saveToStorage(STORAGE_KEYS.TOUR_BOOKINGS, uniqueBookings);
}

export function addStoredTourBooking(booking: TourBooking): TourBooking[] {
  const current = getStoredTourBookings();
  // Check if identical booking already exists
  const isDuplicate = current.some(
    b => b.id === booking.id || 
    (b.propertyId === booking.propertyId && b.date === booking.date && b.timeSlot === booking.timeSlot && b.studentPhone === booking.studentPhone)
  );
  const updated = isDuplicate ? current : [booking, ...current];
  saveStoredTourBookings(updated);
  return updated;
}

export function getStoredReservations(): Reservation[] {
  const loaded = getFromStorage<Reservation[]>(STORAGE_KEYS.RESERVATIONS, []);
  if (!Array.isArray(loaded)) return [];
  return loaded;
}

export function saveStoredReservations(reservations: Reservation[]): void {
  const seen = new Set<string>();
  const uniqueRes = reservations.filter(r => {
    if (!r.id || seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
  saveToStorage(STORAGE_KEYS.RESERVATIONS, uniqueRes);
}

export function addStoredReservation(res: Reservation): Reservation[] {
  const current = getStoredReservations();
  const isDuplicate = current.some(r => r.id === res.id || r.bookingRef === res.bookingRef);
  const updated = isDuplicate ? current : [res, ...current];
  saveStoredReservations(updated);
  return updated;
}

// 5. RECENTLY VIEWED PROPERTIES
export function getStoredRecentlyViewedIds(): string[] {
  const loaded = getFromStorage<string[]>(STORAGE_KEYS.RECENTLY_VIEWED_IDS, []);
  if (!Array.isArray(loaded)) return [];
  return Array.from(new Set(loaded.filter(id => typeof id === 'string' && id.trim() !== '')));
}

export function addStoredRecentlyViewedId(propertyId: string): string[] {
  if (!propertyId) return getStoredRecentlyViewedIds();
  const current = getStoredRecentlyViewedIds();
  const filtered = current.filter(id => id !== propertyId);
  const updated = [propertyId, ...filtered].slice(0, 12); // Keep up to 12 recent properties
  saveToStorage(STORAGE_KEYS.RECENTLY_VIEWED_IDS, updated);
  return updated;
}

// 6. USER PREFERENCES (Hub, Currency, Filters, Roommate preferences, Calculator)
export function getStoredSelectedHubId(): string {
  const loaded = getFromStorage<string>(STORAGE_KEYS.SELECTED_HUB_ID, UNIVERSITY_HUBS[0].id);
  const exists = UNIVERSITY_HUBS.some(h => h.id === loaded);
  return exists ? loaded : UNIVERSITY_HUBS[0].id;
}

export function saveStoredSelectedHubId(hubId: string): void {
  saveToStorage(STORAGE_KEYS.SELECTED_HUB_ID, hubId);
}

export function getStoredCurrency(): CurrencyCode {
  const loaded = getFromStorage<CurrencyCode>(STORAGE_KEYS.CURRENCY, 'USD');
  const validCurrencies: CurrencyCode[] = ['USD', 'INR', 'GBP', 'EUR'];
  return validCurrencies.includes(loaded) ? loaded : 'USD';
}

export function saveStoredCurrency(currency: CurrencyCode): void {
  saveToStorage(STORAGE_KEYS.CURRENCY, currency);
}

export function getStoredFilters(defaultFilters: FilterState): FilterState {
  const loaded = getFromStorage<FilterState>(STORAGE_KEYS.FILTERS, defaultFilters);
  return {
    ...defaultFilters,
    ...loaded,
  };
}

export function saveStoredFilters(filters: FilterState): void {
  saveToStorage(STORAGE_KEYS.FILTERS, filters);
}

export interface RoommatePreferences {
  gender: 'all' | 'male' | 'female';
  sleepSchedule: 'all' | 'early_bird' | 'night_owl';
  diet: 'all' | 'veg' | 'non_veg' | 'vegan';
}

export function getStoredRoommatePreferences(): RoommatePreferences {
  return getFromStorage<RoommatePreferences>(STORAGE_KEYS.ROOMMATE_PREFERENCES, {
    gender: 'all',
    sleepSchedule: 'all',
    diet: 'all',
  });
}

export function saveStoredRoommatePreferences(prefs: RoommatePreferences): void {
  saveToStorage(STORAGE_KEYS.ROOMMATE_PREFERENCES, prefs);
}

export interface CalculatorPreferences {
  stayMonths: number;
  roomTypeChoice: 'single' | 'double' | 'studio';
  acHours: number;
  foodOption: 'full_mess' | 'cook_groceries' | 'eating_out';
  commuteType: 'walk' | 'bicycle' | 'transit' | 'cab';
  laundryLoads: number;
}

export function getStoredCalculatorPreferences(): CalculatorPreferences {
  return getFromStorage<CalculatorPreferences>(STORAGE_KEYS.CALCULATOR_PREFERENCES, {
    stayMonths: 9,
    roomTypeChoice: 'double',
    acHours: 6,
    foodOption: 'full_mess',
    commuteType: 'walk',
    laundryLoads: 4,
  });
}

export function saveStoredCalculatorPreferences(prefs: CalculatorPreferences): void {
  saveToStorage(STORAGE_KEYS.CALCULATOR_PREFERENCES, prefs);
}

// 7. OWNER ACTIONS: Change bed availability & room details
export function updatePropertyAvailabilityInStorage(
  propertyId: string, 
  roomId: string, 
  newAvailableBeds: number,
  newTotalBeds?: number
): Property[] {
  const properties = getStoredProperties();
  const updated = properties.map(prop => {
    if (prop.id !== propertyId) return prop;
    const updatedRooms = prop.roomOptions.map(room => {
      if (room.id !== roomId) return room;
      return {
        ...room,
        availableBeds: Math.max(0, newAvailableBeds),
        ...(newTotalBeds !== undefined ? { totalBeds: Math.max(newAvailableBeds, newTotalBeds) } : {})
      };
    });
    return {
      ...prop,
      roomOptions: updatedRooms
    };
  });
  saveStoredProperties(updated);
  return updated;
}

// 8. ADMIN ACTIONS: Verify / Unverify Property or toggle status
export function updatePropertyVerificationInStorage(
  propertyId: string, 
  verified: boolean
): Property[] {
  const properties = getStoredProperties();
  const updated = properties.map(prop => {
    if (prop.id !== propertyId) return prop;
    return {
      ...prop,
      verified
    };
  });
  saveStoredProperties(updated);
  return updated;
}

// 9. USER REVIEWS: Add user-created review
export function addPropertyReviewInStorage(
  propertyId: string, 
  newReview: Review
): Property[] {
  const properties = getStoredProperties();
  const updated = properties.map(prop => {
    if (prop.id !== propertyId) return prop;
    const existingReviews = prop.reviews || [];
    const reviews = [newReview, ...existingReviews];
    const totalScore = reviews.reduce((sum, r) => sum + r.rating, 0);
    const newRating = Number((totalScore / reviews.length).toFixed(2));
    return {
      ...prop,
      reviews,
      rating: newRating,
      reviewCount: reviews.length
    };
  });
  saveStoredProperties(updated);
  return updated;
}

// 10. STUDENT PREFERENCES (Smart Stay Match)
export function getStoredStudentPreferences(): import('../types').StudentPreferences | null {
  return getFromStorage<import('../types').StudentPreferences | null>(STORAGE_KEYS.STUDENT_PREFERENCES, null);
}

export function saveStoredStudentPreferences(preferences: import('../types').StudentPreferences | null): void {
  if (!preferences) {
    removeFromStorage(STORAGE_KEYS.STUDENT_PREFERENCES);
  } else {
    saveToStorage(STORAGE_KEYS.STUDENT_PREFERENCES, preferences);
  }
}

// 11. RESET EVERYTHING TO ORIGINAL MOCK DATA (if user wishes)
export function resetAllStorage(): void {
  if (!isStorageAvailable()) return;
  Object.values(STORAGE_KEYS).forEach(k => {
    try {
      window.localStorage.removeItem(k);
    } catch {}
  });
}
