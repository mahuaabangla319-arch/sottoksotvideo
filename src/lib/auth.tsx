import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string;
  signUp: (email: string, password: string, sotId: string, fullName: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  loading: true,
  error: "",
  signUp: async () => false,
  signIn: async () => false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  clearError: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // ১. প্রথমে এখন Session আছে কিনা দেখো
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });

    // ২. Login / Logout হলে অটো আপডেট
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    // ৩. ৮ সেকেন্ডের বেশি Loading হলে জোর করে বন্ধ করো - Google Loading আটকানো ঠিক হবে
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 8000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const clearError = () => setError("");

  // ===== SIGNUP - আসল Gmail + SOT ID, কোনো ফেক @sottok.com Email নয় =====
  const signUp = async (email: string, password: string, sotId: string, fullName: string) => {
    setLoading(true);
    setError("");
    try {
      const cleanId = sotId.toLowerCase().trim().replace(/[^a-z0-9_]/g, "");
      if (cleanId.length < 3) {
        setError("SOT ID কমপক্ষে ৩ অক্ষরের হতে হবে");
        return false;
      }

      // আগে এই SOT ID আছে কিনা চেক করো
      const { data: exists } = await supabase
        .from("profiles")
        .select("sot_id")
        .eq("sot_id", cleanId)
        .maybeSingle();

      if (exists) {
        setError("এই SOT ID already নেওয়া হয়ে গেছে, অন্য একটা দাও");
        return false;
      }

      // আসল Gmail দিয়ে Signup
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Signup হয়নি, আবার চেষ্টা করো");

      // Profile বানাও - পুরনো ডাটা ডিলিট হবে না, নতুন Insert হবে
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: email.trim(),
        sot_id: cleanId,
        full_name: fullName.trim(),
      });
      if (profileError) throw profileError;

      return true;
    } catch (e: any) {
      setError(e.message || "Signup-এ সমস্যা হয়েছে");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ===== LOGIN - Gmail + Password =====
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError("");
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (loginError) throw loginError;
      return true;
    } catch (e: any) {
      setError("Email / Password ভুল, আবার চেষ্টা করো");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ===== GOOGLE LOGIN =====
  const signInWithGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth/callback",
        },
      });
      if (error) throw error;
    } catch (e: any) {
      setError("Google Login-এ সমস্যা হয়েছে, আবার চেষ্টা করো");
      setLoading(false);
    }
    // Google-এ গেলে ফিরে আসতে সময় লাগে, ১০ সেকেন্ড পর Loading বন্ধ করো
    setTimeout(() => setLoading(false), 10000);
  };

  // ===== LOGOUT - পুরনো ভিডিও / সেটিং ডিলিট হবে না =====
  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("SignOut error", e);
    } finally {
      setSession(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        error,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);