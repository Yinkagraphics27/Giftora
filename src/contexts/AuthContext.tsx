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

interface BuyerProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string;
  created_at: string;
}

interface SignUpBuyerInput {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
  city?: string;
  country?: string;
}

interface SignUpVendorInput {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
  businessName: string;
  city?: string;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  vendorProfile: VendorProfile | null;
  buyerProfile: BuyerProfile | null;
  isLoading: boolean;

  // Legacy (kept for backward compat)
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;

  // New
  signUpBuyer: (input: SignUpBuyerInput) => Promise<{ error: Error | null }>;
  signUpVendor: (input: SignUpVendorInput) => Promise<{ error: Error | null }>;

  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithPhone: (phone: string) => Promise<{ error: Error | null }>;
  verifyOTP: (phone: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshVendorProfile: () => Promise<void>;
  refreshBuyerProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile | null>(null);
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

  const fetchBuyerProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("buyer_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      setBuyerProfile(data);
    } else {
      setBuyerProfile(null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchVendorProfile(session.user.id);
            fetchBuyerProfile(session.user.id);
          }, 0);
        } else {
          setVendorProfile(null);
          setBuyerProfile(null);
        }

        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchVendorProfile(session.user.id);
        fetchBuyerProfile(session.user.id);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ---------- LEGACY signUp (kept for backward compat, acts as buyer signup with email+password only) ----------
  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    return { error: error as Error | null };
  };

  // ---------- NEW: Buyer signup ----------
  const signUpBuyer = async (input: SignUpBuyerInput) => {
    const redirectUrl = `${window.location.origin}/`;

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: { emailRedirectTo: redirectUrl },
    });

    if (authError) return { error: authError as Error };
    if (!authData.user) return { error: new Error("Signup failed — no user") };

    // 2. Insert buyer_profiles row
    const { error: profileError } = await supabase
      .from("buyer_profiles")
      .insert({
        user_id: authData.user.id,
        full_name: input.fullName,
        phone: input.phone,
        address: input.address,
        city: input.city ?? null,
        country: input.country ?? "Nigeria",
      });

    if (profileError) {
      console.error("Buyer profile insert failed:", profileError);
      // Don't fail signup — user exists. Profile can be created later.
    }

    return { error: null };
  };

  // ---------- NEW: Vendor signup ----------
  const signUpVendor = async (input: SignUpVendorInput) => {
    const redirectUrl = `${window.location.origin}/`;

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: { emailRedirectTo: redirectUrl },
    });

    if (authError) return { error: authError as Error };
    if (!authData.user) return { error: new Error("Signup failed — no user") };

    // 2. Insert vendor_profiles row
    const { error: profileError } = await supabase
      .from("vendor_profiles")
      .insert({
        user_id: authData.user.id,
        business_name: input.businessName,
        email: input.email,
        full_name: input.fullName,
        phone: input.phone,
        address: input.address,
        city: input.city ?? "",
        country: input.country ?? "Nigeria",
        subscription_status: "inactive",
        free_month_earned: false,
      });

    if (profileError) {
      console.error("Vendor profile insert failed:", profileError);
    }

    // 3. Update role from 'user' (trigger default) to 'vendor'
    const { error: roleError } = await supabase
      .from("user_roles")
      .update({ role: "vendor" })
      .eq("user_id", authData.user.id);

    if (roleError) {
      console.error("Role update failed:", roleError);
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/signin` },
    });
    return { error: error as Error | null };
  };

  const signInWithPhone = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    return { error: error as Error | null };
  };

  const verifyOTP = async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setVendorProfile(null);
    setBuyerProfile(null);
  };

  const refreshVendorProfile = async () => {
    if (user) await fetchVendorProfile(user.id);
  };

  const refreshBuyerProfile = async () => {
    if (user) await fetchBuyerProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        vendorProfile,
        buyerProfile,
        isLoading,
        signUp,
        signUpBuyer,
        signUpVendor,
        signIn,
        signInWithGoogle,
        signInWithPhone,
        verifyOTP,
        signOut,
        refreshVendorProfile,
        refreshBuyerProfile,
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