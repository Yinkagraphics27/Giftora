// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
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

function App() {
  return (
    <AuthProvider>
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;