import giftBox from "@/assets/gift-box-1.jpg";
import hamper from "@/assets/hamper-1.jpg";
import corporate from "@/assets/corporate-gift-1.jpg";
import souvenir from "@/assets/souvenir-1.jpg";
import custom from "@/assets/custom-gift-1.jpg";

export interface DemoVendor {
  id: string;
  business_name: string;
  city: string;
  country: string;
  description: string;
  logo_url: string;
  vendor_type: "curator" | "wholesaler";
  is_verified: boolean;
  is_launch_partner: boolean;
  whatsapp: string;
  subscription_status: "active" | "inactive";
  // Extra fields for listing display
  rating: number;
  reviews: number;
  priceRange: string;
  category: string;
}

export const demoVendors: DemoVendor[] = [
  {
    id: "demo-1",
    business_name: "Gift Haven",
    city: "Lagos",
    country: "Nigeria",
    description: "Premium gift boxes and hampers for all occasions. We specialize in creating memorable gifting experiences with carefully curated products, elegant packaging, and personalized touches that make every gift special.",
    logo_url: giftBox,
    vendor_type: "curator",
    is_verified: true,
    is_launch_partner: true,
    whatsapp: "2348012345678",
    subscription_status: "active",
    rating: 4.9,
    reviews: 127,
    priceRange: "₦₦₦",
    category: "gift-boxes",
  },
  {
    id: "demo-2",
    business_name: "Luxury Hampers Co",
    city: "Dubai",
    country: "UAE",
    description: "Exquisite luxury hampers featuring premium products from around the world. Perfect for corporate gifting, special celebrations, and making lasting impressions on clients and loved ones.",
    logo_url: hamper,
    vendor_type: "wholesaler",
    is_verified: true,
    is_launch_partner: false,
    whatsapp: "971501234567",
    subscription_status: "active",
    rating: 4.8,
    reviews: 89,
    priceRange: "$$$",
    category: "hampers",
  },
  {
    id: "demo-3",
    business_name: "Corporate Gifting Solutions",
    city: "London",
    country: "United Kingdom",
    description: "End-to-end corporate gifting solutions for businesses of all sizes. From employee appreciation to client gifts, we handle bulk orders with precision and deliver exceptional quality.",
    logo_url: corporate,
    vendor_type: "wholesaler",
    is_verified: true,
    is_launch_partner: true,
    whatsapp: "447891234567",
    subscription_status: "active",
    rating: 4.7,
    reviews: 156,
    priceRange: "$$$$",
    category: "corporate",
  },
  {
    id: "demo-4",
    business_name: "Memorable Souvenirs",
    city: "New York",
    country: "United States",
    description: "Unique and memorable souvenirs that capture the essence of special moments. We curate one-of-a-kind pieces that serve as perfect keepsakes and thoughtful gifts.",
    logo_url: souvenir,
    vendor_type: "curator",
    is_verified: false,
    is_launch_partner: false,
    whatsapp: "12125551234",
    subscription_status: "inactive",
    rating: 4.6,
    reviews: 73,
    priceRange: "$$",
    category: "souvenirs",
  },
  {
    id: "demo-5",
    business_name: "Artisan Gift Workshop",
    city: "Abuja",
    country: "Nigeria",
    description: "Handcrafted custom gifts made with love and attention to detail. Our artisans create bespoke pieces that tell your story and make recipients feel truly special.",
    logo_url: custom,
    vendor_type: "curator",
    is_verified: true,
    is_launch_partner: false,
    whatsapp: "2349087654321",
    subscription_status: "active",
    rating: 4.9,
    reviews: 94,
    priceRange: "₦₦",
    category: "custom",
  },
];

export const getVendorById = (id: string): DemoVendor | undefined => {
  return demoVendors.find((vendor) => vendor.id === id);
};

export const getActiveVendors = (): DemoVendor[] => {
  return demoVendors.filter((vendor) => vendor.subscription_status === "active");
};
