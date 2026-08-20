import React, { useState } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Footprints, 
  ShieldCheck, 
  CheckCircle2, 
  Phone,
  User,
  Mail
} from 'lucide-react';
import { Property, TourBooking } from '../types';
import { useAuth } from '../context/AuthContext';

interface BookTourModalProps {
  property: Property;
  onClose: () => void;
  onConfirmBooking: (booking: TourBooking) => void;
}

export const BookTourModal: React.FC<BookTourModalProps> = ({
  property,
  onClose,
  onConfirmBooking,
}) => {
  const { user, userProfile } = useAuth();
  const [tourType, setTourType] = useState<'in_person' | 'video_call'>('in_person');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('11:00 AM - 11:30 AM');
  const [name, setName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(userProfile?.email || user?.email || '');
  const [isSuccess, setIsSuccess] = useState(false);

  const timeSlots = [
    '10:00 AM - 10:30 AM',
    '11:30 AM - 12:00 PM',
    '02:30 PM - 03:00 PM',
    '04:30 PM - 05:00 PM',
    '06:00 PM - 06:30 PM'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const booking: TourBooking = {
      id: 'tour_' + Date.now(),
      propertyId: property.id,
      propertyName: property.name,
      userId: user?.uid || 'guest_user',
      ownerId: property.ownerId || 'all_owners',
      date: selectedDate,
      timeSlot: selectedSlot,
      tourType,
      studentName: name,
      studentPhone: phone,
      studentEmail: email || 'student@university.edu',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setIsSuccess(true);
    setTimeout(() => {
      onConfirmBooking(booking);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">
              Free Property Visit
            </span>
            <h3 className="text-base font-extrabold truncate">
              Schedule Tour: {property.name}
            </h3>
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
              Tour Confirmed!
            </h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Warden <strong>{property.wardenContact.name}</strong> will meet you on {selectedDate} at {selectedSlot}. A confirmation SMS was sent to {phone}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            
            {/* Tour Type Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTourType('in_person')}
                className={`p-3 rounded-2xl border-2 text-left transition-all ${
                  tourType === 'in_person'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <Footprints className="w-4 h-4" />
                  <span className="font-extrabold text-xs">In-Person Visit</span>
                </div>
                <p className="text-[11px] text-slate-500">Walk through rooms & mess hall</p>
              </button>

              <button
                type="button"
                onClick={() => setTourType('video_call')}
                className={`p-3 rounded-2xl border-2 text-left transition-all ${
                  tourType === 'video_call'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <Video className="w-4 h-4" />
                  <span className="font-extrabold text-xs">Live Video Call</span>
                </div>
                <p className="text-[11px] text-slate-500">Interactive 3D / WhatsApp call</p>
              </button>
            </div>

            {/* Date and Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Select Date</label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Preferred Time Slot</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  {timeSlots.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Student Contact Info */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700">Your Contact Details</h4>
              
              <div className="space-y-2">
                <div className="relative flex items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                  <User className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div className="relative flex items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                  <Phone className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="tel"
                    required
                    placeholder="Mobile Phone (for Gate Pass SMS)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div className="relative flex items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                  <Mail className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="email"
                    placeholder="University Email (Optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Trust Note */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Free visit. No booking obligation or brokerage charges.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-200 transition-colors cursor-pointer"
            >
              Confirm Tour Schedule
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
