// src/pages/VendorDashboard.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  status: string;
  published_at: string | null;
  created_at: string;
}

const CATEGORIES = [
  { value: 'gift-boxes', label: 'Gift Boxes' },
  { value: 'hampers', label: 'Hampers' },
  { value: 'corporate', label: 'Corporate Gifts' },
  { value: 'souvenirs', label: 'Souvenirs' },
  { value: 'custom', label: 'Custom Gifts' },
];

const VendorDashboard = () => {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('gift-boxes');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const result = await supabase.auth.getUser();
    const user = result.data.user;
    if (!user) {
      navigate('/signin');
      return;
    }
    await fetchVendorProfile(user.id);
  };

  const fetchVendorProfile = async (userId) => {
    const { data, error } = await supabase
      .from('vendor_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching vendor:', error);
      return;
    }
    setVendor(data);
    fetchProducts(data.id);
  };

  const fetchProducts = async (vendorId) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    setProducts(data || []);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image must be less than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!vendor) {
      setMessage('Vendor profile not found.');
      setLoading(false);
      return;
    }

    if (!productName.trim()) {
      setMessage('Please enter a product name.');
      setLoading(false);
      return;
    }

    try {
      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = vendor.id + '-' + Date.now() + '.' + fileExt;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from('products')
        .insert([
          {
            vendor_id: vendor.id,
            name: productName.trim(),
            description: productDescription.trim() || null,
            price: parseFloat(price) || 0,
            category: category,
            image_url: imageUrl,
            status: 'draft',
          }
        ]);

      if (error) throw error;

      setMessage('Product uploaded successfully!');
      setProductName('');
      setProductDescription('');
      setPrice('');
      setCategory('gift-boxes');
      setImageFile(null);
      setImagePreview(null);
      fetchProducts(vendor.id);

    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimFreeMonth = async () => {
    setClaimLoading(true);
    setClaimMessage('');

    try {
      const sessionResult = await supabase.auth.getSession();
      const session = sessionResult.data.session;

      const response = await fetch(
        'https://iaoriuznuyppshgujnrw.supabase.co/functions/v1/activate-free-month',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + (session ? session.access_token : ''),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      const result = await response.json();

      if (result.success) {
        setClaimMessage(result.message);
        const userResult = await supabase.auth.getUser();
        const user = userResult.data.user;
        if (user) {
          fetchVendorProfile(user.id);
        }
      } else {
        setClaimMessage('Error: ' + (result.error || 'Something went wrong'));
      }
    } catch (error) {
      console.error('Claim error:', error);
      setClaimMessage('Error: ' + error.message);
    } finally {
      setClaimLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  const productCount = products.length;
  const requiredProducts = 100;
  const remaining = Math.max(0, requiredProducts - productCount);
  const progress = Math.min(100, (productCount / requiredProducts) * 100);
  const isEligible = productCount >= requiredProducts;
  const alreadyClaimed = vendor ? vendor.free_month_earned : false;

  if (!vendor) {
    return <div className="loading">Loading vendor profile...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>Giftora Dashboard</h1>
        </a>
        <div className="header-actions">
          <a href="/" style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', color: '#333', textDecoration: 'none' }}>
            Back to Site
          </a>
          <span className="vendor-name">{vendor.business_name}</span>
          <span className={'status ' + vendor.subscription_status}>
            {vendor.subscription_status}
          </span>
          <button className="signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Products</h3>
          <div className="card-value">{productCount}</div>
          <div className="card-detail">
            {remaining > 0 ? 'Need ' + remaining + ' more for free month' : 'Goal reached!'}
          </div>
        </div>
        <div className="card">
          <h3>Subscription</h3>
          <div className="card-value">{vendor.subscription_status}</div>
          {vendor.subscription_expires_at ? (
            <div className="card-detail">
              Expires: {new Date(vendor.subscription_expires_at).toLocaleDateString()}
            </div>
          ) : null}
        </div>
        <div className="card">
          <h3>Free Month</h3>
          <div className="card-value">{alreadyClaimed ? 'Claimed' : 'Available'}</div>
          {!alreadyClaimed && isEligible ? (
            <div className="card-detail">You are eligible!</div>
          ) : null}
          {!alreadyClaimed && !isEligible ? (
            <div className="card-detail">{remaining} products to go</div>
          ) : null}
        </div>
      </div>

      <div className="progress-section">
        <h3>Progress to Free Month</h3>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: progress + '%' }}>
            {progress > 10 ? Math.round(progress) + '%' : ''}
          </div>
        </div>
        <p className="progress-text">
          {isEligible
            ? 'You have 100+ products! Claim your free month below.'
            : productCount + ' of ' + requiredProducts + ' products (need ' + remaining + ' more)'}
        </p>
      </div>

      {!alreadyClaimed && isEligible ? (
        <div className="claim-section">
          <button className="btn-claim" onClick={handleClaimFreeMonth} disabled={claimLoading}>
            {claimLoading ? 'Processing...' : 'Claim Free Month'}
          </button>
          {claimMessage ? <p className="claim-message">{claimMessage}</p> : null}
        </div>
      ) : null}

      {alreadyClaimed ? (
        <div className="claimed-banner">
          Free month already claimed!
          {vendor.subscription_expires_at ? (
            <p>Active until: {new Date(vendor.subscription_expires_at).toLocaleDateString()}</p>
          ) : null}
        </div>
      ) : null}

      <div className="upload-section">
        <h2>Upload Product</h2>
        <form onSubmit={handleUpload} className="upload-form">
          <input
            type="text"
            placeholder="Product Name *"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
          <textarea
            placeholder="Product Description"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            rows={4}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', fontFamily: 'inherit' }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Price (NGN)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            min="0"
          />

          <div style={{ margin: '10px 0' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#555' }}>
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
            />
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                style={{ marginTop: '10px', width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            ) : null}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Product'}
          </button>
        </form>
        {message ? <p className="message">{message}</p> : null}
      </div>

      <div className="products-section">
        <h2>Your Products ({products.length})</h2>
        {products.length === 0 ? (
          <p className="no-products">No products yet. Upload your first product!</p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                  />
                ) : null}
                <h4>{product.name}</h4>
                {product.description ? (
                  <p className="product-description">{product.description}</p>
                ) : null}
                <div className="product-meta">
                  <span className="price">NGN {product.price}</span>
                  <span className={'status ' + product.status}>
                    {product.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;