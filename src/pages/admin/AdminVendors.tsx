import { useEffect, useState } from "react";
import {
  Store,
  CheckCircle,
  XCircle,
  Clock,
  BadgeCheck,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Mail,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

export function AdminVendors() {
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(
    null
  );
  const [actionType, setActionType] = useState<"approve" | "revoke" | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchVendors = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("vendor_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Failed to fetch vendors");
    } else {
      setVendors((data ?? []) as VendorProfile[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleVendorAction = async () => {
    if (!selectedVendor || !actionType) return;
    setIsProcessing(true);

    const approve = actionType === "approve";
    const { error } = await supabase
      .from("vendor_profiles")
      .update({ is_verified: approve })
      .eq("id", selectedVendor.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(
        `${selectedVendor.business_name} has been ${
          approve ? "approved" : "rejected"
        }.`
      );
      setVendors((prev) =>
        prev.map((v) =>
          v.id === selectedVendor.id ? { ...v, is_verified: approve } : v
        )
      );
    }

    setSelectedVendor(null);
    setActionType(null);
    setIsProcessing(false);
  };

  const pendingVendors = vendors.filter((v) => !v.is_verified);
  const verifiedVendors = vendors.filter((v) => v.is_verified);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-800 lg:text-3xl">
            Vendor Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Approve or revoke vendor accounts.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchVendors}
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-canvas-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-navy-600">Total</span>
            <Store className="h-4 w-4 text-navy-400" />
          </div>
          <div className="mt-2 font-heading text-2xl font-bold text-navy-800">
            {vendors.length}
          </div>
        </Card>
        <Card className="border-gold-300 bg-gold-100/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gold-700">Pending</span>
            <Clock className="h-4 w-4 text-gold-600" />
          </div>
          <div className="mt-2 font-heading text-2xl font-bold text-gold-700">
            {pendingVendors.length}
          </div>
        </Card>
        <Card className="border-canvas-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-navy-600">Verified</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 font-heading text-2xl font-bold text-emerald-600">
            {verifiedVendors.length}
          </div>
        </Card>
      </div>

      {/* Pending section */}
      {pendingVendors.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold text-navy-800">
            <AlertTriangle className="h-5 w-5 text-gold-600" />
            Pending Review ({pendingVendors.length})
          </h2>
          <Card className="overflow-hidden border-canvas-200 bg-white">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-canvas-200 hover:bg-transparent">
                    <TableHead className="text-navy-600">Business</TableHead>
                    <TableHead className="text-navy-600">Contact</TableHead>
                    <TableHead className="text-navy-600">Location</TableHead>
                    <TableHead className="text-navy-600">Registered</TableHead>
                    <TableHead className="text-right text-navy-600">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingVendors.map((vendor) => (
                    <TableRow
                      key={vendor.id}
                      className="border-canvas-200 hover:bg-canvas-100/50"
                    >
                      <TableCell className="font-medium text-navy-800">
                        {vendor.business_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-navy-600">
                          <Mail className="h-3.5 w-3.5 text-navy-400" />
                          {vendor.email ?? "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-navy-600">
                          <MapPin className="h-3.5 w-3.5 text-navy-400" />
                          {[vendor.city, vendor.country]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(vendor.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gold-500/40 text-gold-700 hover:bg-gold-100 hover:border-gold-500"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setActionType("approve");
                            }}
                          >
                            <CheckCircle className="mr-1 h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setActionType("revoke");
                            }}
                          >
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </section>
      )}

      {/* All vendors */}
      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold text-navy-800">
          All Vendors ({vendors.length})
        </h2>
        <Card className="overflow-hidden border-canvas-200 bg-white">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
            </div>
          ) : vendors.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No vendors registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-canvas-200 hover:bg-transparent">
                    <TableHead className="text-navy-600">Business</TableHead>
                    <TableHead className="text-navy-600">Status</TableHead>
                    <TableHead className="text-navy-600">Location</TableHead>
                    <TableHead className="text-navy-600">
                      Subscription
                    </TableHead>
                    <TableHead className="text-navy-600">Registered</TableHead>
                    <TableHead className="text-right text-navy-600">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow
                      key={vendor.id}
                      className="border-canvas-200 hover:bg-canvas-100/50"
                    >
                      <TableCell className="font-medium text-navy-800">
                        {vendor.business_name}
                      </TableCell>
                      <TableCell>
                        {vendor.is_verified ? (
                          <Badge className="gap-1 rounded-full border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            <BadgeCheck className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="gap-1 rounded-full border-gold-300 bg-gold-100 text-gold-700"
                          >
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-navy-600">
                        {[vendor.city, vendor.country]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="rounded-full border-canvas-200 bg-canvas-100 capitalize text-navy-600"
                        >
                          {vendor.subscription_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(vendor.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {vendor.is_verified ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setActionType("revoke");
                            }}
                          >
                            Revoke
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gold-700 hover:bg-gold-100"
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
            </div>
          )}
        </Card>
      </section>

      {/* Confirm dialog */}
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
                ? `Approve "${selectedVendor?.business_name}"? They will appear in public listings.`
                : `Reject "${selectedVendor?.business_name}"? They will be hidden from public listings.`}
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
              variant={actionType === "revoke" ? "destructive" : "gold"}
              onClick={handleVendorAction}
              disabled={isProcessing}
            >
              {isProcessing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}