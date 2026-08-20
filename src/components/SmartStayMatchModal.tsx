import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  Footprints, 
  Utensils, 
  Wifi, 
  Wind, 
  ShieldCheck, 
  Zap, 
  Sliders, 
  ArrowRight, 
  Building2, 
  Eye, 
  Calendar, 
  Heart,
  ChevronRight,
  RotateCcw,
  Scale
} from 'lucide-react';
import { Property, StudentPreferences, UniversityHub, CurrencyCode } from '../types';
import { calculateStayMatchScore, calculateSafetyScore } from '../utils/matchingAndSafety';
import { formatPrice } from '../utils/currency';
import { handleImageError, FALLBACK_IMAGE } from '../utils/propertyImages';

interface SmartStayMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  hub: UniversityHub;
  currency: CurrencyCode;
  savedPreferences: StudentPreferences | null;
  onSavePreferences: (prefs: StudentPreferences) => void;
  onSelectProperty: (property: Property) => void;
  onBookTour: (property: Property) => void;
  onToggleSave: (propertyId: string) => void;
  savedIds: string[];
}

export const SmartStayMatchModal: React.FC<SmartStayMatchModalProps> = ({
  isOpen,
  onClose,
  properties,
  hub,
  currency,
  savedPreferences,
  onSavePreferences,
  onSelectProperty,
  onBookTour,
  onToggleSave,
  savedIds,
}) => {
  const [step, setStep] = useState<'form' | 'results'>('form');

  // Form State initialized with saved preferences or reasonable defaults
  const [budget, setBudget] = useState<number>(() => {
    if (savedPreferences?.maxBudget) return savedPreferences.maxBudget;
    return hub.avgRentRange.max ? Math.round((hub.avgRentRange.min + hub.avgRentRange.max) / 2) : 800;
  });

  const [roomType, setRoomType] = useState<StudentPreferences['roomType']>(
    savedPreferences?.roomType || 'any'
  );

  const [genderPolicy, setGenderPolicy] = useState<StudentPreferences['genderPolicy']>(
    savedPreferences?.genderPolicy || 'any'
  );

  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(
    savedPreferences?.maxDistanceKm || 2.0
  );

  const [foodRequired, setFoodRequired] = useState<StudentPreferences['foodRequired']>(
    savedPreferences?.foodRequired || 'optional'
  );

  const [acRequired, setAcRequired] = useState<boolean>(
    savedPreferences?.acRequired ?? false
  );

  const [wifiRequired, setWifiRequired] = useState<boolean>(
    savedPreferences?.wifiRequired ?? true
  );

  const [attachedBath, setAttachedBath] = useState<StudentPreferences['attachedBath']>(
    savedPreferences?.attachedBath || 'preferred'
  );

  const [laundry, setLaundry] = useState<StudentPreferences['laundry']>(
    savedPreferences?.laundry || 'preferred'
  );

  const [powerBackup, setPowerBackup] = useState<StudentPreferences['powerBackup']>(
    savedPreferences?.powerBackup || 'preferred'
  );

  const [preferredSafetyLevel, setPreferredSafetyLevel] = useState<StudentPreferences['preferredSafetyLevel']>(
    savedPreferences?.preferredSafetyLevel || 'high'
  );

  if (!isOpen) return null;

  // Active preferences object for calculation
  const currentPreferences: StudentPreferences = {
    maxBudget: budget,
    roomType,
    genderPolicy,
    maxDistanceKm,
    foodRequired,
    acRequired,
    wifiRequired,
    attachedBath,
    laundry,
    powerBackup,
    preferredSafetyLevel,
    updatedAt: new Date().toISOString()
  };

  // Score all properties in this hub and sort by highest match percentage
  const scoredProperties = properties
    .filter(p => p.campusId === hub.id)
    .map(prop => {
      const matchResult = calculateStayMatchScore(prop, currentPreferences);
      const safetyResult = calculateSafetyScore(prop);
      return {
        property: prop,
        matchResult,
        safetyResult
      };
    })
    .sort((a, b) => b.matchResult.matchPercentage - a.matchResult.matchPercentage);

  const handleApplyAndSearch = () => {
    onSavePreferences(currentPreferences);
    setStep('results');
  };

  const handleResetForm = () => {
    setBudget(hub.avgRentRange.max ? Math.round((hub.avgRentRange.min + hub.avgRentRange.max) / 2) : 800);
    setRoomType('any');
    setGenderPolicy('any');
    setMaxDistanceKm(2.0);
    setFoodRequired('optional');
    setAcRequired(false);
    setWifiRequired(true);
    setAttachedBath('preferred');
    setLaundry('preferred');
    setPowerBackup('preferred');
    setPreferredSafetyLevel('high');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-['Outfit',sans-serif]">
                  Find My Perfect Stay
                </h2>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-400/30">
                  Smart Match Engine
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Weighted student algorithm matching budget (25%), distance (20%), facilities (20%), room type (15%), safety (10%) & gender (10%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step === 'results' && (
              <button
                onClick={() => setStep('form')}
                className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust Preferences</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {step === 'form' ? (
            <div className="space-y-6">
              
              {/* Intro Banner */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>Searching stays for: {hub.name}</span>
                  </div>
                  <p className="text-xs text-indigo-700">
                    Set your priorities below. Our match scoring algorithm evaluates real property facilities, walking distance, verified amenities, and TrueCost.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              </div>

              {/* Grid Form Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* 1. Monthly Budget */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      1. Max Monthly Budget
                    </label>
                    <span className="text-sm font-black text-indigo-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                      {formatPrice(budget, currency)}/mo
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min={hub.avgRentRange.min || 100}
                    max={(hub.avgRentRange.max || 1500) * 1.5}
                    step={25}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>Min {formatPrice(hub.avgRentRange.min || 100, currency)}</span>
                    <span>Max {formatPrice(Math.round((hub.avgRentRange.max || 1500) * 1.5), currency)}</span>
                  </div>
                </div>

                {/* 2. Maximum Distance from Campus */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                      <span>2. Campus Proximity Radius</span>
                    </label>
                    <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                      Within {maxDistanceKm} km
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: '500 m (5m walk)', value: 0.5 },
                      { label: '1.0 km (10m walk)', value: 1.0 },
                      { label: '2.0 km (20m walk)', value: 2.0 },
                      { label: '5.0 km (Any)', value: 5.0 }
                    ].map(item => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setMaxDistanceKm(item.value)}
                        className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                          maxDistanceKm === item.value
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Preferred Room Type */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                    3. Preferred Room Type
                  </label>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'single', label: 'Single' },
                      { id: 'double', label: 'Double (Twin)' },
                      { id: 'triple', label: 'Triple' },
                      { id: 'any', label: 'Any Type' }
                    ].map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRoomType(r.id as any)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          roomType === r.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Gender Policy Preference */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                    4. Gender Accommodation
                  </label>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'girls', label: 'Girls Only' },
                      { id: 'boys', label: 'Boys Only' },
                      { id: 'coed', label: 'Co-Ed' },
                      { id: 'any', label: 'Any' }
                    ].map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGenderPolicy(g.id as any)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          genderPolicy === g.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Food & Meal Requirement */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-indigo-600" />
                    <span>5. Food & Meal Plan</span>
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'yes', label: 'Meals Required' },
                      { id: 'optional', label: 'Optional / Either' },
                      { id: 'no', label: 'Self Cook / Outside' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFoodRequired(f.id as any)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          foodRequired === f.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Safety Level Priority */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>6. Safety Priority Level</span>
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'high', label: 'High (85+ Score)' },
                      { id: 'medium', label: 'Standard (70+)' },
                      { id: 'any', label: 'Any Verified' }
                    ].map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setPreferredSafetyLevel(s.id as any)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          preferredSafetyLevel === s.id
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* 7. Key Amenities Toggle Matrix */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                  7. Room & Building Facilities
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  
                  {/* AC */}
                  <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={acRequired}
                      onChange={(e) => setAcRequired(e.target.checked)}
                      className="rounded-md text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-sky-500" />
                        <span>Air Conditioning</span>
                      </div>
                      <span className="text-[10px] text-slate-500">AC in room</span>
                    </div>
                  </label>

                  {/* Wi-Fi */}
                  <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={wifiRequired}
                      onChange={(e) => setWifiRequired(e.target.checked)}
                      className="rounded-md text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <Wifi className="w-3.5 h-3.5 text-indigo-500" />
                        <span>High-Speed Wi-Fi</span>
                      </div>
                      <span className="text-[10px] text-slate-500">100+ Mbps Fiber</span>
                    </div>
                  </label>

                  {/* Attached Bathroom */}
                  <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={attachedBath === 'required'}
                      onChange={(e) => setAttachedBath(e.target.checked ? 'required' : 'not_important')}
                      className="rounded-md text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-900">Attached Bath</div>
                      <span className="text-[10px] text-slate-500">Private bathroom</span>
                    </div>
                  </label>

                  {/* Power Backup */}
                  <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={powerBackup === 'required'}
                      onChange={(e) => setPowerBackup(e.target.checked ? 'required' : 'not_important')}
                      className="rounded-md text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Power Backup</span>
                      </div>
                      <span className="text-[10px] text-slate-500">24x7 Generator</span>
                    </div>
                  </label>

                  {/* Laundry */}
                  <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={laundry === 'required'}
                      onChange={(e) => setLaundry(e.target.checked ? 'required' : 'not_important')}
                      className="rounded-md text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-900">Laundry Service</div>
                      <span className="text-[10px] text-slate-500">In-house wash</span>
                    </div>
                  </label>

                </div>
              </div>

              {/* Bottom CTA to View Results */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="text-xs text-slate-500">
                  {scoredProperties.length} campus accommodations will be ranked instantly.
                </div>

                <button
                  type="button"
                  onClick={handleApplyAndSearch}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black px-6 py-3 rounded-2xl shadow-lg hover:shadow-indigo-200 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Calculate & Rank My Stays</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            /* Results View */
            <div className="space-y-6">
              
              {/* Summary Header of Matching */}
              <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Preferences Saved & Ranked</span>
                  </div>
                  <h3 className="text-xl font-black font-['Outfit',sans-serif]">
                    Your Top Matched Stays near Campus
                  </h3>
                  <p className="text-xs text-slate-300">
                    Budget up to {formatPrice(budget, currency)}/mo • Radius: {maxDistanceKm} km • {roomType.toUpperCase()} Room • {genderPolicy.toUpperCase()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Edit Preferences</span>
                </button>
              </div>

              {/* Scored Property Cards List */}
              <div className="space-y-4">
                {scoredProperties.map(({ property, matchResult, safetyResult }, index) => {
                  const isSaved = savedIds.includes(property.id);
                  const minRent = Math.min(...property.roomOptions.map(r => r.nominalMonthlyRent));

                  return (
                    <div
                      key={property.id}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between group"
                    >
                      {/* Image & Match Badge */}
                      <div className="relative w-full md:w-56 h-40 md:h-36 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                        <img
                          src={property.coverImage || FALLBACK_IMAGE}
                          alt={property.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
                        />
                        
                        {/* Match Percentage Badge */}
                        <div className="absolute top-2.5 left-2.5 bg-slate-900/90 backdrop-blur-md text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1 border border-indigo-400/40">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-indigo-300">{matchResult.matchPercentage}%</span>
                          <span>Match</span>
                        </div>

                        {/* Rank Badge */}
                        <div className="absolute bottom-2.5 left-2.5 bg-white/90 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                          #{index + 1} Best Fit
                        </div>
                      </div>

                      {/* Middle Details & Reasons */}
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {property.isDemo || property.isSampleData ? (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-amber-50 text-amber-800 border border-amber-200">
                              Demo Listing
                            </span>
                          ) : (property.verified || property.verificationStatus === 'verified') ? (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Verified
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
                              Unverified
                            </span>
                          )}
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-indigo-50 text-indigo-700">
                            {property.category}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-sm border ${safetyResult.tierColor}`}>
                            🛡 {safetyResult.score}/100 Safety
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
                            <Footprints className="w-3 h-3 text-emerald-600" />
                            {property.commuteOptions[0]?.durationMin} min walk
                          </span>
                        </div>

                        <h4 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {property.name}
                        </h4>

                        {/* Matching Points Chips */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {matchResult.matchingPoints.map((reason, rIdx) => (
                            <span
                              key={rIdx}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-100"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{reason}</span>
                            </span>
                          ))}
                        </div>

                        {/* If any misses */}
                        {matchResult.missingPoints.length > 0 && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>Considerations:</span>
                            {matchResult.missingPoints.map((m, mIdx) => (
                              <span key={mIdx} className="text-slate-500 font-medium">
                                • {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Pricing & Actions */}
                      <div className="w-full md:w-48 shrink-0 flex flex-col justify-between items-start md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <div className="text-left md:text-right">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Base Rent from
                          </div>
                          <div className="text-lg font-black text-slate-900">
                            {formatPrice(minRent, currency)}
                            <span className="text-xs font-normal text-slate-500">/mo</span>
                          </div>
                          <div className="text-[10px] text-emerald-600 font-bold">
                            0% Brokerage
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onSelectProperty(property);
                            }}
                            className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <span>View Stay</span>
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleSave(property.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isSaved
                                ? 'bg-rose-500 text-white border-rose-500'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-rose-500'
                            }`}
                            title={isSaved ? 'Saved to Wishlist' : 'Save to Shortlist'}
                          >
                            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
