/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDocFromServer } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useGameStore } from './store/gameStore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within FirebaseProvider');
  return context;
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setProgress } = useGameStore();

  useEffect(() => {
    if (!auth.onAuthStateChanged) {
      setLoading(false);
      return;
    }

    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      
      if (u) {
        // Sync progress from Firestore
        const progressRef = doc(db, 'users', u.uid, 'progress', 'data');
        onSnapshot(progressRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setProgress({
              completedLevels: data.completedLevels || [],
              efficiencyRatings: data.efficiencyRatings || {},
              safetyRatings: data.safetyRatings || {},
            });
          }
        }, (error) => {
          console.error("Firestore Sync Error:", error);
        });
      }
    });

    return () => unsubscribe();
  }, [setProgress]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Sign-in popup closed by user.');
      } else {
        console.error('Login error:', error);
        throw error;
      }
    }
  };

  const logout = () => auth.signOut();

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
