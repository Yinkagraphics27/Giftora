import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, Shield, Users, CheckCircle, Clock, Loader2, BadgeCheck, Ban, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface VendorProfile {
  id: string;
  user_id: string;
  business_name: string;
  email: string | null;
  city: string | null;
  country: string | null;
  is_verified: boolean;
  subscription_status: string;
  created_at: string;
}

export default function InternalAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  const [actionType, setActionType] = useState<"approve" | "revoke" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    checkAdmin();
  }, [user, authLoading]);

  const checkAdmin = async () => {
    const { data, error } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" });
    if (error || !data) {
      setIsAdmin(false);
      navigate("/", { replace: true });
    } else {
      setIsAdmin(true);
      fetchVendors();
    }
  };

  const fetchVendors = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("vendor_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching vendors:", error);
      toast({ title: "Error", description: "Failed to fetch vendors", variant: "destructive" });
    } else {
      setVendors(data || []);
    }
    setIsLoading(false);
  };

  const handleVendorAction = async () => {
    if (!selectedVendor || !actionType) return;
    setIsProcessing(true);

    const { error } = await supabase
      .from("vendor_profiles")
      .update({ is_verified: actionType === "approve" })
      .eq("id", selectedVendor.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Vendor Updated",
        description: `${selectedVendor.business_name} has been ${actionType === "approve" ? "approved" : "revoked"}.`,
      });
      setVendors((prev) =>
        prev.map((v) => (v.id === selectedVendor.id ? { ...v, is_verified: actionType === "approve" } : v))
      );
    }
    setSelectedVendor(null);
    setActionType(null);
    setIsProcessing(false);
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const pendingVendors = vendors.filter((v) => !v.is_verified);
  const verifiedVendors = vendors.filter((v) => v.is_verified);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-gold">
              <Gift className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold">Giftora</span>
            <Badge variant="secondary" className="ml-2 bg-red-500/10 text-red-600">Internal Admin</Badge>
          </Link>
          <Button variant="outline" size="sm" onClick={fetchVendors} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-foreground sm:text-3xl">
            <Shield className="h-7 w-7 text-red-500" />
            Vendor Review
          </h1>
          <p className="mt-1 text-muted-foreground">Approve or revoke vendor accounts</p>
        </motion.div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-bold">{vendors.length}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pending</span>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-orange-500">{pendingVendors.length}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Verified</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-green-500">{verifiedVendors.length}</div>
          </Card>
        </div>

        <Card>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : vendors.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No vendors registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.business_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {[vendor.city, vendor.country].filter(Boolean).join(", ") || "—"}
                      </TableCell>
                      <TableCell>
                        {vendor.is_verified ? (
                          <Badge className="bg-green-500/10 text-green-600">
                            <BadgeCheck className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-500 border-orange-200">
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{vendor.subscription_status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(vendor.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {vendor.is_verified ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => { setSelectedVendor(vendor); setActionType("revoke"); }}
                          >
                            <Ban className="mr-1 h-3 w-3" />
                            Revoke
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => { setSelectedVendor(vendor); setActionType("approve"); }}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </main>

      <Dialog open={!!selectedVendor && !!actionType} onOpenChange={() => { setSelectedVendor(null); setActionType(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approve Vendor" : "Revoke Vendor"}</DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? `Approve "${selectedVendor?.business_name}"? They will appear in public listings.`
                : `Revoke "${selectedVendor?.business_name}"? They will be hidden from public listings.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedVendor(null); setActionType(null); }} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant={actionType === "revoke" ? "destructive" : "default"} onClick={handleVendorAction} disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionType === "approve" ? "Approve" : "Revoke"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}