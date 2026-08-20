import React, { useState } from 'react';
import { 
  X, 
  Flag, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Building2
} from 'lucide-react';
import { Property } from '../types';
import { reportProperty } from '../firebase/services/propertyService';
import { useAuth } from '../context/AuthContext';

interface ReportPropertyModalProps {
  property: Property;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportPropertyModal: React.FC<ReportPropertyModalProps> = ({
  property,
  onClose,
  onSuccess,
}) => {
  const { userProfile, user } = useAuth();
  const [reason, setReason] = useState('Inaccurate Pricing or TrueCost');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      await reportProperty(
        property.id,
        property.name,
        user?.uid || 'anonymous_user',
        userProfile?.name || user?.displayName || 'Student User',
        reason,
        description.trim()
      );
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-rose-50 p-6 border-b border-rose-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 font-['Outfit',sans-serif]">
                Report Accommodation
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">
                {property.name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Report Submitted</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Our platform administrators have been notified and will verify this property's listing and warden details.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1.5">
                  Reason for Reporting
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Inaccurate Pricing or TrueCost">Inaccurate Pricing or Hidden Costs</option>
                  <option value="Fake or Misleading Images">Fake or Misleading Images</option>
                  <option value="Unresponsive or Rude Warden">Unresponsive or Rude Warden</option>
                  <option value="Curfew / Amenity Violation">Amenity / Curfew discrepancy</option>
                  <option value="Safety or Hygiene Concerns">Safety or Hygiene Concerns</option>
                  <option value="Other Issue">Other Issue</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1.5">
                  Details & Evidence
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what went wrong or why this property violates StayFind standards..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Submit Report</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
