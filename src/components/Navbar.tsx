import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Sparkles, 
  MapPin, 
  Bookmark, 
  Scale, 
  Users, 
  Calculator, 
  PlusCircle, 
  ChevronDown, 
  Menu, 
  X,
  Compass,
  CheckCircle2,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  GraduationCap,
  Search
} from 'lucide-react';
import { CurrencyCode, UniversityHub } from '../types';
import { UNIVERSITY_HUBS } from '../data/mockData';
import { CURRENCY_RATES } from '../utils/currency';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: 'explore' | 'calculator' | 'compare' | 'roommates' | 'saved';
  setCurrentTab: (tab: 'explore' | 'calculator' | 'compare' | 'roommates' | 'saved') => void;
  selectedHub: UniversityHub;
  setSelectedHub: (hub: UniversityHub) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  savedCount: number;
  compareCount: number;
  onOpenAIAdvisor: () => void;
  onOpenListProperty: () => void;
  onOpenOwnerDashboard?: () => void;
  onOpenAdminDashboard?: () => void;
  onOpenSmartMatch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  selectedHub,
  setSelectedHub,
  currency,
  setCurrency,
  savedCount,
  compareCount,
  onOpenAIAdvisor,
  onOpenListProperty,
  onOpenOwnerDashboard,
  onOpenAdminDashboard,
  onOpenSmartMatch,
}) => {
  const { userProfile, user, logout, openAuthModal, isOwner, isAdmin, isStudent } = useAuth();
  
  const [hubDropdownOpen, setHubDropdownOpen] = useState(false);
  const [hubSearchQuery, setHubSearchQuery] = useState('');
  const [hubRegionFilter, setHubRegionFilter] = useState<'all' | 'himachal' | 'punjab' | 'chandigarh' | 'delhi'>('all');
  const hubDropdownRef = useRef<HTMLDivElement>(null);

  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hubDropdownRef.current && !hubDropdownRef.current.contains(event.target as Node)) {
        setHubDropdownOpen(false);
      }
    };
    if (hubDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hubDropdownOpen]);

  // Filtered hubs based on search and region
  const filteredHubs = UNIVERSITY_HUBS.filter((hub) => {
    const matchesSearch = 
      hub.name.toLowerCase().includes(hubSearchQuery.toLowerCase()) ||
      hub.shortName.toLowerCase().includes(hubSearchQuery.toLowerCase()) ||
      hub.city.toLowerCase().includes(hubSearchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (hubRegionFilter === 'all') return true;
    if (hubRegionFilter === 'himachal') return hub.city.toLowerCase().includes('himachal') || hub.id.startsWith('univ-hp');
    if (hubRegionFilter === 'punjab') return hub.city.toLowerCase().includes('punjab') || hub.id.startsWith('univ-pb');
    if (hubRegionFilter === 'chandigarh') return hub.city.toLowerCase().includes('chandigarh') || hub.id.startsWith('univ-ch');
    if (hubRegionFilter === 'delhi') return hub.city.toLowerCase().includes('delhi') || hub.id.startsWith('univ-dl');
    return true;
  });

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Campus Hub Selector */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button 
              onClick={() => setCurrentTab('explore')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden cursor-pointer"
              id="stayfind-logo-btn"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 font-['Outfit',sans-serif]">
                    Stay<span className="text-indigo-600">Find</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full border border-indigo-100/80">
                    Student Living
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Verified PGs & Campus Stays
                </p>
              </div>
            </button>

            {/* University Selector Dropdown */}
            <div className="relative hidden md:block" ref={hubDropdownRef}>
              <button
                onClick={() => setHubDropdownOpen(!hubDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 hover:bg-slate-200/80 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 transition-colors focus:outline-hidden cursor-pointer shadow-2xs"
                id="hub-selector-btn"
                aria-label="Select University Hub"
                aria-expanded={hubDropdownOpen}
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="max-w-[170px] truncate">{selectedHub.shortName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${hubDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {hubDropdownOpen && (
                <div 
                  className="absolute left-0 mt-2 w-80 sm:w-96 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden flex flex-col"
                  style={{ maxHeight: 'min(75vh, 520px)' }}
                >
                  {/* Header with Search and Region Pills */}
                  <div className="p-3 border-b border-slate-100 bg-slate-50/70 space-y-2 shrink-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        Select University Hub
                      </p>
                      <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100/80">
                        {filteredHubs.length} available
                      </span>
                    </div>

                    {/* Quick Search */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search university, college or city..."
                        value={hubSearchQuery}
                        onChange={(e) => setHubSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        autoFocus
                      />
                      {hubSearchQuery && (
                        <button
                          onClick={() => setHubSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Regional Filter Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[11px]">
                      <button
                        onClick={() => setHubRegionFilter('all')}
                        className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          hubRegionFilter === 'all'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/60'
                        }`}
                      >
                        All ({UNIVERSITY_HUBS.length})
                      </button>
                      <button
                        onClick={() => setHubRegionFilter('himachal')}
                        className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          hubRegionFilter === 'himachal'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/60'
                        }`}
                      >
                        Himachal
                      </button>
                      <button
                        onClick={() => setHubRegionFilter('punjab')}
                        className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          hubRegionFilter === 'punjab'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/60'
                        }`}
                      >
                        Punjab
                      </button>
                      <button
                        onClick={() => setHubRegionFilter('chandigarh')}
                        className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          hubRegionFilter === 'chandigarh'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/60'
                        }`}
                      >
                        Chandigarh
                      </button>
                      <button
                        onClick={() => setHubRegionFilter('delhi')}
                        className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          hubRegionFilter === 'delhi'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/60'
                        }`}
                      >
                        Delhi
                      </button>
                    </div>
                  </div>

                  {/* Fully Scrollable Hub List with Mousewheel & Trackpad support */}
                  <div 
                    className="overflow-y-auto overscroll-contain py-1 divide-y divide-slate-50 flex-1 scroll-smooth"
                    tabIndex={0}
                  >
                    {filteredHubs.length === 0 ? (
                      <div className="p-6 text-center text-slate-400">
                        <p className="text-xs">No universities match your search</p>
                        <button
                          onClick={() => { setHubSearchQuery(''); setHubRegionFilter('all'); }}
                          className="mt-2 text-xs text-indigo-600 font-semibold hover:underline"
                        >
                          Reset filters
                        </button>
                      </div>
                    ) : (
                      filteredHubs.map((hub) => {
                        const isSelected = selectedHub.id === hub.id;
                        return (
                          <button
                            key={hub.id}
                            onClick={() => {
                              setSelectedHub(hub);
                              setHubDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-indigo-50/70 transition-colors cursor-pointer group ${
                              isSelected ? 'bg-indigo-50/90 text-indigo-900 font-semibold' : 'text-slate-700'
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <p className={`text-xs font-semibold truncate ${isSelected ? 'text-indigo-700' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                                {hub.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  {hub.city}
                                </span>
                                {hub.avgRentRange && (
                                  <span className="text-[10px] text-slate-400">
                                    • Avg ₹{hub.avgRentRange.min.toLocaleString('en-IN')}+
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />
                            ) : (
                              <span className="text-[11px] text-slate-300 group-hover:text-indigo-400 shrink-0 transition-colors">
                                Select →
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setCurrentTab('explore')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'explore'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
              id="nav-explore-tab"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Stays</span>
            </button>

            <button
              onClick={() => setCurrentTab('calculator')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'calculator'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
              id="nav-calculator-tab"
            >
              <Calculator className="w-4 h-4" />
              <span>TrueCost™ Calculator</span>
            </button>

            <button
              onClick={() => setCurrentTab('compare')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                currentTab === 'compare'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
              id="nav-compare-tab"
            >
              <Scale className="w-4 h-4" />
              <span>Compare</span>
              {compareCount > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center -mr-1">
                  {compareCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('roommates')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'roommates'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
              id="nav-roommates-tab"
            >
              <Users className="w-4 h-4" />
              <span>Roommates</span>
            </button>

            <button
              onClick={() => setCurrentTab('saved')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                currentTab === 'saved'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
              id="nav-saved-tab"
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
              {savedCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center -mr-1">
                  {savedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Currency Switcher */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-bold text-slate-700 transition-colors focus:outline-hidden cursor-pointer"
                id="currency-toggle-btn"
                title="Change display currency"
              >
                <span>{CURRENCY_RATES[currency].symbol}</span>
                <span className="text-[11px]">{currency}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50">
                  {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCurrency(c);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-indigo-50/70 cursor-pointer ${
                        currency === c ? 'font-bold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{CURRENCY_RATES[c].name}</span>
                      {currency === c && <span className="text-indigo-600 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* AI Advisor Button */}
            <button
              onClick={onOpenAIAdvisor}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              id="ai-advisor-btn"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">AI Stay Advisor</span>
              <span className="sm:hidden">AI</span>
            </button>

            {/* Role / Auth Cluster */}
            {user && userProfile ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  id="user-profile-menu-btn"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-extrabold text-slate-800 leading-tight truncate max-w-[90px]">
                      {userProfile.name}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-600">
                      {userProfile.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{userProfile.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{userProfile.email}</p>
                      <div className="mt-1">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isAdmin 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : (isOwner ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700')
                        }`}>
                          Role: {userProfile.role}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      {isOwner && onOpenOwnerDashboard && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenOwnerDashboard();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 flex items-center gap-2"
                        >
                          <Building2 className="w-4 h-4 text-indigo-600" />
                          <span>Owner Dashboard</span>
                        </button>
                      )}

                      {isAdmin && onOpenAdminDashboard && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAdminDashboard();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Admin Portal</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setCurrentTab('saved');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 flex items-center gap-2"
                      >
                        <Bookmark className="w-4 h-4 text-rose-500" />
                        <span>Saved Stays & Visits</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenListProperty();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 flex items-center gap-2"
                      >
                        <PlusCircle className="w-4 h-4 text-indigo-600" />
                        <span>List Property / PG</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                id="sign-in-btn"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 space-y-2 animate-in fade-in">
            {/* Campus Hub Selector on Mobile */}
            <div className="px-2 py-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Select Campus Hub ({UNIVERSITY_HUBS.length} Universities)
              </label>
              <select
                value={selectedHub.id}
                onChange={(e) => {
                  const found = UNIVERSITY_HUBS.find(h => h.id === e.target.value);
                  if (found) setSelectedHub(found);
                }}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
              >
                <optgroup label="🏔️ Himachal Pradesh">
                  {UNIVERSITY_HUBS.filter(h => h.id.startsWith('univ-hp')).map(hub => (
                    <option key={hub.id} value={hub.id}>{hub.name} ({hub.city})</option>
                  ))}
                </optgroup>
                <optgroup label="🌾 Punjab">
                  {UNIVERSITY_HUBS.filter(h => h.id.startsWith('univ-pb')).map(hub => (
                    <option key={hub.id} value={hub.id}>{hub.name} ({hub.city})</option>
                  ))}
                </optgroup>
                <optgroup label="🏛️ Chandigarh (UT)">
                  {UNIVERSITY_HUBS.filter(h => h.id.startsWith('univ-ch')).map(hub => (
                    <option key={hub.id} value={hub.id}>{hub.name} ({hub.city})</option>
                  ))}
                </optgroup>
                <optgroup label="🏛️ Delhi (NCR)">
                  {UNIVERSITY_HUBS.filter(h => h.id.startsWith('univ-dl')).map(hub => (
                    <option key={hub.id} value={hub.id}>{hub.name} ({hub.city})</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-2">
              <button
                onClick={() => { setCurrentTab('explore'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-left ${
                  currentTab === 'explore' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>Explore Stays</span>
              </button>

              <button
                onClick={() => { setCurrentTab('calculator'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-left ${
                  currentTab === 'calculator' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span>TrueCost™</span>
              </button>

              <button
                onClick={() => { setCurrentTab('compare'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-left ${
                  currentTab === 'compare' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <Scale className="w-4 h-4 text-indigo-600" />
                <span>Compare ({compareCount})</span>
              </button>

              <button
                onClick={() => { setCurrentTab('roommates'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-left ${
                  currentTab === 'roommates' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Roommates</span>
              </button>

              <button
                onClick={() => { setCurrentTab('saved'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-left ${
                  currentTab === 'saved' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <Bookmark className="w-4 h-4 text-rose-500" />
                <span>Saved Stays ({savedCount})</span>
              </button>

              <button
                onClick={() => { onOpenListProperty(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-50 text-slate-700 text-left"
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                <span>List PG / Room</span>
              </button>
            </div>

            {/* Auth options on Mobile */}
            <div className="pt-2 border-t border-slate-200">
              {user ? (
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="text-xs font-bold text-slate-800">
                    {userProfile?.name} <span className="text-[10px] text-indigo-600 font-semibold">({userProfile?.role})</span>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                  className="w-full py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl text-center"
                >
                  Sign In / Create Account
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
