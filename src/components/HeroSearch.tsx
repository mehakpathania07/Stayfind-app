import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Utensils, 
  Footprints, 
  Sparkles, 
  Percent, 
  SlidersHorizontal,
  Layers,
  Flame,
  Check,
  Wind,
  Bath,
  User,
  Users,
  Compass,
  DollarSign,
  GraduationCap,
  Building,
  ArrowRight
} from 'lucide-react';
import { UniversityHub, FilterState, CurrencyCode } from '../types';
import { UNIVERSITY_HUBS } from '../data/mockData';
import { STATES_REGIONS, CITIES, UNIVERSITIES } from '../data/regionalData';
import { formatPrice } from '../utils/currency';

interface HeroSearchProps {
  hub: UniversityHub;
  onSelectHub?: (hub: UniversityHub) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  currency: CurrencyCode;
  totalListingsCount: number;
  onOpenFiltersDrawer: () => void;
  onOpenSmartMatch?: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  hub,
  onSelectHub,
  filters,
  setFilters,
  currency,
  totalListingsCount,
  onOpenFiltersDrawer,
  onOpenSmartMatch,
}) => {
  // Region & Campus Selectors internal state
  const [selectedState, setSelectedState] = useState<string>(() => {
    const currentUni = UNIVERSITIES.find(u => u.id === hub.id);
    return currentUni?.stateId || 'himachal-pradesh';
  });

  const [selectedCity, setSelectedCity] = useState<string>(() => {
    const currentUni = UNIVERSITIES.find(u => u.id === hub.id);
    return currentUni?.cityId || 'palampur';
  });

  // Sync state & city when hub changes externally
  useEffect(() => {
    const currentUni = UNIVERSITIES.find(u => u.id === hub.id);
    if (currentUni) {
      if (currentUni.stateId) setSelectedState(currentUni.stateId);
      if (currentUni.cityId) setSelectedCity(currentUni.cityId);
    }
  }, [hub.id]);

  // Cities filtered by selected State
  const availableCities = CITIES.filter(c => selectedState === 'all' || c.stateId === selectedState);

  // Universities filtered by State & City
  const availableUniversities = UNIVERSITY_HUBS.filter(h => {
    const uni = UNIVERSITIES.find(u => u.id === h.id);
    if (!uni) return true;
    if (selectedState !== 'all' && uni.stateId !== selectedState) return false;
    if (selectedCity !== 'all' && uni.cityId !== selectedCity) return false;
    return true;
  });

  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    if (stateId === 'all') {
      setSelectedCity('all');
    } else {
      const firstCity = CITIES.find(c => c.stateId === stateId);
      if (firstCity) {
        setSelectedCity(firstCity.id);
        const matchingHub = UNIVERSITY_HUBS.find(h => {
          const u = UNIVERSITIES.find(uni => uni.id === h.id);
          return u?.cityId === firstCity.id;
        });
        if (matchingHub && onSelectHub) {
          onSelectHub(matchingHub);
        }
      } else {
        setSelectedCity('all');
      }
    }
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    if (cityId !== 'all') {
      const matchingHub = UNIVERSITY_HUBS.find(h => {
        const u = UNIVERSITIES.find(uni => uni.id === h.id);
        return u?.cityId === cityId;
      });
      if (matchingHub && onSelectHub) {
        onSelectHub(matchingHub);
      }
    }
  };

  const handleUniversityChange = (hubId: string) => {
    const targetHub = UNIVERSITY_HUBS.find(h => h.id === hubId);
    if (targetHub && onSelectHub) {
      onSelectHub(targetHub);
    }
  };

  const handleFindMyStay = () => {
    const resultsElement = document.getElementById('property-results-section') || document.getElementById('listing-specifications-sheet');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const quickFilters = [
    { 
      id: 'quick-chip-walk',
      label: 'Walk to Campus (<10m)', 
      icon: Footprints,
      active: filters.maxDistanceMin <= 10, 
      onClick: () => setFilters(prev => ({ ...prev, maxDistanceMin: prev.maxDistanceMin <= 10 ? 30 : 10 })) 
    },
    { 
      id: 'quick-chip-meals',
      label: '3 Meals Included', 
      icon: Utensils,
      active: filters.mealsIncludedOnly, 
      onClick: () => setFilters(prev => ({ ...prev, mealsIncludedOnly: !prev.mealsIncludedOnly })) 
    },
    { 
      id: 'quick-chip-single',
      label: 'Single Private Room', 
      icon: User,
      active: filters.roomType === 'single', 
      onClick: () => setFilters(prev => ({ ...prev, roomType: prev.roomType === 'single' ? 'all' : 'single' })) 
    },
    { 
      id: 'quick-chip-girls',
      label: 'Girls Only Hostel', 
      icon: Users,
      active: filters.gender === 'girls', 
      onClick: () => setFilters(prev => ({ ...prev, gender: prev.gender === 'girls' ? 'all' : 'girls' })) 
    },
    { 
      id: 'quick-chip-boys',
      label: 'Boys Only PG', 
      icon: Users,
      active: filters.gender === 'boys', 
      onClick: () => setFilters(prev => ({ ...prev, gender: prev.gender === 'boys' ? 'all' : 'boys' })) 
    },
    { 
      id: 'quick-chip-attached-washroom',
      label: 'Attached Washroom', 
      icon: Bath,
      active: filters.attachedBathOnly, 
      onClick: () => setFilters(prev => ({ ...prev, attachedBathOnly: !prev.attachedBathOnly })) 
    },
    { 
      id: 'quick-chip-ac',
      label: 'Split AC', 
      icon: Wind,
      active: filters.acOnly, 
      onClick: () => setFilters(prev => ({ ...prev, acOnly: !prev.acOnly })) 
    },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-8 pb-10 px-4 sm:px-6 lg:px-8 rounded-3xl shadow-2xl border border-slate-800 mb-8">
      {/* Background Decorative Graphic Elements */}
      <div className="absolute inset-0 opacity-25 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-violet-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-600/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto space-y-6">
        
        {/* Top Badges & Hub Location */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/15 text-xs font-semibold text-indigo-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-white">{hub.city}</span>
            <span className="text-white/40">•</span>
            <span className="text-indigo-200 font-medium">{hub.shortName} Campus Area</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-300 font-bold">{totalListingsCount} Stays Available</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-indigo-200 font-medium">
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-200 font-semibold">Tiered Listing Trust Model</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              <Percent className="w-4 h-4 text-amber-400" />
              <span className="text-slate-200 font-semibold">0% Student Brokerage</span>
            </div>
          </div>
        </div>

        {/* Main Headline & Supporting Text */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-['Outfit',sans-serif] leading-tight">
              Find a stay that fits your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-200">student life.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              Discover PGs, rooms and hostels near your college. Compare rent, distance, amenities and safety before you choose.
            </p>
          </div>

          {onOpenSmartMatch && (
            <button
              onClick={onOpenSmartMatch}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2 text-xs sm:text-sm shrink-0 transition-all hover:scale-102 active:scale-98 cursor-pointer border border-amber-300/40"
              id="hero-find-perfect-stay-btn"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>AI Smart Match</span>
            </button>
          )}
        </div>

        {/* Comprehensive Multi-Tier Search Area */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/50 border border-white/20 space-y-3">
          
          {/* Row 1: State, City, University Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* State / UT Selector */}
            <div className="flex items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-200/90 focus-within:border-indigo-500 focus-within:bg-white transition-all">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mr-2" />
              <div className="w-full">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">State / UT</label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                  id="hero-state-select"
                >
                  <option value="all">All States & UTs</option>
                  {STATES_REGIONS.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* City Selector */}
            <div className="flex items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-200/90 focus-within:border-indigo-500 focus-within:bg-white transition-all">
              <Building className="w-4 h-4 text-indigo-600 shrink-0 mr-2" />
              <div className="w-full">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">City / District</label>
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                  id="hero-city-select"
                >
                  <option value="all">All Cities</option>
                  {availableCities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* University Selector */}
            <div className="flex items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-200/90 focus-within:border-indigo-500 focus-within:bg-white transition-all">
              <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0 mr-2" />
              <div className="w-full">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">University / College</label>
                <select
                  value={hub.id}
                  onChange={(e) => handleUniversityChange(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                  id="hero-university-select"
                >
                  {availableUniversities.map(h => (
                    <option key={h.id} value={h.id}>{h.shortName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Search Query, Room Preference, Budget & Find My Stay Button */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            
            {/* Freeform Search Query */}
            <div className="md:col-span-4 relative flex items-center bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200/90 focus-within:border-indigo-500 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Search landmark, gate, PG name..."
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden"
                id="main-search-input"
              />
              {filters.searchQuery && (
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Room Preference */}
            <div className="md:col-span-3 flex items-center bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200/90 focus-within:border-indigo-500 focus-within:bg-white transition-all">
              <Layers className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
              <select
                value={filters.roomType}
                onChange={(e) => setFilters(prev => ({ ...prev, roomType: e.target.value as any }))}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                id="room-type-select"
              >
                <option value="all">All Room Types</option>
                <option value="single">Single Private Room</option>
                <option value="double">Twin / Double Sharing</option>
                <option value="triple">Triple Sharing</option>
                <option value="studio">Private Studio / Loft</option>
              </select>
            </div>

            {/* Budget Range / Max Filter */}
            <div className="md:col-span-2 flex items-center bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200/90 focus-within:border-indigo-500 focus-within:bg-white transition-all">
              <DollarSign className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
              <select
                value={filters.maxRent || 15000}
                onChange={(e) => setFilters(prev => ({ ...prev, maxRent: parseInt(e.target.value, 10) }))}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                id="budget-max-select"
              >
                <option value={6000}>Up to {formatPrice(6000, currency)}</option>
                <option value={8000}>Up to {formatPrice(8000, currency)}</option>
                <option value={10000}>Up to {formatPrice(10000, currency)}</option>
                <option value={12000}>Up to {formatPrice(12000, currency)}</option>
                <option value={15000}>Up to {formatPrice(15000, currency)}</option>
                <option value={20000}>Any Budget</option>
              </select>
            </div>

            {/* Primary "Find My Stay" Button */}
            <div className="md:col-span-3 flex items-center gap-2">
              <button
                onClick={handleFindMyStay}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl py-2.5 sm:py-3 px-3 text-xs sm:text-sm font-extrabold shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                id="find-my-stay-btn"
              >
                <Search className="w-4 h-4" />
                <span>Find My Stay</span>
              </button>

              <button
                onClick={onOpenFiltersDrawer}
                className="p-2.5 sm:p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                title="Open Advanced Filters"
                id="all-filters-btn"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Quick Filter Chips Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar pt-1">
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Quick:
          </span>
          {quickFilters.map((q) => {
            const Icon = q.icon;
            return (
              <button
                key={q.id}
                id={q.id}
                onClick={q.onClick}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap border shrink-0 flex items-center gap-1.5 cursor-pointer select-none ${
                  q.active
                    ? 'bg-white text-indigo-950 border-white shadow-md font-extrabold ring-2 ring-indigo-400/80 scale-102'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
                }`}
              >
                {q.active ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                ) : (
                  <Icon className="w-3.5 h-3.5 text-indigo-200" />
                )}
                <span>{q.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Market Price Gauge Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/10 text-xs">
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <p className="text-[10px] uppercase font-bold text-slate-400">Average Starting Rent</p>
            <p className="text-sm font-extrabold text-white mt-0.5">
              {formatPrice(hub.avgRentRange.min, currency)} <span className="text-[11px] font-normal text-slate-400">/mo</span>
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <p className="text-[10px] uppercase font-bold text-slate-400">Average Walking Time</p>
            <p className="text-sm font-extrabold text-emerald-400 mt-0.5">
              6 - 10 Mins <span className="text-[11px] font-normal text-slate-400">to Campus</span>
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <p className="text-[10px] uppercase font-bold text-slate-400">Zero Brokerage</p>
            <p className="text-sm font-extrabold text-amber-300 mt-0.5">
              Save {formatPrice(350, currency)} <span className="text-[11px] font-normal text-slate-400">in fees</span>
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <p className="text-[10px] uppercase font-bold text-slate-400">Deposit Protection</p>
            <p className="text-sm font-extrabold text-sky-300 mt-0.5">
              100% Refundable <span className="text-[11px] font-normal text-slate-400">escrow</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
