import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MapPin, BadgeCheck, ArrowLeft, MessageCircle, Package, Star } from "lucide-react";
import { getVendorById } from "@/data/demoVendors";
import { openWhatsAppChat } from "@/utils/whatsapp";

export default function VendorProfile() {
  const { id } = useParams<{ id: string }>();
  const vendor = id ? getVendorById(id) : undefined;

  if (!vendor) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-16 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Vendor Not Found
            </h1>
            <p className="text-muted-foreground mb-8">
              This vendor profile doesn't exist or is no longer available.
            </p>
            <Link to="/vendors">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Browse Vendors
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Back Button */}
        <div className="container pt-6">
          <Link
            to="/vendors"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendors
          </Link>
        </div>

        {/* Vendor Profile */}
        <section className="py-8">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 space-y-6"
              >
                {/* Logo/Image */}
                <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-secondary/30">
                  {vendor.logo_url ? (
                    <img
                      src={vendor.logo_url}
                      alt={vendor.business_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-6xl font-bold text-muted-foreground/30">
                        {vendor.business_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Vendor Info */}
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                      {vendor.business_name}
                    </h1>
                    {vendor.is_verified && (
                      <Badge variant="secondary" className="gap-1">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verified
                      </Badge>
                    )}
                    {vendor.is_launch_partner && (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                        Launch Partner
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{vendor.city}, {vendor.country}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {vendor.rating}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({vendor.reviews} reviews)
                      </span>
                    </div>
                    {vendor.vendor_type && (
                      <Badge 
                        variant={vendor.vendor_type === "wholesaler" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {vendor.vendor_type === "wholesaler" ? "Gift Producer / Wholesaler" : "Gift Curator"}
                      </Badge>
                    )}
                  </div>

                  {/* Wholesale Indicator */}
                  {vendor.vendor_type === "wholesaler" && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                      <Package className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">Wholesale available for business buyers</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {vendor.description && (
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <h2 className="text-lg font-semibold text-foreground mb-2">
                      About
                    </h2>
                    <p>{vendor.description}</p>
                  </div>
                )}
              </motion.div>

              {/* Contact Sidebar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
                    Contact Vendor
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Chat directly with {vendor.business_name} on WhatsApp for inquiries and orders.
                  </p>
                  
                  {vendor.whatsapp ? (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      size="lg"
                      onClick={() => {
                        const message = `Hi ${vendor.business_name}! 👋\n\nI found your business on Giftora and I'm interested in learning more about your products and services.\n\nThank you!`;
                        openWhatsAppChat(vendor.whatsapp, message);
                      }}
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Chat on WhatsApp
                    </Button>
                  ) : (
                    <Button className="w-full" size="lg" disabled>
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Contact Not Available
                    </Button>
                  )}

                  <p className="mt-4 text-xs text-muted-foreground text-center">
                    You'll be redirected to WhatsApp to chat with this vendor
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
