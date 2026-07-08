import * as React from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/src/firebase';
import { getProfileFromSQL } from '@/src/services/hybridApiService';
import { safeStringify } from '@/src/lib/safeStringify';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  // Sanitize the input error to prevent circular reference issues before any processing
  const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown Error');
  
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  
  // Log a version that is definitely safe
  try {
    console.error('Firestore Error Details: ', safeStringify(errInfo));
  } catch (e) {
    console.error('Firestore Error (Fallback Log):', errorMessage, operationType, path);
  }
}

export type UserRole = 'student' | 'trainer' | 'supervisor' | 'admin' | 'trial';

interface UserProfile {
  role: UserRole;
  name?: string;
  email?: string;
  uid: string;
  createdAt?: number;
  unreadByGroup?: Record<string, number>;
  totalUnread?: number;
  groupId?: string; // Add if missing from previous contexts
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
}

const AuthContext = React.createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  isAuthReady: false
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isAuthReady, setIsAuthReady] = React.useState(false);

  React.useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    
    // Safety timeout: If auth & profile logic hangs for more than 5 seconds, forced-continue
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth initialization taking too long, forcing ready state...");
        setLoading(false);
        setIsAuthReady(true);
      }
    }, 5500);

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth State Changed. User:", firebaseUser?.email);
      setUser(firebaseUser);
      
      if (firebaseUser) {
        console.log("User is authenticated. Attempting SQL prefetch...");
        // Prefetch SQL profile in background so it doesn't block UI loading state indefinitely
        getProfileFromSQL().then(sqlProfile => {
          console.log("SQL Profile Fetched:", !!sqlProfile);
          if (sqlProfile) {
            setProfile(prev => ({ ...prev, ...sqlProfile, uid: firebaseUser.uid }));
          }
        }).catch(err => console.error("Initial SQL Profile fetch failed:", err));

        console.log("Subscribing to Firestore user profile...");
        // Listen to user profile in Firestore (Realtime - Lite Data like chat counts)
        unsubscribeProfile = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
          console.log("Firestore Profile Update received. Exists:", docSnap.exists());
          const adminEmails = ['TKA.egypt@gmail.com', 'eng.waheedea@gmail.com'];
          const isDeveloper = firebaseUser.email && adminEmails.includes(firebaseUser.email);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Auto-promote developer to admin if not already
            if (isDeveloper && data.role !== 'admin') {
              console.log("Auto-promoting developer to admin...");
              updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'admin' }).catch(e => {
                console.error("Self-promotion failed - usually due to rules, but email-based admin should take over in UI", e);
              });
              data.role = 'admin';
            }
            setProfile(prev => ({ ...prev, ...data, uid: firebaseUser.uid } as UserProfile));
          } else {
            const defaultRole = isDeveloper ? 'admin' : 'student';
            setProfile(prev => prev || ({ uid: firebaseUser.uid, role: defaultRole } as UserProfile));
          }
          setLoading(false);
          setIsAuthReady(true);
        }, (error) => {
          console.error("Firestore Profile Sync Error:", error?.message || error);
          // If Firestore fails, we still have the user object, let's allow them to see the landing page at least
          if (!isAuthReady) {
            setLoading(false);
            setIsAuthReady(true);
          }
          handleFirestoreError(error, OperationType.GET, 'users/' + firebaseUser.uid);
        });

      } else {
        console.log("User is not authenticated.");
        setProfile(null);
        setLoading(false);
        setIsAuthReady(true);
        if (unsubscribeProfile) unsubscribeProfile();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      clearTimeout(safetyTimeout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
