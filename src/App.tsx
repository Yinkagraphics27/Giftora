import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Vendors from "./pages/Vendors";
import VendorProfile from "./pages/VendorProfile";
import BrowseGifts from "./pages/BrowseGifts";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import Register from "./pages/Register";
import Pricing from "./pages/Pricing";
import VendorAuth from "./pages/VendorAuth";
import VendorOnboarding from "./pages/VendorOnboarding";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import InternalAdmin from "./pages/InternalAdmin";
import AdminAddVendor from "./pages/AdminAddVendor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/gifts" element={<BrowseGifts />} />
            <Route path="/gifts/:id" element={<ProductDetail />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/vendors/:id" element={<VendorProfile />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/vendor/auth" element={<VendorAuth />} />
            <Route path="/vendor/onboarding" element={<VendorOnboarding />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/internal-admin-review" element={<InternalAdmin />} />
            <Route path="/admin/add-vendor" element={<AdminAddVendor />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
