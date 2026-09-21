import giftBox from "@/assets/gift-box-1.jpg";
import hamper from "@/assets/hamper-1.jpg";
import corporate from "@/assets/corporate-gift-1.jpg";
import souvenir from "@/assets/souvenir-1.jpg";
import custom from "@/assets/custom-gift-1.jpg";

export interface DemoVendorProduct {
  id: string;
  name: string;
  price: string;
  image_url: string;
}

export interface DemoVendor {
  id: string;
  business_name: string;
  city: string;
  country: string;
  description: string;
  logo_url: string;
  banner_url?: string;
  tagline?: string;
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
  // Extended profile fields
  member_since?: string;
  response_time?: string;
  specialties?: string[];
  shipping_info?: string;
  products?: DemoVendorProduct[];
}

export const demoVendors: DemoVendor[] = [
  {
    id: "demo-1",
    business_name: "Gift Haven",
    city: "Lagos",
    country: "Nigeria",
    description:
      "Premium gift boxes and hampers for all occasions. We specialize in creating memorable gifting experiences with carefully curated products, elegant packaging, and personalized touches that make every gift special.",
    logo_url: giftBox,
    banner_url: hamper,
    tagline: "Curated gift boxes for life's special moments",
    vendor_type: "curator",
    is_verified: true,
    is_launch_partner: true,
    whatsapp: "2348012345678",
    subscription_status: "active",
    rating: 4.9,
    reviews: 127,
    priceRange: "₦₦₦",
    category: "gift-boxes",
    member_since: "2023",
    response_time: "Usually replies within 1 hour",
    specialties: ["Weddings", "Corporate", "Luxury Packaging", "Customization"],
    shipping_info:
      "Same-day delivery within Lagos. Nationwide delivery in 2–4 business days. International shipping available on request.",
    products: [
      {
        id: "p1",
        name: "Anniversary Gift Box",
        price: "₦45,000",
        image_url: giftBox,
      },
      {
        id: "p2",
        name: "Bridal Luxury Hamper",
        price: "₦85,000",
        image_url: hamper,
      },
      {
        id: "p3",
        name: "Corporate Welcome Kit",
        price: "₦120,000",
        image_url: corporate,
      },
      {
        id: "p4",
        name: "Custom Keepsake Set",
        price: "₦35,000",
        image_url: custom,
      },
    ],
  },
  {
    id: "demo-2",
    business_name: "Luxury Hampers Co",
    city: "Dubai",
    country: "UAE",
    description:
      "Exquisite luxury hampers featuring premium products from around the world. Perfect for corporate gifting, special celebrations, and making lasting impressions on clients and loved ones.",
    logo_url: hamper,
    banner_url: corporate,
    tagline: "World-class hampers, delivered with elegance",
    vendor_type: "wholesaler",
    is_verified: true,
    is_launch_partner: false,
    whatsapp: "971501234567",
    subscription_status: "active",
    rating: 4.8,
    reviews: 89,
    priceRange: "$$$",
    category: "hampers",
    member_since: "2022",
    response_time: "Replies within 2 hours",
    specialties: ["Corporate Gifting", "Luxury Hampers", "Bulk Orders"],
    shipping_info:
      "Free delivery within Dubai. GCC-wide shipping in 3–5 days. Express international shipping available.",
    products: [
      {
        id: "p1",
        name: "Royal Celebration Hamper",
        price: "$250",
        image_url: hamper,
      },
      {
        id: "p2",
        name: "Executive Client Gift Set",
        price: "$380",
        image_url: corporate,
      },
      {
        id: "p3",
        name: "Luxury Spa Hamper",
        price: "$180",
        image_url: souvenir,
      },
    ],
  },
  {
    id: "demo-3",
    business_name: "Corporate Gifting Solutions",
    city: "London",
    country: "United Kingdom",
    description:
      "End-to-end corporate gifting solutions for businesses of all sizes. From employee appreciation to client gifts, we handle bulk orders with precision and deliver exceptional quality.",
    logo_url: corporate,
    banner_url: corporate,
    tagline: "Enterprise-grade gifting, flawlessly executed",
    vendor_type: "wholesaler",
    is_verified: true,
    is_launch_partner: true,
    whatsapp: "447891234567",
    subscription_status: "active",
    rating: 4.7,
    reviews: 156,
    priceRange: "$$$$",
    category: "corporate",
    member_since: "2021",
    response_time: "Replies within 4 business hours",
    specialties: ["Corporate Gifting", "Bulk Orders", "Branded Merchandise", "Employee Rewards"],
    shipping_info:
      "UK-wide delivery in 2–3 days. European shipping in 5–7 days. Dedicated account manager for bulk orders.",
    products: [
      {
        id: "p1",
        name: "Employee Appreciation Box",
        price: "£75",
        image_url: corporate,
      },
      {
        id: "p2",
        name: "Client Welcome Hamper",
        price: "£150",
        image_url: hamper,
      },
      {
        id: "p3",
        name: "Executive Gift Set",
        price: "£320",
        image_url: giftBox,
      },
    ],
  },
  {
    id: "demo-4",
    business_name: "Memorable Souvenirs",
    city: "New York",
    country: "United States",
    description:
      "Unique and memorable souvenirs that capture the essence of special moments. We curate one-of-a-kind pieces that serve as perfect keepsakes and thoughtful gifts.",
    logo_url: souvenir,
    banner_url: souvenir,
    tagline: "Keepsakes that tell your story",
    vendor_type: "curator",
    is_verified: false,
    is_launch_partner: false,
    whatsapp: "12125551234",
    subscription_status: "inactive",
    rating: 4.6,
    reviews: 73,
    priceRange: "$$",
    category: "souvenirs",
    member_since: "2024",
    response_time: "Replies within 1 business day",
    specialties: ["Keepsakes", "Personalized Gifts", "Memorabilia"],
    shipping_info:
      "US-wide shipping in 3–5 business days. Free shipping on orders over $100.",
    products: [
      {
        id: "p1",
        name: "Personalized Photo Frame",
        price: "$45",
        image_url: souvenir,
      },
      {
        id: "p2",
        name: "Custom Engraved Keepsake",
        price: "$75",
        image_url: custom,
      },
    ],
  },
  {
    id: "demo-5",
    business_name: "Artisan Gift Workshop",
    city: "Abuja",
    country: "Nigeria",
    description:
      "Handcrafted custom gifts made with love and attention to detail. Our artisans create bespoke pieces that tell your story and make recipients feel truly special.",
    logo_url: custom,
    banner_url: custom,
    tagline: "Handcrafted gifts, made just for you",
    vendor_type: "curator",
    is_verified: true,
    is_launch_partner: false,
    whatsapp: "2349087654321",
    subscription_status: "active",
    rating: 4.9,
    reviews: 94,
    priceRange: "₦₦",
    category: "custom",
    member_since: "2023",
    response_time: "Usually replies within 3 hours",
    specialties: ["Handcrafted", "Custom Orders", "Personalized", "Artisanal"],
    shipping_info:
      "Nationwide delivery in Nigeria within 3–5 business days. Custom orders may take 7–14 days to produce.",
    products: [
      {
        id: "p1",
        name: "Handcrafted Wooden Box",
        price: "₦28,000",
        image_url: custom,
      },
      {
        id: "p2",
        name: "Bespoke Gift Set",
        price: "₦55,000",
        image_url: giftBox,
      },
      {
        id: "p3",
        name: "Personalized Hamper",
        price: "₦72,000",
        image_url: hamper,
      },
    ],
  },
];

export const getVendorById = (id: string): DemoVendor | undefined => {
  return demoVendors.find((vendor) => vendor.id === id);
};

export const getActiveVendors = (): DemoVendor[] => {
  return demoVendors.filter((vendor) => vendor.subscription_status === "active");
};