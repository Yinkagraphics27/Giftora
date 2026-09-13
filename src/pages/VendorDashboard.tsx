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

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('gift-boxes');
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileBusinessName, setProfileBusinessName] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [profileCountry, setProfileCountry] = useState('');
  const [profileWhatsapp, setProfileWhatsapp] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

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
    setProfileBusinessName(data.business_name || '');
    setProfileDescription(data.description || '');
    setProfileCity(data.city || '');
    setProfileCountry(data.country || '');
    setProfileWhatsapp(data.whatsapp || '');
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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage('Logo must be less than 5MB');
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
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

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage('');

    try {
      let logoUrl = vendor.logo_url || null;

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = vendor.id + '-logo-' + Date.now() + '.' + fileExt;

        const { error: uploadError } = await supabase.storage
          .from('vendor-logos')
          .upload(fileName, logoFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('vendor-logos')
          .getPublicUrl(fileName);

        logoUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from('vendor_profiles')
        .update({
          business_name: profileBusinessName.trim(),
          description: profileDescription.trim() || null,
          city: profileCity.trim() || null,
          country: profileCountry.trim() || null,
          whatsapp: profileWhatsapp.trim() || null,
          logo_url: logoUrl,
        })
        .eq('id', vendor.id);

      if (error) throw error;

      setProfileMessage('Profile updated successfully!');
      setLogoFile(null);
      setLogoPreview(null);
      fetchVendorProfile(vendor.user_id);
    } catch (error) {
      console.error('Profile save error:', error);
      setProfileMessage('Error: ' + error.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditName(product.name);
    setEditDescription(product.description || '');
    setEditPrice(String(product.price));
    setEditCategory(product.category || 'gift-boxes');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
    setEditPrice('');
    setEditCategory('gift-boxes');
  };

  const saveEdit = async (productId) => {
    if (!editName.trim()) {
      setMessage('Product name cannot be empty.');
      return;
    }

    setEditSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editName.trim(),
          description: editDescription.trim() || null,
          price: parseFloat(editPrice) || 0,
          category: editCategory,
        })
        .eq('id', productId);

      if (error) throw error;

      setMessage('Product updated successfully!');
      cancelEdit();
      fetchProducts(vendor.id);
    } catch (error) {
      console.error('Edit error:', error);
      setMessage('Error: ' + error.message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm('Delete this product? This cannot be undone.');
    if (!confirmed) return;

    setDeletingId(productId);
    setMessage('');

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setMessage('Product deleted.');
      fetchProducts(vendor.id);
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Error: ' + error.message);
    } finally {
      setDeletingId(null);
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

      <div className="upload-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>My Profile</h2>
          <button
            onClick={() => { setShowProfileEdit(!showProfileEdit); setProfileMessage(''); }}
            style={{ padding: '8px 16px', background: showProfileEdit ? '#eee' : '#E8752F', color: showProfileEdit ? '#333' : 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
          >
            {showProfileEdit ? 'Close' : 'Edit Profile'}
          </button>
        </div>

        {!showProfileEdit ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
            {vendor.logo_url ? (
              <img
                src={vendor.logo_url}
                alt="Logo"
                style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #ddd' }}
              />
            ) : (
              <div style={{ width: '70px', height: '70px', borderRadius: '10px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px' }}>
                No logo
              </div>
            )}
            <div>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>{vendor.business_name}</p>
              {vendor.description ? <p style={{ fontSize: '14px', color: '#666' }}>{vendor.description}</p> : <p style={{ fontSize: '14px', color: '#999' }}>No description yet</p>}
              {(vendor.city || vendor.country) && (
                <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
                  {[vendor.city, vendor.country].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleProfileSave} className="upload-form" style={{ marginTop: '16px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#555' }}>
                Logo
              </label>
              <input type="file" accept="image/*" onChange={handleLogoChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
              />
              {(logoPreview || vendor.logo_url) ? (
                <img
                  src={logoPreview || vendor.logo_url}
                  alt="Preview"
                  style={{ marginTop: '10px', width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              ) : null}
            </div>

            <input
              type="text"
              placeholder="Business Name"
              value={profileBusinessName}
              onChange={(e) => setProfileBusinessName(e.target.value)}
              required
            />
            <textarea
              placeholder="Business Description"
              value={profileDescription}
              onChange={(e) => setProfileDescription(e.target.value)}
              rows={3}
            />
            <input
              type="text"
              placeholder="City"
              value={profileCity}
              onChange={(e) => setProfileCity(e.target.value)}
            />
            <input
              type="text"
              placeholder="Country"
              value={profileCountry}
              onChange={(e) => setProfileCountry(e.target.value)}
            />
            <input
              type="text"
              placeholder="WhatsApp Number (e.g. 2348001234567)"
              value={profileWhatsapp}
              onChange={(e) => setProfileWhatsapp(e.target.value)}
            />
            <button type="submit" disabled={profileSaving}>
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}
        {profileMessage ? <p className="message">{profileMessage}</p> : null}
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

                {editingId === product.id ? (
                  <div>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', margin: '6px 0', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                      style={{ width: '100%', padding: '8px 10px', margin: '6px 0', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit' }}
                    />
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', margin: '6px 0', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      step="0.01"
                      min="0"
                      style={{ width: '100%', padding: '8px 10px', margin: '6px 0', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button
                        onClick={() => saveEdit(product.id)}
                        disabled={editSaving}
                        style={{ flex: 1, padding: '8px', background: '#E8752F', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                      >
                        {editSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={editSaving}
                        style={{ flex: 1, padding: '8px', background: '#eee', color: '#333', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
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
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        onClick={() => startEdit(product)}
                        style={{ flex: 1, padding: '8px', background: 'white', color: '#E8752F', border: '1px solid #E8752F', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        style={{ flex: 1, padding: '8px', background: 'white', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                      >
                        {deletingId === product.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;