import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  getSession,
  onAuthStateChange,
  signIn,
  signOut,
  signUp,
} from '../services/authService';

import {
  checkIsAdmin,
} from '../services/adminService';


const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin status
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);


  useEffect(() => {
    let unsubscribe = () => {};


    // Get the current logged-in session
    getSession()
      .then((s) => {
        setSession(s);

        // Check if the current user is an admin
        if (s?.user) {
          return checkIsAdmin();
        }

        return false;
      })
      .then((admin) => {
        setIsAdmin(Boolean(admin));
      })
      .catch(() => {
        setIsAdmin(false);
      })
      .finally(() => {
        setLoading(false);
        setAdminLoading(false);
      });


    // Listen for login/logout changes
    unsubscribe = onAuthStateChange((s) => {
      setSession(s);

      if (s?.user) {
        setAdminLoading(true);

        checkIsAdmin()
          .then((admin) => {
            setIsAdmin(Boolean(admin));
          })
          .catch(() => {
            setIsAdmin(false);
          })
          .finally(() => {
            setAdminLoading(false);
          });
      } else {
        setIsAdmin(false);
        setAdminLoading(false);
      }
    });


    // Clean up auth listener
    return () => unsubscribe();
  }, []);


  const value = {
    session,
    user: session?.user ?? null,
    loading,

    // Admin information
    isAdmin,
    adminLoading,

    // Authentication functions
    signIn,
    signUp,
    signOut,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return ctx;
}