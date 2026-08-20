import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Building2, 
  Search, 
  Star, 
  Users,
  Flag,
  MessageSquare,
  Trash2,
  Check,
  Ban,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Property, CurrencyCode, UserProfile, FirestoreReport, Review } from '../types';
import { formatPrice } from '../utils/currency';
import { getAllUsers } from '../firebase/services/authService';
import { fetchReports, updateReportStatus } from '../firebase/services/propertyService';
import { fetchAllReviews, deleteReview } from '../firebase/services/reviewService';

interface AdminDashboardModalProps {
  properties: Property[];
  onClose: () => void;
  currency: CurrencyCode;
  onUpdateVerification: (propertyId: string, status: 'verified' | 'rejected') => void;
  onResetToDefaults: () => void;
  onRefreshData?: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  properties,
  onClose,
  currency,
  onUpdateVerification,
  onResetToDefaults,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'users' | 'reports' | 'reviews'>('properties');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Firestore loaded states
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [reportsList, setReportsList] = useState<FirestoreReport[]>([]);
  const [reviewsList, setReviewsList] = useState<(Review & { propertyId: string; propertyName?: string })[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      const [users, reports, reviews] = await Promise.all([
        getAllUsers(),
        fetchReports(),
        fetchAllReviews()
      ]);
      setUsersList(users);
      setReportsList(reports);
      setReviewsList(reviews);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const filteredProperties = properties.filter(p => {
    const status = p.verificationStatus || (p.verified ? 'verified' : 'pending');
    if (filterStatus === 'verified' && status !== 'verified') return false;
    if (filterStatus === 'pending' && status !== 'pending') return false;
    if (filterStatus === 'rejected' && status !== 'rejected') return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.campusName.toLowerCase().includes(q);
    }
    return true;
  });

  const handleVerify = (propId: string, propName: string) => {
    onUpdateVerification(propId, 'verified');
    setSuccessMsg(`"${propName}" has been VERIFIED & published to students!`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleReject = (propId: string, propName: string) => {
    onUpdateVerification(propId, 'rejected');
    setSuccessMsg(`"${propName}" has been REJECTED.`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleReportAction = async (reportId: string, status: 'reviewed' | 'dismissed') => {
    try {
      await updateReportStatus(reportId, status);
      setReportsList(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
      setSuccessMsg(`Report marked as ${status}.`);
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (e) {
      console.error('Error updating report status:', e);
    }
  };

  const handleDeleteReview = async (reviewId: string, propertyId: string) => {
    if (!window.confirm('Delete this user review from Firestore?')) return;
    try {
      await deleteReview(reviewId, propertyId);
      setReviewsList(prev => prev.filter(r => r.id !== reviewId));
      setSuccessMsg('Review removed by administrator.');
      if (onRefreshData) onRefreshData();
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (e) {
      console.error('Error deleting review:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/20">
                  StayFind Administration Portal
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold font-['Outfit',sans-serif]">
                Trust, Compliance & User Moderation
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50/70">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'properties'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Properties ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'users'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Owners ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all relative ${
              activeTab === 'reports'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Flag className="w-4 h-4" />
            <span>Reports</span>
            {reportsList.filter(r => r.status === 'pending').length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {reportsList.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Reviews ({reviewsList.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Notification */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: Properties Verification */}
          {activeTab === 'properties' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by property title, campus, or address..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                  >
                    All ({properties.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('pending')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500'}`}
                  >
                    Pending ({properties.filter(p => (p.verificationStatus === 'pending' || !p.verified)).length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('verified')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === 'verified' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'}`}
                  >
                    Verified ({properties.filter(p => p.verified).length})
                  </button>
                </div>
              </div>

              {/* Property Rows */}
              <div className="space-y-3">
                {filteredProperties.map((prop) => {
                  const status = prop.verificationStatus || (prop.verified ? 'verified' : 'pending');
                  return (
                    <div
                      key={prop.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={prop.coverImage}
                          alt={prop.name}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-sm text-slate-900 truncate">
                              {prop.name}
                            </h4>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              status === 'verified'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : (status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200')
                            }`}>
                              {status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            {prop.campusName} • {prop.address}
                          </p>
                          <p className="text-[11px] text-indigo-700 font-bold">
                            Starts from {formatPrice(prop.roomOptions[0]?.nominalMonthlyRent || 800, currency)}/mo
                          </p>
                        </div>
                      </div>

                      {/* Verify / Reject Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {status !== 'verified' && (
                          <button
                            onClick={() => handleVerify(prop.id, prop.name)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Verify Stay</span>
                          </button>
                        )}
                        {status !== 'rejected' && (
                          <button
                            onClick={() => handleReject(prop.id, prop.name)}
                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Users & Owners */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Registered Students & Property Owners
                  </h4>
                  <p className="text-xs text-slate-500">
                    User records stored securely in Firestore <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded-sm">users</code> collection.
                  </p>
                </div>
                <button
                  onClick={loadAdminData}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  Refresh
                </button>
              </div>

              {loadingData ? (
                <p className="text-xs text-slate-500 py-8 text-center">Loading users from Firestore...</p>
              ) : usersList.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">
                  <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No registered users in Firestore yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">Sign up new student or owner accounts using the Auth button.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {usersList.map((u) => (
                    <div
                      key={u.uid}
                      className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{u.name}</span>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            u.role === 'admin'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : (u.role === 'owner' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-700 border-slate-200')
                          }`}>
                            {u.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {u.email}</span>
                          {u.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {u.phone}</span>}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        UID: {u.uid.slice(0, 8)}...
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Reports */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Flagged Listings & Discrepancy Reports
                  </h4>
                  <p className="text-xs text-slate-500">
                    Submitted by students regarding pricing discrepancies or warden issues.
                  </p>
                </div>
              </div>

              {reportsList.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">
                  <Flag className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No active reports filed</p>
                  <p className="text-[11px] text-slate-400 mt-1">All accommodations meet quality and compliance standards.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportsList.map((r) => (
                    <div
                      key={r.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                            {r.reason}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            r.status === 'reviewed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900">Property: {r.propertyName}</h5>
                        <p className="text-xs text-slate-600">{r.description}</p>
                        <p className="text-[10px] text-slate-400">Reported by: {r.reportedByName || 'Student'}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {r.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleReportAction(r.id, 'reviewed')}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                            >
                              Mark Reviewed
                            </button>
                            <button
                              onClick={() => handleReportAction(r.id, 'dismissed')}
                              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Reviews Moderation */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Community Reviews Moderation
                  </h4>
                  <p className="text-xs text-slate-500">
                    Remove spam or abusive reviews directly from Firestore.
                  </p>
                </div>
              </div>

              {reviewsList.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">
                  <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No user-created reviews to moderate</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviewsList.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{rev.authorName}</span>
                          <span className="flex items-center text-amber-500 text-xs font-bold">
                            <Star className="w-3 h-3 fill-amber-400" /> {rev.rating}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700">"{rev.comment}"</p>
                        <p className="text-[10px] text-slate-400">Date: {rev.date}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteReview(rev.id, rev.propertyId)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
