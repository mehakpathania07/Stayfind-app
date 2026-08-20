import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Lock, 
  CreditCard,
  Building2,
  FileText
} from 'lucide-react';
import { Property, RoomOption, CurrencyCode, Reservation } from '../types';
import { formatPrice } from '../utils/currency';

interface ReserveBedModalProps {
  property: Property;
  room: RoomOption;
  currency: CurrencyCode;
  onClose: () => void;
  onConfirmReservation: (res: Reservation) => void;
}

export const ReserveBedModal: React.FC<ReserveBedModalProps> = ({
  property,
  room,
  currency,
  onClose,
  onConfirmReservation,
}) => {
  const [moveInDate, setMoveInDate] = useState<string>(
    new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [leaseMonths, setLeaseMonths] = useState<number>(9);
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedRes, setConfirmedRes] = useState<Reservation | null>(null);

  const tokenAmount = Math.round(room.nominalMonthlyRent * 0.1);

  const handlePayAndReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentPhone) return;

    setIsProcessing(true);

    setTimeout(() => {
      const res: Reservation = {
        id: 'res_' + Date.now(),
        propertyId: property.id,
        propertyName: property.name,
        roomType: room.title,
        moveInDate,
        leaseDurationMonths: leaseMonths,
        tokenPaid: tokenAmount,
        status: 'active',
        bookingRef: 'SF-' + Math.floor(100000 + Math.random() * 900000)
      };

      setConfirmedRes(res);
      setIsProcessing(false);
      onConfirmReservation(res);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-amber-300 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              100% Refundable Token Reservation
            </span>
            <h3 className="text-base font-extrabold truncate">
              Reserve Bed: {property.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedRes ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                Bed Successfully Reserved!
              </h3>
              <p className="text-xs font-semibold text-indigo-600">
                Booking Reference: {confirmedRes.bookingRef}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Property:</span>
                <span className="font-bold text-slate-800">{confirmedRes.propertyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Room Type:</span>
                <span className="font-bold text-slate-800">{confirmedRes.roomType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Move-in Date:</span>
                <span className="font-bold text-slate-800">{confirmedRes.moveInDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Token Amount Paid:</span>
                <span className="font-bold text-emerald-600">{formatPrice(confirmedRes.tokenPaid, currency)}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              The property manager has locked your bed slot. Remaining rent & deposit are payable upon room check-in.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handlePayAndReserve} className="p-5 sm:p-6 space-y-5">
            
            {/* Room Summary Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{room.title}</span>
                <span className="text-xs font-black text-indigo-600">
                  {formatPrice(room.nominalMonthlyRent, currency)}/mo
                </span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Available Bed Slots: {room.availableBeds} remaining</span>
                <span>Deposit: {room.depositMonths} Month</span>
              </div>
            </div>

            {/* Move in Date & Lease Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Move-In Date</label>
                <input
                  type="date"
                  required
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Lease Term</label>
                <select
                  value={leaseMonths}
                  onChange={(e) => setLeaseMonths(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value={4}>1 Semester (4 Months)</option>
                  <option value={9}>Academic Year (9 Months)</option>
                  <option value={12}>Full Year (12 Months)</option>
                </select>
              </div>
            </div>

            {/* Student Details */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700">Resident Information</h4>
              <input
                type="text"
                required
                placeholder="Full Student Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              />
              <input
                type="tel"
                required
                placeholder="Student Mobile Number"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              />
            </div>

            {/* Token Deposit Breakdown */}
            <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-4 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Hold Token Amount (10%):</span>
                <span className="font-extrabold text-indigo-700 text-sm">
                  {formatPrice(tokenAmount, currency)}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                100% refundable if cancelled at least 48 hours prior to move-in date. Adjusted against your first month's rent.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white rounded-xl font-extrabold text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {isProcessing ? 'Securing Slot...' : `Pay ${formatPrice(tokenAmount, currency)} Token & Reserve`}
              </span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
