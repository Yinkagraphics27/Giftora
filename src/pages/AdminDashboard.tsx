import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Gift,
  Shield,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Mail,
  Phone,
  Building2,
  LogOut,
  Loader2,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";

interface VendorProfile {
  id: string;
  user_id: string;
  business_name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  country: string;
  city: string;
  description: string | null;
  is_verified: boolean;
  is_launch_partner: boolean;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useAdminRole();
  const { toast } = useToast();
  
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchVendors();
    }
  }, [isAdmin]);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast({
        title: "Error",
        description: "Failed to fetch vendors",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyVendor = async (approve: boolean) => {
    if (!selectedVendor) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("vendor_profiles")
        .update({ is_verified: approve })
        .eq("id", selectedVendor.id);

      if (error) throw error;

      toast({
        title: approve ? "Vendor Approved" : "Vendor Rejected",
        description: `${selectedVendor.business_name} has been ${approve ? "approved" : "rejected"}.`,
      });

      // Update local state
      setVendors((prev) =>
        prev.map((v) =>
          v.id === selectedVendor.id ? { ...v, is_verified: approve } : v
        )
      );

      setSelectedVendor(null);
      setActionType(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update vendor",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const pendingVendors = vendors.filter((v) => !v.is_verified);
  const verifiedVendors = vendors.filter((v) => v.is_verified);

  if (roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-gold">
              <Gift className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold">Giftora</span>
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
              Admin
            </Badge>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-foreground sm:text-3xl">
            <Shield className="h-7 w-7 text-primary" />
            Admin Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Review and approve vendor registrations
          </p>
        </motion.div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {pendingVendors.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {verifiedVendors.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Vendors */}
        {pendingVendors.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="mb-4 flex items-center gap-2 font-heading text-xl font-semibold">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Pending Review ({pendingVendors.length})
            </h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{vendor.business_name}</p>
                            {vendor.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {vendor.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {vendor.email}
                          </div>
                          {vendor.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {vendor.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {vendor.city}, {vendor.country}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(vendor.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setActionType("approve");
                            }}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setActionType("reject");
                            }}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </motion.section>
        )}

        {/* All Vendors */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mb-4 flex items-center gap-2 font-heading text-xl font-semibold">
            <Users className="h-5 w-5" />
            All Vendors ({vendors.length})
          </h2>
          <Card>
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : vendors.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No vendors registered yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{vendor.business_name}</span>
                          {vendor.is_launch_partner && (
                            <Badge variant="secondary" className="text-xs">
                              Launch Partner
                            </Badge>
                          )}
                        </div>
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
                        <div className="text-sm">{vendor.email}</div>
                      </TableCell>
                      <TableCell>
                        {vendor.city}, {vendor.country}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {vendor.subscription_tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(vendor.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {vendor.is_verified ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setActionType("reject");
                            }}
                          >
                            Revoke
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setActionType("approve");
                            }}
                          >
                            Verify
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </motion.section>
      </main>

      {/* Confirmation Dialog */}
      <Dialog
        open={!!selectedVendor && !!actionType}
        onOpenChange={() => {
          setSelectedVendor(null);
          setActionType(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Vendor" : "Reject Vendor"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? `Are you sure you want to verify "${selectedVendor?.business_name}"? They will be able to receive inquiries and appear in public listings.`
                : `Are you sure you want to reject "${selectedVendor?.business_name}"? They will not appear in public listings.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedVendor(null);
                setActionType(null);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={() => handleVerifyVendor(actionType === "approve")}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
