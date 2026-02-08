// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";
import { sanitizeText } from "../utils/sanitize";

const AuthContext = createContext();

// University email domain
const UNIVERSITY_DOMAIN = "@edu.nielsbrock.dk";

// Validate university email
const isUniversityEmail = (email) => {
  return email.toLowerCase().trim().endsWith(UNIVERSITY_DOMAIN);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
        }
        
        if (mounted) {
          setUser(data.session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (mounted) {
        setUser(session?.user ?? null);
        
        // Make sure loading is false after any auth change
        if (loading) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Microsoft Azure AD login with university email restriction
  const signInWithMicrosoft = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          redirectTo: `${window.location.origin}/`,
          scopes: 'email profile openid',
          queryParams: {
            prompt: 'select_account',
            // Restrict to Niels Brock tenant (you'll need to configure this in Azure)
            domain_hint: 'edu.nielsbrock.dk'
          },
          skipBrowserRedirect: false,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error during Microsoft sign in:", error);
      throw error;
    }
  };

  // Email/Password Sign Up - Only allows university emails
  const signUpWithEmail = async (email, password, userData) => {
    try {
      // Validate university email
      if (!isUniversityEmail(email)) {
        throw new Error(`Please use your Niels Brock student email (${UNIVERSITY_DOMAIN})`);
      }

      // Sanitize user data
      const sanitizedData = {
        full_name: userData?.full_name ? sanitizeText(userData.full_name) : null,
        section: userData?.section ? sanitizeText(userData.section) : null,
        ...userData
      };

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: sanitizedData,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  // Email/Password Sign In - Only allows university emails
  const signInWithEmail = async (email, password) => {
    try {
      // Validate university email
      if (!isUniversityEmail(email)) {
        throw new Error(`Please use your Niels Brock student email (${UNIVERSITY_DOMAIN})`);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  // Magic Link Sign In - Only allows university emails
  const signInWithMagicLink = async (email) => {
    try {
      // Validate university email
      if (!isUniversityEmail(email)) {
        throw new Error(`Please use your Niels Brock student email (${UNIVERSITY_DOMAIN})`);
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Magic link error:", error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    console.log("Signing out...");
    
    // Clear user immediately BEFORE calling signOut
    setUser(null);
    setLoading(false);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
      }
      
      console.log("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      signInWithMicrosoft, 
      signInWithEmail, 
      signUpWithEmail, 
      signInWithMagicLink, 
      signOut, 
      loading,
      isUniversityEmail // Export for use in forms
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};