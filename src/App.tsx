// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import BrowseGifts from './pages/BrowseGifts';
import Vendors from './pages/Vendors';
import VendorProfile from './pages/VendorProfile';
import VendorAuth from './pages/VendorAuth';
import VendorDashboard from './pages/VendorDashboard';
import NotFound from './pages/NotFound';
import ProductDetail from './pages/ProductDetail';
import CategoriesPage from './pages/Categories';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { Toaster } from '@/components/ui/sonner';

// Admin Console
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminVendors } from './pages/admin/AdminVendors';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCategories } from './pages/admin/AdminCategories';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/browse" element={<BrowseGifts />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/vendors/:id" element={<VendorProfile />} />
        <Route path="/gifts/:id" element={<ProductDetail />} />
        <Route path="/categories" element={<CategoriesPage />} />

        {/* AUTH */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/dashboard" element={<VendorDashboard />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:id" element={<OrderConfirmation />} />
        <Route path="/my-orders" element={<MyOrders />} />

        {/* LEGACY */}
        <Route path="/internal-admin-review" element={<Navigate to="/admin/vendors" replace />} />
        <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategories />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;