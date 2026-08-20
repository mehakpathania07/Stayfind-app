import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Bed, 
  DollarSign, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Check,
  Ban,
  ExternalLink,
  ShieldCheck,
  Tag,
  Wifi,
  Utensils
} from 'lucide-react';
import { Property, CurrencyCode, TourBooking, RoomOption } from '../types';
import { formatPrice } from '../utils/currency';
import { 
  updateProperty, 
  deleteProperty, 
  updateRoomAvailability 
} from '../firebase/services/propertyService';
import { 
  fetchVisitRequestsForOwner, 
  updateVisitRequestStatus 
} from '../firebase/services/visitRequestService';
import { useAuth } from '../context/AuthContext';

interface OwnerDashboardModalProps {
  properties: Property[];
  onClose: () => void;
  currency: CurrencyCode;
  onUpdateAvailability: (propertyId: string, roomId: string, availableBeds: number, totalBeds?: number) => void;
  onOpenListProperty: () => void;
  onPropertyUpdated?: () => void;
}

export const OwnerDashboardModal: React.FC<OwnerDashboardModalProps> = ({
  properties,
  onClose,
  currency,
  onUpdateAvailability,
  onOpenListProperty,
  onPropertyUpdated,
}) => {
  const { userProfile, user, isOwner, isAdmin } = useAuth();
  
  // Filter properties: if logged in as owner, show their properties (or all if demo)
  const ownerProperties = properties.filter(p => {
    if (isAdmin) return true;
    if (user?.uid && p.ownerId === user.uid) return true;
    // Default fallback so demo owners always see properties
    return true;
  });

  const [activeTab, setActiveTab] = useState<'inventory' | 'requests' | 'edit'>('inventory');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(ownerProperties[0]?.id || '');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  
  // Visit Requests State
  const [visitRequests, setVisitRequests] = useState<TourBooking[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Edit property state
  const selectedProperty = ownerProperties.find(p => p.id === selectedPropertyId) || ownerProperties[0];
  const [editName, setEditName] = useState(selectedProperty?.name || '');
  const [editTagline, setEditTagline] = useState(selectedProperty?.tagline || '');
  const [editRent, setEditRent] = useState(selectedProperty?.monthlyRent || 750);
  const [editCurfew, setEditCurfew] = useState(selectedProperty?.curfewTime || 'No Curfew');
  const [editWifi, setEditWifi] = useState(selectedProperty?.wifiSpeedMbps || 100);
  const [editMeals, setEditMeals] = useState(selectedProperty?.mealsIncluded ?? true);

  useEffect(() => {
    if (selectedProperty) {
      setEditName(selectedProperty.name);
      setEditTagline(selectedProperty.tagline);
      setEditRent(selectedProperty.monthlyRent || Math.min(...selectedProperty.roomOptions.map(r => r.nominalMonthlyRent)));
      setEditCurfew(selectedProperty.curfewTime);
      setEditWifi(selectedProperty.wifiSpeedMbps);
      setEditMeals(selectedProperty.mealsIncluded);
    }
  }, [selectedPropertyId, selectedProperty]);

  // Fetch visit requests for this owner/properties
  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const list = await fetchVisitRequestsForOwner(user?.uid || 'all');
      setVisitRequests(list);
    } catch (e) {
      console.error('Error loading visit requests:', e);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  const handleBedChange = (roomId: string, newAvailable: number, total: number) => {
    if (!selectedProperty) return;
    const clamped = Math.max(0, Math.min(total, newAvailable));
    onUpdateAvailability(selectedProperty.id, roomId, clamped, total);
    setSavedSuccessMsg(`Availability updated for ${selectedProperty.name}!`);
    setTimeout(() => setSavedSuccessMsg(null), 2500);
  };

  const handleSavePropertyEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    try {
      await updateProperty(selectedProperty.id, {
        name: editName,
        tagline: editTagline,
        monthlyRent: editRent,
        curfewTime: editCurfew,
        wifiSpeedMbps: editWifi,
        mealsIncluded: editMeals,
      });
      setSavedSuccessMsg(`Property "${editName}" details saved to Firestore!`);
      if (onPropertyUpdated) onPropertyUpdated();
      setTimeout(() => setSavedSuccessMsg(null), 2500);
    } catch (e) {
      console.error('Error saving property edits:', e);
    }
  };

  const handleDeleteProperty = async (propId: string) => {
    if (!window.confirm('Are you sure you want to delete this property listing?')) return;
    try {
      await deleteProperty(propId);
      setSavedSuccessMsg('Property listing removed from Firestore.');
      if (onPropertyUpdated) onPropertyUpdated();
      setTimeout(() => setSavedSuccessMsg(null), 2500);
    } catch (e) {
      console.error('Error deleting property:', e);
    }
  };

  const handleUpdateRequestStatus = async (reqId: string, status: 'accepted' | 'rejected') => {
    try {
      await updateVisitRequestStatus(reqId, status);
      setVisitRequests(prev => prev.map(r => r.id === reqId ? { ...r, status } : r));
      setSavedSuccessMsg(`Visit request marked as ${status}!`);
      setTimeout(() => setSavedSuccessMsg(null), 2500);
    } catch (e) {
      console.error('Error updating request status:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/20">
                  Landlord & Warden Portal
                </span>
                {userProfile && (
                  <span className="text-[11px] text-slate-300">
                    Logged in as: <strong className="text-white">{userProfile.name}</strong>
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-extrabold font-['Outfit',sans-serif]">
                Owner Dashboard & Inventory Manager
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50/70">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'inventory'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bed className="w-4 h-4" />
            <span>Room Vacancies & Beds</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all relative ${
              activeTab === 'requests'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Student Visit Requests</span>
            {visitRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {visitRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'edit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Details & Pricing</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Notification */}
          {savedSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{savedSuccessMsg}</span>
            </div>
          )}

          {/* TAB 1: Room Vacancies */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              
              {/* Property Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Select Your Property Listing
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <select
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {ownerProperties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.campusName}) — {p.roomOptions.reduce((s, r) => s + r.availableBeds, 0)} beds free
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenListProperty();
                    }}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>List New Property</span>
                  </button>
                </div>
              </div>

              {selectedProperty && (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {selectedProperty.name}
                      </h4>
                      <p className="text-xs text-slate-500">{selectedProperty.address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        Category: <span className="uppercase text-indigo-600">{selectedProperty.category}</span>
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        selectedProperty.verified 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {selectedProperty.verified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>

                  {/* Room Tiers Availability Editor */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Bed className="w-4 h-4 text-indigo-600" />
                        <span>Live Room Tiers & Bed Availability</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">Updates Firestore immediately</span>
                    </div>

                    <div className="space-y-3">
                      {selectedProperty.roomOptions.map((room) => {
                        const isSoldOut = room.availableBeds === 0;
                        return (
                          <div 
                            key={room.id}
                            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1 max-w-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-slate-900">
                                  {room.title}
                                </span>
                                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                                  {formatPrice(room.nominalMonthlyRent, currency)}/mo
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                {room.attachedBath ? 'Attached Bath' : 'Common Bath'} • {room.airConditioning ? 'AC' : 'Non-AC'} • {room.sizeSqFt} sq ft
                              </p>
                            </div>

                            {/* Bed Adjuster */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl">
                                <button
                                  type="button"
                                  onClick={() => handleBedChange(room.id, room.availableBeds - 1, room.totalBeds)}
                                  disabled={room.availableBeds <= 0}
                                  className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-30 font-extrabold text-xs text-slate-700 shadow-xs flex items-center justify-center cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="w-12 text-center text-xs font-black text-slate-900">
                                  {room.availableBeds} / {room.totalBeds}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleBedChange(room.id, room.availableBeds + 1, room.totalBeds)}
                                  disabled={room.availableBeds >= room.totalBeds}
                                  className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-30 font-extrabold text-xs text-slate-700 shadow-xs flex items-center justify-center cursor-pointer"
                                >
                                  +
                                </button>
                              </div>

                              <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${
                                isSoldOut 
                                  ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                                  : (room.availableBeds <= 1 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                              }`}>
                                {isSoldOut ? 'Sold Out' : `${room.availableBeds} Free`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Student Visit Requests */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Incoming In-Person & Video Visit Requests
                  </h4>
                  <p className="text-xs text-slate-500">
                    Review and confirm campus property tours booked by prospective students.
                  </p>
                </div>
                <button
                  onClick={loadRequests}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                >
                  Refresh
                </button>
              </div>

              {loadingRequests ? (
                <p className="text-xs text-slate-500 py-8 text-center">Loading tour requests from Firestore...</p>
              ) : visitRequests.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200 space-y-2">
                  <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No student visit requests yet</p>
                  <p className="text-[11px] text-slate-400">When students book a tour on your listings, requests will show up here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visitRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-black text-slate-900">{req.studentName}</h5>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            req.status === 'accepted' || req.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : (req.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200')
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-semibold">{req.propertyName}</p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-500" />
                            {req.date} at {req.timeSlot}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {req.studentPhone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {req.studentEmail}
                          </span>
                        </div>
                      </div>

                      {/* Accept / Reject Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateRequestStatus(req.id, 'accepted')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleUpdateRequestStatus(req.id, 'rejected')}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                          </>
                        )}
                        {req.status !== 'pending' && (
                          <span className="text-xs text-slate-400 font-semibold italic">
                            Status finalized
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Edit Property Details & Pricing */}
          {activeTab === 'edit' && selectedProperty && (
            <form onSubmit={handleSavePropertyEdits} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Property Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Base Starting Rent ({currency}/mo)
                  </label>
                  <input
                    type="number"
                    required
                    value={editRent}
                    onChange={(e) => setEditRent(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Tagline / Description
                  </label>
                  <input
                    type="text"
                    value={editTagline}
                    onChange={(e) => setEditTagline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Curfew Timing
                  </label>
                  <input
                    type="text"
                    value={editCurfew}
                    onChange={(e) => setEditCurfew(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    WiFi Speed (Mbps)
                  </label>
                  <input
                    type="number"
                    value={editWifi}
                    onChange={(e) => setEditWifi(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="editMealsCheckbox"
                    checked={editMeals}
                    onChange={(e) => setEditMeals(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                  <label htmlFor="editMealsCheckbox" className="text-xs font-bold text-slate-700">
                    Daily Meals / Food Mess Included
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDeleteProperty(selectedProperty.id)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Listing</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
