import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  signUpUser, 
  loginUser, 
  logoutUser, 
  getUserProfile 
} from '../firebase/services/authService';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  isStudent: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  signup: (name: string, email: string, phone: string, pass: string, role: UserRole) => Promise<UserProfile>;
  login: (email: string, pass: string) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  authModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  authModalRole: UserRole;
  openAuthModal: (mode?: 'login' | 'signup', role?: UserRole) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal controls
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authModalRole, setAuthModalRole] = useState<UserRole>('student');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            // Create default profile if not present
            const fallbackProfile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              email: currentUser.email || '',
              phone: '',
              role: 'student',
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', currentUser.uid), fallbackProfile);
            setUserProfile(fallbackProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile in auth listener:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (name: string, email: string, phone: string, pass: string, role: UserRole): Promise<UserProfile> => {
    setError(null);
    try {
      const profile = await signUpUser(name, email, phone, pass, role);
      setUserProfile(profile);
      setAuthModalOpen(false);
      return profile;
    } catch (err: any) {
      const msg = err.message || 'Failed to sign up. Please try again.';
      setError(msg);
      throw err;
    }
  };

  const login = async (email: string, pass: string): Promise<UserProfile | null> => {
    setError(null);
    try {
      const { profile } = await loginUser(email, pass);
      setUserProfile(profile);
      setAuthModalOpen(false);
      return profile;
    } catch (err: any) {
      const msg = err.message || 'Invalid credentials or failed to log in.';
      setError(msg);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    setError(null);
    await logoutUser();
    setUser(null);
    setUserProfile(null);
  };

  const openAuthModal = (mode: 'login' | 'signup' = 'login', role: UserRole = 'student') => {
    setAuthModalMode(mode);
    setAuthModalRole(role);
    setAuthModalOpen(true);
    setError(null);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setError(null);
  };

  const role = userProfile?.role || null;
  const isStudent = role === 'student';
  const isOwner = role === 'owner';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role,
        loading,
        error,
        isStudent,
        isOwner,
        isAdmin,
        signup,
        login,
        logout,
        authModalOpen,
        authModalMode,
        authModalRole,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
