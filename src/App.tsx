import React, { useState, useEffect, useCallback } from 'react';
import { 
  CurrencyCode, 
  UniversityHub, 
  Property, 
  RoomOption, 
  FilterState, 
  TourBooking, 
  Reservation,
  Review
} from './types';
import { UNIVERSITY_HUBS, PROPERTIES } from './data/mockData';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { PopularDestinations } from './components/PopularDestinations';
import { PropertyList } from './components/PropertyList';
import { TrustAndFeaturesSection } from './components/TrustAndFeaturesSection';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { TrueCostCalculator } from './components/TrueCostCalculator';
import { CompareModal } from './components/CompareModal';
import { FloatingCompareBar } from './components/FloatingCompareBar';
import { RoommateMatcher } from './components/RoommateMatcher';
import { SavedStaysView } from './components/SavedStaysView';
import { AIAdvisorModal } from './components/AIAdvisorModal';
import { BookTourModal } from './components/BookTourModal';
import { ReserveBedModal } from './components/ReserveBedModal';
import { ListPropertyModal } from './components/ListPropertyModal';
import { OwnerDashboardModal } from './components/OwnerDashboardModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { AuthModal } from './components/AuthModal';
import { ReportPropertyModal } from './components/ReportPropertyModal';
import { SmartStayMatchModal } from './components/SmartStayMatchModal';
import { StudentPreferences } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  Building2, 
  ShieldCheck, 
  Heart, 
  CheckCircle2, 
  Info,
  Calendar,
  Sparkles,
  Award,
  Sliders,
  RotateCcw,
  Loader2
} from 'lucide-react';
import {
  getStoredProperties,
  saveStoredProperties,
  getStoredSavedIds,
  saveStoredSavedIds,
  getStoredCompareIds,
  saveStoredCompareIds,
  getStoredTourBookings,
  addStoredTourBooking,
  saveStoredTourBookings,
  getStoredReservations,
  addStoredReservation,
  saveStoredReservations,
  getStoredRecentlyViewedIds,
  addStoredRecentlyViewedId,
  getStoredSelectedHubId,
  saveStoredSelectedHubId,
  getStoredCurrency,
  saveStoredCurrency,
  getStoredFilters,
  saveStoredFilters,
  resetAllStorage
} from './utils/storage';
import {
  fetchProperties,
  seedInitialProperties,
  saveProperty,
  updateRoomAvailability,
  updatePropertyVerification,
  submitReport
} from './firebase/services/propertyService';
import {
  fetchWishlist,
  toggleWishlistProperty
} from './firebase/services/wishlistService';
import {
  createVisitRequest,
  fetchVisitRequestsForUser
} from './firebase/services/visitRequestService';
import { addReview } from './firebase/services/reviewService';

function MainStayFindApp() {
  const { user, userProfile, isOwner, isAdmin, isStudent, authModalOpen, closeAuthModal, authModalMode } = useAuth();

  // 1. Core State
  const [allProperties, setAllProperties] = useState<Property[]>(() => getStoredProperties());
  const [loadingInitialData, setLoadingInitialData] = useState<boolean>(true);
  
  const [selectedHub, setSelectedHub] = useState<UniversityHub>(() => {
    const hubId = getStoredSelectedHubId();
    return UNIVERSITY_HUBS.find(h => h.id === hubId) || UNIVERSITY_HUBS[0];
  });

  const [currency, setCurrency] = useState<CurrencyCode>(() => getStoredCurrency());
  const [currentTab, setCurrentTab] = useState<'explore' | 'calculator' | 'compare' | 'roommates' | 'saved'>('explore');
  
  // Bookmarks & Comparisons
  const [savedIds, setSavedIds] = useState<string[]>(() => getStoredSavedIds());
  
  const [comparedProperties, setComparedProperties] = useState<Property[]>(() => {
    const initialProps = getStoredProperties();
    const compareIds = getStoredCompareIds();
    return initialProps.filter(p => compareIds.includes(p.id));
  });

  // Tour Bookings & Bed Reservations
  const [tourBookings, setTourBookings] = useState<TourBooking[]>(() => getStoredTourBookings());
  const [reservations, setReservations] = useState<Reservation[]>(() => getStoredReservations());
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => getStoredRecentlyViewedIds());

  // Modals
  const [selectedPropertyDetail, setSelectedPropertyDetail] = useState<Property | null>(null);
  const [tourProperty, setTourProperty] = useState<Property | null>(null);
  const [reserveModalData, setReserveModalData] = useState<{ property: Property; room: RoomOption } | null>(null);
  const [reportPropertyData, setReportPropertyData] = useState<Property | null>(null);
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [isSmartMatchOpen, setIsSmartMatchOpen] = useState(false);
  const [studentPreferences, setStudentPreferences] = useState<StudentPreferences | null>(() => ({
    monthlyBudget: 600,
    roomType: 'single',
    genderPreference: 'any',
    maxDistanceKm: 2.5,
    requiredFacilities: ['wifi', 'meals', 'ac'],
    safetyPriority: 'high'
  }));
  const [isListPropertyOpen, setIsListPropertyOpen] = useState(false);
  const [isOwnerDashboardOpen, setIsOwnerDashboardOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 2. Load Properties from Firestore
  const loadFirestoreProperties = useCallback(async () => {
    try {
      let props = await fetchProperties();
      if (!props || props.length === 0) {
        // Seed initial properties to Firestore
        await seedInitialProperties();
        props = await fetchProperties();
      }
      if (props && props.length > 0) {
        setAllProperties(props);
        saveStoredProperties(props);
      }
    } catch (e) {
      console.warn('Firestore property load fallback to storage/mock:', e);
    } finally {
      setLoadingInitialData(false);
    }
  }, []);

  useEffect(() => {
    loadFirestoreProperties();
  }, [loadFirestoreProperties]);

  // 3. Sync User Wishlist & Tour Bookings from Firestore when authenticated
  useEffect(() => {
    if (user?.uid) {
      // Fetch Wishlist from Firestore
      fetchWishlist(user.uid)
        .then((remoteSaved) => {
          if (remoteSaved && remoteSaved.length > 0) {
            setSavedIds(remoteSaved);
            saveStoredSavedIds(remoteSaved);
          }
        })
        .catch(err => console.warn('Wishlist load error:', err));

      // Fetch User Visit Bookings
      fetchVisitRequestsForUser(user.uid)
        .then((remoteBookings) => {
          if (remoteBookings && remoteBookings.length > 0) {
            setTourBookings(remoteBookings);
            saveStoredTourBookings(remoteBookings);
          }
        })
        .catch(err => console.warn('Bookings load error:', err));
    }
  }, [user]);

  // Filter State
  const [filters, setFilters] = useState<FilterState>(() => {
    const defaultFilters: FilterState = {
      searchQuery: '',
      stateId: 'all',
      cityId: 'all',
      universityId: 'all',
      campusId: selectedHub.id,
      category: 'all',
      gender: 'all',
      roomType: 'all',
      maxBudget: 2500,
      maxDistanceMin: 30,
      mealsIncludedOnly: false,
      attachedBathOnly: false,
      acOnly: false,
      noCurfewOnly: false,
      wifiSpeedMin: 0,
      verifiedOnly: false,
      sortBy: 'recommended',
    };
    return getStoredFilters(defaultFilters);
  });

  // Local storage synchronization backups
  useEffect(() => {
    saveStoredProperties(allProperties);
  }, [allProperties]);

  useEffect(() => {
    saveStoredSavedIds(savedIds);
  }, [savedIds]);

  useEffect(() => {
    saveStoredCompareIds(comparedProperties.map(p => p.id));
  }, [comparedProperties]);

  useEffect(() => {
    saveStoredSelectedHubId(selectedHub.id);
  }, [selectedHub]);

  useEffect(() => {
    saveStoredCurrency(currency);
  }, [currency]);

  useEffect(() => {
    saveStoredFilters(filters);
  }, [filters]);

  useEffect(() => {
    saveStoredTourBookings(tourBookings);
  }, [tourBookings]);

  useEffect(() => {
    saveStoredReservations(reservations);
  }, [reservations]);

  useEffect(() => {
    setFilters(prev => ({ ...prev, campusId: selectedHub.id }));
  }, [selectedHub]);

  // Record Recently Viewed
  const handleSelectProperty = (property: Property) => {
    setSelectedPropertyDetail(property);
    const updatedRecent = addStoredRecentlyViewedId(property.id);
    setRecentlyViewedIds(updatedRecent);
  };

  // Bookmark Toggle with Firestore + Local State
  const handleToggleSave = async (propertyId: string) => {
    const isCurrentlySaved = savedIds.includes(propertyId);
    let nextSaved: string[];
    if (isCurrentlySaved) {
      nextSaved = savedIds.filter(id => id !== propertyId);
      showToast('Removed from your saved shortlist');
    } else {
      nextSaved = Array.from(new Set([...savedIds, propertyId]));
      showToast('Saved to your shortlist!');
    }
    setSavedIds(nextSaved);
    saveStoredSavedIds(nextSaved);

    if (user?.uid) {
      try {
        await toggleWishlistProperty(user.uid, propertyId);
      } catch (e) {
        console.error('Firestore wishlist update error:', e);
      }
    }
  };

  // Comparison Toggle
  const handleToggleCompare = (property: Property) => {
    const exists = comparedProperties.some(p => p.id === property.id);
    if (exists) {
      const updated = comparedProperties.filter(p => p.id !== property.id);
      setComparedProperties(updated);
      saveStoredCompareIds(updated.map(p => p.id));
      showToast(`Removed "${property.name}" from comparison`);
    } else {
      if (comparedProperties.length >= 3) {
        showToast('Maximum 3 properties can be compared at once. Remove one to add another.');
        return;
      }
      const updated = [...comparedProperties, property];
      setComparedProperties(updated);
      saveStoredCompareIds(updated.map(p => p.id));
      showToast(`Added "${property.name}" to comparison!`);
    }
  };

  // Add Custom Listed Property (Firestore + Local State)
  const handleAddNewProperty = async (newProp: Property) => {
    try {
      await saveProperty(newProp);
      const updated = [newProp, ...allProperties];
      setAllProperties(updated);
      saveStoredProperties(updated);
      showToast(`Property "${newProp.name}" submitted to Firestore!`);
    } catch (e) {
      console.error('Error saving property to Firestore:', e);
      const updated = [newProp, ...allProperties];
      setAllProperties(updated);
      showToast(`Property "${newProp.name}" saved locally.`);
    }
  };

  // Owner Action: Change Bed Availability (Firestore + Local State)
  const handleUpdatePropertyAvailability = async (
    propertyId: string, 
    roomId: string, 
    availableBeds: number,
    totalBeds?: number
  ) => {
    try {
      await updateRoomAvailability(propertyId, roomId, availableBeds, totalBeds);
    } catch (e) {
      console.error('Firestore availability update error:', e);
    }

    setAllProperties(prev => prev.map(p => {
      if (p.id !== propertyId) return p;
      return {
        ...p,
        roomOptions: p.roomOptions.map(r => {
          if (r.id !== roomId) return r;
          return {
            ...r,
            availableBeds,
            ...(totalBeds !== undefined ? { totalBeds } : {})
          };
        })
      };
    }));

    if (selectedPropertyDetail && selectedPropertyDetail.id === propertyId) {
      setSelectedPropertyDetail(prev => {
        if (!prev) return null;
        return {
          ...prev,
          roomOptions: prev.roomOptions.map(r => {
            if (r.id !== roomId) return r;
            return {
              ...r,
              availableBeds,
              ...(totalBeds !== undefined ? { totalBeds } : {})
            };
          })
        };
      });
    }
  };

  // Admin Action: Verify / Reject Property (Firestore + Local State)
  const handleUpdatePropertyVerification = async (propertyId: string, status: 'verified' | 'rejected') => {
    const isVerified = status === 'verified';
    try {
      await updatePropertyVerification(propertyId, status);
    } catch (e) {
      console.error('Firestore verification update error:', e);
    }

    setAllProperties(prev => prev.map(p => {
      if (p.id !== propertyId) return p;
      return {
        ...p,
        verified: isVerified,
        verificationStatus: status
      };
    }));

    if (selectedPropertyDetail && selectedPropertyDetail.id === propertyId) {
      setSelectedPropertyDetail(prev => prev ? { ...prev, verified: isVerified, verificationStatus: status } : null);
    }
  };

  // User Review Submission (Firestore + Local State)
  const handleAddPropertyReview = async (propertyId: string, review: Review) => {
    try {
      await addReview(propertyId, review);
    } catch (e) {
      console.error('Firestore review submit error:', e);
    }

    setAllProperties(prev => prev.map(p => {
      if (p.id !== propertyId) return p;
      const updatedReviews = [review, ...(p.reviews || [])];
      const newRating = Number((updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length).toFixed(1));
      return {
        ...p,
        reviews: updatedReviews,
        rating: newRating,
        reviewCount: updatedReviews.length
      };
    }));

    if (selectedPropertyDetail && selectedPropertyDetail.id === propertyId) {
      setSelectedPropertyDetail(prev => {
        if (!prev) return null;
        const updatedReviews = [review, ...(prev.reviews || [])];
        const newRating = Number((updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length).toFixed(1));
        return {
          ...prev,
          reviews: updatedReviews,
          rating: newRating,
          reviewCount: updatedReviews.length
        };
      });
    }

    showToast('Review submitted and saved to Firestore!');
  };

  // Tour Booking submission with Firestore
  const handleConfirmTourBooking = async (booking: TourBooking) => {
    try {
      await createVisitRequest({
        ...booking,
        userId: user?.uid || 'guest_user',
        ownerId: tourProperty?.ownerId || 'all_owners',
      });
    } catch (e) {
      console.error('Firestore tour booking error:', e);
    }

    const updated = addStoredTourBooking(booking);
    setTourBookings(updated);
    showToast(`Tour scheduled with ${tourProperty?.wardenContact?.name || 'Warden'}! Saved to Firestore.`);
  };

  // Bed Reservation submission with persistence & vacancy reduction
  const handleConfirmReservation = (res: Reservation) => {
    const updated = addStoredReservation(res);
    setReservations(updated);
    
    // Deduct 1 available bed in the reserved room
    const prop = allProperties.find(p => p.name === res.propertyName || p.id === res.propertyId);
    if (prop) {
      const room = prop.roomOptions.find(r => r.title === res.roomType || r.type === res.roomType);
      if (room && room.availableBeds > 0) {
        handleUpdatePropertyAvailability(prop.id, room.id, room.availableBeds - 1, room.totalBeds);
      }
    }
    showToast(`Bed successfully reserved! Ref: ${res.bookingRef}`);
  };

  // Report Property Submit
  const handleReportProperty = async (propertyId: string, propertyName: string, reason: string, description: string) => {
    try {
      await submitReport({
        propertyId,
        propertyName,
        reportedByUid: user?.uid || 'anonymous',
        reportedByName: userProfile?.name || 'Student',
        reason,
        description,
        status: 'pending'
      });
      showToast('Report submitted to Trust & Safety team.');
    } catch (e) {
      console.error('Report submission error:', e);
      showToast('Report submitted.');
    }
  };

  // Reset to original mock data
  const handleResetToDefaults = () => {
    resetAllStorage();
    setAllProperties(PROPERTIES);
    setSavedIds(['stay-01']);
    setComparedProperties([]);
    setTourBookings([]);
    setReservations([]);
    setRecentlyViewedIds([]);
    setSelectedHub(UNIVERSITY_HUBS[0]);
    setCurrency('USD');
    showToast('Storage successfully reset to initial default state.');
  };

  const savedPropertiesList = allProperties.filter(p => savedIds.includes(p.id));
  const recentlyViewedPropertiesList = recentlyViewedIds
    .map(id => allProperties.find(p => p.id === id))
    .filter((p): p is Property => Boolean(p));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedHub={selectedHub}
        setSelectedHub={setSelectedHub}
        currency={currency}
        setCurrency={setCurrency}
        savedCount={savedIds.length}
        compareCount={comparedProperties.length}
        onOpenAIAdvisor={() => setIsAIAdvisorOpen(true)}
        onOpenSmartMatch={() => setIsSmartMatchOpen(true)}
        onOpenListProperty={() => setIsListPropertyOpen(true)}
        onOpenOwnerDashboard={() => setIsOwnerDashboardOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: Explore Stays */}
        {currentTab === 'explore' && (
          <div className="space-y-8">
            <HeroSearch
              hub={selectedHub}
              onSelectHub={(newHub) => {
                setSelectedHub(newHub);
                saveStoredSelectedHubId(newHub.id);
                setFilters(prev => ({ ...prev, campusId: newHub.id }));
              }}
              filters={filters}
              setFilters={setFilters}
              currency={currency}
              totalListingsCount={allProperties.filter(p => p.campusId === selectedHub.id).length}
              onOpenFiltersDrawer={() => setIsFilterDrawerOpen(true)}
              onOpenSmartMatch={() => setIsSmartMatchOpen(true)}
            />

            <PopularDestinations
              selectedHub={selectedHub}
              onSelectHub={(newHub) => {
                setSelectedHub(newHub);
                saveStoredSelectedHubId(newHub.id);
                setFilters(prev => ({ ...prev, campusId: newHub.id }));
              }}
            />

            <PropertyList
              properties={allProperties}
              filters={filters}
              setFilters={setFilters}
              selectedHub={selectedHub}
              currency={currency}
              savedIds={savedIds}
              onToggleSave={handleToggleSave}
              comparedProperties={comparedProperties}
              onToggleCompare={handleToggleCompare}
              onSelectProperty={handleSelectProperty}
              onBookTour={(p) => setTourProperty(p)}
              isFilterDrawerOpen={isFilterDrawerOpen}
              setIsFilterDrawerOpen={setIsFilterDrawerOpen}
            />

            <TrustAndFeaturesSection
              onOpenSmartMatch={() => setIsSmartMatchOpen(true)}
              onOpenCalculator={() => setCurrentTab('calculator')}
              onOpenCompare={() => setCurrentTab('compare')}
            />
          </div>
        )}

        {/* TAB 2: TrueCost™ Calculator */}
        {currentTab === 'calculator' && (
          <TrueCostCalculator
            hub={selectedHub}
            currency={currency}
            onExploreStays={() => setCurrentTab('explore')}
          />
        )}

        {/* TAB 3: Compare Stays */}
        {currentTab === 'compare' && (
          <CompareModal
            comparedProperties={comparedProperties}
            onRemoveFromCompare={(id) => {
              const updated = comparedProperties.filter(p => p.id !== id);
              setComparedProperties(updated);
              saveStoredCompareIds(updated.map(p => p.id));
            }}
            onClearCompare={() => {
              setComparedProperties([]);
              saveStoredCompareIds([]);
            }}
            currency={currency}
            onSelectProperty={handleSelectProperty}
            onBookTour={(p) => setTourProperty(p)}
            onExploreMore={() => setCurrentTab('explore')}
            allProperties={allProperties}
            studentPreferences={studentPreferences}
            filters={filters}
            onAddToCompare={handleToggleCompare}
          />
        )}

        {/* TAB 4: Roommate Matcher */}
        {currentTab === 'roommates' && (
          <RoommateMatcher
            hub={selectedHub}
            currency={currency}
          />
        )}

        {/* TAB 5: Saved Stays & Requests */}
        {currentTab === 'saved' && (
          <SavedStaysView
            savedProperties={savedPropertiesList}
            onRemoveSaved={handleToggleSave}
            currency={currency}
            onSelectProperty={handleSelectProperty}
            onToggleCompare={handleToggleCompare}
            comparedIds={comparedProperties.map(p => p.id)}
            onBookTour={(p) => setTourProperty(p)}
            onExploreMore={() => setCurrentTab('explore')}
            tourBookings={tourBookings}
            reservations={reservations}
            recentlyViewedProperties={recentlyViewedPropertiesList}
            preferences={studentPreferences}
            allProperties={allProperties}
            onOpenSmartMatch={() => setIsSmartMatchOpen(true)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
              SF
            </div>
            <span className="font-extrabold text-slate-800 font-['Outfit',sans-serif]">
              StayFind Student Living
            </span>
            <span>• Verified Campus Accommodations with Firestore</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <button onClick={() => setCurrentTab('calculator')} className="hover:text-indigo-600 cursor-pointer">TrueCost™ Engine</button>
            <button onClick={() => setCurrentTab('roommates')} className="hover:text-indigo-600 cursor-pointer">Roommate Matcher</button>
            <button onClick={() => setIsAIAdvisorOpen(true)} className="hover:text-indigo-600 text-indigo-600 font-bold cursor-pointer">Ask AI Advisor</button>
            <button onClick={() => setIsOwnerDashboardOpen(true)} className="hover:text-indigo-600 font-bold text-slate-700 cursor-pointer">Owner Portal</button>
            <button onClick={() => setIsAdminDashboardOpen(true)} className="hover:text-emerald-700 font-bold text-emerald-600 cursor-pointer">Admin Verification</button>
            <button onClick={handleResetToDefaults} className="hover:text-rose-600 text-slate-400 flex items-center gap-1 cursor-pointer">
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Bottom Comparison Dock (When properties are selected and not on compare tab) */}
      {comparedProperties.length > 0 && currentTab !== 'compare' && (
        <FloatingCompareBar
          comparedProperties={comparedProperties}
          onRemoveProperty={(id) => {
            const updated = comparedProperties.filter(p => p.id !== id);
            setComparedProperties(updated);
            saveStoredCompareIds(updated.map(p => p.id));
          }}
          onClearAll={() => {
            setComparedProperties([]);
            saveStoredCompareIds([]);
          }}
          onOpenCompare={() => setCurrentTab('compare')}
          currency={currency}
        />
      )}

      {/* MODAL 1: Full Property Deep Dive */}
      {selectedPropertyDetail && (
        <PropertyDetailModal
          property={selectedPropertyDetail}
          onClose={() => setSelectedPropertyDetail(null)}
          currency={currency}
          isSaved={savedIds.includes(selectedPropertyDetail.id)}
          onToggleSave={handleToggleSave}
          isCompared={comparedProperties.some(p => p.id === selectedPropertyDetail.id)}
          onToggleCompare={handleToggleCompare}
          onBookTour={(p) => {
            setSelectedPropertyDetail(null);
            setTourProperty(p);
          }}
          onReserveBed={(p, room) => {
            setSelectedPropertyDetail(null);
            setReserveModalData({ property: p, room });
          }}
          onAddReview={handleAddPropertyReview}
          onReportProperty={(p) => setReportPropertyData(p)}
        />
      )}

      {/* MODAL 2: Book Tour */}
      {tourProperty && (
        <BookTourModal
          property={tourProperty}
          onClose={() => setTourProperty(null)}
          onConfirmBooking={(booking) => {
            handleConfirmTourBooking(booking);
          }}
        />
      )}

      {/* MODAL 3: Reserve Bed with Token */}
      {reserveModalData && (
        <ReserveBedModal
          property={reserveModalData.property}
          room={reserveModalData.room}
          currency={currency}
          onClose={() => setReserveModalData(null)}
          onConfirmReservation={(res) => {
            handleConfirmReservation(res);
          }}
        />
      )}

      {/* MODAL 4: AI Campus Living Advisor */}
      {isAIAdvisorOpen && (
        <AIAdvisorModal
          onClose={() => setIsAIAdvisorOpen(false)}
          hub={selectedHub}
          properties={allProperties.filter(p => p.campusId === selectedHub.id)}
          currency={currency}
          onSelectProperty={(p) => {
            setIsAIAdvisorOpen(false);
            handleSelectProperty(p);
          }}
        />
      )}

      {/* MODAL 5: List Property / PG */}
      {isListPropertyOpen && (
        <ListPropertyModal
          onClose={() => setIsListPropertyOpen(false)}
          selectedHub={selectedHub}
          onAddNewProperty={handleAddNewProperty}
        />
      )}

      {/* MODAL 6: Owner Vacancy Management */}
      {isOwnerDashboardOpen && (
        <OwnerDashboardModal
          properties={allProperties}
          onClose={() => setIsOwnerDashboardOpen(false)}
          currency={currency}
          onUpdateAvailability={handleUpdatePropertyAvailability}
          onOpenListProperty={() => setIsListPropertyOpen(true)}
        />
      )}

      {/* MODAL 7: Admin Verification Portal */}
      {isAdminDashboardOpen && (
        <AdminDashboardModal
          properties={allProperties}
          onClose={() => setIsAdminDashboardOpen(false)}
          currency={currency}
          onUpdateVerification={handleUpdatePropertyVerification}
          onResetToDefaults={handleResetToDefaults}
          onRefreshData={loadFirestoreProperties}
        />
      )}

      {/* MODAL 8: Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
        onLoginSuccess={(role) => {
          if (role === 'owner') {
            setIsOwnerDashboardOpen(true);
          } else if (role === 'admin') {
            setIsAdminDashboardOpen(true);
          }
        }}
      />

      {/* MODAL 9: Report Inaccurate Listing */}
      {reportPropertyData && (
        <ReportPropertyModal
          property={reportPropertyData}
          onClose={() => setReportPropertyData(null)}
          onSubmitReport={handleReportProperty}
        />
      )}

      {/* MODAL 10: Find My Perfect Stay - Smart Match */}
      {isSmartMatchOpen && (
        <SmartStayMatchModal
          isOpen={isSmartMatchOpen}
          onClose={() => setIsSmartMatchOpen(false)}
          properties={allProperties}
          currency={currency}
          onSelectProperty={(property) => {
            setIsSmartMatchOpen(false);
            handleSelectProperty(property);
          }}
          onSavePreferences={(prefs) => {
            setStudentPreferences(prefs);
            showToast('Preferences updated! Matches recalculated.');
          }}
          initialPreferences={studentPreferences || undefined}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainStayFindApp />
    </AuthProvider>
  );
}
