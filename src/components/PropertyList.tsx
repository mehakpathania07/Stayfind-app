import React, { useState } from 'react';
import { 
  Grid, 
  Map as MapIcon, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Footprints, 
  Utensils, 
  ShieldCheck, 
  Layers, 
  RotateCcw,
  Sparkles,
  Wifi,
  Search
} from 'lucide-react';
import { Property, FilterState, UniversityHub, CurrencyCode } from '../types';
import { PropertyCard } from './PropertyCard';
import { MapExplorer } from './MapExplorer';
import { formatPrice } from '../utils/currency';

interface PropertyListProps {
  properties: Property[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  selectedHub: UniversityHub;
  currency: CurrencyCode;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  comparedProperties: Property[];
  onToggleCompare: (property: Property) => void;
  onSelectProperty: (property: Property) => void;
  onBookTour: (property: Property) => void;
  isFilterDrawerOpen: boolean;
  setIsFilterDrawerOpen: (open: boolean) => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  filters,
  setFilters,
  selectedHub,
  currency,
  savedIds,
  onToggleSave,
  comparedProperties,
  onToggleCompare,
  onSelectProperty,
  onBookTour,
  isFilterDrawerOpen,
  setIsFilterDrawerOpen,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'split' | 'map'>('split');
  const [activeMapProperty, setActiveMapProperty] = useState<Property | null>(null);

  // Helper to extract walking time in minutes
  const getWalkMinutes = (prop: Property): number => {
    const walkOption = prop.commuteOptions?.find(c => c.type === 'walk');
    if (walkOption && typeof walkOption.durationMin === 'number') {
      return walkOption.durationMin;
    }
    if (prop.estimatedWalkingTime) {
      const match = prop.estimatedWalkingTime.match(/(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
    if (prop.distanceFromUniversity || prop.distanceFromCollege) {
      const text = prop.distanceFromUniversity || prop.distanceFromCollege || '';
      const kmMatch = text.match(/([\d.]+)\s*km/i);
      if (kmMatch) {
        const km = parseFloat(kmMatch[1]);
        return Math.max(2, Math.round(km * 12));
      }
    }
    return 10;
  };

  // Filter & Sort Pipeline
  const filteredProperties = properties.filter((prop) => {
    // Campus matching
    if (filters.campusId && filters.campusId !== 'all') {
      const matchesCampus = 
        prop.campusId === filters.campusId || 
        prop.primaryUniversityId === filters.campusId || 
        (prop.universityIds && prop.universityIds.includes(filters.campusId));
      if (!matchesCampus) return false;
    }

    // Search query matching
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = (prop.name || '').toLowerCase().includes(q);
      const matchNeighborhood = (prop.neighborhood || '').toLowerCase().includes(q);
      const matchAddress = (prop.address || '').toLowerCase().includes(q);
      const matchTagline = (prop.tagline || '').toLowerCase().includes(q);
      const matchCity = (prop.city || prop.cityName || '').toLowerCase().includes(q);
      const matchUni = (prop.campusName || prop.primaryUniversityName || '').toLowerCase().includes(q);
      if (!matchName && !matchNeighborhood && !matchAddress && !matchTagline && !matchCity && !matchUni) return false;
    }

    // Category
    if (filters.category !== 'all' && prop.category !== filters.category && prop.propertyType !== filters.category) return false;

    // Gender (Girls Only / Boys Only / Co-ed)
    if (filters.gender !== 'all') {
      const propGender = prop.genderPolicy || prop.gender;
      if (propGender !== filters.gender) return false;
    }

    // Room Type (Single / Double / Triple / Studio)
    if (filters.roomType !== 'all') {
      const hasRoom = prop.roomOptions?.some(r => r.type === filters.roomType) ||
        prop.rooms?.some(r => r.roomType === filters.roomType) ||
        (filters.roomType === 'single' && prop.category === 'apartment');
      if (!hasRoom) return false;
    }

    // Walking Distance (< 10m / Max Distance Filter)
    const shortestWalk = getWalkMinutes(prop);
    if (shortestWalk > filters.maxDistanceMin) return false;

    // 3 Meals Included Filter
    if (filters.mealsIncludedOnly) {
      const hasMeals = prop.mealsIncluded === true ||
        prop.foodAvailable === true ||
        prop.mealPlanType === '3_meals_daily' ||
        (typeof prop.foodCost === 'number' && prop.foodCost > 0) ||
        prop.baseCostBreakdown?.some(b => b.category === 'food' || b.name.toLowerCase().includes('meal') || b.name.toLowerCase().includes('food')) ||
        prop.amenities?.some(a => a.isIncluded && (a.name.toLowerCase().includes('meal') || a.name.toLowerCase().includes('food') || a.id.includes('food') || a.id.includes('meal'))) ||
        prop.facilities?.some(f => f.toLowerCase().includes('meal') || f.toLowerCase().includes('food')) ||
        prop.featuredPerks?.some(p => p.toLowerCase().includes('meal') || p.toLowerCase().includes('food'));
      if (!hasMeals) return false;
    }

    // Attached Washroom Filter
    if (filters.attachedBathOnly) {
      const hasAttached = prop.roomOptions?.some(r => r.attachedBath === true) ||
        prop.rooms?.some(r => r.attachedBathroom === true) ||
        prop.amenities?.some(a => a.isIncluded && (a.name.toLowerCase().includes('attached') || a.name.toLowerCase().includes('bath') || a.name.toLowerCase().includes('washroom') || a.id.includes('bath'))) ||
        prop.facilities?.some(f => f.toLowerCase().includes('attached') || f.toLowerCase().includes('bath') || f.toLowerCase().includes('washroom')) ||
        prop.featuredPerks?.some(p => p.toLowerCase().includes('attached') || p.toLowerCase().includes('bath') || p.toLowerCase().includes('washroom'));
      if (!hasAttached) return false;
    }

    // Split AC Filter
    if (filters.acOnly) {
      const hasAc = prop.roomOptions?.some(r => r.airConditioning === true) ||
        prop.amenities?.some(a => a.isIncluded && (a.name.toLowerCase().includes('ac') || a.name.toLowerCase().includes('air conditioning') || a.name.toLowerCase().includes('air-condition') || a.id.includes('ac'))) ||
        prop.facilities?.some(f => f.toLowerCase().includes('ac') || f.toLowerCase().includes('air conditioning')) ||
        prop.featuredPerks?.some(p => p.toLowerCase().includes('ac') || p.toLowerCase().includes('air conditioning'));
      if (!hasAc) return false;
    }

    // No Curfew Only
    if (filters.noCurfewOnly) {
      const noCurfew = (prop.curfewTime || '').toLowerCase().includes('no curfew') || 
        (prop.curfewTime || '').toLowerCase().includes('24x7');
      if (!noCurfew) return false;
    }

    // Verified Only
    if (filters.verifiedOnly && !prop.verified && prop.verificationStatus !== 'verified') return false;

    // Wifi Speed Min
    if (filters.wifiSpeedMin > 0 && (prop.wifiSpeedMbps || 0) < filters.wifiSpeedMin) return false;

    return true;
  });

  // Sort
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (filters.sortBy === 'price_low') {
      const minA = Math.min(...a.roomOptions.map(r => r.nominalMonthlyRent));
      const minB = Math.min(...b.roomOptions.map(r => r.nominalMonthlyRent));
      return minA - minB;
    }
    if (filters.sortBy === 'price_high') {
      const maxA = Math.max(...a.roomOptions.map(r => r.nominalMonthlyRent));
      const maxB = Math.max(...b.roomOptions.map(r => r.nominalMonthlyRent));
      return maxB - maxA;
    }
    if (filters.sortBy === 'distance_near') {
      const walkA = getWalkMinutes(a);
      const walkB = getWalkMinutes(b);
      return walkA - walkB;
    }
    if (filters.sortBy === 'rating_high') {
      return b.rating - a.rating;
    }
    return 0; // recommended
  });

  const comparedIds = comparedProperties.map(p => p.id);

  const resetFilters = () => {
    setFilters({
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
    });
  };

  // Count active filters (for badge / summary)
  const activeFilterList: { id: string; label: string; onRemove: () => void }[] = [];
  if (filters.maxDistanceMin <= 10) {
    activeFilterList.push({
      id: 'active-walk',
      label: `≤ ${filters.maxDistanceMin}m Walk`,
      onRemove: () => setFilters(prev => ({ ...prev, maxDistanceMin: 30 }))
    });
  }
  if (filters.mealsIncludedOnly) {
    activeFilterList.push({
      id: 'active-meals',
      label: '3 Meals Included',
      onRemove: () => setFilters(prev => ({ ...prev, mealsIncludedOnly: false }))
    });
  }
  if (filters.roomType !== 'all') {
    const labelMap: Record<string, string> = {
      single: 'Single Room',
      double: 'Twin Sharing',
      triple: 'Triple Sharing',
      studio: 'Studio Loft'
    };
    activeFilterList.push({
      id: 'active-room',
      label: labelMap[filters.roomType] || filters.roomType,
      onRemove: () => setFilters(prev => ({ ...prev, roomType: 'all' }))
    });
  }
  if (filters.gender !== 'all') {
    const genderMap: Record<string, string> = {
      girls: 'Girls Only',
      boys: 'Boys Only',
      coed: 'Co-ed'
    };
    activeFilterList.push({
      id: 'active-gender',
      label: genderMap[filters.gender] || filters.gender,
      onRemove: () => setFilters(prev => ({ ...prev, gender: 'all' }))
    });
  }
  if (filters.attachedBathOnly) {
    activeFilterList.push({
      id: 'active-attached-bath',
      label: 'Attached Washroom',
      onRemove: () => setFilters(prev => ({ ...prev, attachedBathOnly: false }))
    });
  }
  if (filters.acOnly) {
    activeFilterList.push({
      id: 'active-ac',
      label: 'Split AC',
      onRemove: () => setFilters(prev => ({ ...prev, acOnly: false }))
    });
  }
  if (filters.searchQuery) {
    activeFilterList.push({
      id: 'active-search',
      label: `"${filters.searchQuery}"`,
      onRemove: () => setFilters(prev => ({ ...prev, searchQuery: '' }))
    });
  }

  return (
    <div className="space-y-6" id="property-results-section">
      
      {/* Controls Bar: Results Count, Sort Dropdown & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        
        {/* Left: Results Count */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-slate-900">
            {sortedProperties.length} Student Stays Found
          </span>
          <span className="text-xs text-slate-500 hidden md:inline">
            near {selectedHub.shortName} • {selectedHub.city}
          </span>
        </div>

        {/* Right: Sort & View Toggle */}
        <div className="flex items-center gap-2.5">
          
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-transparent font-bold text-slate-700 focus:outline-hidden cursor-pointer"
              id="sort-by-select"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="distance_near">Distance: Nearest to Gate</option>
              <option value="rating_high">Rating: Highest Rated</option>
            </select>
          </div>

          {/* View Switcher: Split / Grid / Map */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'split' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Split Map & Grid View"
            >
              <Layers className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View Only"
            >
              <Grid className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Interactive Campus Map View"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Active Filter Chips Bar (Synchronized with Quick Chips & Drawer) */}
      {activeFilterList.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-indigo-50/70 p-2.5 px-3.5 rounded-2xl border border-indigo-100 text-xs">
          <span className="font-bold text-indigo-950 flex items-center gap-1 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            Filters:
          </span>
          {activeFilterList.map(item => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1.5 bg-white text-indigo-950 font-semibold px-2.5 py-1 rounded-full border border-indigo-200 shadow-2xs"
            >
              <span>{item.label}</span>
              <button
                onClick={item.onRemove}
                className="hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[10px] cursor-pointer"
                title="Remove filter"
              >
                ✕
              </button>
            </span>
          ))}
          <button
            onClick={resetFilters}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline ml-auto cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Content Layout based on viewMode */}
      {viewMode === 'map' && (
        <div className="space-y-6">
          <MapExplorer
            hub={selectedHub}
            properties={sortedProperties}
            currency={currency}
            selectedProperty={activeMapProperty}
            onSelectProperty={onSelectProperty}
          />
        </div>
      )}

      {viewMode === 'grid' && (
        <div>
          {sortedProperties.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-extrabold text-slate-800 font-['Outfit',sans-serif]">No stays found</p>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  Try changing your filters or increasing your budget.
                </p>
              </div>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  currency={currency}
                  isSaved={savedIds.includes(prop.id)}
                  onToggleSave={onToggleSave}
                  isCompared={comparedIds.includes(prop.id)}
                  onToggleCompare={onToggleCompare}
                  onSelectProperty={onSelectProperty}
                  onBookTour={onBookTour}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Property Cards (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            {sortedProperties.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-extrabold text-slate-800 font-['Outfit',sans-serif]">No stays found</p>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                    Try changing your filters or increasing your budget.
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortedProperties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    currency={currency}
                    isSaved={savedIds.includes(prop.id)}
                    onToggleSave={onToggleSave}
                    isCompared={comparedIds.includes(prop.id)}
                    onToggleCompare={onToggleCompare}
                    onSelectProperty={onSelectProperty}
                    onBookTour={onBookTour}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Campus Interactive Map (5 cols on desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <MapExplorer
              hub={selectedHub}
              properties={sortedProperties}
              currency={currency}
              selectedProperty={activeMapProperty}
              onSelectProperty={onSelectProperty}
            />
          </div>

        </div>
      )}

      {/* Filter Drawer / Modal */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-base text-slate-900">Filter Accommodations</h3>
                </div>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              {/* 1. Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Property Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'All Categories' },
                    { id: 'pg', label: 'Paying Guest (PG)' },
                    { id: 'coliving', label: 'Co-Living' },
                    { id: 'hostel', label: 'Student Hostel' },
                    { id: 'apartment', label: 'Private Studio' }
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => setFilters(prev => ({ ...prev, category: c.id as any }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold text-left transition-all ${
                        filters.category === c.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Maximum Walking Distance */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wider">Max Walking Distance</span>
                  <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    ≤ {filters.maxDistanceMin} Mins Walk
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={filters.maxDistanceMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxDistanceMin: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>5 mins (Across street)</span>
                  <span>15 mins</span>
                  <span>30 mins</span>
                </div>
              </div>

              {/* 3. Must-Have Amenities Checkboxes */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Essential Amenities</label>
                
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.mealsIncludedOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, mealsIncludedOnly: e.target.checked }))}
                    className="rounded-sm accent-indigo-600 w-4 h-4"
                  />
                  <span>Chef Meals & Food Included in Rent</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.attachedBathOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, attachedBathOnly: e.target.checked }))}
                    className="rounded-sm accent-indigo-600 w-4 h-4"
                  />
                  <span>Attached Private Washroom</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.acOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, acOnly: e.target.checked }))}
                    className="rounded-sm accent-indigo-600 w-4 h-4"
                  />
                  <span>Air Conditioning (In-Room Split AC)</span>
                </label>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-colors"
              >
                Show Results
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
