// src/pages/VendorAuth.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

type Mode = 'signin' | 'signup' | 'forgot';

const VendorAuth = () => {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      if (mode === 'signup') {
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

      } else if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        navigate('/dashboard');

      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password',
        });

        if (error) throw error;

        setMessage('✅ Password reset link sent! Check your email.');
        setEmail('');
      }

    } catch (error: any) {
      console.error('Auth error:', error);
      setError('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<Mode, string> = {
    signin: 'Vendor Sign In',
    signup: 'Create Vendor Account',
    forgot: 'Reset Your Password',
  };

  const buttonLabels: Record<Mode, string> = {
    signin: 'Sign In',
    signup: 'Sign Up',
    forgot: 'Send Reset Link',
  };

  return (
    <div className="auth-container">
      <h2>{titles[mode]}</h2>

      <form onSubmit={handleAuth}>
        {mode === 'signup' && (
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

        {mode !== 'forgot' && (
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: '44px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#888',
                padding: 0,
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        )}

        {mode === 'signin' && (
          <div style={{ textAlign: 'right', marginTop: '-4px', marginBottom: '10px' }}>
            <button
              type="button"
              className="link-btn"
              style={{ fontSize: '13px', padding: 0 }}
              onClick={() => { setMode('forgot'); setError(''); setMessage(''); }}
            >
              Forgot password?
            </button>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : buttonLabels[mode]}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}

      <p>
        {mode === 'signup' && 'Already have an account?'}
        {mode === 'signin' && "Don't have an account?"}
        {mode === 'forgot' && 'Remembered your password?'}
        <button
          className="link-btn"
          onClick={() => {
            setMode(mode === 'signup' ? 'signin' : mode === 'forgot' ? 'signin' : 'signup');
            setError('');
            setMessage('');
          }}
        >
          {mode === 'signup' ? 'Sign In' : mode === 'forgot' ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
};

export default VendorAuth;