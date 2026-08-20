import React, { useState, useMemo } from 'react';
import { 
  X, 
  Scale, 
  Check, 
  Minus, 
  Star, 
  Footprints, 
  Utensils, 
  Wifi, 
  ShieldCheck, 
  Calendar,
  ExternalLink,
  Plus,
  Sparkles,
  Zap,
  DollarSign,
  MapPin,
  Clock,
  Wind,
  Bath,
  Home,
  CheckCircle2,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  ArrowRight,
  Info,
  TrendingDown,
  Award,
  Layers
} from 'lucide-react';
import { Property, CurrencyCode, StudentPreferences, FilterState } from '../types';
import { formatPrice } from '../utils/currency';
import { calculateSafetyScore, calculateTrueCost, calculateStayMatchScore } from '../utils/matchingAndSafety';
import { handleImageError, FALLBACK_IMAGE } from '../utils/propertyImages';

interface CompareModalProps {
  comparedProperties: Property[];
  onRemoveFromCompare: (propertyId: string) => void;
  onClearCompare: () => void;
  currency: CurrencyCode;
  onSelectProperty: (property: Property) => void;
  onBookTour: (property: Property) => void;
  onExploreMore: () => void;
  allProperties?: Property[];
  studentPreferences?: StudentPreferences | null;
  filters?: FilterState;
  onAddToCompare?: (property: Property) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  comparedProperties,
  onRemoveFromCompare,
  onClearCompare,
  currency,
  onSelectProperty,
  onBookTour,
  onExploreMore,
  allProperties = [],
  studentPreferences,
  filters,
  onAddToCompare,
}) => {
  const [isAddPickerOpen, setIsAddPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDifferenceOnly, setShowDifferenceOnly] = useState(false);

  // Derive effective preferences for matching
  const effectivePreferences: StudentPreferences = useMemo(() => {
    if (studentPreferences) return studentPreferences;
    return {
      maxBudget: filters?.maxBudget || 20000,
      roomType: (filters?.roomType as any) || 'any',
      genderPolicy: (filters?.gender as any) || 'any',
      maxDistanceKm: (filters?.maxDistanceMin ? filters.maxDistanceMin / 12 : 2.0),
      foodRequired: filters?.mealsIncludedOnly ? 'yes' : 'optional',
      acRequired: Boolean(filters?.acOnly),
      wifiRequired: Boolean(filters?.wifiSpeedMin && filters.wifiSpeedMin > 0),
      attachedBath: filters?.attachedBathOnly ? 'required' : 'preferred',
      laundry: 'preferred',
      powerBackup: 'preferred',
      preferredSafetyLevel: 'high',
    };
  }, [studentPreferences, filters]);

  // Compute rich dynamic analysis for all compared properties
  const propertyAnalysis = useMemo(() => {
    return comparedProperties.map((p) => {
      const defaultRoom = p.roomOptions.find(r => r.id === p.defaultRoomId) || p.roomOptions[0] || {
        id: 'room_default',
        type: 'single',
        title: 'Single Room',
        nominalMonthlyRent: p.monthlyRent || 8000,
        depositMonths: 1,
        availableBeds: 1,
        totalBeds: 1,
        sizeSqFt: 140,
        attachedBath: false,
        balcony: false,
        airConditioning: false,
        studyDeskIncluded: true,
        images: []
      };

      const trueCost = calculateTrueCost(p, defaultRoom);
      const safety = calculateSafetyScore(p);
      const match = calculateStayMatchScore(p, effectivePreferences);
      
      const minRent = p.roomOptions?.length 
        ? Math.min(...p.roomOptions.map(r => r.nominalMonthlyRent))
        : (p.monthlyRent || 8000);
        
      const maxRent = p.roomOptions?.length 
        ? Math.max(...p.roomOptions.map(r => r.nominalMonthlyRent))
        : minRent;

      const shortestCommute = p.commuteOptions?.find(c => c.type === 'walk') || p.commuteOptions?.[0] || {
        type: 'walk',
        durationMin: 8,
        distanceKm: 0.6,
        monthlyCostEst: 0,
        description: 'Walk to Campus Gate'
      };

      const hasAC = p.roomOptions?.some(r => r.airConditioning) || 
        p.amenities?.some(a => a.name.toLowerCase().includes('ac') || a.name.toLowerCase().includes('air condition'));
        
      const allRoomsAC = p.roomOptions?.length > 0 && p.roomOptions.every(r => r.airConditioning);

      const hasAttachedBath = p.roomOptions?.some(r => r.attachedBath);
      const allRoomsAttachedBath = p.roomOptions?.length > 0 && p.roomOptions.every(r => r.attachedBath);

      const totalAvailableBeds = p.roomOptions?.reduce((sum, r) => sum + (r.availableBeds || 0), 0) ?? 1;

      const isVerified = !p.isDemo && !p.isSampleData && (p.verified || p.verificationStatus === 'verified');
      const isDemo = Boolean(p.isDemo || p.isSampleData);

      const securityDepositAmount = trueCost.securityDeposit;
      const depositMonths = defaultRoom.depositMonths || 1;

      return {
        property: p,
        defaultRoom,
        trueCost,
        trueCostTotal: trueCost.trueMonthlyTotal,
        securityDeposit: securityDepositAmount,
        depositMonths,
        safetyScore: safety.score,
        safetyTier: safety.tier,
        safetyReasons: safety.reasons,
        matchPercentage: match.matchPercentage,
        matchBreakdown: match.scoreBreakdown,
        matchPoints: match.matchingPoints,
        missingPoints: match.missingPoints,
        minRent,
        maxRent,
        walkMinutes: shortestCommute.durationMin,
        distanceKm: shortestCommute.distanceKm,
        wifiSpeed: p.wifiSpeedMbps || 50,
        hasAC,
        allRoomsAC,
        hasAttachedBath,
        allRoomsAttachedBath,
        totalAvailableBeds,
        isVerified,
        isDemo,
        roomTypes: p.roomOptions?.map(r => r.title || r.type) || ['Standard Room']
      };
    });
  }, [comparedProperties, effectivePreferences]);

  // Determine standout metrics across items for objective highlighting
  const highlights = useMemo(() => {
    if (propertyAnalysis.length <= 1) return {};
    
    const lowestRent = Math.min(...propertyAnalysis.map(a => a.minRent));
    const lowestTrueCost = Math.min(...propertyAnalysis.map(a => a.trueCostTotal));
    const shortestDistance = Math.min(...propertyAnalysis.map(a => a.distanceKm));
    const fastestWalk = Math.min(...propertyAnalysis.map(a => a.walkMinutes));
    const highestSafety = Math.max(...propertyAnalysis.map(a => a.safetyScore));
    const highestRating = Math.max(...propertyAnalysis.map(a => a.property.rating));
    const highestWifi = Math.max(...propertyAnalysis.map(a => a.wifiSpeed));
    const lowestDeposit = Math.min(...propertyAnalysis.map(a => a.securityDeposit));
    const highestMatch = Math.max(...propertyAnalysis.map(a => a.matchPercentage));
    const mostAvailableBeds = Math.max(...propertyAnalysis.map(a => a.totalAvailableBeds));

    return {
      lowestRent,
      lowestTrueCost,
      shortestDistance,
      fastestWalk,
      highestSafety,
      highestRating,
      highestWifi,
      lowestDeposit,
      highestMatch,
      mostAvailableBeds
    };
  }, [propertyAnalysis]);

  // Determine Best Match Winner & Highlights
  const bestMatch = useMemo(() => {
    if (propertyAnalysis.length === 0) return null;
    return [...propertyAnalysis].sort((a, b) => b.matchPercentage - a.matchPercentage)[0];
  }, [propertyAnalysis]);

  const lowestCostPick = useMemo(() => {
    if (propertyAnalysis.length <= 1) return null;
    return [...propertyAnalysis].sort((a, b) => a.trueCostTotal - b.trueCostTotal)[0];
  }, [propertyAnalysis]);

  const closestDistancePick = useMemo(() => {
    if (propertyAnalysis.length <= 1) return null;
    return [...propertyAnalysis].sort((a, b) => a.distanceKm - b.distanceKm)[0];
  }, [propertyAnalysis]);

  // Candidates available to add to comparison
  const availableToAdd = useMemo(() => {
    const comparedIds = new Set(comparedProperties.map(p => p.id));
    return allProperties
      .filter(p => !comparedIds.has(p.id))
      .filter(p => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.neighborhood?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
        );
      });
  }, [allProperties, comparedProperties, searchQuery]);

  // Common amenities to check
  const standardAmenities = [
    { key: 'powerBackup', label: '24x7 Power Backup', check: (p: Property) => p.powerBackup || p.amenities?.some(a => a.name.toLowerCase().includes('backup') || a.name.toLowerCase().includes('generator')) },
    { key: 'housekeeping', label: 'Daily Housekeeping', check: (p: Property) => p.amenities?.some(a => a.name.toLowerCase().includes('housekeeping') || a.name.toLowerCase().includes('cleaning')) },
    { key: 'roWater', label: 'RO Drinking Water', check: (p: Property) => p.amenities?.some(a => a.name.toLowerCase().includes('ro') || a.name.toLowerCase().includes('water')) },
    { key: 'geyser', label: 'Geyser / 24x7 Hot Water', check: (p: Property) => p.amenities?.some(a => a.name.toLowerCase().includes('geyser') || a.name.toLowerCase().includes('hot water')) },
    { key: 'laundry', label: 'Washing Machine / Laundry', check: (p: Property) => p.amenities?.some(a => a.name.toLowerCase().includes('washing') || a.name.toLowerCase().includes('laundry')) },
    { key: 'refrigerator', label: 'Common Refrigerator', check: (p: Property) => p.amenities?.some(a => a.name.toLowerCase().includes('fridge') || a.name.toLowerCase().includes('refrigerator')) },
    { key: 'cctv', label: 'CCTV Security & Guard', check: (p: Property) => p.cctv || p.amenities?.some(a => a.name.toLowerCase().includes('cctv') || a.name.toLowerCase().includes('guard')) },
    { key: 'studyDesk', label: 'Study Table & Chair', check: (p: Property) => p.roomOptions?.some(r => r.studyDeskIncluded) || p.amenities?.some(a => a.name.toLowerCase().includes('desk') || a.name.toLowerCase().includes('study')) },
    { key: 'lift', label: 'Elevator / Lift', check: (p: Property) => p.amenities?.some(a => a.name.toLowerCase().includes('lift') || a.name.toLowerCase().includes('elevator')) },
    { key: 'lounge', label: 'Common Lounge / Gym', check: (p: Property) => p.amenities?.some(a => a.name.toLowerCase().includes('lounge') || a.name.toLowerCase().includes('gym') || a.name.toLowerCase().includes('tv')) },
  ];

  // If no properties are selected
  if (comparedProperties.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16 px-4 space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner border border-indigo-100">
          <Scale className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
            Side-by-Side PG & Room Comparison
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Select up to 3 student stays to compare real base rents, TrueCost™ living totals, walking distances, meals, AC, safety scores, and amenities.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onExploreMore}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-200 transition-all cursor-pointer"
            id="explore-properties-compare-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Browse Stays to Compare</span>
          </button>
        </div>

        {/* Informational feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-6 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs mb-2">
              1
            </div>
            <h4 className="font-bold text-xs text-slate-900">Up to 3 Properties</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Select 2 or 3 stays from property cards or detail pages to line them up side-by-side.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs mb-2">
              2
            </div>
            <h4 className="font-bold text-xs text-slate-900">TrueCost™ Clarity</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Compare actual out-of-pocket costs with meals, electricity, WiFi, and deposits included.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center font-bold text-xs mb-2">
              3
            </div>
            <h4 className="font-bold text-xs text-slate-900">Smart Best Match</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Receive a personalized recommendation tailored to your budget, commute, and comfort needs.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200 px-2 sm:px-4">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <button
              onClick={onExploreMore}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-colors cursor-pointer"
              id="return-to-search-btn"
            >
              <span>← Return to Search Results</span>
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
              <Scale className="w-3.5 h-3.5" />
              <span>Smart Side-by-Side Comparison</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
              Compare Stays
            </h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black ${
              comparedProperties.length === 3 ? 'bg-amber-600 text-white' : 'bg-slate-900 text-white'
            }`}>
              {comparedProperties.length} of 3 selected {comparedProperties.length === 3 ? '(Max Limit Reached)' : ''}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analyzing TrueCost™ monthly outflow, verified safety scores, food plans, and walk times.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {comparedProperties.length < 3 ? (
            <button
              onClick={() => setIsAddPickerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              id="add-stay-compare-btn"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Stay ({comparedProperties.length}/3)</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Max 3 Stays Added</span>
            </div>
          )}

          <button
            onClick={onClearCompare}
            className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            id="clear-all-compare-btn"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* SMART RECOMMENDATION BANNER (Requirement #8 & #7) */}
      {bestMatch && comparedProperties.length > 1 && (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      StayFind Match Recommendation
                    </span>
                    <span className="bg-white/10 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Personalized Analysis
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    🎯 Best Overall Match: <span className="text-amber-300">{bestMatch.property.name}</span> ({bestMatch.matchPercentage}% Match)
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectProperty(bestMatch.property)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <span>View Winner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Nuanced Decision Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              
              {/* Card 1: Best Match Why */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Award className="w-4 h-4" />
                  <span>Why {bestMatch.property.name} Wins</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Best overall alignment with your criteria: {bestMatch.walkMinutes} min walk ({bestMatch.distanceKm} km), safety score {bestMatch.safetyScore}/100, and {bestMatch.property.mealsIncluded ? 'includes chef meals' : 'flexible food options'}.
                </p>
                {bestMatch.matchPoints.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {bestMatch.matchPoints.slice(0, 2).map((pt, idx) => (
                      <span key={idx} className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> {pt}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card 2: Lowest Outflow / Value Pick */}
              {lowestCostPick && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <TrendingDown className="w-4 h-4" />
                    <span>Lowest TrueCost™ Option</span>
                  </div>
                  <div className="flex items-baseline gap-1 text-sm font-black text-white">
                    <span>{lowestCostPick.property.name}</span>
                    <span className="text-xs text-emerald-400">~{formatPrice(lowestCostPick.trueCostTotal, currency)}/mo</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {lowestCostPick.property.id === bestMatch.property.id 
                      ? 'Also the lowest monthly living outflow among your compared stays!' 
                      : `Saves you ~${formatPrice(Math.abs(bestMatch.trueCostTotal - lowestCostPick.trueCostTotal), currency)}/mo compared to ${bestMatch.property.name}.`}
                  </p>
                </div>
              )}

              {/* Card 3: Commute & Convenience Pick */}
              {closestDistancePick && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
                    <Footprints className="w-4 h-4" />
                    <span>Closest to Campus Gate</span>
                  </div>
                  <div className="flex items-baseline gap-1 text-sm font-black text-white">
                    <span>{closestDistancePick.property.name}</span>
                    <span className="text-xs text-sky-400">{closestDistancePick.walkMinutes} min walk</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Only {closestDistancePick.distanceKm} km from campus gate, saving daily commute time.
                  </p>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARISON TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[760px] table-fixed">
            
            {/* Column Width Definitions */}
            <colgroup>
              <col className="w-52 sm:w-60" />
              {propertyAnalysis.map(a => (
                <col key={a.property.id} className="w-64 sm:w-72" />
              ))}
              {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                <col key={`empty-col-${idx}`} className="w-64 sm:w-72" />
              ))}
            </colgroup>

            {/* HEADER ROW: Property Images & Titles */}
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="p-4 sm:p-5 align-top">
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Comparing Attributes
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Hover on highlights to see standout criteria.
                    </p>
                  </div>
                </th>

                {/* Compared Property Header Columns */}
                {propertyAnalysis.map(({ property: prop, isVerified, isDemo, minRent, trueCostTotal, matchPercentage }) => (
                  <th key={prop.id} className="p-4 sm:p-5 align-top relative border-l border-slate-200 bg-white group">
                    
                    {/* Remove Column Button */}
                    <button
                      onClick={() => onRemoveFromCompare(prop.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors z-10 cursor-pointer"
                      title={`Remove ${prop.name} from comparison`}
                      id={`remove-compare-${prop.id}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div className="space-y-3">
                      
                      {/* Thumbnail Container */}
                      <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-slate-100">
                        <img
                          src={prop.coverImage || FALLBACK_IMAGE}
                          alt={prop.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1 flex-wrap">
                          {isDemo ? (
                            <span className="inline-flex items-center gap-1 bg-amber-900/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              <Sparkles className="w-2.5 h-2.5" />
                              Demo Listing
                            </span>
                          ) : isVerified ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                              <ShieldCheck className="w-3 h-3" />
                              Verified Listing
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-800 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              Unverified
                            </span>
                          )}
                          
                          <span className="text-[10px] font-extrabold uppercase bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full">
                            {prop.category}
                          </span>
                        </div>

                        {bestMatch?.property.id === prop.id && comparedProperties.length > 1 && (
                          <div className="absolute bottom-2 left-2 right-2 bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center justify-between">
                            <span>🎯 Best Match</span>
                            <span>{matchPercentage}%</span>
                          </div>
                        )}
                      </div>

                      {/* Property Details Header */}
                      <div className="space-y-1">
                        {prop.reviewCount && prop.reviewCount > 0 ? (
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{prop.rating}</span>
                            <span className="text-slate-400 font-normal">({prop.reviewCount} reviews)</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 font-medium italic">
                            No reviews yet
                          </div>
                        )}

                        <h3 className="font-black text-sm text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {prop.name}
                        </h3>

                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{prop.neighborhood || prop.address}</span>
                        </p>
                      </div>

                      {/* Action buttons inside header */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => onSelectProperty(prop)}
                          className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>View Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onBookTour(prop)}
                          className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          title="Schedule a visit"
                        >
                          <Calendar className="w-3 h-3 text-indigo-600" />
                        </button>
                      </div>

                    </div>
                  </th>
                ))}

                {/* Empty Slot Columns (Up to 3 properties max) */}
                {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                  <th key={`empty-slot-${idx}`} className="p-4 sm:p-5 align-middle border-l border-slate-200 bg-slate-50/40 text-center">
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center h-full min-h-[220px]">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-700">
                          Empty Compare Slot
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Add a 2nd or 3rd stay to view differences
                        </p>
                      </div>
                      <button
                        onClick={() => setIsAddPickerOpen(true)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-indigo-600 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                      >
                        + Select Property
                      </button>
                    </div>
                  </th>
                ))}

              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody className="divide-y divide-slate-100 text-xs">
              
              {/* SECTION: BASIC INFO */}
              <tr className="bg-slate-100/70">
                <td colSpan={4} className="p-3 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  1. Property Overview & Status
                </td>
              </tr>

              {/* Property Name Row */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                  Property Name
                </td>
                {propertyAnalysis.map(({ property: prop }) => (
                  <td key={prop.id} className="p-4 font-extrabold text-slate-900 border-l border-slate-100">
                    <div>{prop.name}</div>
                    <div className="text-[10px] font-normal text-slate-400">{prop.tagline}</div>
                  </td>
                ))}
                {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                  <td key={`empty-name-${idx}`} className="p-4 text-slate-300 border-l border-slate-100 text-center">—</td>
                ))}
              </tr>

              {/* Verified / Demo Status Row */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                  Trust Model Status
                </td>
                {propertyAnalysis.map(({ property: prop, isVerified, isDemo }) => (
                  <td key={prop.id} className="p-4 border-l border-slate-100">
                    {isVerified ? (
                      <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-1 rounded-lg">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Verified Listing</span>
                      </div>
                    ) : isDemo ? (
                      <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2.5 py-1 rounded-lg">
                        <Info className="w-4 h-4 text-amber-600" />
                        <span>Demo Listing</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-lg">
                        <span>Unverified Listing</span>
                      </div>
                    )}
                  </td>
                ))}
                {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                  <td key={`empty-ver-${idx}`} className="p-4 text-slate-300 border-l border-slate-100 text-center">—</td>
                ))}
              </tr>

              {/* SECTION: FINANCIALS & TRUECOST */}
              <tr className="bg-slate-100/70">
                <td colSpan={4} className="p-3 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  2. Pricing, Deposits & TrueCost™ Breakdown
                </td>
              </tr>

              {/* Monthly Rent Row */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                  Monthly Rent
                </td>
                {propertyAnalysis.map(({ property: prop, minRent, maxRent }) => {
                  const isLowestRent = highlights.lowestRent === minRent && propertyAnalysis.length > 1;
                  return (
                    <td key={prop.id} className={`p-4 border-l border-slate-100 ${isLowestRent ? 'bg-emerald-50/30' : ''}`}>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-black text-slate-900">
                          {formatPrice(minRent, currency)}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">/mo</span>
                        {isLowestRent && (
                          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md ml-1.5">
                            Lowest Rent
                          </span>
                        )}
                      </div>
                      {minRent !== maxRent && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Tiers up to {formatPrice(maxRent, currency)}/mo
                        </div>
                      )}
                    </td>
                  );
                })}
                {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                  <td key={`empty-rent-${idx}`} className="p-4 text-slate-300 border-l border-slate-100 text-center">—</td>
                ))}
              </tr>

              {/* Estimated Monthly TrueCost Row */}
              <tr className="bg-indigo-50/30">
                <td className="p-4 font-extrabold text-indigo-950 bg-indigo-50/50">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Estimated Monthly TrueCost</span>
                  </div>
                  <span className="text-[10px] font-normal text-slate-500 block mt-0.5">
                    Rent + Meals + Electricity + Wi-Fi + Maint.
                  </span>
                </td>
                {propertyAnalysis.map(({ property: prop, trueCost, trueCostTotal }) => {
                  const isLowestTrueCost = highlights.lowestTrueCost === trueCostTotal && propertyAnalysis.length > 1;
                  return (
                    <td key={prop.id} className={`p-4 border-l border-slate-100 ${isLowestTrueCost ? 'bg-indigo-100/40' : ''}`}>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-indigo-700">
                          ~{formatPrice(trueCostTotal, currency)}
                        </span>
                        <span className="text-xs text-indigo-400 font-normal">/mo</span>
                        {isLowestTrueCost && (
                          <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-md ml-1.5 shadow-2xs">
                            💡 Lowest TrueCost
                          </span>
                        )}
                      </div>
                      
                      {/* Cost components mini chips */}
                      <div className="flex flex-wrap gap-1 mt-2 text-[10px] text-slate-600">
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          Food: {prop.mealsIncluded ? 'Included' : `+${formatPrice(trueCost.foodCost, currency)}`}
                        </span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          Elec: ~{formatPrice(trueCost.electricityCost, currency)}
                        </span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          WiFi: {trueCost.wifiCost === 0 ? 'Free' : `+${formatPrice(trueCost.wifiCost, currency)}`}
                        </span>
                      </div>
                    </td>
                  );
                })}
                {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                  <td key={`empty-truecost-${idx}`} className="p-4 text-slate-300 border-l border-slate-100 text-center">—</td>
                ))}
              </tr>

              {/* Security Deposit Row */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                  Security Deposit
                </td>
                {propertyAnalysis.map(({ property: prop, securityDeposit, depositMonths }) => (
                  <td key={prop.id} className="p-4 border-l border-slate-100">
                    <div className="font-extrabold text-slate-900 text-sm">
                      {formatPrice(securityDeposit, currency)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <span>{depositMonths} Month(s)</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-bold">100% Refundable</span>
                    </div>
                  </td>
                ))}
                {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                  <td key={`empty-dep-${idx}`} className="p-4 text-slate-300 border-l border-slate-100 text-center">—</td>
                ))}
              </tr>

              {/* SECTION: ROOMS & LIVING SETUP */}
              <tr className="bg-slate-100/70">
                <td colSpan={4} className="p-3 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  3. Room Types & Facilities
                </td>
              </tr>

              {/* Room Types Row */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                  Room Type
                </td>
                {propertyAnalysis.map(({ property: prop }) => (
                  <td key={prop.id} className="p-4 border-l border-slate-100">
                    <div className="flex flex-wrap gap-1.5">
                      {prop.roomOptions.map((room) => (
                        <span 
                          key={room.id}
                          className="bg-slate-100 text-slate-800 text-[11px] font-bold px-2 py-0.8 rounded-lg border border-slate-200"
                        >
                          {room.title || `${room.type.toUpperCase()}`}
                          <span className="text-slate-400 font-normal ml-1">
                            ({formatPrice(room.nominalMonthlyRent, currency)})
                          </span>
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
                {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                  <td key={`empty-rooms-${idx}`} className="p-4 text-slate-300 border-l border-slate-100 text-center">—</td>
                ))}
              </tr>

              {/* AC Availability Row */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                  AC
                </td>
                {propertyAnalysis.map(({ property: prop, hasAC, allRoomsAC }) => (
                  <td key={prop.id} className="p-4 border-l border-slate-100">
                    {allRoomsAC ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        AC in All Rooms
                      </span>
                    ) : hasAC ? (
                      <span className="inline-flex items-center gap-1 text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg font-bold">
                        <Check className="w-3.5 h-3.5 text-sky-600" />
                        AC in Select Tiers
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
                        <Minus className="w-3.5 h-3.5" />
                        Non-AC / Cooler
                      </span>
                    )}
                  </td>
                ))}
                {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                  <td key={`empty-ac-${idx}`} className="p-4 text-slate-300 border-l border-slate-100 text-center">—</td>
                ))}
              </tr>

              {/* Attached Washroom Row */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                  Attached Washroom
                </td>
                {propertyAnalysis.map(({ property: prop, hasAttachedBath, allRoomsAttachedBath }) => (
                  <td key={prop.id} className="p-4 border-l border-slate-100">
                    {allRoomsAttachedBath ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Attached in All Rooms
                      </span>
                    ) : hasAttachedBath ? (
                      <span className="inline-flex items-center gap-1 text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg font-bold">
                        <Check className="w-3.5 h-3.5 text-sky-600" />
                        Attached in Select Tiers
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
                        <Minus className="w-3.5 h-3.5" />
                        Shared Washrooms
                      </span>
                    )}
                  </td>
                ))}
                {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                  <td key={`empty-bath-${idx}`} className="p-4 text-slate-300 border-l border-slate-100 text-center">—</td>
                ))}
              </tr>

              {/* SECTION: COMMUTE & LOCATION */}
              <tr className="bg-slate-100/70">
                <td colSpan={4} className="p-3 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  4. Proximity & Campus Commute
                </td>
              </tr>

              {/* Distance from University Row */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                  Distance from University
                </td>
                {propertyAnalysis.map(({ property: prop, distanceKm }) => {
                  const isShortestDist = highlights.shortestDistance === distanceKm && propertyAnalysis.length > 1;
                  return (
                    <td key={prop.id} className={`p-4 border-l border-slate-100 ${isShortestDist ? 'bg-sky-50/30' : ''}`}>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 text-sm">{distanceKm} km</span>
                        {isShortestDist && (
                          <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded-md">
                            Closest to Campus
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{prop.campusName || 'Main Campus'}</span>
                    </td>
                  );
                })}
                {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                  <td key={`empty-dist-${idx}`} className="p-4 text-slate-300 border-l border-slate-100 text-center">—</td>
                ))}
              </tr>

              {/* Walking Time Row */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                  Walking Time
                </td>
                {propertyAnalysis.map(({ property: prop, walkMinutes }) => {
                  const isFastestWalk = highlights.fastestWalk === walkMinutes && propertyAnalysis.length > 1;
                  return (
                    <td key={prop.id} className={`p-4 border-l border-slate-100 ${isFastestWalk ? 'bg-emerald-50/30' : ''}`}>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <Footprints className="w-4 h-4" />
                        <span className="text-sm">{walkMinutes} min walk</span>
                        {isFastestWalk && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                            Fastest Walk
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
                {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                  <td key={`empty-walk-${idx}`} className="p-4 text-slate-300 border-l border-slate-100 text-center">—</td>
                ))}
              </tr>

              {/* Meals Included Row */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                  Meals Included
                </td>
                {propertyAnalysis.map(({ property: prop }) => (
                  <td key={prop.id} className="p-4 border-l border-slate-100">
                    {prop.mealsIncluded ? (
                      <div>
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          3 Chef Meals Daily
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">Breakfast, Lunch & Dinner Included</span>
                      </div>
                    ) : prop.mealPlanType ? (
                      <div>
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg font-bold capitalize">
                          {prop.mealPlanType.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-slate-600 font-medium">Self-Cooking Kitchen</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Meal subscription optional</span>
                      </div>
                    )}
                  </td>
                ))}
                {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                  <td key={`empty-meals-${idx}`} className="p-4 text-slate-300 border-l border-slate-100 text-center">—</td>
                ))}
              </tr>

              {/* SECTION: SAFETY & CONNECTIVITY */}
              <tr className="bg-slate-100/70">
                <td colSpan={4} className="p-3 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  5. Safety, Wi-Fi & Availability
                </td>
              </tr>

              {/* Wi-Fi Row */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                  Wi-Fi
                </td>
                {propertyAnalysis.map(({ property: prop, wifiSpeed }) => {
                  const isFastestWifi = highlights.highestWifi === wifiSpeed && propertyAnalysis.length > 1;
                  return (
                    <td key={prop.id} className={`p-4 border-l border-slate-100 ${isFastestWifi ? 'bg-sky-50/30' : ''}`}>
                      <div className="flex items-center gap-1.5 text-sky-700 font-bold text-sm">
                        <Wifi className="w-4 h-4" />
                        <span>{wifiSpeed} Mbps</span>
                        {isFastestWifi && (
                          <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded-md font-bold">
                            Fastest
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Unlimited High-Speed Fiber</span>
                    </td>
                  );
                })}
                {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                  <td key={`empty-wifi-${idx}`} className="p-4 text-slate-300 border-l border-slate-100 text-center">—</td>
                ))}
              </tr>

              {/* Safety Score Row */}
              <tr className="bg-emerald-50/20">
                <td className="p-4 font-extrabold text-emerald-950 bg-emerald-50/40">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Safety Score</span>
                  </div>
                  <span className="text-[10px] font-normal text-slate-500 block mt-0.5">
                    Verified CCTV, biometric & warden
                  </span>
                </td>
                {propertyAnalysis.map(({ property: prop, safetyScore, safetyTier }) => {
                  const isHighestSafety = highlights.highestSafety === safetyScore && propertyAnalysis.length > 1;
                  return (
                    <td key={prop.id} className={`p-4 border-l border-slate-100 ${isHighestSafety ? 'bg-emerald-100/40' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-900">{safetyScore}/100</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          safetyScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {safetyTier}
                        </span>
                        {isHighestSafety && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-1.5 py-0.5 rounded-md">
                            ⭐ Highest Safety
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <span>{prop.curfewTime}</span>
                        <span>•</span>
                        <span>{prop.cctv ? '24x7 CCTV' : 'Secured Entry'}</span>
                      </div>
                    </td>
                  );
                })}
                {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                  <td key={`empty-safety-${idx}`} className="p-4 text-slate-300 border-l border-slate-100 text-center">—</td>
                ))}
              </tr>

              {/* Rating Row */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                  Rating
                </td>
                {propertyAnalysis.map(({ property: prop }) => {
                  const isHighestRating = highlights.highestRating === prop.rating && propertyAnalysis.length > 1;
                  return (
                    <td key={prop.id} className="p-4 border-l border-slate-100">
                      <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-sm">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span>{prop.rating} / 5.0</span>
                        {isHighestRating && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">
                            Highest Rated
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Based on {prop.reviewCount} verified reviews</span>
                    </td>
                  );
                })}
                {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                  <td key={`empty-rate-${idx}`} className="p-4 text-slate-300 border-l border-slate-100 text-center">—</td>
                ))}
              </tr>

              {/* Available Rooms Row */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                  Available Rooms
                </td>
                {propertyAnalysis.map(({ property: prop, totalAvailableBeds }) => {
                  const isMostBeds = highlights.mostAvailableBeds === totalAvailableBeds && totalAvailableBeds > 0 && propertyAnalysis.length > 1;
                  return (
                    <td key={prop.id} className={`p-4 border-l border-slate-100 ${isMostBeds ? 'bg-emerald-50/20' : ''}`}>
                      {prop.availability === 'sold_out' || totalAvailableBeds === 0 ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg font-bold">
                          <X className="w-3.5 h-3.5 text-rose-600" />
                          Sold Out
                        </span>
                      ) : prop.availability === 'few_left' || totalAvailableBeds <= 3 ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Only {totalAvailableBeds} Beds Left
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            {totalAvailableBeds} Beds Available
                          </span>
                          {isMostBeds && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                              Most Available Rooms
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
                {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                  <td key={`empty-avail-${idx}`} className="p-4 text-slate-300 border-l border-slate-100 text-center">—</td>
                ))}
              </tr>

              {/* SECTION: MAJOR AMENITIES */}
              <tr className="bg-slate-100/70">
                <td colSpan={4} className="p-3 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  6. Major Amenities & Facilities
                </td>
              </tr>

              {/* Standard Amenities Iteration */}
              {standardAmenities.map(amenity => (
                <tr key={amenity.key}>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                    {amenity.label}
                  </td>
                  {propertyAnalysis.map(({ property: prop }) => {
                    const hasAmenity = amenity.check(prop);
                    return (
                      <td key={prop.id} className="p-4 border-l border-slate-100">
                        {hasAmenity ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Included</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
                            <Minus className="w-4 h-4 text-slate-300" />
                            <span>Not Provided</span>
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                    <td key={`empty-amenity-${amenity.key}-${idx}`} className="p-4 text-slate-300 border-l border-slate-100 text-center">—</td>
                  ))}
                </tr>
              ))}

              {/* BOTTOM ACTIONS ROW */}
              <tr className="bg-slate-50/80">
                <td className="p-4 font-extrabold text-slate-800">
                  Direct Actions
                </td>
                {propertyAnalysis.map(({ property: prop }) => (
                  <td key={prop.id} className="p-4 border-l border-slate-100 space-y-2">
                    <button
                      onClick={() => onSelectProperty(prop)}
                      className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>View Full Property</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onBookTour(prop)}
                      className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Book Free Visit</span>
                    </button>
                  </td>
                ))}
                {Array.from({ length: 3 - propertyAnalysis.length }).map((_, idx) => (
                  <td key={`empty-act-${idx}`} className="p-4 border-l border-slate-100 text-center">
                    <button
                      onClick={() => setIsAddPickerOpen(true)}
                      className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      + Add Stay
                    </button>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* Table Footer Navigation / Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Scale className="w-4 h-4 text-indigo-600" />
          <span>Comparing <strong>{comparedProperties.length} of 3</strong> maximum allowed properties side-by-side.</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onExploreMore}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            id="return-search-footer-btn"
          >
            <span>← Return to Search Results</span>
          </button>
          {comparedProperties.length < 3 ? (
            <button
              onClick={() => setIsAddPickerOpen(true)}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              + Add 3rd Stay
            </button>
          ) : (
            <button
              onClick={onClearCompare}
              className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Clear Comparison
            </button>
          )}
        </div>
      </div>

      {/* QUICK STAY PICKER MODAL (When adding 2nd or 3rd stay) */}
      {isAddPickerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsAddPickerOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-['Outfit',sans-serif]">
                  Add Stay to Comparison
                </h3>
                <p className="text-xs text-slate-500">
                  Select a property to compare ({comparedProperties.length}/3 selected)
                </p>
              </div>
              <button
                onClick={() => setIsAddPickerOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search stays by name or neighborhood..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            {/* Available List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
              {availableToAdd.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <p className="text-xs text-slate-500">
                    {searchQuery ? 'No stays match your search query.' : 'All available properties are already in comparison!'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                availableToAdd.map((p) => {
                  const minRent = Math.min(...p.roomOptions.map(r => r.nominalMonthlyRent));
                  const walkMin = p.commuteOptions?.find(c => c.type === 'walk')?.durationMin || 8;
                  const isVerified = !p.isDemo && !p.isSampleData && (p.verified || p.verificationStatus === 'verified');
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.coverImage || FALLBACK_IMAGE}
                          alt={p.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-extrabold text-xs text-slate-900 truncate group-hover:text-indigo-600">
                              {p.name}
                            </h4>
                            {isVerified && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {p.neighborhood} • {walkMin} min walk
                          </p>
                          <div className="text-xs font-black text-slate-900 mt-0.5">
                            {formatPrice(minRent, currency)}/mo
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (onAddToCompare) {
                            onAddToCompare(p);
                          }
                          setIsAddPickerOpen(false);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors shrink-0 cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Maximum 3 properties can be compared simultaneously.</span>
              <button
                onClick={() => setIsAddPickerOpen(false)}
                className="px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
