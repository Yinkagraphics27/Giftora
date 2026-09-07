// src/pages/VendorAuth.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const VendorAuth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isSignUp) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('vendor_profiles')
            .insert([
              {
                user_id: authData.user.id,
                business_name: businessName,
                subscription_status: 'inactive',
                free_month_earned: false,
              }
            ]);

          if (profileError) throw profileError;
        }

        setMessage('✅ Account created! Please check your email to confirm.');
        setEmail('');
        setPassword('');
        setBusinessName('');

      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        navigate('/dashboard');
      }

    } catch (error: any) {
      console.error('Auth error:', error);
      setError('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isSignUp ? 'Create Vendor Account' : 'Vendor Sign In'}</h2>
      
      <form onSubmit={handleAuth}>
        {isSignUp && (
          <input
            type="text"
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}
      
      <p>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <button 
          className="link-btn" 
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
};

export default VendorAuth;