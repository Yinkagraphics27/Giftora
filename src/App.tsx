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
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Wishlist from './pages/Wishlist';
import Messages from './pages/Messages';
import Account from './pages/Account';
import { Toaster } from '@/components/ui/sonner';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorProductForm from './pages/vendor/VendorProductForm';
import VendorOrder from './pages/vendor/VendorOrders';

// Admin Console
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminVendors } from './pages/admin/AdminVendors';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCategories } from './pages/admin/AdminCategories';
import VendorOrders from './pages/vendor/VendorOrders';

function App() {
  return (
    <>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Index />} />
        <Route path="/browse" element={<BrowseGifts />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/vendors/:id" element={<VendorProfile />} />
        <Route path="/gifts/:id" element={<ProductDetail />} />

        {/* AUTH */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* VENDOR */}
        <Route path="/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/products" element={<VendorProducts />} />
        <Route path="/vendor/products/new" element={<VendorProductForm />} />
        <Route path="/vendor/products/:id/edit" element={<VendorProductForm />} />
        <Route path="/vendor/orders" element={<VendorOrders />} />

        {/* BUYER */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:id" element={<OrderConfirmation />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/account" element={<Account />} />

        {/* LEGACY */}
        <Route
          path="/internal-admin-review"
          element={<Navigate to="/admin/vendors" replace />}
        />
        <Route
          path="/admin-dashboard"
          element={<Navigate to="/admin" replace />}
        />
        <Route
          path="/categories"
          element={<Navigate to="/browse" replace />}
        />

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