import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { MapPin, Star, Search, Filter, Users, BadgeCheck } from "lucide-react";
import { demoVendors } from "@/data/demoVendors";

const categories = [
  { id: "all", name: "All Categories" },
  { id: "gift-boxes", name: "Gift Boxes" },
  { id: "hampers", name: "Hampers" },
  { id: "corporate", name: "Corporate Gifts" },
  { id: "souvenirs", name: "Souvenirs" },
  { id: "custom", name: "Custom Gifts" },
];

const locations = [
  { id: "all", name: "All Locations" },
  { id: "nigeria", name: "Nigeria" },
  { id: "uae", name: "UAE" },
  { id: "uk", name: "United Kingdom" },
  { id: "us", name: "United States" },
];

const vendorTypes = [
  { id: "all", name: "All Vendors" },
  { id: "curator", name: "Gift Curators" },
  { id: "wholesaler", name: "Wholesalers" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedVendorType, setSelectedVendorType] = useState("all");

  const filteredVendors = demoVendors.filter((vendor) => {
    const matchesSearch =
      vendor.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || vendor.category === selectedCategory;
    const matchesLocation =
      selectedLocation === "all" ||
      vendor.country.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesVendorType =
      selectedVendorType === "all" || vendor.vendor_type === selectedVendorType;

    return matchesSearch && matchesCategory && matchesLocation && matchesVendorType;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-secondary/30 py-12 md:py-16">
          <div className="container">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-heading text-3xl font-bold text-foreground md:text-4xl"
            >
              Find Vendors
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-muted-foreground"
            >
              Connect with trusted gift vendors from around the world
            </motion.p>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex flex-col gap-4 md:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <MapPin className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedVendorType} onValueChange={setSelectedVendorType}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Users className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Vendor Type" />
                </SelectTrigger>
                <SelectContent>
                  {vendorTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          </div>
        </section>

        {/* Vendors Grid */}
        <section className="py-12">
          <div className="container">
            <p className="mb-6 text-sm text-muted-foreground">
              Showing {filteredVendors.length} vendor{filteredVendors.length !== 1 ? "s" : ""}
            </p>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredVendors.map((vendor) => (
                <Link key={vendor.id} to={`/vendors/${vendor.id}`}>
                  <motion.div
                    variants={item}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:shadow-medium cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={vendor.logo_url}
                        alt={vendor.business_name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 flex gap-2">
                        <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium capitalize text-foreground backdrop-blur-sm">
                          {vendor.category.replace("-", " ")}
                        </span>
                      </div>
                      {vendor.is_verified && (
                        <div className="absolute right-3 top-3">
                          <Badge variant="secondary" className="gap-1 bg-background/90 backdrop-blur-sm">
                            <BadgeCheck className="h-3 w-3" />
                            Verified
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {vendor.business_name}
                        </h3>
                        {vendor.is_launch_partner && (
                          <Badge className="bg-primary/10 text-primary text-xs shrink-0">
                            Launch Partner
                          </Badge>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {vendor.description}
                      </p>

                      <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {vendor.city}, {vendor.country}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span className="text-sm font-medium text-foreground">
                              {vendor.rating}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({vendor.reviews} reviews)
                          </span>
                        </div>
                        <Badge 
                          variant={vendor.vendor_type === "wholesaler" ? "default" : "outline"}
                          className="text-xs capitalize"
                        >
                          {vendor.vendor_type === "wholesaler" ? "Wholesaler" : "Curator"}
                        </Badge>
                      </div>

                      <p className="mt-3 text-sm font-medium text-primary">
                        {vendor.priceRange}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>

            {filteredVendors.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-lg text-muted-foreground">
                  No vendors found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedLocation("all");
                    setSelectedVendorType("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
