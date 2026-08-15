import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface VendorProfile {
  id: string;
  user_id: string;
  business_name: string;
  email: string;
  phone: string | null;
  country: string;
  city: string;
  whatsapp: string | null;
  logo_url: string | null;
  description: string | null;
  is_verified: boolean;
  is_launch_partner: boolean;
  subscription_tier: string;
  subscription_status: string;
  status: string;
  vendor_type: string;
  created_at: string;
  updated_at: string;
  // Subscription fields
  subscription_expires_at: string | null;
  subscription_paused_at: string | null;
  subscription_pause_days_used: number;
  free_month_earned: boolean;
  is_trusted_vendor: boolean;
  products_reviewed_count: number;
  paystack_customer_code: string | null;
  paystack_subscription_code: string | null;
  paystack_authorization_code: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  vendorProfile: VendorProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithPhone: (phone: string) => Promise<{ error: Error | null }>;
  verifyOTP: (phone: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshVendorProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVendorProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("vendor_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (!error && data) {
      setVendorProfile(data);
    } else {
      setVendorProfile(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchVendorProfile(session.user.id);
          }, 0);
        } else {
          setVendorProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchVendorProfile(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/vendor/dashboard`,
      },
    });
    
    return { error: error as Error | null };
  };

  const signInWithPhone = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    
    return { error: error as Error | null };
  };

  const verifyOTP = async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setVendorProfile(null);
  };

  const refreshVendorProfile = async () => {
    if (user) {
      // Retry a few times with delay to handle race conditions
      let retries = 0;
      const maxRetries = 3;
      while (retries < maxRetries) {
        await fetchVendorProfile(user.id);
        if (vendorProfile) break;
        await new Promise(resolve => setTimeout(resolve, 300));
        retries++;
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        vendorProfile,
        isLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithPhone,
        verifyOTP,
        signOut,
        refreshVendorProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
