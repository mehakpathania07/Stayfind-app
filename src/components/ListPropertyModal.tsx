import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  DollarSign, 
  Utensils, 
  Wifi, 
  Plus, 
  Sparkles
} from 'lucide-react';
import { UniversityHub, PropertyCategory, GenderPolicy } from '../types';
import { useAuth } from '../context/AuthContext';

interface ListPropertyModalProps {
  onClose: () => void;
  selectedHub: UniversityHub;
  onAddNewProperty: (newPropData: any) => void;
}

export const ListPropertyModal: React.FC<ListPropertyModalProps> = ({
  onClose,
  selectedHub,
  onAddNewProperty,
}) => {
  const { user, userProfile } = useAuth();
  const [propertyName, setPropertyName] = useState('');
  const [category, setCategory] = useState<PropertyCategory>('pg');
  const [genderPolicy, setGenderPolicy] = useState<GenderPolicy>('coed');
  const [address, setAddress] = useState('');
  const [singleRent, setSingleRent] = useState('850');
  const [doubleRent, setDoubleRent] = useState('580');
  const [walkingMin, setWalkingMin] = useState('8');
  const [mealsIncluded, setMealsIncluded] = useState(true);
  const [wifiSpeed, setWifiSpeed] = useState('300');
  const [ownerName, setOwnerName] = useState(userProfile?.name || '');
  const [ownerPhone, setOwnerPhone] = useState(userProfile?.phone || '');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyName || !address || !ownerName) return;

    const newProperty = {
      id: 'prop_' + Date.now(),
      name: propertyName,
      tagline: `Verified student ${category.toUpperCase()} near ${selectedHub.name}`,
      category,
      genderPolicy,
      campusId: selectedHub.id,
      campusName: selectedHub.name,
      address,
      neighborhood: 'Campus Enclave',
      ownerId: user?.uid || 'owner_' + Date.now(),
      ownerName: ownerName,
      ownerPhone: ownerPhone,
      latitude: selectedHub.coordinates[0] + (Math.random() - 0.5) * 0.01,
      longitude: selectedHub.coordinates[1] + (Math.random() - 0.5) * 0.01,
      coverImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
      ],
      rating: 0,
      reviewCount: 0,
      verified: false,
      verificationStatus: 'pending',
      curfewTime: '11:00 PM',
      visitorPolicy: 'Allowed until 9:30 PM in lounge',
      mealsIncluded,
      wifiSpeedMbps: parseInt(wifiSpeed) || 200,
      powerBackup: true,
      noticePeriodDays: 30,
      roomOptions: [
        {
          id: 'opt-single',
          type: 'single' as const,
          title: 'Single Private Room',
          nominalMonthlyRent: parseInt(singleRent) || 850,
          depositMonths: 1,
          availableBeds: 2,
          totalBeds: 6,
          sizeSqFt: 180,
          attachedBath: true,
          balcony: true,
          airConditioning: true,
          studyDeskIncluded: true,
          images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80']
        },
        {
          id: 'opt-double',
          type: 'double' as const,
          title: 'Twin Sharing Room',
          nominalMonthlyRent: parseInt(doubleRent) || 580,
          depositMonths: 1,
          availableBeds: 4,
          totalBeds: 12,
          sizeSqFt: 240,
          attachedBath: true,
          balcony: false,
          airConditioning: true,
          studyDeskIncluded: true,
          images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80']
        }
      ],
      defaultRoomId: 'opt-double',
      baseCostBreakdown: [
        { name: 'Nominal Base Rent', amount: parseInt(doubleRent) || 580, period: 'monthly' as const, mandatory: true, category: 'rent' as const },
        { name: 'Meals & Food', amount: mealsIncluded ? 100 : 0, period: 'monthly' as const, mandatory: true, category: 'food' as const },
        { name: 'Wi-Fi & Common Maintenance', amount: 0, period: 'monthly' as const, mandatory: true, category: 'utilities' as const },
        { name: 'Electricity Estimate', amount: 25, period: 'monthly' as const, mandatory: false, category: 'utilities' as const },
        { name: 'Security Deposit (Refundable)', amount: parseInt(doubleRent) || 580, period: 'one-time' as const, mandatory: true, category: 'deposit' as const }
      ],
      amenities: [
        { id: 'am1', name: `${wifiSpeed} Mbps Wi-Fi`, category: 'connectivity' as const, icon: 'Wifi', isIncluded: true },
        { id: 'am2', name: 'Attached Bathrooms', category: 'comfort' as const, icon: 'Bath', isIncluded: true },
        { id: 'am3', name: 'Biometric Access', category: 'security' as const, icon: 'ShieldCheck', isIncluded: true }
      ],
      commuteOptions: [
        { type: 'walk' as const, durationMin: parseInt(walkingMin) || 8, distanceKm: 0.6, monthlyCostEst: 0, description: `${walkingMin} mins walk to main campus` }
      ],
      houseRules: [
        'Quiet hours after 11:00 PM',
        'Visitor register mandatory'
      ],
      wardenContact: {
        name: ownerName,
        role: 'Property Owner / Warden',
        phone: ownerPhone || '+1 (555) 019-2834',
        responseRate: 'Under 15 minutes',
        verifiedHost: true
      },
      reviews: [],
      featuredPerks: ['Newly Listed', '0% Brokerage', 'Fast Wi-Fi']
    };

    setIsSuccess(true);
    setTimeout(() => {
      onAddNewProperty(newProperty);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">List Your PG or Student Property</h3>
              <p className="text-xs text-indigo-200">Reach university students looking for accommodation near {selectedHub.shortName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
              Property Listed Successfully!
            </h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Your property <strong>{propertyName}</strong> is now live with instant TrueCost™ breakdown calculations for university students.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
            
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Property / PG Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Oxford Academic Suites PG"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800"
                >
                  <option value="pg">Paying Guest (PG)</option>
                  <option value="coliving">Co-Living Space</option>
                  <option value="hostel">Student Hostel</option>
                  <option value="apartment">Studio / Apartment</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Gender Policy</label>
                <select
                  value={genderPolicy}
                  onChange={(e) => setGenderPolicy(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800"
                >
                  <option value="coed">Co-Ed Living</option>
                  <option value="girls">Girls Only</option>
                  <option value="boys">Boys Only</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Exact Street Address</label>
              <input
                type="text"
                required
                placeholder="e.g. 15 University Ave, Cambridge, MA"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Single Room Rent ($/mo)</label>
                <input
                  type="number"
                  value={singleRent}
                  onChange={(e) => setSingleRent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Twin Sharing Rent ($/mo)</label>
                <input
                  type="number"
                  value={doubleRent}
                  onChange={(e) => setDoubleRent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Walking Time to Gate (Mins)</label>
                <input
                  type="number"
                  value={walkingMin}
                  onChange={(e) => setWalkingMin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Wi-Fi Fiber Speed (Mbps)</label>
                <input
                  type="number"
                  value={wifiSpeed}
                  onChange={(e) => setWifiSpeed(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="meals-check"
                checked={mealsIncluded}
                onChange={(e) => setMealsIncluded(e.target.checked)}
                className="rounded-sm accent-indigo-600"
              />
              <label htmlFor="meals-check" className="font-semibold text-slate-700 cursor-pointer">
                Chef Meals / Daily Mess Food Included in Rent
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Owner / Warden Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Smith"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>0% Brokerage Listing. Direct verified student booking requests.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Publish Property Listing
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
