import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs 
} from 'firebase/firestore';
import { auth, db } from '../config';
import { UserProfile, UserRole } from '../../types';

// Authorized bootstrap admin emails
export const AUTHORIZED_ADMIN_EMAILS = [
  'hellcoded@gmail.com',
  'admin@stayfind.campus'
];

export const isAuthorizedAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.toLowerCase().trim());
};

export const signUpUser = async (
  name: string,
  email: string,
  phone: string,
  password: string,
  role: UserRole
): Promise<UserProfile> => {
  // Security Enforcement: Do NOT allow public signup to assign 'admin' role
  const safeRole: UserRole = (role === 'admin') 
    ? (isAuthorizedAdminEmail(email) ? 'admin' : 'student')
    : (role === 'owner' ? 'owner' : 'student');

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update Auth display name
  try {
    await updateProfile(user, { displayName: name });
  } catch (e) {
    console.warn('Could not update display name in Auth', e);
  }

  const profile: UserProfile = {
    uid: user.uid,
    name,
    email,
    phone,
    role: safeRole,
    createdAt: new Date().toISOString(),
  };

  // Store user profile in Firestore
  try {
    await setDoc(doc(db, 'users', user.uid), profile);

    // If authorized admin, also register in admins collection
    if (safeRole === 'admin') {
      try {
        await setDoc(doc(db, 'admins', user.uid), {
          uid: user.uid,
          email: user.email,
          name,
          assignedAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Could not write admin document:', e);
      }
    }
  } catch (err) {
    console.warn('Could not sync user profile to Firestore (offline fallback):', err);
  }

  return profile;
};

export const loginUser = async (email: string, password: string): Promise<{ user: User; profile: UserProfile | null }> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  let profile: UserProfile | null = null;
  try {
    // Retrieve user document from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      profile = userDocSnap.data() as UserProfile;
      
      // Auto-promote authorized admin emails if needed
      if (isAuthorizedAdminEmail(user.email) && profile.role !== 'admin') {
        profile.role = 'admin';
        await setDoc(userDocRef, { role: 'admin' }, { merge: true });
        try {
          await setDoc(doc(db, 'admins', user.uid), {
            uid: user.uid,
            email: user.email,
            name: profile.name,
            assignedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn('Admin doc creation notice:', e);
        }
      }
    } else {
      // If not found in firestore (e.g. legacy/admin), create basic default profile
      const initialRole: UserRole = isAuthorizedAdminEmail(user.email) ? 'admin' : 'student';
      profile = {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone: '',
        role: initialRole,
        createdAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, profile);

      if (initialRole === 'admin') {
        try {
          await setDoc(doc(db, 'admins', user.uid), {
            uid: user.uid,
            email: user.email,
            name: profile.name,
            assignedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn('Admin doc creation notice:', e);
        }
      }
    }
  } catch (err) {
    console.warn('Could not fetch user profile from Firestore, using fallback profile:', err);
    profile = {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      phone: '',
      role: isAuthorizedAdminEmail(user.email) ? 'admin' : 'student',
      createdAt: new Date().toISOString(),
    };
  }

  return { user, profile };
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDocSnap = await getDoc(doc(db, 'users', uid));
    if (userDocSnap.exists()) {
      return userDocSnap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.error('Error fetching user profile from Firestore:', err);
    return null;
  }
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users: UserProfile[] = [];
    querySnapshot.forEach((d) => {
      users.push(d.data() as UserProfile);
    });
    return users;
  } catch (err) {
    console.error('Error fetching all users from Firestore:', err);
    return [];
  }
};

export const saveUserPreferencesInFirestore = async (
  uid: string,
  preferences: import('../../types').StudentPreferences
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, { preferences }, { merge: true });

    // Also write to userPreferences collection for standalone query support
    const prefDocRef = doc(db, 'userPreferences', uid);
    await setDoc(prefDocRef, { ...preferences, userId: uid, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('Error saving user preferences to Firestore:', err);
  }
};

export const getUserPreferencesFromFirestore = async (
  uid: string
): Promise<import('../../types').StudentPreferences | null> => {
  try {
    const prefDocRef = doc(db, 'userPreferences', uid);
    const prefSnap = await getDoc(prefDocRef);
    if (prefSnap.exists()) {
      return prefSnap.data() as import('../../types').StudentPreferences;
    }
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data() as UserProfile;
      return data.preferences || null;
    }
    return null;
  } catch (err) {
    console.error('Error fetching user preferences from Firestore:', err);
    return null;
  }
};

