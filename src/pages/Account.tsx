import { MobileShell } from "@/components/layout/MobileShell";
import { MobileHeader } from "@/components/home/MobileHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Package,
  Store,
  Shield,
  LogOut,
  ChevronRight,
  Heart,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getUserRole, UserRole } from "@/lib/auth";

const Account = () => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRoleLoading(false);
      return;
    }
    (async () => {
      const r = await getUserRole(user.id);
      setRole(r);
      setRoleLoading(false);
    })();
  }, [user, authLoading]);

  if (authLoading || roleLoading) {
    return (
      <MobileShell>
        <MobileHeader />
        <main className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
        </main>
        <MobileBottomNav />
      </MobileShell>
    );
  }

  // ---------- NOT LOGGED IN ----------
  if (!user) {
    return (
      <MobileShell>
        <MobileHeader />
        <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 pb-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-canvas-100">
            <User className="h-8 w-8 text-navy-400" />
          </div>
          <h1 className="mt-4 font-heading text-xl font-bold text-navy-800">
            Sign in to Giftora
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track orders, save favorites, and manage your account.
          </p>
          <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
            <Button variant="gold" size="lg" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/signup">Create Account</Link>
            </Button>
          </div>
        </main>
        <MobileBottomNav />
      </MobileShell>
    );
  }

  // ---------- LOGGED IN ----------
  const roleLabel =
    role === "admin" ? "Administrator" : role === "vendor" ? "Vendor" : "Buyer";

  return (
    <MobileShell>
      <MobileHeader />
      <main className="space-y-4 px-3 pb-24 pt-4">
        {/* Profile card */}
        <div className="rounded-2xl border border-canvas-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-800 text-xl font-bold text-gold-500 ring-2 ring-gold-500/30">
              {user.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-base font-bold text-navy-800">
                {user.email?.split("@")[0]}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
              <span className="mt-1 inline-block rounded-full border border-gold-300 bg-gold-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-700">
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Menu section */}
        <div className="overflow-hidden rounded-2xl border border-canvas-200 bg-white">
          <MenuItem
            to="/my-orders"
            icon={Package}
            label="My Orders"
            description="View and track orders"
          />
          <Divider />
          <MenuItem
            to="/wishlist"
            icon={Heart}
            label="Wishlist"
            description="Saved gifts"
          />
          <Divider />
          <MenuItem
            to="/messages"
            icon={MessageCircle}
            label="Messages"
            description="Chat with vendors"
          />
        </div>

        {/* Role-specific section */}
        {(role === "vendor" || role === "admin") && (
          <div className="overflow-hidden rounded-2xl border border-canvas-200 bg-white">
            {role === "vendor" && (
              <MenuItem
                to="/dashboard"
                icon={Store}
                label="Vendor Dashboard"
                description="Manage your store"
              />
            )}
            {role === "admin" && (
              <>
                {role === "vendor" && <Divider />}
                <MenuItem
                  to="/admin"
                  icon={Shield}
                  label="Admin Console"
                  description="Full platform control"
                  highlight
                />
              </>
            )}
          </div>
        )}

        {/* Sign out */}
        <button
          type="button"
          onClick={async () => {
            await signOut();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-canvas-200 bg-white py-3.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </main>
      <MobileBottomNav />
    </MobileShell>
  );
};

function MenuItem({
  to,
  icon: Icon,
  label,
  description,
  highlight,
}: {
  to: string;
  icon: any;
  label: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-canvas-100/60"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          highlight
            ? "bg-navy-800 text-gold-500"
            : "bg-canvas-100 text-navy-700"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-sm font-semibold text-navy-800">
          {label}
        </p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-navy-400 transition-transform group-hover:translate-x-0.5 group-hover:text-gold-600" />
    </Link>
  );
}

function Divider() {
  return <div className="border-t border-canvas-200" />;
}

export default Account;