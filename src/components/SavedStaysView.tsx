import React, { useState, useMemo } from 'react';
import { 
  Bookmark, 
  Trash2, 
  Scale, 
  Footprints, 
  Utensils, 
  Wifi, 
  ExternalLink,
  Plus,
  Share2,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  History,
  ShieldCheck,
  Phone,
  Video,
  FileText,
  Sliders,
  Award,
  Zap
} from 'lucide-react';
import { Property, CurrencyCode, TourBooking, Reservation, StudentPreferences } from '../types';
import { formatPrice } from '../utils/currency';
import { calculateStayMatchScore, calculateSafetyScore } from '../utils/matchingAndSafety';
import { handleImageError, FALLBACK_IMAGE } from '../utils/propertyImages';

interface SavedStaysViewProps {
  savedProperties: Property[];
  onRemoveSaved: (id: string) => void;
  currency: CurrencyCode;
  onSelectProperty: (property: Property) => void;
  onToggleCompare: (property: Property) => void;
  comparedIds: string[];
  onBookTour: (property: Property) => void;
  onExploreMore: () => void;
  tourBookings?: TourBooking[];
  reservations?: Reservation[];
  recentlyViewedProperties?: Property[];
  preferences?: StudentPreferences | null;
  allProperties?: Property[];
  onOpenSmartMatch?: () => void;
}

export const SavedStaysView: React.FC<SavedStaysViewProps> = ({
  savedProperties,
  onRemoveSaved,
  currency,
  onSelectProperty,
  onToggleCompare,
  comparedIds,
  onBookTour,
  onExploreMore,
  tourBookings = [],
  reservations = [],
  recentlyViewedProperties = [],
  preferences,
  allProperties = [],
  onOpenSmartMatch,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'saved' | 'recommendations' | 'bookings' | 'recent'>('saved');

  const totalBookingsCount = tourBookings.length + reservations.length;

  // Calculate recommended properties based on preferences
  const rankedRecommendations = useMemo(() => {
    if (!preferences || allProperties.length === 0) return [];
    return allProperties
      .map(p => {
        const match = calculateStayMatchScore(preferences, p);
        return { property: p, match };
      })
      .sort((a, b) => b.match.matchPercentage - a.match.matchPercentage)
      .slice(0, 6);
  }, [preferences, allProperties]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 text-rose-700 rounded-full text-xs font-bold mb-1">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Personal Student Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
            Student Dashboard
          </h2>
          <p className="text-xs text-slate-500">
            Access your personalized stay preferences, recommendations, bookmarked rooms, and visit schedules.
          </p>
        </div>

        {/* Sub-tabs Selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl flex-wrap">
          <button
            onClick={() => setActiveSubTab('saved')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'saved'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-rose-500" />
            <span>Wishlist ({savedProperties.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('recommendations')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'recommendations'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Matches & Recommendations</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bookings')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'bookings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Bookings & Visits ({totalBookingsCount})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('recent')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'recent'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5 text-slate-600" />
            <span>Recently Viewed ({recentlyViewedProperties.length})</span>
          </button>
        </div>
      </div>

      {/* Your Stay Preferences Banner Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/10 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full border border-white/10">
            <Sliders className="w-3.5 h-3.5" />
            <span>Your Stay Preferences</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black">
            {preferences ? 'Smart Match Criteria Configured' : 'Find Your Perfect Student Stay'}
          </h3>
          {preferences ? (
            <div className="flex flex-wrap gap-2 text-xs text-indigo-100 pt-1">
              <span className="bg-white/10 px-2.5 py-1 rounded-lg">
                💰 Budget: {formatPrice(preferences.monthlyBudget, currency)}/mo
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg capitalize">
                🛏️ Room: {preferences.roomType}
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg capitalize">
                👥 Gender: {preferences.genderPreference}
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg">
                🚶 Max Distance: {preferences.maxDistanceKm} km
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg capitalize">
                🛡️ Safety: {preferences.safetyPriority}
              </span>
            </div>
          ) : (
            <p className="text-xs text-indigo-200 max-w-xl">
              Set your budget, room type, campus distance, and required facilities to get algorithmic match scores and tailored recommendations.
            </p>
          )}
        </div>

        <button
          onClick={onOpenSmartMatch}
          className="px-5 py-3 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-extrabold text-xs shadow-lg transition-all hover:scale-105 shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>{preferences ? 'Edit Preferences' : 'Find My Perfect Stay'}</span>
        </button>
      </div>

      {/* SUB-TAB 0: Recommendations */}
      {activeSubTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                Recommended Stays for You
              </h3>
              <p className="text-xs text-slate-500">
                Calculated using your budget, proximity, room type, and safety preference weights.
              </p>
            </div>
            {preferences && (
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                {rankedRecommendations.length} Top Matches
              </span>
            )}
          </div>

          {!preferences ? (
            <div className="max-w-2xl mx-auto text-center py-12 px-4 space-y-4 bg-white rounded-3xl border border-slate-200 p-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900">
                No Preference Profile Found
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Complete the step-by-step smart match form to get ranked recommendations with breakdown analysis.
              </p>
              <button
                onClick={onOpenSmartMatch}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Launch Smart Stay Match</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rankedRecommendations.map(({ property: prop, match }) => {
                const isCompared = comparedIds.includes(prop.id);
                const minRent = Math.min(...prop.roomOptions.map(r => r.nominalMonthlyRent));
                const safety = calculateSafetyScore(prop);

                return (
                  <div
                    key={prop.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition-all p-4 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100">
                        <img
                          src={prop.coverImage || FALLBACK_IMAGE}
                          alt={prop.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
                        />
                        {/* Match Score Badge & Trust Badge */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                          <div className="bg-indigo-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-black text-amber-300 flex items-center gap-1 shadow-sm border border-indigo-400/40">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>{match.matchPercentage}% Match</span>
                          </div>
                          {prop.isDemo || prop.isSampleData ? (
                            <span className="bg-amber-900/90 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                              Demo
                            </span>
                          ) : (prop.verified || prop.verificationStatus === 'verified') ? (
                            <span className="bg-emerald-800/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              Verified
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-sm">
                            {prop.category}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {formatPrice(minRent, currency)}/mo
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">
                          {prop.name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {prop.address}
                        </p>
                      </div>

                      {/* Match reasons */}
                      <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                        {match.matchingPoints.slice(0, 2).map((r, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="line-clamp-1">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => onSelectProperty(prop)}
                        className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>View Room</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onToggleCompare(prop)}
                        className={`p-2 rounded-xl border transition-colors ${
                          isCompared
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                        title="Compare stay"
                      >
                        <Scale className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 1: Saved Shortlist */}
      {activeSubTab === 'saved' && (
        <>
          {savedProperties.length === 0 ? (
            <div className="max-w-3xl mx-auto text-center py-16 px-4 space-y-4 bg-white rounded-3xl border border-slate-200 p-8">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                Your Shortlist is Empty
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Save your favorite PGs, student co-living pods, or studio apartments to compare them later or share with your parents and roommates.
              </p>
              <button
                onClick={onExploreMore}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Explore Verified Stays</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedProperties.map((prop) => {
                const isCompared = comparedIds.includes(prop.id);
                const minRent = Math.min(...prop.roomOptions.map(r => r.nominalMonthlyRent));

                return (
                  <div
                    key={prop.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition-all p-4 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100">
                        <img
                          src={prop.coverImage || FALLBACK_IMAGE}
                          alt={prop.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                          {prop.isDemo || prop.isSampleData ? (
                            <span className="bg-amber-900/90 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                              Demo
                            </span>
                          ) : (prop.verified || prop.verificationStatus === 'verified') ? (
                            <span className="bg-emerald-800/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              Verified
                            </span>
                          ) : (
                            <span className="bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
                              Unverified
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => onRemoveSaved(prop.id)}
                          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 hover:bg-rose-500 text-slate-700 hover:text-white transition-all shadow-md cursor-pointer"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-sm">
                            {prop.category}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {formatPrice(minRent, currency)}/mo
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">
                          {prop.name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {prop.address}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <Footprints className="w-3.5 h-3.5" />
                          <span>{prop.commuteOptions[0]?.durationMin}m walk</span>
                        </div>
                        {prop.mealsIncluded && (
                          <div className="flex items-center gap-1 text-slate-700">
                            <Utensils className="w-3 h-3 text-indigo-500" />
                            <span>Meals</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-slate-700">
                          <Wifi className="w-3 h-3 text-sky-500" />
                          <span>{prop.wifiSpeedMbps}M</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => onToggleCompare(prop)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border cursor-pointer ${
                          isCompared
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-700 border-slate-200'
                        }`}
                        title={isCompared ? 'Remove from comparison' : 'Add to side-by-side comparison'}
                      >
                        <Scale className={`w-3.5 h-3.5 ${isCompared ? 'text-white' : 'text-indigo-600'}`} />
                        <span>{isCompared ? 'In Compare' : 'Add to Compare'}</span>
                      </button>

                      <button
                        onClick={() => onSelectProperty(prop)}
                        className="py-2 px-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* SUB-TAB 2: Bookings & Visit Requests */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-6">
          {totalBookingsCount === 0 ? (
            <div className="max-w-3xl mx-auto text-center py-16 px-4 space-y-4 bg-white rounded-3xl border border-slate-200 p-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                No Visit or Reservation Requests Yet
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Schedule free in-person property tours or lock room slots with refundable token deposits. All requests are saved persistently.
              </p>
              <button
                onClick={onExploreMore}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Explore Stays & Book Tour</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Tour Bookings */}
              {tourBookings.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>Scheduled Property Visits ({tourBookings.length})</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tourBookings.map((tour) => (
                      <div
                        key={tour.id}
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Confirmed Visit
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {tour.tourType === 'in_person' ? '🚶 In-Person Tour' : '📹 Video Call Tour'}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-base text-slate-900">
                            {tour.propertyName}
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Date: <strong>{tour.date}</strong> at <strong>{tour.timeSlot}</strong></span>
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1">
                          <p><strong>Student:</strong> {tour.studentName} ({tour.studentPhone})</p>
                          <p><strong>Email:</strong> {tour.studentEmail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bed Reservations */}
              {reservations.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Active Bed Token Reservations ({reservations.length})</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reservations.map((res) => (
                      <div
                        key={res.id}
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <FileText className="w-3.5 h-3.5" />
                            Ref: {res.bookingRef}
                          </span>
                          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            Token: {formatPrice(res.tokenPaid, currency)}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-base text-slate-900">
                            {res.propertyName}
                          </h4>
                          <p className="text-xs text-slate-600 font-semibold mt-0.5">
                            {res.roomType} • {res.leaseDurationMonths} Months Lease
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 flex items-center justify-between">
                          <span>Move-in Date: <strong>{res.moveInDate}</strong></span>
                          <span className="text-indigo-600 font-bold">100% Refundable</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: Recently Viewed */}
      {activeSubTab === 'recent' && (
        <>
          {recentlyViewedProperties.length === 0 ? (
            <div className="max-w-3xl mx-auto text-center py-16 px-4 space-y-4 bg-white rounded-3xl border border-slate-200 p-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto shadow-inner">
                <History className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                No Recently Viewed Properties
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Properties you explore or inspect in detail will automatically be logged here for convenient access across browser sessions.
              </p>
              <button
                onClick={onExploreMore}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Explore Stays</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentlyViewedProperties.map((prop) => {
                const minRent = Math.min(...prop.roomOptions.map(r => r.nominalMonthlyRent));
                return (
                  <div
                    key={prop.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition-all p-4 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100">
                        <img
                          src={prop.coverImage || FALLBACK_IMAGE}
                          alt={prop.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
                        />
                        {prop.verified && (
                          <div className="absolute top-2.5 left-2.5 bg-white/95 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-emerald-700 flex items-center gap-1 shadow-sm">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-sm">
                            {prop.category}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {formatPrice(minRent, currency)}/mo
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">
                          {prop.name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {prop.address}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectProperty(prop)}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>View Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
};
