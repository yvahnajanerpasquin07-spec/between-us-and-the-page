import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSession, onAuthStateChange, signIn, signOut, signUp } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    getSession()
      .then((s) => setSession(s))
      .finally(() => setLoading(false));

    unsubscribe = onAuthStateChange((s) => setSession(s));

    return () => unsubscribe();
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
