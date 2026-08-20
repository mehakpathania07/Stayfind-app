import React, { useState } from 'react';
import { 
  ArrowLeft,
  X, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Footprints, 
  Utensils, 
  Wifi, 
  Wind, 
  Zap, 
  Check, 
  Calendar, 
  Phone, 
  MessageSquare, 
  Heart, 
  Share2, 
  Scale, 
  Lock, 
  Bath, 
  Clock, 
  Sparkles,
  Calculator,
  Plus, 
  CheckCircle2, 
  Flag, 
  Building2,
  ExternalLink,
  DollarSign,
  Copy,
  Info,
  UserCheck,
  Send,
  BedDouble,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon
} from 'lucide-react';
import { Property, RoomOption, CurrencyCode, Review, NearbyService } from '../types';
import { formatPrice } from '../utils/currency';
import { calculateSafetyScore, calculateTrueCost } from '../utils/matchingAndSafety';
import { useAuth } from '../context/AuthContext';
import { buildPropertyGallery, handleImageError, FALLBACK_IMAGE, AccommodationImage } from '../utils/propertyImages';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
  currency: CurrencyCode;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  isCompared: boolean;
  onToggleCompare: (property: Property) => void;
  onBookTour: (property: Property) => void;
  onReserveBed: (property: Property, room: RoomOption) => void;
  onAddReview?: (propertyId: string, review: Review) => void;
  onReportProperty?: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  currency,
  isSaved,
  onToggleSave,
  isCompared,
  onToggleCompare,
  onBookTour,
  onReserveBed,
  onAddReview,
  onReportProperty,
}) => {
  const { userProfile } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    property.defaultRoomId || property.roomOptions[0]?.id
  );

  const galleryItems = React.useMemo(() => {
    return buildPropertyGallery(property);
  }, [property]);

  const [activeServiceCategory, setActiveServiceCategory] = useState<string>('all');
  const [acUsageHours, setAcUsageHours] = useState<number>(6); // hours per day slider
  const [includeLaundryAddon, setIncludeLaundryAddon] = useState<boolean>(true);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [inquiryMessage, setInquiryMessage] = useState<string>('');
  const [inquirySent, setInquirySent] = useState<boolean>(false);
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);

  // Auto-switch gallery photo when room type is selected
  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    const targetRoom = property.roomOptions.find(r => r.id === roomId);
    if (targetRoom) {
      const matchingIdx = galleryItems.findIndex(g => g.category === targetRoom.type);
      if (matchingIdx >= 0) {
        setActiveImageIndex(matchingIdx);
      }
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev === 0 ? galleryItems.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev === galleryItems.length - 1 ? 0 : prev + 1));
  };

  // Write Review State
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewName, setReviewName] = useState(userProfile?.name || 'Verified Student');
  const [reviewUni, setReviewUni] = useState(property.campusName || 'Campus Resident');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTag, setReviewTag] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const selectedRoom = property.roomOptions.find(r => r.id === selectedRoomId) || property.roomOptions[0];

  const safetyResult = calculateSafetyScore(property);

  const trueCostResult = calculateTrueCost(property, selectedRoom, {
    electricity: Math.round(15 + (acUsageHours * 4.5 * (property.campusId === 'hub_delhi_nc' ? 0.6 : 1))),
  });

  const totalMonthlyTrueCost = trueCostResult.trueMonthlyTotal + (includeLaundryAddon ? 20 : 0);
  const depositAmount = trueCostResult.securityDeposit;
  const totalMoveInOutflow = totalMonthlyTrueCost + depositAmount + trueCostResult.brokerage + trueCostResult.oneTimeCharges;

  const isVerifiedSSU = !property.isDemo && !property.isSampleData && (property.verified || property.verificationStatus === 'verified');

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard?.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setIsContactModalOpen(false);
      setInquiryMessage('');
    }, 2000);
  };

  // Dynamic Data Extraction with "Not provided" fallbacks
  const propertyName = property.name || 'Not provided';
  const propertyLocation = property.address || property.location || property.neighborhood || 'Not provided';
  
  const distanceFromUniversity = property.distanceFromUniversity || 
    property.distanceFromCollege || 
    (property.commuteOptions?.[0]?.distanceKm ? `${property.commuteOptions[0].distanceKm} km from Campus Gate` : 'Not provided');
    
  const walkingTimeToCampus = property.estimatedWalkingTime || 
    (property.commuteOptions?.find(c => c.type === 'walk')?.durationMin ? `${property.commuteOptions.find(c => c.type === 'walk')?.durationMin} min walk` : 'Not provided');
    
  const monthlyRentDisplay = property.monthlyRent 
    ? `${formatPrice(property.monthlyRent, currency)}/mo` 
    : (selectedRoom?.nominalMonthlyRent ? `${formatPrice(selectedRoom.nominalMonthlyRent, currency)}/mo` : 'Not provided');
    
  const roomTypesSummary = property.roomOptions && property.roomOptions.length > 0 
    ? property.roomOptions.map(r => r.title || `${r.type.toUpperCase()} Occupancy`).join(', ') 
    : 'Not provided';
    
  const genderEligibility = property.genderPolicy === 'girls' 
    ? 'Girls Only Hostel / PG' 
    : property.genderPolicy === 'boys' 
    ? 'Boys Only PG' 
    : property.genderPolicy === 'coed' 
    ? 'Co-ed Accommodations' 
    : 'Not provided';
    
  const mealsIncludedInfo = property.mealsIncluded !== undefined 
    ? (property.mealsIncluded 
        ? '3 Meals Included Daily (Breakfast, Lunch & Dinner)' 
        : (property.mealPlanType ? `${property.mealPlanType.replace(/_/g, ' ')} / Not Included` : 'Self Cooking / Meals Not Included')) 
    : 'Not provided';
    
  const acTypeInfo = property.roomOptions?.some(r => r.airConditioning) 
    ? 'All-Weather Inverter Split AC' 
    : 'Non-AC / Natural Mountain Ventilation & Room Heaters';
    
  const attachedWashroomInfo = selectedRoom 
    ? (selectedRoom.attachedBath ? 'Yes (Private Attached Washroom)' : 'Common / Shared Washroom') 
    : (property.roomOptions?.some(r => r.attachedBath) ? 'Attached Washroom Available' : 'Shared Washroom');
    
  const securityDepositInfo = property.securityDeposit 
    ? `${formatPrice(property.securityDeposit, currency)} (100% Refundable at lease exit)` 
    : (selectedRoom?.depositMonths ? `${selectedRoom.depositMonths} Month Rent (Refundable)` : 'Not provided');
    
  const curfewInfo = property.curfewTime || 'Not provided';
  
  const wifiInfo = property.wifiSpeedMbps 
    ? `${property.wifiSpeedMbps} Mbps Fiber High-Speed Wi-Fi Included` 
    : 'Not provided';
    
  const electricityMaintenanceInfo = property.powerBackup !== undefined 
    ? `${property.powerBackup ? '100% Inverter / Power Backup' : 'Standard Grid Power'}, Sub-metered / Maintenance Included` 
    : 'Not provided';
    
  const wardenContactName = property.wardenContact?.name || 'Not provided';
  const wardenContactRole = property.wardenContact?.role || 'Property Host / Warden';
  const wardenContactPhone = property.wardenContact?.phone || 'Not provided';
  const wardenResponseRate = property.wardenContact?.responseRate || 'Responds within 1 hour';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div 
        className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col my-auto max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
        id="property-detail-modal"
      >
        
        {/* Top Sticky Navigation Bar */}
        <div className="sticky top-0 z-30 bg-slate-900 text-white px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between shadow-md">
          
          {/* Back Button & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer shrink-0 border border-slate-700"
              id="back-detail-modal-btn"
              title="Return to property listings"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                  {propertyName}
                </h2>

                {/* Verified vs Demo vs Unverified Listing Badge */}
                {property.isDemo || property.isSampleData ? (
                  <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Demo Listing
                  </span>
                ) : (property.verified || property.verificationStatus === 'verified') ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Listing
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-slate-800 text-amber-300 border border-amber-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    Unverified Listing
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>{propertyLocation}</span>
              </p>
            </div>
          </div>

          {/* Action Button Controls: Save, Compare, Contact, Share, Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Clear "Save" Button */}
            <button
              onClick={() => onToggleSave(property.id)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isSaved 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-xs' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
              id="detail-save-btn"
              title={isSaved ? 'Remove from saved' : 'Save to shortlist'}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-rose-400' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            {/* Clear "Compare" Button */}
            <button
              onClick={() => onToggleCompare(property)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isCompared 
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs' 
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-indigo-900/50 hover:border-indigo-400 hover:text-white'
              }`}
              id="detail-compare-btn"
              title={isCompared ? 'Remove from compare' : 'Add to side-by-side comparison (up to 3 stays)'}
            >
              <Scale className={`w-3.5 h-3.5 ${isCompared ? 'text-white' : 'text-indigo-400'}`} />
              <span className="hidden sm:inline">{isCompared ? 'In Compare' : 'Add to Compare'}</span>
            </button>

            {/* Clear "Contact" Button */}
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-xs border border-emerald-500"
              id="detail-contact-btn"
              title="Contact host or warden"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Contact</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors relative"
              title="Copy share link"
            >
              <Share2 className="w-4 h-4" />
              {shareCopied && (
                <span className="absolute -bottom-8 right-0 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md">
                  Link Copied!
                </span>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              id="close-detail-modal-btn"
              title="Close details view"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-slate-50/50">
          
          {/* 1. Hero Gallery Showcase */}
          <div className="space-y-3">
            <div className="relative aspect-16/9 sm:aspect-21/9 w-full rounded-3xl overflow-hidden bg-slate-900 shadow-xl group/hero">
              <img
                src={galleryItems[activeImageIndex]?.url || property.galleryImages[activeImageIndex] || property.coverImage || FALLBACK_IMAGE}
                alt={`${propertyName} - ${galleryItems[activeImageIndex]?.label || 'Photo'}`}
                className="w-full h-full object-cover transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/30 pointer-events-none" />

              {/* Top Image Category Pill */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-1.5 shadow-md">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{galleryItems[activeImageIndex]?.label || `Photo ${activeImageIndex + 1}`}</span>
                </span>
                {galleryItems[activeImageIndex]?.description && (
                  <span className="hidden md:inline-block bg-slate-900/70 backdrop-blur-md text-slate-300 text-xs px-3 py-1.5 rounded-xl border border-white/10 max-w-sm truncate">
                    {galleryItems[activeImageIndex]?.description}
                  </span>
                )}
              </div>

              {/* Prev / Next Arrows */}
              {galleryItems.length > 1 && (
                <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-between z-10 pointer-events-none">
                  <button
                    onClick={handlePrevImage}
                    className="pointer-events-auto w-10 h-10 rounded-2xl bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md flex items-center justify-center border border-white/15 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="pointer-events-auto w-10 h-10 rounded-2xl bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md flex items-center justify-center border border-white/15 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Bottom Floating Stats Bar */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white flex-wrap gap-2 z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  {isVerifiedSSU ? (
                    <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-emerald-400/40">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Listing
                    </span>
                  ) : (
                    <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-amber-400/40">
                      Demo Listing
                    </span>
                  )}
                  <span className="bg-slate-900/80 backdrop-blur-md text-xs font-semibold px-3 py-1 rounded-full border border-slate-700">
                    {activeImageIndex + 1} of {galleryItems.length} Photos
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {property.reviewCount && property.reviewCount > 0 ? (
                    <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-amber-400 font-bold text-xs border border-slate-700">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{property.rating} / 5.0</span>
                      <span className="text-slate-300 font-normal">({property.reviewCount} reviews)</span>
                    </div>
                  ) : (
                    <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-slate-300 font-medium text-xs border border-slate-700">
                      No reviews yet
                    </div>
                  )}
                  <div className="bg-indigo-900/80 backdrop-blur-md px-3 py-1 rounded-full text-indigo-200 font-bold text-xs border border-indigo-700">
                    🛡 Safety: {safetyResult.score}/100
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Thumbnails Strip with Category Labels */}
            {galleryItems.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none pt-1">
                {galleryItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative flex flex-col items-start p-1 rounded-2xl shrink-0 border-2 transition-all cursor-pointer bg-white ${
                      activeImageIndex === idx
                        ? 'border-indigo-600 ring-2 ring-indigo-200 shadow-md scale-[1.02]'
                        : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={item.url}
                        alt={item.label}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 truncate max-w-[96px] sm:max-w-[112px] px-1 pt-1 block">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Key Listing Specifications & Fact Sheet */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4" id="listing-specifications-sheet">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span>Property Details & Verified Fact Sheet</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Comprehensive listing attributes and specifications
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border self-start sm:self-auto ${
                  isVerifiedSSU
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  {isVerifiedSSU ? '🛡️ Verified' : 'Demo Listing'}
                </span>
              </div>
            </div>

            {/* Comprehensive Grid Displaying All 18+ Required Attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              
              {/* 1. Property Name */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Property Name</span>
                <span className="font-bold text-slate-900 text-sm line-clamp-1">{propertyName}</span>
              </div>

              {/* 2. Verification Badge */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Listing Status</span>
                <span className={`font-extrabold text-sm flex items-center gap-1 ${isVerifiedSSU ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isVerifiedSSU ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : null}
                  {isVerifiedSSU ? 'Verified' : 'Demo Listing'}
                </span>
              </div>

              {/* 3. Location */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Location</span>
                <span className="font-semibold text-slate-800 line-clamp-2">{propertyLocation}</span>
              </div>

              {/* 4. Distance from Selected University */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Distance from Campus</span>
                <span className="font-extrabold text-indigo-700 text-sm">{distanceFromUniversity}</span>
              </div>

              {/* 5. Walking Time to Campus */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Walking Time</span>
                <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1">
                  <Footprints className="w-4 h-4 text-emerald-600" />
                  {walkingTimeToCampus}
                </span>
              </div>

              {/* 6. Monthly Rent */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Monthly Rent</span>
                <span className="font-black text-indigo-700 text-base">{monthlyRentDisplay}</span>
              </div>

              {/* 7. Room Type */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Room Type(s)</span>
                <span className="font-bold text-slate-900">{roomTypesSummary}</span>
              </div>

              {/* 8. Gender Eligibility */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Gender Eligibility</span>
                <span className={`font-extrabold ${
                  property.genderPolicy === 'girls' ? 'text-rose-700' : property.genderPolicy === 'boys' ? 'text-blue-700' : 'text-indigo-700'
                }`}>
                  {genderEligibility}
                </span>
              </div>

              {/* 9. Meals Included */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Meals Included</span>
                <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5" />
                  {mealsIncludedInfo}
                </span>
              </div>

              {/* 10. AC Type */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">AC Type</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-sky-600" />
                  {acTypeInfo}
                </span>
              </div>

              {/* 11. Attached Washroom */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Attached Washroom</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-indigo-600" />
                  {attachedWashroomInfo}
                </span>
              </div>

              {/* 12. Security Deposit */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Security Deposit</span>
                <span className="font-bold text-slate-900">{securityDepositInfo}</span>
              </div>

              {/* 13. Curfew Information */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Curfew Information</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  {curfewInfo}
                </span>
              </div>

              {/* 14. Wi-Fi Availability */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Wi-Fi Availability</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-indigo-600" />
                  {wifiInfo}
                </span>
              </div>

              {/* 15. Electricity / Maintenance Information */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Electricity & Maintenance</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  {electricityMaintenanceInfo}
                </span>
              </div>

              {/* 16. Warden / Manager Contact */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs sm:col-span-2 lg:col-span-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Warden / Manager Contact Details</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {wardenContactName} ({wardenContactRole}) — Phone: {wardenContactPhone}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">⚡ {wardenResponseRate}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(true)}
                    className="self-start sm:self-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contact Warden</span>
                  </button>
                </div>
              </div>

              {/* 17. Amenities List */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs sm:col-span-2 lg:col-span-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Included Amenities</span>
                <div className="flex flex-wrap gap-1.5">
                  {property.amenities && property.amenities.length > 0 ? (
                    property.amenities.map(a => (
                      <span key={a.id} className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg text-slate-700 font-semibold border border-slate-200 shadow-2xs text-[11px]">
                        <Check className="w-3 h-3 text-emerald-600" />
                        {a.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">Not provided</span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* 3. Available Room Types & Live Occupancy Selector */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-indigo-600" />
                  <span>Available Room Types & Configurations</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select a room type to calculate TrueCost™ and reserve bed
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                {property.roomOptions.length} Options Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {property.roomOptions.map((room) => {
                const isSelected = room.id === selectedRoomId;
                return (
                  <div
                    key={room.id}
                    onClick={() => handleSelectRoom(room.id)}
                    className={`rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-200'
                        : 'border-slate-200 hover:border-slate-300 bg-white shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-sm">
                          {room.type.toUpperCase()} OCCUPANCY
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                            ✓
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-slate-900">
                        {room.title}
                      </h4>

                      <div className="mt-2 text-lg font-black text-slate-900">
                        {formatPrice(room.nominalMonthlyRent, currency)}
                        <span className="text-xs font-normal text-slate-500">/mo</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2.5 border-t border-slate-200/70 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Room Size:</span>
                        <span className="font-semibold text-slate-800">{room.sizeSqFt || 180} sq.ft</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Attached Bath:</span>
                        <span className="font-semibold text-slate-800">{room.attachedBath ? 'Private Attached' : 'Common'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Air Conditioning:</span>
                        <span className="font-semibold text-slate-800">{room.airConditioning ? 'Inverter Split AC' : 'Non-AC'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Live Availability:</span>
                        <span className="font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                          {room.availableBeds} beds left
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. TrueCost™ Interactive Breakdown Engine (StayFind Dark Theme) */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 text-xs font-extrabold px-3 py-1 rounded-full border border-indigo-500/30 mb-1">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>TrueCost™ Transparency Engine</span>
                </div>
                <h3 className="text-xl font-extrabold text-white font-['Outfit',sans-serif]">
                  Actual Monthly Living Outflow
                </h3>
                <p className="text-xs text-slate-400">
                  Calculated dynamically for: <span className="text-indigo-300 font-semibold">{selectedRoom.title}</span>
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Estimated Monthly TrueCost</span>
                <div className="text-2xl sm:text-3xl font-black text-indigo-400">
                  {formatPrice(totalMonthlyTrueCost, currency)}
                  <span className="text-sm font-normal text-slate-400">/mo</span>
                </div>
              </div>
            </div>

            {/* Interactive AC Usage Simulation */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-slate-200">AC & Heating Power Simulation</span>
                </div>
                <span className="text-xs font-extrabold text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-800">
                  {acUsageHours} Hours / Day
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="16"
                step="2"
                value={acUsageHours}
                onChange={(e) => setAcUsageHours(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 hrs (No AC)</span>
                <span>6 hrs (Night only)</span>
                <span>12 hrs (Standard)</span>
                <span>16 hrs (Heavy use)</span>
              </div>
            </div>

            {/* Itemized Breakdown Table */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-medium">Base Room Rent ({selectedRoom.title})</span>
                <span className="font-bold text-white">{formatPrice(selectedRoom.nominalMonthlyRent, currency)}/mo</span>
              </div>

              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-medium">Nutritious Meal Plan ({property.mealsIncluded ? '3 Meals Buffet' : 'Self Cooking'})</span>
                <span className="font-bold text-emerald-400">
                  {trueCostResult.foodCost > 0 ? `${formatPrice(trueCostResult.foodCost, currency)}/mo` : 'Included ($0)'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-medium">Electricity & Power Sub-meter ({acUsageHours}h daily AC)</span>
                <span className="font-bold text-sky-300">~{formatPrice(trueCostResult.electricityCost, currency)}/mo</span>
              </div>

              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-medium">High-Speed Fiber Wi-Fi ({property.wifiSpeedMbps || 100} Mbps)</span>
                <span className="font-bold text-emerald-400">100% Free ($0)</span>
              </div>

              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-medium">Daily Room Cleaning & Trash Clearance</span>
                <span className="font-bold text-emerald-400">Included ($0)</span>
              </div>

              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="laundry-addon"
                    checked={includeLaundryAddon}
                    onChange={(e) => setIncludeLaundryAddon(e.target.checked)}
                    className="rounded-sm accent-indigo-500"
                  />
                  <label htmlFor="laundry-addon" className="text-slate-300 cursor-pointer">
                    App Laundry Pass (20 loads / month)
                  </label>
                </div>
                <span className="font-bold text-slate-200">
                  {includeLaundryAddon ? `${formatPrice(20, currency)}/mo` : '$0'}
                </span>
              </div>
            </div>

            {/* Deposit & First Month Calculation */}
            <div className="bg-indigo-950/60 border border-indigo-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-300 tracking-wider">Move-In One-Time Cost</span>
                <p className="text-sm font-extrabold text-white mt-0.5">
                  Deposit: {formatPrice(depositAmount, currency)} ({selectedRoom.depositMonths || 1} Month refundable)
                </p>
                <p className="text-[11px] text-slate-400">Returned in full within 7 days of lease end</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-indigo-300 font-bold uppercase">Total First Month (Rent + Deposit)</span>
                <p className="text-lg font-black text-indigo-300">
                  {formatPrice(totalMoveInOutflow, currency)}
                </p>
              </div>
            </div>

          </div>

          {/* 5. Commute & Walking Breakdown */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
              <Footprints className="w-5 h-5 text-indigo-600" />
              <span>Commute to University Campus Gates</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {property.commuteOptions.map((opt, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-indigo-600 mb-1">
                    <span className="font-extrabold uppercase text-xs tracking-wider">
                      {opt.type === 'walk' ? '🚶 Walking' : opt.type === 'bicycle' ? '🚲 Bicycling' : '🚌 Transit / Bus'}
                    </span>
                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {opt.durationMin} mins
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{opt.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. House Rules & Safety Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* House Rules */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>House Rules & Code of Conduct</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {property.houseRules && property.houseRules.length > 0 ? (
                  property.houseRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{rule}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">Not provided</li>
                )}
              </ul>
            </div>

            {/* Warden Profile & Contact Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Host & Warden Details
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    ⚡ {wardenResponseRate}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  {wardenContactName}
                </h4>
                <p className="text-xs text-slate-500">
                  {wardenContactRole}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2 text-slate-800 font-semibold truncate">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{wardenContactPhone}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyPhone(wardenContactPhone)}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors shrink-0 cursor-pointer"
                  title="Copy Phone Number"
                >
                  {copiedPhone ? 'Copied!' : <Copy className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  Contact
                </button>
              </div>
            </div>
          </div>

          {/* 7. Student Reviews Section */}
          <div className="space-y-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                  Verified Student Reviews
                </h3>
                <p className="text-xs text-slate-500">
                  Real experiences from students who lived at this accommodation
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {property.reviews && property.reviews.length > 0 ? (
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1 rounded-full text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{property.rating} ({property.reviews.length} {property.reviews.length === 1 ? 'review' : 'reviews'})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                    <span>No reviews yet</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsWritingReview(!isWritingReview)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Write Review</span>
                </button>
              </div>
            </div>

            {/* Write Review Form */}
            {isWritingReview && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!reviewName || !reviewComment) return;
                  const newRev: Review = {
                    id: 'rev_' + Date.now(),
                    authorName: reviewName,
                    authorUniversity: reviewUni || property.campusName,
                    authorMajor: 'Resident',
                    authorYear: 'Current Batch',
                    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                    rating: reviewRating,
                    date: 'Just now',
                    comment: reviewComment,
                    tags: reviewTag ? reviewTag.split(',').map(t => t.trim()).filter(Boolean) : ['Verified Resident'],
                  };
                  if (onAddReview) {
                    onAddReview(property.id, newRev);
                  }
                  setReviewSuccess(true);
                  setTimeout(() => {
                    setReviewSuccess(false);
                    setIsWritingReview(false);
                    setReviewName('');
                    setReviewComment('');
                    setReviewTag('');
                  }, 1500);
                }}
                className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 space-y-3 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">
                    Share Your Experience
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setIsWritingReview(false)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>

                {reviewSuccess && (
                  <div className="bg-emerald-100 text-emerald-800 text-xs font-bold p-2.5 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Review posted successfully!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Rating</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (Exceptional)</option>
                      <option value={4}>⭐⭐⭐⭐ 4 Stars (Very Good)</option>
                      <option value={3}>⭐⭐⭐ 3 Stars (Average)</option>
                      <option value={2}>⭐⭐ 2 Stars (Needs Improvement)</option>
                      <option value={1}>⭐ 1 Star (Poor)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Review Comments</label>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share feedback on cleanliness, food, Wi-Fi speed, and warden responsiveness..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <input
                    type="text"
                    value={reviewTag}
                    onChange={(e) => setReviewTag(e.target.value)}
                    placeholder="Tags (e.g. Great Food, Quiet, Fast Wi-Fi)"
                    className="flex-1 mr-3 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-3">
              {property.reviews && property.reviews.length > 0 ? (
                property.reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={rev.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{rev.authorName}</p>
                          <p className="text-[11px] text-slate-500">{rev.authorUniversity || 'Campus Resident'} • {rev.date || 'Recent'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{rev.comment || rev.content}"
                    </p>

                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                        {rev.tags.map((t, idx) => (
                          <span key={idx} className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-1">
                  <p className="text-xs font-bold text-slate-700">No student reviews yet</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Have you lived here or visited this property? Be the first student to share your feedback.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 z-30 bg-slate-900 text-white px-4 sm:px-6 py-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
          
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Monthly TrueCost</span>
              <div className="text-lg sm:text-xl font-black text-white">
                {formatPrice(totalMonthlyTrueCost, currency)}
                <span className="text-xs font-normal text-slate-400">/mo</span>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/80">
              0% Brokerage
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            {/* Quick Action: Save Button */}
            <button
              onClick={() => onToggleSave(property.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                isSaved 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
              id="footer-save-btn"
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-rose-400' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            {/* Quick Action: Compare Button */}
            <button
              onClick={() => onToggleCompare(property)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                isCompared 
                  ? 'bg-indigo-600 text-white border-indigo-500' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
              id="footer-compare-btn"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isCompared ? 'Comparing' : 'Compare'}</span>
            </button>

            {/* Quick Action: Contact Button */}
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs border border-emerald-500"
              id="footer-contact-btn"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contact</span>
            </button>

            {/* Book Tour */}
            <button
              onClick={() => onBookTour(property)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              id="book-tour-modal-trigger"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Schedule Visit</span>
            </button>

            {/* Reserve Bed */}
            <button
              onClick={() => onReserveBed(property, selectedRoom)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-900 transition-all hover:scale-[1.02] cursor-pointer"
              id="reserve-bed-trigger"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Reserve Bed ({formatPrice(selectedRoom.nominalMonthlyRent * 0.1, currency)} Token)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Direct Contact Warden / Manager Interactive Sheet Modal */}
      {isContactModalOpen && (
        <div 
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsContactModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Contact Property Host</h3>
                  <p className="text-xs text-slate-500">{propertyName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Host Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{wardenContactName}</h4>
                  <p className="text-xs text-slate-500">{wardenContactRole}</p>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  ⚡ {wardenResponseRate}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs font-mono font-bold text-slate-800">
                <span>{wardenContactPhone}</span>
                <button
                  type="button"
                  onClick={() => handleCopyPhone(wardenContactPhone)}
                  className="text-xs font-sans font-bold text-indigo-600 hover:text-indigo-800"
                >
                  {copiedPhone ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={wardenContactPhone !== 'Not provided' ? `tel:${wardenContactPhone.replace(/[^0-9+]/g, '')}` : '#'}
                className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Call Directly</span>
              </a>

              <a
                href={wardenContactPhone !== 'Not provided' ? `https://wa.me/${wardenContactPhone.replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20am%20interested%20in%20${encodeURIComponent(propertyName)}%20on%20StayFind.` : '#'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Chat</span>
              </a>
            </div>

            {/* Direct Inquiry Form */}
            <form onSubmit={handleSendInquiry} className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">
                Send In-App Inquiry / Request Callback
              </label>
              <textarea
                required
                rows={3}
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                placeholder="Ask about room availability, curfew flexibility, deposit return, food timing..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />

              {inquirySent && (
                <div className="bg-emerald-100 text-emerald-800 text-xs font-bold p-2.5 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Inquiry sent to warden! They will contact you shortly.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
