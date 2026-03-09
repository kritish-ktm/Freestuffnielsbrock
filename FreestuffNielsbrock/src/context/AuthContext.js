// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";
import { sanitizeText } from "../utils/sanitize";

const AuthContext = createContext();

const UNIVERSITY_DOMAIN = "@edu.nielsbrock.dk";

const isUniversityEmail = (email) => {
  return email.toLowerCase().trim().endsWith(UNIVERSITY_DOMAIN);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error("Session error:", error);
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      if (mounted) {
        setUser(session?.user ?? null);
        if (loading) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // ✅ Google OAuth — open to ALL Google accounts, no email restriction
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: "select_account", // Always show Google account picker
          },
        },
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error during Google sign in:", error);
      throw error;
    }
  };

  // Microsoft Azure AD login
  const signInWithMicrosoft = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          redirectTo: `${window.location.origin}/`,
          scopes: "email profile openid",
          queryParams: {
            prompt: "select_account",
            domain_hint: "edu.nielsbrock.dk",
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

  // Email/Password Sign Up — restricted to @edu.nielsbrock.dk
  const signUpWithEmail = async (email, password, userData) => {
    try {
      if (!isUniversityEmail(email)) {
        throw new Error(`Please use your Niels Brock student email (${UNIVERSITY_DOMAIN})`);
      }
      const sanitizedData = {
        full_name: userData?.full_name ? sanitizeText(userData.full_name) : null,
        section: userData?.section ? sanitizeText(userData.section) : null,
        ...userData,
      };
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: sanitizedData,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  // Email/Password Sign In — restricted to @edu.nielsbrock.dk
  const signInWithEmail = async (email, password) => {
    try {
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

  // Magic Link — restricted to @edu.nielsbrock.dk
  const signInWithMagicLink = async (email) => {
    try {
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
    setUser(null);
    setLoading(false);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Sign out error:", error);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithGoogle,
        signInWithMicrosoft,
        signInWithEmail,
        signUpWithEmail,
        signInWithMagicLink,
        signOut,
        loading,
        isUniversityEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};