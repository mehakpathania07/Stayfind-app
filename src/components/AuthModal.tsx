import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialMode?: 'login' | 'signup';
  onLoginSuccess?: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode,
  onLoginSuccess,
}) => {
  const { 
    authModalOpen, 
    authModalMode, 
    authModalRole, 
    closeAuthModal, 
    login, 
    signup, 
    error 
  } = useAuth();

  const isVisible = isOpen !== undefined ? isOpen : authModalOpen;
  const handleClose = () => {
    if (onClose) onClose();
    closeAuthModal();
  };

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode || authModalMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(authModalRole || 'student');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialMode) setMode(initialMode);
    else setMode(authModalMode);
  }, [initialMode, authModalMode]);

  useEffect(() => {
    if (authModalRole) setSelectedRole(authModalRole);
  }, [authModalRole]);

  if (!isVisible) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (!email.trim()) throw new Error('Please enter a valid email address');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        
        const profile = await signup(name.trim(), email.trim(), phone.trim(), password, selectedRole);
        if (profile && onLoginSuccess) {
          onLoginSuccess(profile.role);
        }
      } else {
        if (!email.trim() || !password) throw new Error('Please enter your email and password');
        const profile = await login(email.trim(), password);
        if (profile && onLoginSuccess) {
          onLoginSuccess(profile.role);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = err.message || 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/invalid-email') message = 'The email address is not valid.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      }
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Please log in instead.';
      }
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickDemo = (demoRole: UserRole) => {
    if (demoRole === 'admin') {
      setEmail('admin@stayfind.campus');
      setPassword('admin123');
      setName('Platform Administrator');
      setPhone('+1 (555) 999-0001');
      setSelectedRole('admin');
    } else if (demoRole === 'owner') {
      setEmail('owner.robert@stayfind.campus');
      setPassword('owner123');
      setName('Robert Sterling (Owner)');
      setPhone('+1 (555) 345-6789');
      setSelectedRole('owner');
    } else {
      setEmail('student.alex@stayfind.campus');
      setPassword('student123');
      setName('Alex Chen (Student)');
      setPhone('+1 (555) 123-4567');
      setSelectedRole('student');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-sm">
              SF
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-200">
              StayFind Account
            </span>
          </div>

          <h3 className="text-2xl font-extrabold font-['Outfit',sans-serif]">
            {mode === 'login' ? 'Welcome Back!' : 'Join StayFind Living'}
          </h3>
          <p className="text-xs text-indigo-100 mt-1">
            {mode === 'login' 
              ? 'Access your student dashboard, wishlist, or property listings' 
              : 'Discover verified student PGs, connect with roommates & book tours'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-indigo-900/40 p-1 rounded-2xl mt-4">
            <button
              type="button"
              onClick={() => { setMode('login'); setFormError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-200 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setFormError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-200 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          
          {(formError || error) && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Authentication Error</p>
                <p>{formError || error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Sign Up Role Selector */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  I am joining as a:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('student')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      selectedRole === 'student'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs'
                    }`}
                  >
                    <GraduationCap className={`w-5 h-5 ${selectedRole === 'student' ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold leading-tight">Student Resident</span>
                    <span className="text-[10px] text-slate-400 font-medium">Find & compare stays</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('owner')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      selectedRole === 'owner'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs'
                    }`}
                  >
                    <Building2 className={`w-5 h-5 ${selectedRole === 'owner' ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold leading-tight">PG / Property Owner</span>
                    <span className="text-[10px] text-slate-400 font-medium">List & manage rooms</span>
                  </button>
                </div>
              </div>
            )}

            {/* Name (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Phone (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to StayFind' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill Box */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Quick One-Click Test Accounts
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => fillQuickDemo('student')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl text-[10px] font-bold text-slate-600 transition-colors text-center"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('owner')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl text-[10px] font-bold text-slate-600 transition-colors text-center"
              >
                🏢 Owner
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('admin')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl text-[10px] font-bold text-slate-600 transition-colors text-center"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
