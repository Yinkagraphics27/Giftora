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
  Loader2,
  BadgeCheck,
  Ban,
  RefreshCw,
  Plus,
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
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/useAdminRole";

interface VendorProfile {
  id: string;
  user_id: string;
  business_name: string;
  email: string;
  phone: string | null;
  vendor_type: string;
  status: string;
  is_verified: boolean;
  subscription_status: string;
  subscription_tier: string;
  country: string;
  city: string;
  created_at: string;
}

type ActionType = "approve" | "suspend" | "activate" | null;

export default function InternalAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isLoading: roleLoading } = useAdminRole();
  
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/", { replace: true });
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

  const handleVendorAction = async () => {
    if (!selectedVendor || !actionType) return;

    setIsProcessing(true);
    try {
      let updateData: Record<string, any> = {};

      switch (actionType) {
        case "approve":
          updateData = { status: "approved", is_verified: true };
          break;
        case "suspend":
          updateData = { status: "suspended", is_verified: false };
          break;
        case "activate":
          updateData = { status: "approved", is_verified: true };
          break;
      }

      const { error } = await supabase
        .from("vendor_profiles")
        .update(updateData)
        .eq("id", selectedVendor.id);

      if (error) throw error;

      const actionMessages = {
        approve: "approved",
        suspend: "suspended",
        activate: "reactivated",
      };

      toast({
        title: "Vendor Updated",
        description: `${selectedVendor.business_name} has been ${actionMessages[actionType]}.`,
      });

      // Update local state
      setVendors((prev) =>
        prev.map((v) =>
          v.id === selectedVendor.id ? { ...v, ...updateData } : v
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

  const getStatusBadge = (status: string, isVerified: boolean) => {
    if (status === "suspended") {
      return (
        <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-200">
          <Ban className="mr-1 h-3 w-3" />
          Suspended
        </Badge>
      );
    }
    if (status === "approved" && isVerified) {
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-200">
          <BadgeCheck className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-orange-500 border-orange-200">
        <Clock className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    );
  };

  const getSubscriptionBadge = (status: string) => {
    if (status === "active") {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600">
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Inactive
      </Badge>
    );
  };

  const pendingVendors = vendors.filter((v) => v.status === "pending");
  const approvedVendors = vendors.filter((v) => v.status === "approved");
  const suspendedVendors = vendors.filter((v) => v.status === "suspended");

  // Show loading while checking role
  if (roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not admin
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
            <Badge variant="secondary" className="ml-2 bg-red-500/10 text-red-600">
              Internal Admin
            </Badge>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="gold" size="sm" asChild>
              <Link to="/admin/add-vendor">
                <Plus className="mr-2 h-4 w-4" />
                Add Vendor
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={fetchVendors} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-foreground sm:text-3xl">
            <Shield className="h-7 w-7 text-red-500" />
            Internal Vendor Review
          </h1>
          <p className="mt-1 text-muted-foreground">
            Review, approve, or suspend vendor registrations
          </p>
        </motion.div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
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
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {approvedVendors.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Suspended</CardTitle>
              <Ban className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {suspendedVendors.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Vendors Table */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Vendor Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">
                          {vendor.business_name}
                        </TableCell>
                        <TableCell className="text-sm">
                          {vendor.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {vendor.vendor_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(vendor.status, vendor.is_verified)}
                        </TableCell>
                        <TableCell>
                          {vendor.is_verified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          {getSubscriptionBadge(vendor.subscription_status)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(vendor.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {vendor.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:bg-green-50 hover:text-green-700"
                                onClick={() => {
                                  setSelectedVendor(vendor);
                                  setActionType("approve");
                                }}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                            )}
                            {vendor.status === "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => {
                                  setSelectedVendor(vendor);
                                  setActionType("suspend");
                                }}
                              >
                                <Ban className="mr-1 h-3 w-3" />
                                Suspend
                              </Button>
                            )}
                            {vendor.status === "suspended" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                onClick={() => {
                                  setSelectedVendor(vendor);
                                  setActionType("activate");
                                }}
                              >
                                <RefreshCw className="mr-1 h-3 w-3" />
                                Reactivate
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
              {actionType === "approve" && "Approve Vendor"}
              {actionType === "suspend" && "Suspend Vendor"}
              {actionType === "activate" && "Reactivate Vendor"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" &&
                `Approve "${selectedVendor?.business_name}"? They will appear in public listings and can receive inquiries.`}
              {actionType === "suspend" &&
                `Suspend "${selectedVendor?.business_name}"? They will be hidden from public listings and cannot receive inquiries.`}
              {actionType === "activate" &&
                `Reactivate "${selectedVendor?.business_name}"? They will appear in public listings again.`}
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
              variant={actionType === "suspend" ? "destructive" : "default"}
              onClick={handleVendorAction}
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionType === "approve" && "Approve"}
              {actionType === "suspend" && "Suspend"}
              {actionType === "activate" && "Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
