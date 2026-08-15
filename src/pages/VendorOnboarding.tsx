import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// This page now redirects to the dashboard, which handles onboarding inline
export default function VendorOnboarding() {
  const navigate = useNavigate();
  const { user, vendorProfile, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Not logged in - redirect to auth
      navigate("/vendor/auth", { replace: true });
    } else {
      // Logged in - always go to dashboard (it handles onboarding inline)
      navigate("/vendor/dashboard", { replace: true });
    }
  }, [user, vendorProfile, isLoading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
