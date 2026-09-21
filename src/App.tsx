// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import BrowseGifts from './pages/BrowseGifts';
import Vendors from './pages/Vendors';
import VendorProfile from './pages/VendorProfile';
import VendorAuth from './pages/VendorAuth';
import VendorDashboard from './pages/VendorDashboard';
import NotFound from './pages/NotFound';
import ProductDetail from './pages/ProductDetail';
import InternalAdmin from './pages/InternalAdmin';
import CategoriesPage from './pages/Categories';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/browse" element={<BrowseGifts />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/vendors/:id" element={<VendorProfile />} />
        <Route path="/signin" element={<VendorAuth />} />
        <Route path="/signup" element={<VendorAuth />} />
        <Route path="/dashboard" element={<VendorDashboard />} />
        <Route path="/gifts/:id" element={<ProductDetail />} />
        <Route path="/internal-admin-review" element={<InternalAdmin />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:id" element={<OrderConfirmation />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;