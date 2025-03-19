import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, createUserDocument } from '../utils/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Create/update user document in Firestore
        await createUserDocument(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up with email and password
  const signup = async (email, password, name) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with name
      await user.updateProfile({
        displayName: name
      });

      // Create user document with additional data
      await createUserDocument(user, { displayName: name });
      
      router.push('/dashboard');
      return { user, error: null };
    } catch (error) {
      setError(error.message);
      return { user: null, error: error.message };
    }
  };

  // Sign in with email and password
  const signin = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
      return { user, error: null };
    } catch (error) {
      setError(error.message);
      return { user: null, error: error.message };
    }
  };

  // Sign out
  const signout = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/');
      return { error: null };
    } catch (error) {
      setError(error.message);
      return { error: error.message };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      setError(error.message);
      return { error: error.message };
    }
  };

  // Update user profile
  const updateProfile = async (data) => {
    try {
      if (!user) throw new Error('No user logged in');

      // Update auth profile if name is provided
      if (data.displayName) {
        await user.updateProfile({
          displayName: data.displayName
        });
      }

      // Update user document in Firestore
      await createUserDocument(user, data);

      return { error: null };
    } catch (error) {
      setError(error.message);
      return { error: error.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    signin,
    signout,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}