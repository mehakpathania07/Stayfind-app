import React from 'react';
import { 
  ShieldCheck, 
  Percent, 
  Calculator, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Scale, 
  Footprints, 
  Lock, 
  Zap, 
  FileCheck2, 
  ArrowRight 
} from 'lucide-react';

interface TrustAndFeaturesSectionProps {
  onOpenSmartMatch?: () => void;
  onOpenCalculator?: () => void;
  onOpenCompare?: () => void;
}

export const TrustAndFeaturesSection: React.FC<TrustAndFeaturesSectionProps> = ({
  onOpenSmartMatch,
  onOpenCalculator,
  onOpenCompare,
}) => {
  return (
    <section className="space-y-12 py-10">
      
      {/* SECTION 1: Why StayFind? (4 Value Pillars) */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Student Accommodation Platform
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-['Outfit',sans-serif]">
            Find a stay that fits your student life.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            PGs, rooms & hostels near your college — compare rent, distance, amenities and safety before you choose.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all space-y-3 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <Percent className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-base text-slate-900 font-['Outfit',sans-serif]">
                0% Student Brokerage
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Direct landlord and warden connections. Save ₹5,000–₹12,000 per semester on middleman fees and arbitrary agent surcharges.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Direct Lease Connection</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all space-y-3 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-base text-slate-900 font-['Outfit',sans-serif]">
                18-Point Physical Safety Audit
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Every property undergoes on-site inspection for 24x7 CCTV coverage, biometric access gates, resident warden presence, and fire safety.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-indigo-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Safe Badging</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all space-y-3 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                <Calculator className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-base text-slate-900 font-['Outfit',sans-serif]">
                TrueCost™ Zero Surprises
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                No end-of-month shock bills. We dynamically factor nominal rent, meals, AC sub-metering, Wi-Fi speed, and maintenance into one number.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-amber-800 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full Expense Breakdown</span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all space-y-3 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-base text-slate-900 font-['Outfit',sans-serif]">
                Smart Match & Roommates
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Find compatible roommates by major, study habits, food preferences, and sleep schedules to ensure harmonious university co-living.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-violet-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Student Community Vetted</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: 3 Deep Dives (Verified Stays, Smart Match, TrueCost & Compare) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Card 1: Verified / Trusted Stay Explanation */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                Listing Trust Model
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-white font-['Outfit',sans-serif]">
                Verified vs. Demo Stays
              </h3>
              <p className="text-xs text-slate-300 font-normal leading-relaxed">
                StayFind maintains a transparent 3-tier trust model so you always know listing validity:
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>1. Verified Listing:</strong> In-person or owner document verification confirmed by admin.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>2. Unverified Listing:</strong> Newly registered listing awaiting physical validation.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span><strong>3. Demo Listing:</strong> Clear demonstration data with transparent labeling.</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Sri Sai Univ. Pilot Active</span>
            <span className="text-emerald-400 font-bold">Transparent Trust Model</span>
          </div>
        </div>

        {/* Card 2: Smart Match Explanation */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-indigo-900/60 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                AI Compatibility
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-white font-['Outfit',sans-serif]">
                How Smart Match Works
              </h3>
              <p className="text-xs text-slate-300 font-normal leading-relaxed">
                Rather than browsing hundreds of random listings, Smart Match ranks your stays dynamically using 5 key indicators:
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Budget & Room Type:</strong> Balances your monthly allowance with single, twin, or triple sharing options.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Walking Commute Radius:</strong> Scores stays based on exact morning walking minutes to your department gate.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Lifestyle & Study Comfort:</strong> Filters for split AC, attached washrooms, high-speed fiber, and meal plans.</span>
              </li>
            </ul>
          </div>

          {onOpenSmartMatch && (
            <button
              onClick={onOpenSmartMatch}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Try Smart Match Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Card 3: Compare & TrueCost Explanation */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
                <Scale className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                Side-by-Side Analytics
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-white font-['Outfit',sans-serif]">
                Compare & TrueCost™ Engine
              </h3>
              <p className="text-xs text-slate-300 font-normal leading-relaxed">
                Select up to 3 stays and evaluate 16 direct criteria to pick the optimal residence without hidden surprises:
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Side-by-Side Table:</strong> Contrast rent, deposits, Wi-Fi speeds, washrooms, and food included simultaneously.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>TrueCost™ Math:</strong> Base Rent + Food + Electricity Submetering + Maintenance = Honest Total Outflow.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Objective Highlights:</strong> Color badges highlight lowest price, shortest walk, and best safety without fake claims.</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-2 pt-2">
            {onOpenCalculator && (
              <button
                onClick={onOpenCalculator}
                className="flex-1 py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/15 cursor-pointer text-center"
              >
                Open Calculator
              </button>
            )}
            {onOpenCompare && (
              <button
                onClick={onOpenCompare}
                className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer text-center"
              >
                Compare Stays
              </button>
            )}
          </div>
        </div>

      </div>

    </section>
  );
};
