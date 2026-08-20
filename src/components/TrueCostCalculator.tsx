import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Utensils, 
  Wind, 
  Bus, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  Download,
  Share2,
  TrendingDown,
  Building2,
  Home,
  Layers
} from 'lucide-react';
import { UniversityHub, CurrencyCode } from '../types';
import { formatPrice } from '../utils/currency';
import { getStoredCalculatorPreferences, saveStoredCalculatorPreferences } from '../utils/storage';

interface TrueCostCalculatorProps {
  hub: UniversityHub;
  currency: CurrencyCode;
  onExploreStays: () => void;
}

export const TrueCostCalculator: React.FC<TrueCostCalculatorProps> = ({
  hub,
  currency,
  onExploreStays,
}) => {
  // Configurable Student Parameters with localStorage persistence
  const initialPrefs = getStoredCalculatorPreferences();
  const [stayMonths, setStayMonths] = useState<number>(initialPrefs.stayMonths);
  const [roomTypeChoice, setRoomTypeChoice] = useState<'single' | 'double' | 'studio'>(initialPrefs.roomTypeChoice);
  const [acHours, setAcHours] = useState<number>(initialPrefs.acHours);
  const [foodOption, setFoodOption] = useState<'full_mess' | 'cook_groceries' | 'eating_out'>(initialPrefs.foodOption);
  const [commuteType, setCommuteType] = useState<'walk' | 'bicycle' | 'transit' | 'cab'>(initialPrefs.commuteType);
  const [laundryLoads, setLaundryLoads] = useState<number>(initialPrefs.laundryLoads);

  useEffect(() => {
    saveStoredCalculatorPreferences({
      stayMonths,
      roomTypeChoice,
      acHours,
      foodOption,
      commuteType,
      laundryLoads,
    });
  }, [stayMonths, roomTypeChoice, acHours, foodOption, commuteType, laundryLoads]);

  // Cost Models Calculation
  // 1. On-Campus Dorm
  const dormBaseRentMonthly = roomTypeChoice === 'single' ? 1200 : 850;
  const dormMealPlanMonthly = 350;
  const dormUtilitiesMonthly = 0; // included
  const dormCommuteMonthly = 0;
  const dormLaundryMonthly = 35;
  const dormTotalMonthly = dormBaseRentMonthly + dormMealPlanMonthly + dormUtilitiesMonthly + dormCommuteMonthly + dormLaundryMonthly;

  // 2. Verified Student PG / Co-Living (StayFind Model)
  const pgBaseRentMonthly = roomTypeChoice === 'single' ? 950 : (roomTypeChoice === 'studio' ? 1250 : 620);
  const pgMealPlanMonthly = foodOption === 'full_mess' ? 110 : (foodOption === 'cook_groceries' ? 140 : 260);
  const pgUtilitiesMonthly = Math.round(15 + acHours * 4.2);
  const pgCommuteMonthly = commuteType === 'walk' ? 0 : (commuteType === 'bicycle' ? 5 : (commuteType === 'transit' ? 30 : 120));
  const pgLaundryMonthly = 15;
  const pgTotalMonthly = pgBaseRentMonthly + pgMealPlanMonthly + pgUtilitiesMonthly + pgCommuteMonthly + pgLaundryMonthly;

  // 3. Independent Private Flat / Unverified Rental
  const flatBaseRentMonthly = roomTypeChoice === 'single' ? 1100 : (roomTypeChoice === 'studio' ? 1400 : 750);
  const flatBrokerageAmortized = 80; // 1 month brokerage spread over stay
  const flatMealPlanMonthly = foodOption === 'full_mess' ? 180 : (foodOption === 'cook_groceries' ? 160 : 320);
  const flatUtilitiesMonthly = Math.round(45 + acHours * 6.5 + 40); // WiFi + water + electricity
  const flatCommuteMonthly = commuteType === 'walk' ? 0 : (commuteType === 'bicycle' ? 5 : (commuteType === 'transit' ? 45 : 150));
  const flatLaundryMonthly = 40;
  const flatTotalMonthly = flatBaseRentMonthly + flatBrokerageAmortized + flatMealPlanMonthly + flatUtilitiesMonthly + flatCommuteMonthly + flatLaundryMonthly;

  // Total Academic Year Totals
  const dormAnnual = dormTotalMonthly * stayMonths;
  const pgAnnual = pgTotalMonthly * stayMonths;
  const flatAnnual = flatTotalMonthly * stayMonths;

  const annualSavings = dormAnnual - pgAnnual;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* Title & Introduction */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
          <Calculator className="w-3.5 h-3.5" />
          <span>TrueCost™ Transparency Tool</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
          Calculate True Student Living Cost
        </h2>
        <p className="text-sm text-slate-600">
          Most landlords advertise nominal rent without accounting for electricity sub-meters, meal plans, laundry tokens, or transit. Customize your student habits to see the exact outflow.
        </p>
      </div>

      {/* Main Interactive Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Student Habit Controls */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">
              Your Living Preferences
            </h3>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {hub.shortName}
            </span>
          </div>

          {/* 1. Stay Duration */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Lease Duration</span>
              <span className="text-indigo-600 font-extrabold">{stayMonths} Months</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '1 Sem (4m)', value: 4 },
                { label: 'Acad Year (9m)', value: 9 },
                { label: 'Full Year (12m)', value: 12 },
              ].map(d => (
                <button
                  key={d.value}
                  onClick={() => setStayMonths(d.value)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    stayMonths === d.value
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Room Configuration */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Room Occupancy</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Single Room', value: 'single' },
                { label: 'Twin Sharing', value: 'double' },
                { label: 'Studio Loft', value: 'studio' },
              ].map(r => (
                <button
                  key={r.value}
                  onClick={() => setRoomTypeChoice(r.value as any)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    roomTypeChoice === r.value
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. AC / Heating Hours */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Daily AC / Heater Usage</span>
              <span className="font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                {acHours} Hours / Day
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              step="2"
              value={acHours}
              onChange={(e) => setAcHours(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0h (Fan only)</span>
              <span>6h (Night)</span>
              <span>12h+ (Heavy)</span>
            </div>
          </div>

          {/* 4. Food & Dining Preference */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Food & Diet Preference</label>
            <select
              value={foodOption}
              onChange={(e) => setFoodOption(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
            >
              <option value="full_mess">Included Mess / PG 3 Meals Buffet</option>
              <option value="cook_groceries">Self-Cook & Grocery Meal Prep</option>
              <option value="eating_out">Frequent Dining Out & Food Delivery</option>
            </select>
          </div>

          {/* 5. Commute Transport */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Campus Commute Method</label>
            <select
              value={commuteType}
              onChange={(e) => setCommuteType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
            >
              <option value="walk">Walking (Under 10 min, $0)</option>
              <option value="bicycle">Bicycle / Electric Scooter ($5/mo maintenance)</option>
              <option value="transit">City Bus / Metro Pass (~$30/mo)</option>
              <option value="cab">Ride Share / Auto-rickshaws (~$120/mo)</option>
            </select>
          </div>

        </div>

        {/* Right Column: Comparative TrueCost Output Display */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Highlight Savings Banner */}
          {annualSavings > 0 && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-lg flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-200">
                  <TrendingDown className="w-4 h-4" />
                  <span>Student Savings Alert</span>
                </div>
                <h4 className="text-lg sm:text-xl font-extrabold">
                  Save {formatPrice(annualSavings, currency)} per {stayMonths}-month academic year
                </h4>
                <p className="text-xs text-emerald-100">
                  By choosing a verified StayFind PG with meals & utilities over on-campus dorms!
                </p>
              </div>

              <button
                onClick={onExploreStays}
                className="shrink-0 bg-white text-emerald-800 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md hover:bg-emerald-50 transition-colors"
              >
                Find Stays
              </button>
            </div>
          )}

          {/* 3-Column Comparative Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* 1. On-Campus Dorm */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Traditional</span>
                  <Building2 className="w-4 h-4 text-slate-400" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">On-Campus Dorm</h4>
                <p className="text-[11px] text-slate-500">University managed hall</p>

                <div className="mt-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Monthly</span>
                  <div className="text-xl font-black text-slate-900">
                    {formatPrice(dormTotalMonthly, currency)}
                    <span className="text-xs font-normal text-slate-500">/mo</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Room:</span>
                  <span className="font-semibold">{formatPrice(dormBaseRentMonthly, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Meal Plan:</span>
                  <span className="font-semibold">{formatPrice(dormMealPlanMonthly, currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                  <span>{stayMonths}-Mo Total:</span>
                  <span className="text-slate-900">{formatPrice(dormAnnual, currency)}</span>
                </div>
              </div>
            </div>

            {/* 2. StayFind Verified PG (WINNER) */}
            <div className="bg-indigo-900 text-white rounded-2xl p-4 border-2 border-indigo-500 shadow-xl space-y-3 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-bl-lg">
                Best Value
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-indigo-300">StayFind Verified</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="font-bold text-sm text-white">Student PG / Co-Living</h4>
                <p className="text-[11px] text-indigo-200">Meals + Wi-Fi + Housekeeping</p>

                <div className="mt-3">
                  <span className="text-[10px] uppercase font-bold text-indigo-300">True Monthly Outflow</span>
                  <div className="text-xl font-black text-indigo-300">
                    {formatPrice(pgTotalMonthly, currency)}
                    <span className="text-xs font-normal text-indigo-200">/mo</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-indigo-800 text-xs space-y-1 text-indigo-100">
                <div className="flex justify-between">
                  <span>Base Rent:</span>
                  <span className="font-semibold">{formatPrice(pgBaseRentMonthly, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Food & Utilities:</span>
                  <span className="font-semibold">{formatPrice(pgMealPlanMonthly + pgUtilitiesMonthly, currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1 border-t border-indigo-800">
                  <span>{stayMonths}-Mo Total:</span>
                  <span className="text-amber-300">{formatPrice(pgAnnual, currency)}</span>
                </div>
              </div>
            </div>

            {/* 3. Private Flat / Unverified */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Independent</span>
                  <Home className="w-4 h-4 text-slate-400" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Private Rental Flat</h4>
                <p className="text-[11px] text-slate-500">+ Brokerage & Separate Bills</p>

                <div className="mt-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Monthly</span>
                  <div className="text-xl font-black text-slate-900">
                    {formatPrice(flatTotalMonthly, currency)}
                    <span className="text-xs font-normal text-slate-500">/mo</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Rent + Broker:</span>
                  <span className="font-semibold">{formatPrice(flatBaseRentMonthly + flatBrokerageAmortized, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bills + Food:</span>
                  <span className="font-semibold">{formatPrice(flatMealPlanMonthly + flatUtilitiesMonthly, currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                  <span>{stayMonths}-Mo Total:</span>
                  <span className="text-slate-900">{formatPrice(flatAnnual, currency)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Itemized Comparison Matrix Checklist */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900">
              Hidden Costs Comparison Breakdown
            </h4>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-medium text-slate-700">Brokerage / Agent Commission:</span>
                <span className="font-bold text-emerald-600">$0 with StayFind (Save ~$500)</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-medium text-slate-700">Security Deposit Escrow:</span>
                <span className="font-bold text-slate-900">100% Refundable Guarantee</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-medium text-slate-700">Daily Housekeeping & Linen:</span>
                <span className="font-bold text-emerald-600">Included free in PGs</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-medium text-slate-700">High Speed Study Wi-Fi:</span>
                <span className="font-bold text-emerald-600">Free 300+ Mbps Fiber</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
