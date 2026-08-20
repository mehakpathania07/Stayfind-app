import React, { useState } from 'react';
import { 
  Heart, 
  ShieldCheck, 
  MapPin, 
  Footprints, 
  Utensils, 
  Wifi, 
  Wind, 
  Zap, 
  Scale, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Calculator,
  Eye,
  Calendar,
  Sparkles,
  Users,
  Bed,
  Check
} from 'lucide-react';
import { Property, CurrencyCode } from '../types';
import { formatPrice } from '../utils/currency';
import { calculateSafetyScore } from '../utils/matchingAndSafety';
import { handleImageError, FALLBACK_IMAGE } from '../utils/propertyImages';

interface PropertyCardProps {
  property: Property;
  currency: CurrencyCode;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  isCompared: boolean;
  onToggleCompare: (property: Property) => void;
  onSelectProperty: (property: Property) => void;
  onBookTour: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  currency,
  isSaved,
  onToggleSave,
  isCompared,
  onToggleCompare,
  onSelectProperty,
  onBookTour,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Calculate default room & true cost total
  const defaultRoom = property.roomOptions.find(r => r.id === property.defaultRoomId) || property.roomOptions[0];
  const lowestNominalRent = Math.min(...property.roomOptions.map(r => r.nominalMonthlyRent));
  
  // Calculate total monthly estimate: nominal + mandatory monthly costs + electricity
  const monthlyMandatoryAddons = property.baseCostBreakdown
    .filter(item => item.period === 'monthly' && item.category !== 'rent')
    .reduce((sum, item) => sum + item.amount, 0);

  const lowestTrueCostMonthly = lowestNominalRent + monthlyMandatoryAddons;

  const shortestCommute = property.commuteOptions?.find(c => c.type === 'walk') || property.commuteOptions?.[0] || { durationMin: 8, distanceKm: 0.6 };

  const totalAvailableBeds = property.roomOptions?.reduce((sum, r) => sum + (r.availableBeds || 0), 0) ?? 0;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev === 0 ? property.galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev === property.galleryImages.length - 1 ? 0 : prev + 1));
  };

  const getGenderBadge = () => {
    if (property.genderPolicy === 'girls') {
      return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">Girls Only PG</span>;
    }
    if (property.genderPolicy === 'boys') {
      return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">Boys Only PG</span>;
    }
    return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full">Co-Ed Living</span>;
  };

  return (
    <div 
      className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
      onClick={() => onSelectProperty(property)}
      id={`property-card-${property.id}`}
    >
      {/* Top Image Carousel Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-900">
        <img
          src={property.galleryImages[activeImageIndex] || property.coverImage || FALLBACK_IMAGE}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/40 pointer-events-none" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {property.isDemo || property.isSampleData ? (
              <span className="inline-flex items-center gap-1 bg-amber-950/90 backdrop-blur-md text-amber-300 border border-amber-500/50 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Demo Listing
              </span>
            ) : (property.verified || property.verificationStatus === 'verified') ? (
              <span className="inline-flex items-center gap-1 bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm border border-emerald-400/40">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                Verified Listing
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-slate-900/90 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                Unverified Listing
              </span>
            )}

            {(() => {
              const safety = calculateSafetyScore(property);
              return (
                <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm backdrop-blur-md ${
                  safety.score >= 80 ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-400/40' : 'bg-slate-900/90 text-amber-300 border border-amber-400/40'
                }`}>
                  <span>🛡 {safety.score}/100</span>
                </span>
              );
            })()}

            {property.specialOffer && (
              <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                <Sparkles className="w-3 h-3" />
                {property.specialOffer.title}
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(property.id);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md cursor-pointer ${
              isSaved
                ? 'bg-rose-500 text-white scale-110'
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-rose-500 hover:scale-105'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save to shortlist'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Carousel Prev/Next Buttons & Dots */}
        {property.galleryImages.length > 1 && (
          <>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between absolute inset-x-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <button
                onClick={handlePrevImage}
                className="pointer-events-auto w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all cursor-pointer"
                title="Previous photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextImage}
                className="pointer-events-auto w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all cursor-pointer"
                title="Next photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Carousel Dot Indicators */}
            <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10 pointer-events-none">
              {property.galleryImages.slice(0, 5).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    activeImageIndex === idx ? 'w-4 bg-white shadow-xs' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Bottom Carousel Walking Distance Chip & Rating */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between z-10 text-white">
          <div className="inline-flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold border border-white/10">
            <Footprints className="w-3.5 h-3.5 text-emerald-400" />
            <span>{shortestCommute.durationMin}m walk to gate</span>
          </div>

          {property.reviewCount && property.reviewCount > 0 ? (
            <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-extrabold">{property.rating}</span>
              <span className="text-[10px] text-slate-300 font-medium">({property.reviewCount})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[10px] text-slate-300 font-medium">
              <span>No reviews yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div className="space-y-1.5">
          {/* Tags Header */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {getGenderBadge()}
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
              {property.category}
            </span>
            <span className="text-[11px] text-slate-500 truncate flex items-center gap-1 ml-auto font-medium">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              {property.neighborhood}
            </span>
          </div>

          {/* Property Title */}
          <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 font-['Outfit',sans-serif]">
            {property.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-1 font-normal">
            {property.tagline}
          </p>
        </div>

        {/* Key Feature Perks Bar */}
        <div className="flex items-center gap-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 font-medium" title="High-Speed Wi-Fi">
            <Wifi className="w-3.5 h-3.5 text-indigo-500" />
            <span>{property.wifiSpeedMbps}M</span>
          </div>

          {property.mealsIncluded && (
            <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md text-[11px] font-bold">
              <Utensils className="w-3 h-3 text-emerald-600" />
              <span>Meals Inc.</span>
            </div>
          )}

          {property.powerBackup && (
            <div className="flex items-center gap-1" title="Power Backup 24x7">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-medium">Power</span>
            </div>
          )}

          <div className="ml-auto text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Bed className="w-3 h-3 text-slate-400" />
            <span>{totalAvailableBeds > 0 ? `${totalAvailableBeds} beds left` : 'Waitlist'}</span>
          </div>
        </div>

        {/* TrueCost™ Pricing Comparison Box */}
        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200 space-y-1">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Base Rent</span>
              <div className="text-base font-extrabold text-slate-900">
                {formatPrice(lowestNominalRent, currency)}
                <span className="text-xs font-normal text-slate-500">/mo</span>
              </div>
            </div>

            {/* TrueCost Calculation highlight */}
            <div className="text-right">
              <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded-sm">
                <Calculator className="w-2.5 h-2.5" />
                TrueCost™ Total
              </div>
              <div className="text-sm font-extrabold text-indigo-600">
                ~{formatPrice(lowestTrueCostMonthly, currency)}
                <span className="text-[10px] font-normal text-indigo-400">/mo</span>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60 font-medium">
            <span>Rent + Food + Wi-Fi + Utilities</span>
            <span className="text-emerald-600 font-bold">0% Brokerage</span>
          </div>
        </div>

        {/* Action Controls & Compare Trigger */}
        <div className="pt-1 flex items-center gap-2">
          
          {/* Add to Compare Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(property);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isCompared
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-700 border-slate-200 shadow-2xs'
            }`}
            title={isCompared ? 'Remove from comparison' : 'Add to side-by-side comparison (up to 3 stays)'}
            id={`compare-btn-${property.id}`}
          >
            {isCompared ? (
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            ) : (
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span className="text-[11px] whitespace-nowrap">
              {isCompared ? 'In Compare' : 'Compare'}
            </span>
          </button>

          {/* Book Tour Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookTour(property);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-indigo-600 text-white py-2 px-3 rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Visit</span>
          </button>

          {/* View Details Button */}
          <button
            onClick={() => onSelectProperty(property)}
            className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
};
