import React from 'react';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';
import { Property, CurrencyCode } from '../types';
import { formatPrice } from '../utils/currency';
import { handleImageError, FALLBACK_IMAGE } from '../utils/propertyImages';

interface FloatingCompareBarProps {
  comparedProperties: Property[];
  onRemoveProperty: (id: string) => void;
  onClearAll: () => void;
  onOpenCompare: () => void;
  currency: CurrencyCode;
}

export const FloatingCompareBar: React.FC<FloatingCompareBarProps> = ({
  comparedProperties,
  onRemoveProperty,
  onClearAll,
  onOpenCompare,
  currency,
}) => {
  if (comparedProperties.length === 0) return null;

  return (
    <aside 
      aria-label="Stay Comparison Dock"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-2xl p-3 sm:p-3.5 text-white animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-center justify-between gap-3">
        
        {/* Left: Summary & Slots */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/90 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
            <Scale className="w-4 h-4" />
          </div>

          <div className="min-w-0 hidden xs:block sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight font-['Outfit',sans-serif]">
                Compare Stays
              </span>
              <span className="text-[10px] font-extrabold bg-indigo-500/30 text-indigo-300 px-1.5 py-0.2 rounded-full border border-indigo-400/30">
                {comparedProperties.length}/3
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              Side-by-side rent, TrueCost & safety
            </p>
          </div>

          {/* Property Mini Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-[180px] sm:max-w-xs scrollbar-none">
            {comparedProperties.map((p) => {
              const minRent = Math.min(...p.roomOptions.map(r => r.nominalMonthlyRent));
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-lg pl-1 pr-1.5 py-1 text-xs shrink-0 group shadow-2xs"
                >
                  <img
                    src={p.coverImage || FALLBACK_IMAGE}
                    alt={p.name}
                    className="w-5 h-5 rounded-md object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
                  />
                  <span className="text-[11px] font-bold text-slate-200 max-w-[65px] sm:max-w-[85px] truncate">
                    {p.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveProperty(p.id);
                    }}
                    className="p-0.5 rounded-full hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                    title={`Remove ${p.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onClearAll}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-xs font-semibold"
            title="Clear all compared properties"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCompare}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold px-3.5 sm:px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            id="floating-compare-btn"
          >
            <span>Compare ({comparedProperties.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
};
