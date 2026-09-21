import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  Package,
  ShoppingCart,
  Tag,
  ArrowRight,
  Loader2,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export function AdminOverview() {
  const [stats, setStats] = useState({
    vendors: 0,
    pendingVendors: 0,
    products: 0,
    pendingProducts: 0,
    orders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      const [
        vendorsRes,
        pendingVendorsRes,
        productsRes,
        pendingProductsRes,
        ordersRes,
      ] = await Promise.all([
        supabase
          .from("vendor_profiles")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("vendor_profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_verified", false),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("status", "draft"),
        supabase.from("orders").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        vendors: vendorsRes.count ?? 0,
        pendingVendors: pendingVendorsRes.count ?? 0,
        products: productsRes.count ?? 0,
        pendingProducts: pendingProductsRes.count ?? 0,
        orders: ordersRes.count ?? 0,
      });

      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy-800 lg:text-3xl">
          Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quick snapshot of your marketplace.
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Vendors"
          value={stats.vendors}
          icon={Store}
          link="/admin/vendors"
          hint={
            stats.pendingVendors > 0
              ? `${stats.pendingVendors} pending review`
              : "All reviewed"
          }
          urgent={stats.pendingVendors > 0}
        />
        <StatCard
          title="Total Products"
          value={stats.products}
          icon={Package}
          link="/admin/products"
          hint={
            stats.pendingProducts > 0
              ? `${stats.pendingProducts} pending approval`
              : "All approved"
          }
          urgent={stats.pendingProducts > 0}
        />
        <StatCard
          title="Total Orders"
          value={stats.orders}
          icon={ShoppingCart}
          link="/admin/orders"
          hint="View all orders"
          accent="gold"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 font-heading text-lg font-semibold text-navy-800">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            to="/admin/vendors"
            icon={Store}
            label="Review Vendors"
            badge={stats.pendingVendors}
          />
          <QuickAction
            to="/admin/products"
            icon={Package}
            label="Moderate Products"
            badge={stats.pendingProducts}
          />
          <QuickAction
            to="/admin/orders"
            icon={ShoppingCart}
            label="View Orders"
          />
          <QuickAction
            to="/admin/categories"
            icon={Tag}
            label="Manage Categories"
          />
        </div>
      </div>

      <Card className="border-gold-300 bg-gold-100/30">
        <CardContent className="flex items-start gap-3 p-5">
          <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
          <div>
            <p className="font-heading font-semibold text-navy-800">
              Analytics coming soon
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Revenue charts, top vendors, and trend analysis will appear here
              in Session 3.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  link,
  hint,
  urgent,
  accent = "navy",
}: {
  title: string;
  value: number;
  icon: any;
  link: string;
  hint?: string;
  urgent?: boolean;
  accent?: "navy" | "gold";
}) {
  return (
    <Link to={link}>
      <Card
        className={`group cursor-pointer border-canvas-200 bg-white transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-md ${
          urgent ? "ring-1 ring-gold-400/50" : ""
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-navy-600">
            {title}
          </CardTitle>
          <Icon
            className={`h-4 w-4 ${
              accent === "gold" ? "text-gold-500" : "text-navy-400"
            }`}
          />
        </CardHeader>
        <CardContent>
          <div className="font-heading text-3xl font-bold text-navy-800">
            {value}
          </div>
          {hint && (
            <p
              className={`mt-1.5 flex items-center gap-1 text-xs ${
                urgent ? "font-medium text-gold-600" : "text-muted-foreground"
              }`}
            >
              {urgent && <Clock className="h-3 w-3" />}
              {hint}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
  badge,
}: {
  to: string;
  icon: any;
  label: string;
  badge?: number;
}) {
  return (
    <Link to={to}>
      <div className="group flex items-center justify-between rounded-xl border border-canvas-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-canvas-100 transition-colors group-hover:bg-gold-100">
            <Icon className="h-4 w-4 text-navy-600 group-hover:text-gold-600" />
          </div>
          <span className="text-sm font-medium text-navy-800">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {badge !== undefined && badge > 0 && (
            <Badge className="rounded-full border-gold-300 bg-gold-100 text-xs text-gold-700">
              {badge}
            </Badge>
          )}
          <ArrowRight className="h-4 w-4 text-navy-400 transition-transform group-hover:translate-x-0.5 group-hover:text-gold-600" />
        </div>
      </div>
    </Link>
  );
}